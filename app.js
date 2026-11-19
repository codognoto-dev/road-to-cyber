'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cfg=window.ROAD_TO_CYBER||{};
const ready=Boolean(window.supabase?.createClient && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.supabaseUrl||'') && cfg.supabasePublishableKey && !cfg.supabasePublishableKey.includes('COLE_AQUI'));
const sb=ready?window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey):null;
const DAY_PLAN=[
  {day:'Segunda',focus:'Cyber / Cloud',duration:'60 min',desc:'Curso principal + anotação + 1 exercício'},
  {day:'Quarta',focus:'Inglês',duration:'60 min',desc:'Shadowing + speaking + vocabulário técnico'},
  {day:'Sexta',focus:'Cyber / Cloud + Inglês',duration:'60 min',desc:'30 min técnico + 30 min inglês'},
  {day:'Sábado',focus:'Opcional / Discord',duration:'Livre',desc:'Alinhar com o grupo, revisão ou laboratório'}
];
const TRACKS=[
  {id:'stage0',stage:0,name:'Stage 0 — Fundamentos & rotina',period:'Semanas 1–4',focus:'Construir consistência, lógica básica e inglês ativo.',courses:[
    {name:'Python para Iniciantes: Do Zero e Direto ao Ponto',url:'https://www.udemy.com/course/python-direto-ao-ponto/',why:'Variáveis, if/else, listas e funções.'},
    {name:'Speak English With Confidence',url:'https://www.udemy.com/course/english-speaking/',why:'Destravamento de fala e confiança.'}
  ],goals:['Entender if/else','Explicar uma validação simples','Gravar apresentação curta em inglês']},
  {id:'stage1',stage:1,name:'Stage 1 — Redes, Linux e funcionamento dos sistemas',period:'Meses 2–5',focus:'Como servidores, redes e aplicações se conectam.',courses:[
    {name:'Arquitetura de Redes — Gabriel Torres',url:'https://www.udemy.com/course/redes-modulo-1/',why:'IP, DNS, portas, topologia e protocolos.'},
    {name:'Primeiros Passos no Linux',url:'https://www.udemy.com/course/primeiros-passos-no-linux/',why:'Terminal, arquivos, permissões, processos.'},
    {name:'English for IT Professionals',url:'https://www.udemy.com/course/english-for-it-professionals/',why:'Vocabulário e situações de TI.'}
  ],goals:['Explicar DNS e HTTPS','Executar comandos Linux básicos','Descrever um problema técnico em inglês']},
  {id:'stage2',stage:2,name:'Stage 2 — Cyber + Cloud base',period:'Meses 6–10',focus:'Fundamentos de segurança, nuvem e responsabilidade compartilhada.',courses:[
    {name:'Cibersegurança para Iniciantes',url:'https://www.udemy.com/course/ciberseguranca-para-iniciantes/',why:'Ameaças, controles e visão de carreira.'},
    {name:'Microsoft Azure + Preparação AZ-900',url:'https://www.udemy.com/course/introducao-ao-microsoft-azure-certificacao-az-900/',why:'Conceitos de nuvem e Azure.'},
    {name:'Fundamentos da Segurança da Informação e Cyber Security',url:'https://www.udemy.com/course/fundamentos-e-gestao-seguranca-da-informacao/',why:'Segurança técnica e GRC.'}
  ],goals:['Explicar IaaS/PaaS/SaaS','Mapear riscos básicos','Desenhar uma arquitetura simples']},
  {id:'stage3',stage:3,name:'Stage 3 — Cloud Security, identidade e automação',period:'Meses 11–14',focus:'Unir Cyber, Cloud e automação com Python.',courses:[
    {name:'Certificação Microsoft SC-900',url:'https://www.udemy.com/course/certificacao-microsoft-sc-900/',why:'Identidade, Zero Trust e segurança Microsoft.'},
    {name:'Python para Cibersegurança: do básico à automação',url:'https://www.udemy.com/course/python-para-ciberseguranca-do-basico-a-automacao/',why:'Scripts de apoio e análise de dados/logs.'},
    {name:'English for Job Interviews: Speak with Confidence',url:'https://www.udemy.com/course/job-interview-english/',why:'Entrevistas e comunicação profissional.'}
  ],goals:['Ler logs simulados','Explicar MFA e least privilege','Fazer uma mock interview']}
];
const EXAMS=[
  {name:'Road to Cyber — Ciclo 01',date:'18/12/2026',base:'Python + inglês',type:'Interna'},
  {name:'Road to Cyber — Ciclo 02',date:'29/01/2027',base:'Python + redes',type:'Interna'},
  {name:'Road to Cyber — Ciclo 03',date:'26/03/2027',base:'Linux + inglês técnico',type:'Interna'},
  {name:'Road to Cyber — Ciclo 04',date:'21/05/2027',base:'Cyber básico + redes',type:'Interna'},
  {name:'Road to Cyber — Ciclo 05',date:'30/07/2027',base:'Cloud fundamentals',type:'Interna'},
  {name:'Road to Cyber — Ciclo 06',date:'24/09/2027',base:'Cloud security + inglês',type:'Interna'},
  {name:'Road to Cyber — Ciclo 07',date:'03/12/2027',base:'Portfólio + mock interview',type:'Interna'}
];
const EXTERNAL_EXAMS=[
  {title:'Microsoft Learn — AZ-900 learning path',url:'https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/',cat:'Cloud',desc:'Base oficial para conceitos de nuvem/Azure.'},
  {title:'Microsoft Learn — SC-900 learning path',url:'https://learn.microsoft.com/training/paths/describe-concepts-of-security-compliance-identity/',cat:'Cyber',desc:'Segurança, conformidade e identidade.'},
  {title:'Cambridge English — sample tests B1/B2',url:'https://www.cambridgeenglish.org/exams-and-tests/qualifications/preliminary/preparation/',cat:'English',desc:'Amostras de prova de inglês com foco CEFR.'},
  {title:'Cisco Skills for All — Networking Basics',url:'https://skillsforall.com/course/networking-basics',cat:'Network',desc:'Curso/lab introdutório de redes.'},
  {title:'PortSwigger Web Security Academy',url:'https://portswigger.net/web-security',cat:'Security',desc:'Labs de segurança web com trilhas guiadas.'},
  {title:'Microsoft Learn — Python fundamentals',url:'https://learn.microsoft.com/pt-br/training/paths/get-started-with-python-fundamentals/',cat:'Python',desc:'Trilha gratuita complementar a Python.'},
  {title:'British Council — B2 Speaking',url:'https://learnenglish.britishcouncil.org/free-resources/speaking/b2',cat:'English',desc:'Atividades de conversação em inglês nível B2.'},
  {title:'AWS — Certification exam prep',url:'https://aws.amazon.com/certification/certification-prep/',cat:'Cloud',desc:'Questões e materiais oficiais gratuitos da AWS; identifique os itens Free.'}
];
const LABS=[
  {title:'TryHackMe — Pre Security',url:'https://tryhackme.com/path/outline/presecurity',cat:'Cyber',desc:'Boa porta de entrada para segurança e redes.'},
  {title:'OverTheWire — Bandit',url:'https://overthewire.org/wargames/bandit/',cat:'Linux',desc:'Treino gamificado de terminal e raciocínio.'},
  {title:'Cisco Packet Tracer + labs',url:'https://www.netacad.com/courses/packet-tracer',cat:'Network',desc:'Simular redes e testar topologias.'},
  {title:'Google Cloud Skills Boost (free labs list)',url:'https://www.cloudskillsboost.google/catalog?locale=pt_BR',cat:'Cloud',desc:'Labs guiados de cloud; filtre os gratuitos.'},
  {title:'n8n Learn',url:'https://learn.n8n.io/',cat:'Automation',desc:'Automações e integrações sem depender de empresa.'},
  {title:'Kaggle Learn — Intro to Python',url:'https://www.kaggle.com/learn/python',cat:'Python',desc:'Pequenas lições e exercícios práticos.'},
  {title:'OWASP Juice Shop',url:'https://owasp.org/projects/juice-shop',cat:'Web security',desc:'Aplicativo deliberadamente vulnerável para treinos em ambiente autorizado.'},
  {title:'TryHackMe — SOC Level 1',url:'https://tryhackme.com/path/outline/soclevel1',cat:'Blue Team',desc:'Monitoramento e investigação defensiva; confira quais salas são gratuitas.'},
  {title:'AWS Skill Builder',url:'https://aws.amazon.com/training/digital/',cat:'Cloud',desc:'Cursos e recursos digitais gratuitos; alguns laboratórios são pagos.'}
];

