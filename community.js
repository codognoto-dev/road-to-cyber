'use strict';
/* Road to Cyber V8 Community Layer.
   Preserves V7.1 rendering/auth logic; migration 03 enables additional features.
   Never stores secrets in frontend; uses Supabase RLS + controlled RPCs. */
(() => {
  const $x = id => document.getElementById(id);
  const q = (sel, root=document) => root.querySelector(sel);
  const qa = (sel, root=document) => [...root.querySelectorAll(sel)];
  const escapeX = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const COVERS = [
    {key:'matrix',name:'Neon Matrix',hint:'Inicial',locked:false},
    {key:'pulse',name:'Digital Pulse',hint:'Inicial',locked:false},
    {key:'sakura',name:'Sakura.exe',hint:'2 meses de estudo',locked:true},
    {key:'guardian',name:'守 Guardian',hint:'2 meses de estudo',locked:true}
  ];
  const BUCKET = 'rtc-profile-images';
  let extra = null, loadedUser = null, fetchBusy = false, migrationAvailable = null;
  let publicList = [], publicListLoadedAt = 0;
  let chosenCover = 'matrix', pendingAvatar = null, pendingBlobUrl = null, removeAvatarDraft = false, myStats = null;
  let navigatePass = false;

  function showToast(text) { if(typeof toast === 'function') toast(text); }
  function avatarUrl(path) {
    if(!path || !sb) return '';
    // All uploads go in the user's folder. Public bucket is for voluntary profile pictures.
    const result=sb.storage.from(BUCKET).getPublicUrl(path);
    return result?.data?.publicUrl || '';
  }
  function avatarHtml(path, cls='') {
    const url=avatarUrl(path);
    return url ? `<img class="rtc-avatar ${cls}" src="${escapeX(url)}" alt="Avatar de perfil" loading="lazy">` : `<span class="rtc-avatar rtc-avatar-fallback ${cls}" aria-hidden="true">守</span>`;
  }
  function coverClass(cover) { return COVERS.some(c=>c.key===cover) ? `rtc-cover-${cover}` : 'rtc-cover-matrix'; }
  function currentUnlock() {
    const done = (typeof sessions === 'undefined' ? [] : sessions).filter(s=>s.status==='done');
    const count = myStats ? Number(myStats.done_count||0) : done.length;
    const firstDate = myStats?.first_done_at ? new Date(myStats.first_done_at) : done.length ? done.reduce((best,item)=>new Date(item.created_at)<best?new Date(item.created_at):best,new Date(done[0].created_at)) : null;
    if(!firstDate) return {allowed:false,count:0,first:null,remaining:8};
    const date = new Date(firstDate);date.setMonth(date.getMonth()+2);
    return {allowed:count>=8 && new Date()>=date,count,first:date,remaining:Math.max(0,8-count)};
  }
  function safeStat(x) { return x===undefined || x===null ? '—' : escapeX(x); }
  function profileMarkup(p, opts={}) {
    const name=p?.display_name || 'Estudante';
    const handle=p?.username || 'road-to-cyber';
    const bio=p?.bio || 'Explorando Cyber, Cloud e novas habilidades.';
    return `<div class="rtc-cover ${coverClass(p?.cover_key)}">
      <div class="rtc-cover-inner">${avatarHtml(p?.avatar_path)}<div><div class="rtc-profile-name">${escapeX(name)}</div><div class="rtc-profile-user">@${escapeX(handle)} · Stage ${escapeX(p?.stage ?? 0)}</div></div></div>
    </div>${opts.noBio ? '' : `<p class="small" style="margin:12px 3px 0">${escapeX(bio)}</p>`}`;
  }

  function addChrome() {
    if (!$x('rtcBlackout')) {
      const overlay=document.createElement('div'); overlay.id='rtcBlackout';overlay.className='rtc-blackout';overlay.setAttribute('aria-hidden','true');
      overlay.innerHTML='<div class="rtc-scanline"></div>';
      document.body.append(overlay);
    }
    const authLogo=q('#authView .brand .logo');
    if(authLogo) authLogo.innerHTML='<img class="rtc-brand-symbol" src="./assets/icon.png" alt="Road to Cyber">';
    const sideBrand=q('.sidebar .brandline');
    if(sideBrand && !sideBrand.querySelector('img')) sideBrand.insertAdjacentHTML('afterbegin','<img class="rtc-side-brand" src="./assets/icon.png" alt="">');
    const chatLogo=q('.hero-app .hero-status');
    if(chatLogo) chatLogo.innerHTML='<span class="signal-dot"></span> ROAD TO CYBER • COMUNIDADE';
  }

  function addDirectory() {
    const community=$x('community');
    if(!community || $x('rtcDirectory')) return;
    const section=document.createElement('div');section.className='panel rtc-section glow';section.id='rtcDirectory';
    section.innerHTML=`
      <div class="section-head"><div><div class="eyebrow">Explorar comunidade</div><h2>Estudantes Road to Cyber</h2><p class="small">Perfis que optaram por aparecer na comunidade. Amigos do seu grupo permanecem visíveis no painel abaixo.</p></div><button class="btn ghost sm" type="button" id="rtcDirectoryRefresh">Atualizar</button></div>
      <div class="rtc-row" style="justify-content:space-between;margin-bottom:14px"><input class="rtc-search" type="search" id="rtcDirectorySearch" placeholder="Buscar estudante..." aria-label="Buscar estudantes"></div>
      <div id="rtcDirectoryList" class="rtc-member-grid"><div class="notice info">Carregando estudantes...</div></div>`;
    const head=community.querySelector('.section-head');
    head?.after(section);
    $x('rtcDirectoryRefresh').onclick=()=>loadPublicDirectory(true);
    $x('rtcDirectorySearch').oninput=()=>renderPublicDirectory();
    section.addEventListener('click',e=>{
      const target=e.target.closest('[data-rtc-profile]');if(target) openMemberProfile(target.dataset.rtcProfile);
    });
  }

  function addProfileStudio() {
    const settings=$x('settings');if(!settings || $x('rtcProfileStudio')) return;
    const block=document.createElement('div');block.className='panel rtc-section glow';block.id='rtcProfileStudio';
    block.innerHTML=`
    <div class="section-head"><div><div class="eyebrow">Personalização</div><h2>Seu cartão de estudante</h2></div><span class="pill mag">PROFILE // CUSTOM</span></div>
    <div id="rtcProfileSchemaNotice" class="notice warn hidden" style="margin-bottom:15px"></div>
    <div class="rtc-studio-grid">
      <div>
        <div id="rtcProfilePreview"></div>
        <div id="rtcAchievementList" class="rtc-row" style="margin-top:14px"></div>
        <div id="rtcUnlockText" class="small" style="margin-top:14px"></div>
        <div class="rtc-meter"><div id="rtcUnlockBar" style="width:0%"></div></div>
      </div>
      <div>
        <label for="rtcAvatarFile">Imagem de perfil (JPG, PNG ou WebP até 5 MB; comprimida antes do envio)</label>
        <input id="rtcAvatarFile" type="file" accept="image/png,image/jpeg,image/webp">
        <label class="rtc-profile-input" for="rtcBio">Sobre você (até 220 caracteres)</label>
        <textarea id="rtcBio" maxlength="220" placeholder="Conte o que você está estudando, suas metas e seus interesses."></textarea>
        <label class="rtc-checkbox-label"><input id="rtcPublicToggle" type="checkbox"><span>Quero aparecer na busca da comunidade. Meu nome, avatar, bio, capa, fase e estatísticas resumidas ficarão visíveis a outros estudantes autenticados.</span></label>
        <div class="small" style="margin:10px 0">Fotos enviadas ficam em um bucket de imagens públicas. Não use fotos sensíveis ou de terceiros sem consentimento.</div>
        <div class="split"><button type="button" id="rtcSaveAppearance" class="btn primary">Salvar personalização</button><button type="button" class="btn ghost" id="rtcRemoveAvatar">Retirar foto</button></div>
      </div>
    </div>
    <hr class="sep"><div class="section-head" style="margin-bottom:10px"><h3>Capas desbloqueáveis</h3><span class="pill lime">2 meses de estudo = prêmio</span></div>
    <div id="rtcCoverChoices" class="rtc-select-cover"></div>`;
    const firstGrid=settings.querySelector('.grid.cols2');
    settings.insertBefore(block,firstGrid);
    $x('rtcAvatarFile').addEventListener('change',e=>{
      pendingAvatar=e.target.files?.[0] || null;removeAvatarDraft=false;
      if(pendingBlobUrl) URL.revokeObjectURL(pendingBlobUrl);
      pendingBlobUrl=pendingAvatar?URL.createObjectURL(pendingAvatar):null;
      updatePreview();
    });
    $x('rtcRemoveAvatar').onclick=()=>{pendingAvatar=null;removeAvatarDraft=true;if(pendingBlobUrl) URL.revokeObjectURL(pendingBlobUrl);pendingBlobUrl=null;$x('rtcAvatarFile').value='';updatePreview();};
    $x('rtcSaveAppearance').onclick=saveAppearance;
    $x('rtcBio').addEventListener('input',updatePreview);
    $x('rtcCoverChoices').addEventListener('click',e=>{
      const button=e.target.closest('[data-cover]');if(!button || button.disabled)return;
      chosenCover=button.dataset.cover;renderCovers();updatePreview();
    });
    $x('rtcPublicToggle').addEventListener('change',()=>{});
  }

  function showMigrationNotice(text){
    const node=$x('rtcProfileSchemaNotice');if(!node)return;
    node.textContent=text;node.classList.remove('hidden');
  }
  function hideMigrationNotice(){ $x('rtcProfileSchemaNotice')?.classList.add('hidden'); }
  async function loadExtraMe(){
    if(!sb || !me?.id || fetchBusy)return;
    fetchBusy=true;
    try{
      const {data,error}=await sb.from('profiles')
        .select('id,display_name,username,english_level,stage,bio,avatar_path,cover_key,is_public,created_at')
        .eq('id',me.id).single();
      if(error){migrationAvailable=false;showMigrationNotice('A personalização precisa da migração 03_comunidade_perfis.sql no Supabase. O painel de estudos continua funcionando normalmente.');return;}
      migrationAvailable=true;hideMigrationNotice();extra=data;chosenCover=extra.cover_key||'matrix';
      const statRes=await sb.rpc('rtc_get_public_stats',{p_user_id:me.id});
      myStats=!statRes.error && statRes.data?.length ? statRes.data[0] : null;
      $x('rtcBio').value=extra.bio||'';
      $x('rtcPublicToggle').checked=!!extra.is_public;
      $x('rtcSaveAppearance').disabled=false;
      renderProfileStudio();
    }catch(err){migrationAvailable=false;showMigrationNotice('Ainda não foi possível carregar os dados da personalização. Execute o SQL da V8 e tente novamente.');}
    finally{fetchBusy=false;}
  }
  function updatePreview(){
    const node=$x('rtcProfilePreview');if(!node)return;
    const draft={...(extra||{}),display_name:profile?.display_name||'Estudante',username:profile?.username||'cyber',stage:profile?.stage??0,bio:$x('rtcBio')?.value||'',cover_key:chosenCover};
    if(removeAvatarDraft)draft.avatar_path=null;
    if(pendingBlobUrl){
      node.innerHTML=profileMarkup({...draft,avatar_path:null});
      const placeholder=q('.rtc-avatar',node);
      if(placeholder){const img=document.createElement('img');img.src=pendingBlobUrl;img.alt='Prévia da foto';img.className='rtc-avatar';placeholder.replaceWith(img);}
    }else node.innerHTML=profileMarkup(draft);
    const symbol=q('#profileShortcut .profile-symbol');
    if(symbol && extra?.avatar_path){symbol.style.backgroundImage=`url("${avatarUrl(extra.avatar_path)}")`;symbol.style.backgroundSize='cover';symbol.textContent='';}
  }
  function renderCovers(){
    const node=$x('rtcCoverChoices'); if(!node)return;
    const eligible=currentUnlock();
    node.innerHTML=COVERS.map(c=>{
      const disabled=c.locked&&!eligible.allowed;
      return `<button type="button" class="rtc-cover-choice ${chosenCover===c.key?'selected':''}" data-cover="${c.key}" ${disabled?'disabled':''} aria-label="${escapeX(c.name)}">
        <span class="rtc-cover rtc-cover-swatch ${coverClass(c.key)}" aria-hidden="true"></span>
        <span class="rtc-cover-label">${escapeX(c.name)}</span><span class="rtc-cover-note">${disabled?'🔒 ':''}${escapeX(c.hint)}</span>
      </button>`;
    }).join('');
    const bar=$x('rtcUnlockBar'),label=$x('rtcUnlockText');
    if(bar) bar.style.width=`${Math.min(100,eligible.count/8*100)}%`;
    if(label){
      if(eligible.allowed) label.textContent='Conquista desbloqueada! Suas capas Sakura.exe e 守 Guardian estão disponíveis.';
      else if(eligible.count===0) label.textContent='As capas exclusivas começam a contar a partir da sua primeira sessão concluída. Requisitos: 2 meses e 8 sessões.';
      else label.textContent=`Você registrou ${eligible.count}/8 sessões concluídas. Data mínima para desbloqueio: ${eligible.first.toLocaleDateString('pt-BR')}.`;
    }
    const badges=[];
    if(eligible.count>=1)badges.push('✦ Primeira sessão');
    if(eligible.count>=8)badges.push('⚡ 8 sessões');
    if(eligible.allowed)badges.push('🌸 2 meses de estudo');
    if((scores||[]).length>=1)badges.push('🧪 Primeira prova');
    $x('rtcAchievementList').innerHTML=badges.length?badges.map(b=>`<span class="rtc-achievement ${b.includes('2 meses')?'special':''}">${escapeX(b)}</span>`).join(''):'<span class="small">Suas conquistas aparecerão aqui conforme você estudar.</span>';
  }
  function renderProfileStudio(){updatePreview();renderCovers();}

  async function toJpeg(file){
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Escolha uma foto JPG, PNG ou WebP.');
    if(file.size>5*1024*1024)throw new Error('A imagem original deve ter até 5 MB.');
    const u=URL.createObjectURL(file);
    try{
      const img=new Image();img.decoding='async';
      await new Promise((res,rej)=>{img.onload=res;img.onerror=()=>rej(new Error('Imagem inválida.'));img.src=u;});
      const c=document.createElement('canvas');c.width=512;c.height=512;
      const ctx=c.getContext('2d');
      const side=Math.min(img.naturalWidth,img.naturalHeight);
      ctx.fillStyle='#0d1730';ctx.fillRect(0,0,512,512);
      ctx.drawImage(img,(img.naturalWidth-side)/2,(img.naturalHeight-side)/2,side,side,0,0,512,512);
      const blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Falha na compressão.')),'image/jpeg',.83));
      if(blob.size>2*1024*1024)throw new Error('A imagem ainda ficou acima de 2 MB.');
      return blob;
    }finally{URL.revokeObjectURL(u);}
  }
  async function saveAppearance(){
    if(migrationAvailable===false)return showToast('Execute a migração 03 no Supabase primeiro.');
    if(!me || !sb)return;
    const btn=$x('rtcSaveAppearance');btn.disabled=true;btn.textContent='Salvando...';
    const oldPath=extra?.avatar_path||null;
    let path=oldPath,uploadedPath=null;
    try{
      if(pendingAvatar){
        const compressed=await toJpeg(pendingAvatar);
        const name=(globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`)+'.jpg';
        path=`${me.id}/${name}`; uploadedPath=path;
        const res=await sb.storage.from(BUCKET).upload(path,compressed,{contentType:'image/jpeg',cacheControl:'3600',upsert:false});
        if(res.error)throw res.error;
      }else if(removeAvatarDraft) path=null;
      const bio=($x('rtcBio')?.value||'').trim().slice(0,220);
      const r=await sb.rpc('rtc_update_appearance',{p_bio:bio,p_avatar_path:path,p_cover_key:chosenCover});
      if(r.error)throw r.error;
      const publicValue=!!$x('rtcPublicToggle')?.checked;
      const visibility=await sb.from('profiles').update({is_public:publicValue}).eq('id',me.id);
      if(visibility.error)throw visibility.error;
      extra={...extra,bio,avatar_path:path,cover_key:chosenCover,is_public:publicValue};
      if(oldPath && oldPath!==path) sb.storage.from(BUCKET).remove([oldPath]).catch(()=>{});
      pendingAvatar=null;removeAvatarDraft=false;if(pendingBlobUrl) URL.revokeObjectURL(pendingBlobUrl);pendingBlobUrl=null;$x('rtcAvatarFile').value='';
      renderProfileStudio();
      showToast('Perfil personalizado salvo.');
      if($x('community')?.classList.contains('active'))loadPublicDirectory(true);
    }catch(err){
      if(uploadedPath) sb.storage.from(BUCKET).remove([uploadedPath]).catch(()=>{});
      showToast('Não foi possível salvar: '+String(err?.message||err));
    }finally{btn.disabled=false;btn.textContent='Salvar personalização';}
  }
  function renderPublicDirectory(){
    const node=$x('rtcDirectoryList');if(!node)return;
    const term=($x('rtcDirectorySearch')?.value||'').trim().toLocaleLowerCase('pt-BR');
    const list=publicList.filter(p=>`${p.display_name||''} ${p.username||''} ${p.bio||''}`.toLocaleLowerCase('pt-BR').includes(term));
    node.innerHTML=list.length?list.map(p=>`
      <button class="rtc-member-card" data-rtc-profile="${escapeX(p.id)}" type="button">
        <div class="rtc-cover rtc-member-mini-cover ${coverClass(p.cover_key)}"></div>
        <div class="rtc-member-body">${avatarHtml(p.avatar_path,'small')}<div><div class="rtc-member-name">${escapeX(p.display_name)}</div><div class="rtc-member-sub">@${escapeX(p.username)} · Stage ${escapeX(p.stage)}</div></div></div>
      </button>`).join(''):'<div class="notice info">Nenhum perfil público encontrado. Incentive seus colegas a ativarem a visibilidade nas configurações.</div>';
  }
  async function loadPublicDirectory(force=false){
    if(!sb || !me?.id)return;
    if(!force && Date.now()-publicListLoadedAt<45000)return renderPublicDirectory();
    const node=$x('rtcDirectoryList');if(node)node.innerHTML='<div class="notice info">Buscando estudantes...</div>';
    try{
      const {data,error}=await sb.from('profiles')
        .select('id,display_name,username,stage,bio,avatar_path,cover_key,is_public,english_level')
        .eq('is_public',true).order('created_at',{ascending:false}).limit(150);
      if(error)throw error;
      publicList=data||[];publicListLoadedAt=Date.now();renderPublicDirectory();
    }catch(err){if(node)node.innerHTML='<div class="notice warn">A busca de estudantes precisa da migração 03_comunidade_perfis.sql no Supabase. O restante do site segue disponível.</div>';}
  }
  async function openMemberProfile(id){
    const candidate=publicList.find(x=>x.id===id) || roster.find(x=>x.id===id) || (me?.id===id ? {...profile,...extra} : null);
    if(!candidate)return;
    const overlay=document.createElement('div');overlay.className='modal-backdrop show';
    overlay.innerHTML='<div class="panel modal glow" role="dialog" aria-modal="true" aria-label="Perfil de estudante"><div class="notice info">Carregando perfil...</div></div>';
    document.body.append(overlay);
    overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
    try{
      const {data,error}=await sb.from('profiles')
        .select('id,display_name,username,stage,english_level,bio,cover_key,avatar_path,is_public')
        .eq('id',id).single();
      if(error)throw error;
      const stats=await sb.rpc('rtc_get_public_stats',{p_user_id:id});
      const s=(!stats.error && stats.data?.[0])||null;
      const hours=s?Math.round(Number(s.study_minutes||0)/60*10)/10:'—';
      const badge=s && Number(s.done_count)>=8 && s.first_done_at && new Date()>=new Date(new Date(s.first_done_at).setMonth(new Date(s.first_done_at).getMonth()+2)) ? '<span class="rtc-achievement special">🌸 2 meses de estudo</span>' : '';
      const box=overlay.firstChild;
      box.innerHTML=`<div class="section-head"><div class="eyebrow">Perfil da comunidade</div><button type="button" class="btn ghost sm" id="rtcCloseProfile">Fechar</button></div>
        ${profileMarkup(data)}<div class="grid cols3" style="margin-top:16px">
        <div class="neo-card"><div class="small">Sessões concluídas</div><h2>${safeStat(s?.done_count)}</h2></div>
        <div class="neo-card"><div class="small">Horas estudadas</div><h2>${safeStat(hours)}h</h2></div>
        <div class="neo-card"><div class="small">Média de provas</div><h2>${s?.exam_average != null ? escapeX(s.exam_average)+'%' : '—'}</h2></div></div>
        <div class="rtc-row" style="margin-top:14px">${badge}<span class="rtc-achievement">🛡️ Stage ${escapeX(data.stage)}</span></div>
        <p class="small" style="margin-top:18px">Mostramos apenas resultados agregados. Notas pessoais e respostas completas de provas não são compartilhadas.</p>`;
      box.querySelector('#rtcCloseProfile').onclick=()=>overlay.remove();
    }catch(err){
      overlay.firstChild.innerHTML=`<div class="notice warn">Não foi possível carregar esse perfil. Ele pode ser privado ou a migração 03 ainda não foi aplicada.</div><button class="btn ghost" style="margin-top:14px" id="rtcCloseProfile">Fechar</button>`;
      overlay.querySelector('#rtcCloseProfile').onclick=()=>overlay.remove();
    }
  }
  function setupRosterClick(){
    const rosterEl=$x('memberList');if(!rosterEl)return;
    // capture before V7.1's own member modal to show the redesigned public summary
    rosterEl.addEventListener('click',e=>{
      const button=e.target.closest('[data-member]');
      if(!button)return;
      e.stopImmediatePropagation();
      openMemberProfile(button.dataset.member);
    },true);
  }
  function setupNavigation(){
    const overlay=$x('rtcBlackout');
    qa('.nav button[data-page]').forEach(btn=>btn.addEventListener('click',e=>{
      if(navigatePass || !overlay || matchMedia('(prefers-reduced-motion: reduce)').matches || localStorage.getItem('rtc_matrix_enabled')==='false')return;
      const active=document.querySelector('.page.active');
      if(active?.id===btn.dataset.page)return;
      e.stopImmediatePropagation();e.preventDefault();
      overlay.classList.remove('on');void overlay.offsetWidth;overlay.classList.add('on');
      setTimeout(()=>{navigatePass=true;btn.click();navigatePass=false;},220);
      setTimeout(()=>overlay.classList.remove('on'),670);
    },true));
    const communityBtn=document.querySelector('.nav button[data-page="community"]');
    if(communityBtn) communityBtn.addEventListener('click',()=>{setTimeout(()=>loadPublicDirectory(),330);});
  }
  function enhanceRender(){
    if(typeof render!=='function')return;
    const original=render;
    // V7.1 render stays responsible for courses, scores and schedules.
    render=function(...args){
      const result=original.apply(this,args);
      if(typeof me!=='undefined' && me?.id){
        if(loadedUser!==me.id){loadedUser=me.id;extra=null;myStats=null;publicList=[];publicListLoadedAt=0;loadExtraMe();}
        if(extra?.id===me.id)renderProfileStudio();
      }
      return result;
    };
  }
  function init(){
    addChrome();addDirectory();addProfileStudio();setupRosterClick();setupNavigation();enhanceRender();
    if(typeof me!=='undefined' && me?.id){loadedUser=me.id;loadExtraMe();}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