let me=null, profile=null, group=null, roster=[], sessions=[], scores=[];
let refreshing=false;
let resetMode=false;
function message(t,kind='info'){const el=$('authMessage');el.textContent=t;el.className='notice '+kind;el.classList.remove('hidden');}
function toast(t){const n=document.createElement('div');n.textContent=t;n.style.cssText='position:fixed;bottom:24px;right:24px;z-index:9999;max-width:420px;border:1px solid #4df5ff;background:#0d2331;color:white;padding:15px 20px;border-radius:14px;box-shadow:0 0 30px #4df5ff33;font:600 13px system-ui';document.body.append(n);setTimeout(()=>n.remove(),4400);}
function setAuthTab(tab){$('loginForm').classList.toggle('hidden',tab!=='login');$('signupForm').classList.toggle('hidden',tab!=='signup');$('tabLoginBtn').className='btn '+(tab==='login'?'primary':'ghost');$('tabSignupBtn').className='btn '+(tab==='signup'?'primary':'ghost');}
function showLogin(){ $('authView').classList.remove('hidden');$('appView').classList.add('hidden'); }
function showApp(){ $('authView').classList.add('hidden');$('appView').classList.remove('hidden'); }
async function startSession(sess){if(!sess?.user){me=null;profile=null;group=null;showLogin();return;}me=sess.user;showApp();await refresh();}
function errorText(err){const s=String(err?.message||err||'Erro desconhecido');return s.includes('Invalid login credentials')?'E-mail ou senha incorretos.':s.includes('Email not confirmed')?'Confirme seu e-mail antes de entrar.':s.includes('rate limit')?'Limite de e-mails atingido; tente novamente mais tarde.':s.toLowerCase().includes('email address not authorized')?'E-mail não autorizado pelo serviço padrão do Supabase. Use Entrar com Google ou configure seu próprio SMTP gratuito.':s;}
function urlBase(){return location.origin+location.pathname;}
function pendingInvite(){return (new URLSearchParams(location.search).get('convite')||localStorage.getItem('rtc_pending_invite')||'').trim();}
async function applyInviteIfNeeded(){const code=pendingInvite();if(!code || group)return;const {error}=await sb.rpc('rtc_join_group',{p_invite_code:code});if(error){toast('Convite pendente: '+errorText(error));return;}localStorage.removeItem('rtc_pending_invite');history.replaceState({},'',urlBase());}
async function refresh(){if(!me || refreshing)return;refreshing=true;try{
  const {data:p,error:pe}=await sb.from('profiles').select('id,display_name,username,english_level,stage').eq('id',me.id).single();if(pe)throw pe;profile=p;
  const {data:ms,error:meErr}=await sb.from('group_members').select('group_id,user_id').eq('user_id',me.id).limit(1);if(meErr)throw meErr;
  group=null;roster=[];
  if(ms?.length){const {data:g,error:ge}=await sb.from('study_groups').select('id,name,invite_code,target_stage,owner_id').eq('id',ms[0].group_id).single();if(ge)throw ge;group=g;}
  else if(pendingInvite()){await applyInviteIfNeeded();const {data:newm}=await sb.from('group_members').select('group_id').eq('user_id',me.id).limit(1);if(newm?.length){const {data:g}=await sb.from('study_groups').select('id,name,invite_code,target_stage,owner_id').eq('id',newm[0].group_id).single();group=g||null;}}
  if(group){const {data:membership,error:memberErr}=await sb.from('group_members').select('user_id').eq('group_id',group.id);if(memberErr)throw memberErr;const ids=(membership||[]).map(x=>x.user_id);if(ids.length){const {data:people,error:peopleErr}=await sb.from('profiles').select('id,display_name,username,stage').in('id',ids);if(peopleErr)throw peopleErr;roster=people||[];}}
  const [{data:ss,error:se},{data:sc,error:sce}]=await Promise.all([sb.from('study_sessions').select('id,session_day,status,focus,duration_minutes,notes,created_at').eq('user_id',me.id).order('created_at',{ascending:false}).limit(300),sb.from('exam_scores').select('id,resource,score,notes,created_at').eq('user_id',me.id).order('created_at',{ascending:false}).limit(300)]);
  if(se)throw se;if(sce)throw sce;
  sessions=ss||[];scores=sc||[];render();
}catch(e){console.error(e);toast('Falha ao carregar dados: '+errorText(e));}finally{refreshing=false;}}
function groupStatus(){if(!group)return 'sem grupo';return group.name;}
function stageData(n){return TRACKS.find(x=>x.stage===n)||TRACKS[0];}
function render(){if(!me||!profile)return;showApp();$('sideUserName').textContent=profile.display_name;$('sideUserMeta').textContent=group?group.name+' • Stage '+profile.stage:'Sem grupo • Stage '+profile.stage;$('welcomeUser').textContent='Olá, '+profile.display_name;
  const avg=scores.length?Math.round(scores.reduce((a,b)=>a+b.score,0)/scores.length):0;
  $('dashboardStats').innerHTML=[['Sessões registradas',sessions.length,'histórico pessoal'],['Concluídas',sessions.filter(s=>s.status==='done').length,'sessões feitas'],['Média de simulados',avg+'%','resultados registrados'],['Pessoas no grupo',roster.length,groupStatus()]].map(([label,value,sub])=>`<div class="panel stat glow"><div class="label">${esc(label)}</div><div class="value">${esc(value)}</div><div class="sub">${esc(sub)}</div></div>`).join('');
  $('groupBadge').textContent=groupStatus();$('currentStagePill').textContent='Stage '+profile.stage;$('stageSummary').textContent=stageData(profile.stage).name;$('userProgressBar').style.width=Math.min(100,Math.max(6,Math.round((profile.stage+1)*23)))+'%';
  const delta=group?Math.max(0,group.target_stage-profile.stage):0;
  $('catchUpText').textContent=!group?'Entre em um grupo para comparar fases.':delta?`Você está ${delta} etapa(s) atrás da fase-alvo do grupo.`:'Você alcançou a fase-alvo do grupo.';
  $('nextTasks').innerHTML=stageData(profile.stage).goals.map(x=>`<li>${esc(x)}</li>`).join('');
  $('inviteBox').innerHTML=group?`<strong>${esc(group.name)}</strong><br>Código: <code>${esc(group.invite_code)}</code><br><small>Fase-alvo ${group.target_stage}</small>`:'Crie ou entre em um grupo para receber um convite.';
  $('weeklyCards').innerHTML=DAY_PLAN.map(d=>{const last=sessions.find(s=>s.session_day===d.day);const tag=last?({done:'Concluí',miss:'Não fiz',skip:'Dispensado'}[last.status]):'Sem registro';return `<div class="day-card glow"><h4>${esc(d.day)}</h4><div class="small">${esc(d.focus)} • ${esc(d.duration)}</div><p class="small" style="margin-top:8px">${esc(d.desc)}</p><div class="status-row"><span class="status ${last?esc(last.status):''}">${esc(tag)}</span></div>${last?.notes?`<div class="small" style="margin-top:8px">Última nota: ${esc(last.notes)}</div>`:''}</div>`;}).join('');
  $('trackCards').innerHTML=TRACKS.map(t=>`<div class="panel card track-card glow"><div class="split"><span class="pill">Stage ${t.stage}</span><span class="pill mag">${esc(t.period)}</span></div><h3>${esc(t.name)}</h3><p>${esc(t.focus)}</p><div><strong>Cursos</strong><div class="linklist" style="margin-top:10px">${t.courses.map(c=>`<a class="linkcard" href="${c.url}" target="_blank" rel="noopener"><strong>${esc(c.name)}</strong><small>${esc(c.why)}</small></a>`).join('')}</div></div><div><strong>Objetivos</strong><ul>${t.goals.map(g=>`<li>${esc(g)}</li>`).join('')}</ul></div></div>`).join('');
  $('groupSummaryBox').innerHTML=group?`<strong>${esc(group.name)}</strong><br>Código: <code>${esc(group.invite_code)}</code><br><small>Fase-alvo: ${group.target_stage}</small>`:'Você ainda não participa de um grupo.';
  $('memberList').innerHTML=roster.map(m=>`<div class="member glow"><strong>${esc(m.display_name)}</strong><div class="role">@${esc(m.username)} • Stage ${m.stage}${m.id===group.owner_id?' • fundador':''}</div><div class="delta">${m.stage<group.target_stage?`Em recuperação: faltam ${group.target_stage-m.stage} fase(s)`:'Na fase-alvo ou acima'}</div></div>`).join('');
  $('catchupBox').innerHTML=!group?'Entre em um grupo para ver sua trajetória com a equipe.':delta?`Você precisa alcançar Stage ${group.target_stage}. Próximas fases: <ul>${TRACKS.filter(t=>t.stage>profile.stage && t.stage<=group.target_stage).map(t=>`<li>${esc(t.name)}</li>`).join('')}</ul>`:'Você está alinhado com a fase atual do grupo.';
  $('profileName').value=profile.display_name;$('profileUser').value=profile.username;$('profileEnglish').value=profile.english_level;$('profileStage').value=String(profile.stage);
  $('advanceStageBtn').disabled=!group||group.owner_id!==me.id||group.target_stage>=4;
  $('scoreHistory').innerHTML=scores.length?scores.slice(0,6).map(s=>`<div class="linkcard"><div class="split"><strong>${esc(s.resource)}</strong><span class="pill">${s.score}%</span></div><small>${new Date(s.created_at).toLocaleDateString('pt-BR')} • ${esc(s.notes)}</small></div>`).join(''):'<div class="small">Nenhuma nota registrada ainda.</div>';
}
function setupStatic(){
  $('examLinks').innerHTML=EXTERNAL_EXAMS.map(x=>`<a class="linkcard" href="${x.url}" target="_blank" rel="noopener"><strong>${esc(x.title)}</strong><small>${esc(x.cat)} • ${esc(x.desc)}</small></a>`).join('');
  $('labLinks').innerHTML=LABS.map(x=>`<a class="linkcard" href="${x.url}" target="_blank" rel="noopener"><strong>${esc(x.title)}</strong><small>${esc(x.cat)} • ${esc(x.desc)}</small></a>`).join('');
  $('scoreResource').innerHTML=[...EXTERNAL_EXAMS,...LABS,...EXAMS.map(x=>({title:x.name}))].map(x=>`<option>${esc(x.title)}</option>`).join('');
  $('internalExamTable').innerHTML=EXAMS.map((e,i)=>`<tr><td><strong>${esc(e.name)}</strong></td><td>${esc(e.date)}</td><td>${esc(e.base)}</td><td><button class="btn ghost sm" type="button" data-quiz="${i}">Fazer prova</button></td></tr>`).join('');
}
async function handleResult(res,okText){if(res.error)throw res.error;if(okText)toast(okText);await refresh();}
function bind(){
 $('tabLoginBtn').onclick=()=>setAuthTab('login');$('tabSignupBtn').onclick=()=>setAuthTab('signup');
 $('loginForm').onsubmit=async e=>{e.preventDefault();if(!sb)return message('Configure config.js antes de tentar entrar.','warn');try{const r=await sb.auth.signInWithPassword({email:$('loginUser').value.trim(),password:$('loginPass').value});if(r.error)throw r.error;await startSession(r.data.session);}catch(err){message(errorText(err),'warn');}};
 $('signupForm').onsubmit=async e=>{e.preventDefault();if(!sb)return message('Configure config.js antes do cadastro.','warn');try{const name=$('suName').value.trim(),email=$('suEmail').value.trim(),password=$('suPass').value;if(!name||!email||password.length<6)throw new Error('Informe nome, e-mail válido e uma senha de pelo menos 6 caracteres.');const code=$('suInvite').value.trim();if(code)localStorage.setItem('rtc_pending_invite',code);
 const r=await sb.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:urlBase()}});if(r.error)throw r.error;
 if(r.data.session){await startSession(r.data.session);message('Conta criada e conectada.','good');}else{setAuthTab('login');message('Cadastro recebido. Verifique seu e-mail e clique no link de confirmação. Depois entre usando e-mail e senha.','good');}
 }catch(err){message(errorText(err),'warn');}};
 $('googleBtn').onclick=async()=>{if(!sb)return message('Configure o Supabase primeiro.','warn');const code=pendingInvite();if(code)localStorage.setItem('rtc_pending_invite',code);const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:urlBase()}});if(error)message(errorText(error),'warn');};
 $('forgotBtn').onclick=async()=>{if(!sb)return message('Primeiro configure o Supabase.','warn');const email=$('loginUser').value.trim();if(!email)return message('Digite seu e-mail no campo de login e clique novamente em Recuperar senha.','warn');const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:urlBase()});if(error)message(errorText(error),'warn');else message('Se o e-mail existir, você receberá instruções de recuperação.','good');};
 $('resetForm').onsubmit=async e=>{e.preventDefault();const pass=$('resetPassword').value;if(pass.length<6)return message('Use no mínimo 6 caracteres.','warn');const {error}=await sb.auth.updateUser({password:pass});if(error)return message(errorText(error),'warn');$('resetForm').classList.add('hidden');resetMode=false;message('Senha atualizada. Você já pode entrar novamente.','good');await sb.auth.signOut();};
 document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===b.dataset.page));document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x===b));$('crumbTitle').textContent=b.textContent.trim();});
 $('logoutBtn').onclick=async()=>{await sb.auth.signOut();me=null;showLogin();};
 const openModal=()=> $('groupModalWrap').classList.add('show');
 $('openGroupModal').onclick=openModal;$('communityCreateGroup').onclick=openModal;$('communityJoinGroup').onclick=openModal;$('closeGroupModal').onclick=()=>$('groupModalWrap').classList.remove('show');
 $('createGroupForm').onsubmit=async e=>{e.preventDefault();try{const res=await sb.rpc('rtc_create_group',{p_name:$('groupName').value.trim(),p_target_stage:+$('groupTarget').value});await handleResult(res,'Grupo criado! Agora compartilhe o convite.');$('groupModalWrap').classList.remove('show');}catch(err){toast(errorText(err));}};
 $('joinGroupForm').onsubmit=async e=>{e.preventDefault();try{const res=await sb.rpc('rtc_join_group',{p_invite_code:$('joinCode').value.trim()});await handleResult(res,'Você entrou no grupo!');$('groupModalWrap').classList.remove('show');}catch(err){toast(errorText(err));}};
 $('copyInviteBtn').onclick=async()=>{if(!group)return toast('Crie um grupo primeiro.');const link=urlBase()+'?convite='+encodeURIComponent(group.invite_code);try{await navigator.clipboard.writeText(link);toast('Link de convite copiado.');}catch(e){prompt('Copie o link:',link);}};
 $('advanceStageBtn').onclick=async()=>{if(!group||group.owner_id!==me.id)return toast('Só o criador do grupo pode avançar a fase.');try{await handleResult(await sb.rpc('rtc_set_group_target',{p_group_id:group.id,p_stage:Math.min(4,group.target_stage+1)}),'Fase-alvo do grupo atualizada.');}catch(err){toast(errorText(err));}};
 $('sessionForm').onsubmit=async e=>{e.preventDefault();try{const item={user_id:me.id,session_day:$('sessionDay').value,status:$('sessionStatus').value,focus:$('sessionFocus').value,duration_minutes:parseInt($('sessionDuration').value,10),notes:$('sessionNotes').value.trim()};await handleResult(await sb.from('study_sessions').insert(item),'Sessão salva na nuvem.');e.target.reset();}catch(err){toast(errorText(err));}};
 $('fillWeekPlan').onclick=()=>{$('sessionDay').value='Segunda';$('sessionStatus').value='done';$('sessionFocus').value='Cyber / Cloud';$('sessionDuration').value='60 min';$('sessionNotes').value='Aula, anotações e exercício';};
 $('scoreForm').onsubmit=async e=>{e.preventDefault();try{const score=Number($('scoreValue').value);if(!Number.isInteger(score)||score<0||score>100)throw new Error('Informe uma nota de 0 a 100.');await handleResult(await sb.from('exam_scores').insert({user_id:me.id,resource:$('scoreResource').value,score,notes:$('scoreNotes').value.trim()}),'Nota salva na nuvem.');e.target.reset();}catch(err){toast(errorText(err));}};
 $('saveProfileBtn').onclick=async()=>{try{const changes={display_name:$('profileName').value.trim(),username:$('profileUser').value.trim(),english_level:$('profileEnglish').value,stage:+$('profileStage').value};const res=await sb.from('profiles').update(changes).eq('id',me.id);await handleResult(res,'Perfil atualizado.');}catch(err){toast(errorText(err));}};
 $('openQuickCreate').textContent='Convidar colega';$('openQuickCreate').onclick=()=>{const btn=document.querySelector('[data-page="community"]');btn.click();toast('Compartilhe o link de convite com o novo estudante.');};
 // Não criamos senhas para outras pessoas no frontend: cada convidado cadastra a própria conta.
 const q=$('quickCreateForm');q.innerHTML=`<p>Para adicionar uma pessoa, use o link do seu grupo. Cada colega cadastra o próprio e-mail e senha com segurança.</p><button id="quickInvite" class="btn primary" type="button">Copiar link de convite</button><div class="notice info" style="margin-top:12px">Se a pessoa já tiver uma conta, ela pode acessar Comunidade → Entrar com convite.</div>`;
 $('quickInvite').onclick=()=>$('copyInviteBtn').click();
 $('backupBtn').onclick=()=>{const blob=new Blob([JSON.stringify({version:5,exported_at:new Date().toISOString(),profile,sessions,scores},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='road_to_cyber_meu_backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),250);};
 $('restoreFile').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(data.version!==5||!Array.isArray(data.sessions)||!Array.isArray(data.scores))throw new Error('Backup incompatível. Use exportação da versão 5.');if(data.sessions.length>300||data.scores.length>300)throw new Error('Backup muito grande.');if(!confirm('Importar os registros desse backup para a SUA conta? Pode criar duplicatas.'))return;const ses=data.sessions.map(s=>({user_id:me.id,session_day:s.session_day,status:s.status,focus:String(s.focus||'').slice(0,100),duration_minutes:+s.duration_minutes,notes:String(s.notes||'').slice(0,5000)}));const sc=data.scores.map(s=>({user_id:me.id,resource:String(s.resource||'').slice(0,200),score:+s.score,notes:String(s.notes||'').slice(0,3000)}));if(ses.length){const r=await sb.from('study_sessions').insert(ses);if(r.error)throw r.error;}if(sc.length){const r=await sb.from('exam_scores').insert(sc);if(r.error)throw r.error;}toast('Backup importado.');await refresh();}catch(err){toast('Importação não concluída: '+errorText(err));}finally{e.target.value='';}};
 $('internalExamTable').addEventListener('click',e=>{const b=e.target.closest('[data-quiz]');if(b)showQuiz(+b.dataset.quiz);});
}
const QUESTIONS=[
  {q:'Em Python, qual operador compara igualdade?',opts:['=','==','=>','<>'],a:1},
  {q:'Qual método remove espaços no início e no final de um texto?',opts:['clear()','strip()','splitlines()','append()'],a:1},
  {q:'O que significa DNS?',opts:['Sistema de nomes de domínio','Armazenamento de senha','Tipo de cabo','Formato de arquivo'],a:0},
  {q:'O que significa MFA em segurança?',opts:['Login sem senha','Autenticação multifator','Antivírus local','Auditoria financeira'],a:1},
  {q:'Qual frase descreve melhor um problema técnico?',opts:['The server not work yesterday','The server was unavailable yesterday','Server no function','Yesterday server off no'],a:1},
  {q:'Em Cloud, quem protege as credenciais de acesso do cliente?',opts:['Sempre o provedor, sem exceção','Ninguém','O cliente deve gerenciar o uso seguro de suas credenciais','O navegador automaticamente'],a:2},
  {q:'Qual ação é mais segura para testar um script de Cyber?',opts:['Usar servidores de terceiros sem permissão','Usar ambiente pessoal/autorizado e dados fictícios','Pegar dados reais de colegas','Desativar logs'],a:1}
];
function showQuiz(cycle){const overlay=document.createElement('div');overlay.className='modal-backdrop show';const count=cycle<2?5:7;const qs=QUESTIONS.slice(0,count);overlay.innerHTML=`<div class="panel modal glow"><div class="section-head"><h2>Simulado ${cycle+1} — Road to Cyber</h2><button type="button" class="btn ghost sm" id="quizClose">Fechar</button></div><p class="small">Questões autorais de revisão, não equivalentes a certificações oficiais.</p><form id="quizForm">${qs.map((q,i)=>`<div class="neo-card" style="margin:12px 0"><strong>${i+1}. ${esc(q.q)}</strong>${q.opts.map((o,j)=>`<label style="margin-top:9px"><input style="width:auto;margin-right:7px" type="radio" name="question${i}" value="${j}" required />${esc(o)}</label>`).join('')}</div>`).join('')}<button class="btn primary full" type="submit">Corrigir e registrar nota</button></form></div>`;document.body.append(overlay);overlay.querySelector('#quizClose').onclick=()=>overlay.remove();overlay.querySelector('#quizForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);let right=0;qs.forEach((q,i)=>{if(Number(fd.get('question'+i))===q.a)right++;});const score=Math.round(right/qs.length*100);const res=await sb.from('exam_scores').insert({user_id:me.id,resource:EXAMS[cycle]?.name||'Road to Cyber',score,notes:`Simulado autoral: ${right}/${qs.length} acertos`});if(res.error)return toast(errorText(res.error));overlay.remove();toast(`Você acertou ${right}/${qs.length} e tirou ${score}%. Nota salva.`);refresh();};}
function startMatrix(){const canvas=$('matrix');if(!canvas)return;const ctx=canvas.getContext('2d');const glyphs='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789学習未来雲網守心'.split('');let drops=[];function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);drops=Array(Math.ceil(innerWidth/18)).fill(1);}resize();addEventListener('resize',resize);if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;setInterval(()=>{ctx.fillStyle='rgba(6,8,22,.08)';ctx.fillRect(0,0,innerWidth,innerHeight);ctx.font='16px monospace';drops.forEach((y,i)=>{ctx.fillStyle=i%7===0?'#ff4dce':i%5===0?'#a9ff5a':'#4df5ff';ctx.fillText(glyphs[Math.floor(Math.random()*glyphs.length)],i*18,y*18);if(y*18>innerHeight&&Math.random()>.97)drops[i]=0;else drops[i]++;});},85);}
function initialize(){
 // Não confiar na tela para proteger o banco: RLS decide o acesso no servidor.
 $('loginForm').querySelector('label').textContent='E-mail';$('loginUser').placeholder='voce@email.com';$('loginUser').type='email';$('suEmail').required=true;$('suPass').minLength=6;
 $('suUser').required=false;$('suUser').closest('div').classList.add('hidden');$('suEmail').closest('div').classList.remove('hidden');$('suInvite').value=pendingInvite();
 $('demoSeedBtn').remove();
{const n=document.querySelector('#authView .notice.good');if(n)n.textContent='Contas reais: cada pessoa usa a própria conta, protegida por Supabase Auth e regras de acesso (RLS).';}
 document.querySelector('#loginForm .auth-footer').innerHTML='<small>Login com Supabase Auth • Seus dados são privados por padrão.</small><button class="btn ghost sm" id="forgotBtn" type="button">Recuperar senha</button>';
 $('authView').querySelector('.auth-tabs').insertAdjacentHTML('afterend','<button class="btn primary full" id="googleBtn" type="button" style="margin-bottom:14px">Entrar com Google (recomendado)</button><p class="small" style="margin-top:-6px">O cadastro por e-mail/senha requer configurar um serviço de e-mail próprio no Supabase para usuários externos.</p>');
 $('authView').querySelector('.auth-card').insertAdjacentHTML('beforeend','<form id="resetForm" class="hidden" style="margin-top:16px"><label>Defina uma nova senha</label><input id="resetPassword" type="password" minlength="6" required placeholder="Nova senha (mínimo 6 caracteres)" /><button class="btn primary full" style="margin-top:10px" type="submit">Salvar nova senha</button></form>');
 $('sideUserMeta').textContent='Conta Supabase';
 setupStatic();bind();startMatrix();setAuthTab('login');showLogin();
 if(!ready){message('CONFIGURAÇÃO PENDENTE: edite config.js com o Project URL e a publishable key do Supabase. Depois publique os arquivos no GitHub Pages.','warn');return;}
 sb.auth.onAuthStateChange((event,session)=>{setTimeout(()=>{if(event==='PASSWORD_RECOVERY'){$('resetForm').classList.remove('hidden');resetMode=true;showLogin();message('Crie uma nova senha abaixo.','info');}else if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='TOKEN_REFRESHED'){if(!resetMode)startSession(session);}},0);});
 sb.auth.getSession().then(({data,error})=>{if(error)message(errorText(error),'warn');else startSession(data.session);});
}
initialize();
