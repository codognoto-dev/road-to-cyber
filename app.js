'use strict';

const el = (id) => document.getElementById(id);
const bySel = (s, root=document) => root.querySelector(s);
const all = (s, root=document) => Array.from(root.querySelectorAll(s));
const safeText = (id, value) => { const n = el(id); if (n) n.textContent = value; };
const safeHTML = (id, value) => { const n = el(id); if (n) n.innerHTML = value; };
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cfg = window.ROAD_TO_CYBER || {};
const ready = Boolean(window.supabase?.createClient && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.supabaseUrl || '') && cfg.supabasePublishableKey && !String(cfg.supabasePublishableKey).includes('COLE_AQUI'));
const sb = ready ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey) : null;
const DEFAULT_DAYS = ['Segunda','Quarta','Sexta'];
const DAYS = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const FOCUS_OPTIONS = ['Cyber / Cloud','Inglês','Revisão / Laboratório','Encontro com grupo'];
const TRACKS = [
  {stage:0,name:'Stage 0 — Fundamentos & rotina',period:'Semanas 1–4',focus:'Construir consistência, lógica básica e inglês ativo.',courses:[
    {name:'Python para Iniciantes: Do Zero e Direto ao Ponto',url:'https://www.udemy.com/course/python-direto-ao-ponto/',why:'Variáveis, if/else, listas e funções.'},
    {name:'Speak English With Confidence',url:'https://www.udemy.com/course/english-speaking/',why:'Destravamento de fala e confiança.'}
  ],goals:['Entender if/else','Explicar uma validação simples','Gravar apresentação curta em inglês']},
  {stage:1,name:'Stage 1 — Redes, Linux e funcionamento dos sistemas',period:'Meses 2–5',focus:'Como servidores, redes e aplicações se conectam.',courses:[
    {name:'Arquitetura de Redes — Gabriel Torres',url:'https://www.udemy.com/course/redes-modulo-1/',why:'IP, DNS, portas e protocolos.'},
    {name:'Primeiros Passos no Linux',url:'https://www.udemy.com/course/primeiros-passos-no-linux/',why:'Terminal, arquivos, permissões, processos.'},
    {name:'English for IT Professionals',url:'https://www.udemy.com/course/english-for-it-professionals/',why:'Vocabulário e situações de TI.'}
  ],goals:['Explicar DNS e HTTPS','Executar comandos Linux básicos','Descrever um problema técnico em inglês']},
  {stage:2,name:'Stage 2 — Cyber + Cloud base',period:'Meses 6–10',focus:'Fundamentos de segurança, nuvem e responsabilidade compartilhada.',courses:[
    {name:'Cibersegurança para Iniciantes',url:'https://www.udemy.com/course/ciberseguranca-para-iniciantes/',why:'Ameaças, controles e visão de carreira.'},
    {name:'Microsoft Azure + Preparação AZ-900',url:'https://www.udemy.com/course/introducao-ao-microsoft-azure-certificacao-az-900/',why:'Conceitos de nuvem e Azure.'},
    {name:'Fundamentos da Segurança da Informação e Cyber Security',url:'https://www.udemy.com/course/fundamentos-e-gestao-seguranca-da-informacao/',why:'Segurança técnica e GRC.'}
  ],goals:['Explicar IaaS/PaaS/SaaS','Mapear riscos básicos','Desenhar uma arquitetura simples']},
  {stage:3,name:'Stage 3 — Cloud Security, identidade e automação',period:'Meses 11–14',focus:'Unir Cyber, Cloud e automação com Python.',courses:[
    {name:'Certificação Microsoft SC-900',url:'https://www.udemy.com/course/certificacao-microsoft-sc-900/',why:'Identidade, Zero Trust e segurança Microsoft.'},
    {name:'Python para Cibersegurança: do básico à automação',url:'https://www.udemy.com/course/python-para-ciberseguranca-do-basico-a-automacao/',why:'Scripts de apoio e análise de dados/logs.'},
    {name:'English for Job Interviews: Speak with Confidence',url:'https://www.udemy.com/course/job-interview-english/',why:'Entrevistas e comunicação profissional.'}
  ],goals:['Ler logs simulados','Explicar MFA e least privilege','Fazer uma mock interview']},
  {stage:4,name:'Stage 4 — Portfólio e preparo profissional',period:'Meses finais',focus:'Consolidar projetos, currículo e entrevistas.',courses:[
    {name:'English for Job Interviews: Speak with Confidence',url:'https://www.udemy.com/course/job-interview-english/',why:'Entrevistas e comunicação profissional.'}
  ],goals:['Montar portfólio','Fazer mock interview','Revisar trilha completa']}
];
const EXAMS = [
  {name:'Road to Cyber — Ciclo 01',date:'18/12/2026',base:'Python + inglês'},
  {name:'Road to Cyber — Ciclo 02',date:'29/01/2027',base:'Python + redes'},
  {name:'Road to Cyber — Ciclo 03',date:'26/03/2027',base:'Linux + inglês técnico'},
  {name:'Road to Cyber — Ciclo 04',date:'21/05/2027',base:'Cyber básico + redes'},
  {name:'Road to Cyber — Ciclo 05',date:'30/07/2027',base:'Cloud fundamentals'},
  {name:'Road to Cyber — Ciclo 06',date:'24/09/2027',base:'Cloud security + inglês'},
  {name:'Road to Cyber — Ciclo 07',date:'03/12/2027',base:'Portfólio + mock interview'}
];
const EXTERNAL_EXAMS = [
  {title:'Microsoft Learn — AZ-900 learning path',url:'https://learn.microsoft.com/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/',cat:'Cloud',desc:'Base oficial para conceitos de nuvem/Azure.'},
  {title:'Microsoft Learn — SC-900 learning path',url:'https://learn.microsoft.com/training/paths/describe-concepts-of-security-compliance-identity/',cat:'Cyber',desc:'Segurança, conformidade e identidade.'},
  {title:'Cambridge English — sample tests B1/B2',url:'https://www.cambridgeenglish.org/exams-and-tests/qualifications/preliminary/preparation/',cat:'English',desc:'Amostras de prova de inglês.'},
  {title:'Cisco Skills for All — Networking Basics',url:'https://skillsforall.com/course/networking-basics',cat:'Network',desc:'Curso/lab introdutório de redes.'},
  {title:'PortSwigger Web Security Academy',url:'https://portswigger.net/web-security',cat:'Security',desc:'Labs de segurança web guiados.'},
  {title:'Microsoft Learn — Python fundamentals',url:'https://learn.microsoft.com/pt-br/training/paths/get-started-with-python-fundamentals/',cat:'Python',desc:'Trilha complementar de Python.'}
];
const LABS = [
  {title:'TryHackMe — Pre Security',url:'https://tryhackme.com/path/outline/presecurity',cat:'Cyber',desc:'Boa porta de entrada para segurança e redes.'},
  {title:'OverTheWire — Bandit',url:'https://overthewire.org/wargames/bandit/',cat:'Linux',desc:'Treino gamificado de terminal e raciocínio.'},
  {title:'Cisco Packet Tracer + labs',url:'https://www.netacad.com/courses/packet-tracer',cat:'Network',desc:'Simular redes e testar topologias.'},
  {title:'Google Cloud Skills Boost',url:'https://www.cloudskillsboost.google/catalog?locale=pt_BR',cat:'Cloud',desc:'Labs guiados de cloud; filtre os gratuitos.'},
  {title:'n8n Learn',url:'https://learn.n8n.io/',cat:'Automation',desc:'Automações e integrações.'},
  {title:'Kaggle Learn — Intro to Python',url:'https://www.kaggle.com/learn/python',cat:'Python',desc:'Pequenas lições e exercícios práticos.'}
];
const QUESTIONS = [
  {q:'Em Python, qual operador compara igualdade?',opts:['=','==','=>','<>'],a:1},
  {q:'Qual método remove espaços no início e no final de um texto?',opts:['clear()','strip()','splitlines()','append()'],a:1},
  {q:'O que significa DNS?',opts:['Sistema de nomes de domínio','Armazenamento de senha','Tipo de cabo','Formato de arquivo'],a:0},
  {q:'O que significa MFA em segurança?',opts:['Login sem senha','Autenticação multifator','Antivírus local','Auditoria financeira'],a:1},
  {q:'Qual frase descreve melhor um problema técnico?',opts:['The server not work yesterday','The server was unavailable yesterday','Server no function','Yesterday server off no'],a:1},
  {q:'Em Cloud, quem protege as credenciais de acesso do cliente?',opts:['Sempre o provedor','Ninguém','O cliente deve gerenciar o uso seguro das credenciais','O navegador automaticamente'],a:2},
  {q:'Qual ação é mais segura para testar um script de Cyber?',opts:['Usar servidores de terceiros','Usar ambiente autorizado e dados fictícios','Pegar dados reais','Desativar logs'],a:1}
];

let me = null, profile = null, group = null, roster = [], sessions = [], scores = [], refreshing = false, memberSummary = {};
let resetMode = false;

function toast(msg){
  const n=document.createElement('div');
  n.textContent=msg;
  n.style.cssText='position:fixed;bottom:24px;right:24px;z-index:99999;max-width:420px;border:1px solid #4df5ff;background:#0d2331;color:#fff;padding:15px 18px;border-radius:14px;box-shadow:0 0 30px #4df5ff33;font:600 13px system-ui';
  document.body.append(n); setTimeout(()=>n.remove(),4200);
}
function message(text, kind='info'){
  const node = el('authMessage');
  if (!node) return;
  node.textContent = text;
  node.className = 'notice ' + kind;
  node.classList.remove('hidden');
}
function hideMessage(){ const node = el('authMessage'); if (node) node.classList.add('hidden'); }
function setAuthTab(tab){
  const lf = el('loginForm'), sf = el('signupForm');
  if (lf) lf.classList.toggle('hidden', tab !== 'login');
  if (sf) sf.classList.toggle('hidden', tab !== 'signup');
  const b1 = el('tabLoginBtn'), b2 = el('tabSignupBtn');
  if (b1) b1.className = 'btn ' + (tab === 'login' ? 'primary' : 'ghost');
  if (b2) b2.className = 'btn ' + (tab === 'signup' ? 'primary' : 'ghost');
}
function showLogin(){ el('authView')?.classList.remove('hidden'); el('appView')?.classList.add('hidden'); }
function showApp(){ el('authView')?.classList.add('hidden'); el('appView')?.classList.remove('hidden'); }
function errorText(err){
  const s = String(err?.message || err || 'Erro desconhecido');
  if (s.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (s.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (s.toLowerCase().includes('email address not authorized')) return 'O e-mail não está autorizado no serviço padrão do Supabase. Use Entrar com Google.';
  return s;
}
function urlBase(){ return location.origin + location.pathname; }
function currentInvite(){ return (new URLSearchParams(location.search).get('convite') || localStorage.getItem('rtc_pending_invite') || '').trim(); }
function pageKey(){ return me ? `rtc_page_${me.id}` : 'rtc_page_guest'; }
function prefsKey(){ return me ? `rtc_prefs_${me.id}` : 'rtc_prefs_guest'; }
function getPrefs(){
  try {
    const raw = localStorage.getItem(prefsKey());
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      days: Array.isArray(parsed?.days) && parsed.days.length ? parsed.days : [...DEFAULT_DAYS],
      minutes: Number(parsed?.minutes) || 60,
      focusMap: parsed?.focusMap || {}
    };
  } catch { return { days:[...DEFAULT_DAYS], minutes:60, focusMap:{} }; }
}
function savePrefs(prefs){ localStorage.setItem(prefsKey(), JSON.stringify(prefs)); }
function stageData(stage){ return TRACKS.find(t => t.stage === Number(stage)) || TRACKS[0]; }
function streakCount(){
  const done = sessions.filter(s => s.status === 'done').slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  if (!done.length) return 0;
  const dates = [...new Set(done.map(s => new Date(s.created_at).toISOString().slice(0,10)))];
  let streak = 0;
  let cursor = new Date(); cursor.setHours(0,0,0,0);
  for (const d of dates) {
    const curr = cursor.toISOString().slice(0,10);
    const prev = new Date(cursor); prev.setDate(cursor.getDate()-1);
    if (d === curr || d === prev.toISOString().slice(0,10)) { streak++; cursor = new Date(d + 'T00:00:00'); cursor.setDate(cursor.getDate()-1); }
    else break;
  }
  return streak;
}
function achievementList(){
  const count = sessions.filter(s=>s.status==='done').length;
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+Number(b.score||0),0)/scores.length) : 0;
  const list=[];
  if (count >= 1) list.push('Primeira sessão concluída');
  if (count >= 5) list.push('5 sessões de estudo');
  if (count >= 15) list.push('15 sessões de estudo');
  if (avg >= 70 && scores.length) list.push('Média acima de 70%');
  if (profile?.stage >= 1) list.push('Entrou no Stage 1');
  return list;
}
function avgScore(){ return scores.length ? Math.round(scores.reduce((a,b)=>a+Number(b.score||0),0)/scores.length) : 0; }

// O perfil é criado no servidor pelo trigger handle_new_rtc_user.
// IMPORTANTE: nunca executar upsert no login. Isso exige INSERT (bloqueado por RLS)
// e poderia zerar as informações existentes, como a fase do aluno.

async function startSession(sess){
  if (!sess?.user) { me = null; profile = null; group = null; roster = []; sessions=[]; scores=[]; showLogin(); return; }
  me = sess.user;
  showApp();
  await refresh();
}

async function applyInviteIfNeeded(){
  const code = currentInvite();
  if (!code || group || !sb) return;
  const { error } = await sb.rpc('rtc_join_group', { p_invite_code: code });
  if (error) { toast('Convite pendente: ' + errorText(error)); return; }
  localStorage.removeItem('rtc_pending_invite');
  history.replaceState({},'',urlBase());
}

async function loadMemberSummary(ids){
  memberSummary = {};
  if (!ids?.length || !sb) return;
  try {
    // Try to read sessions for group members if policies permit; otherwise silently fallback.
    const [sesRes, scoreRes] = await Promise.all([
      sb.from('study_sessions').select('user_id,status,created_at').in('user_id', ids).order('created_at', {ascending:false}).limit(1000),
      sb.from('exam_scores').select('user_id,score,created_at').in('user_id', ids).order('created_at', {ascending:false}).limit(1000)
    ]);
    if (!sesRes.error && sesRes.data) {
      sesRes.data.forEach(r => {
        memberSummary[r.user_id] ||= { sessions:0, done:0, latest:null, avg:null, scoreCount:0, scoreSum:0 };
        memberSummary[r.user_id].sessions += 1;
        if (r.status === 'done') memberSummary[r.user_id].done += 1;
        if (!memberSummary[r.user_id].latest || new Date(r.created_at) > new Date(memberSummary[r.user_id].latest)) memberSummary[r.user_id].latest = r.created_at;
      });
    }
    if (!scoreRes.error && scoreRes.data) {
      scoreRes.data.forEach(r => {
        memberSummary[r.user_id] ||= { sessions:0, done:0, latest:null, avg:null, scoreCount:0, scoreSum:0 };
        memberSummary[r.user_id].scoreCount += 1;
        memberSummary[r.user_id].scoreSum += Number(r.score||0);
      });
    }
    Object.values(memberSummary).forEach(v => { v.avg = v.scoreCount ? Math.round(v.scoreSum / v.scoreCount) : null; });
  } catch {}
}

async function refresh(){
  if (!me || refreshing || !sb) return;
  refreshing = true;
  try {
    let pRes = await sb.from('profiles').select('id,display_name,username,english_level,stage').eq('id', me.id).single();
    if (pRes.error) {
      if (pRes.error.code === 'PGRST116') {
        throw new Error('Não foi possível abrir seu perfil. Entre em contato com a administração da comunidade.');
      }
      throw pRes.error;
    }
    profile = pRes.data;

    const memberRes = await sb.from('group_members').select('group_id,user_id').eq('user_id', me.id).limit(1);
    if (memberRes.error) throw memberRes.error;
    group = null; roster = [];

    if (memberRes.data?.length) {
      const g = await sb.from('study_groups').select('id,name,invite_code,target_stage,owner_id').eq('id', memberRes.data[0].group_id).single();
      if (g.error) throw g.error;
      group = g.data;
    } else if (currentInvite()) {
      await applyInviteIfNeeded();
      const retry = await sb.from('group_members').select('group_id,user_id').eq('user_id', me.id).limit(1);
      if (retry.data?.length) {
        const g = await sb.from('study_groups').select('id,name,invite_code,target_stage,owner_id').eq('id', retry.data[0].group_id).single();
        if (!g.error) group = g.data;
      }
    }

    if (group) {
      const gm = await sb.from('group_members').select('user_id').eq('group_id', group.id);
      if (gm.error) throw gm.error;
      const ids = (gm.data || []).map(x => x.user_id);
      if (ids.length) {
        const people = await sb.from('profiles').select('id,display_name,username,stage,english_level').in('id', ids);
        if (people.error) throw people.error;
        roster = people.data || [];
        await loadMemberSummary(ids);
      }
    }

    const [sesRes, scoreRes] = await Promise.all([
      sb.from('study_sessions').select('id,user_id,session_day,status,focus,duration_minutes,notes,created_at').eq('user_id', me.id).order('created_at', {ascending:false}).limit(300),
      sb.from('exam_scores').select('id,user_id,resource,score,notes,created_at').eq('user_id', me.id).order('created_at', {ascending:false}).limit(300)
    ]);
    if (sesRes.error) throw sesRes.error;
    if (scoreRes.error) throw scoreRes.error;
    sessions = sesRes.data || [];
    scores = scoreRes.data || [];
    render();
  } catch (e) {
    console.error(e);
    toast('Falha ao carregar dados: ' + errorText(e));
  } finally { refreshing = false; }
}

function routinePlan(){
  const prefs = getPrefs();
  return prefs.days.map((day, idx) => ({
    day,
    focus: prefs.focusMap[day] || (idx === 1 ? 'Inglês' : idx === prefs.days.length - 1 && prefs.days.length > 2 ? 'Revisão / Laboratório' : 'Cyber / Cloud'),
    duration: `${prefs.minutes} min`,
    desc: prefs.minutes >= 60 ? 'Aula + revisão + exercício prático' : prefs.minutes >= 40 ? 'Bloco enxuto e consistente' : 'Sessão rápida de manutenção'
  }));
}

function render(){
  if (!me || !profile) return;
  showApp();
  safeText('sideUserName', profile.display_name);
  safeText('sideUserMeta', group ? `${group.name} • Stage ${profile.stage}` : `Sem grupo • Stage ${profile.stage}`);
  safeText('welcomeUser', `Olá, ${profile.display_name}`);

  const stats = [
    ['Sessões registradas', sessions.length, 'histórico pessoal'],
    ['Concluídas', sessions.filter(s=>s.status==='done').length, 'sessões feitas'],
    ['Média simulados', `${avgScore()}%`, 'resultados registrados'],
    ['Streak atual', streakCount(), 'dias/ocorrências recentes']
  ];
  safeHTML('dashboardStats', stats.map(([label,val,sub]) => `<div class="panel stat glow"><div class="label">${esc(label)}</div><div class="value">${esc(val)}</div><div class="sub">${esc(sub)}</div></div>`).join(''));

  safeText('groupBadge', group ? group.name : 'sem grupo');
  safeText('currentStagePill', `Stage ${profile.stage}`);
  safeText('stageSummary', stageData(profile.stage).name);
  const bar = el('userProgressBar'); if (bar) bar.style.width = `${Math.min(100, Math.max(6, Math.round((Number(profile.stage)+1)*21 + sessions.filter(s=>s.status==='done').length*1.5)))}%`;
  const delta = group ? Math.max(0, Number(group.target_stage) - Number(profile.stage)) : 0;
  safeText('catchUpText', !group ? 'Entre em um grupo para comparar fases.' : delta ? `Você está ${delta} etapa(s) atrás da fase-alvo do grupo.` : 'Você alcançou a fase-alvo do grupo.');
  const achievements = achievementList();
  safeHTML('nextTasks', [...stageData(profile.stage).goals, ...(achievements.length ? [`Conquistas: ${achievements.join(' • ')}`] : [])].map(x=>`<li>${esc(x)}</li>`).join(''));
  safeHTML('inviteBox', group ? `<strong>${esc(group.name)}</strong><br>Código: <code>${esc(group.invite_code)}</code><br><small>Fase-alvo ${esc(group.target_stage)}</small>` : 'Crie ou entre em um grupo para receber um convite.');

  const week = routinePlan();
  safeHTML('weeklyCards', week.map(d => {
    const last = sessions.find(s => s.session_day === d.day);
    const tag = last ? ({done:'Concluí',miss:'Não fiz',skip:'Dispensado'}[last.status] || 'Registrado') : 'Sem registro';
    return `<div class="day-card glow"><h4>${esc(d.day)}</h4><div class="small">${esc(d.focus)} • ${esc(d.duration)}</div><p class="small" style="margin-top:8px">${esc(d.desc)}</p><div class="status-row"><span class="status ${last ? esc(last.status) : ''}">${esc(tag)}</span></div>${last?.notes ? `<div class="small" style="margin-top:8px">Última nota: ${esc(last.notes)}</div>` : ''}</div>`;
  }).join(''));
  const sd = el('sessionDay'); if (sd) sd.innerHTML = week.concat(DAYS.filter(d=>!week.some(w=>w.day===d)).map(d=>({day:d}))).map(d=>`<option>${esc(d.day)}</option>`).join('');
  const dur = el('sessionDuration'); if (dur && !dur.dataset.bound) {
    dur.dataset.bound='1';
    dur.innerHTML = ['15 min','30 min','45 min','60 min','75 min','90 min','120 min'].map(x=>`<option ${x===`${getPrefs().minutes} min`?'selected':''}>${x}</option>`).join('');
  }

  safeHTML('trackCards', TRACKS.map(t => `<div class="panel card track-card glow"><div class="split"><span class="pill">Stage ${t.stage}</span><span class="pill mag">${esc(t.period)}</span></div><h3>${esc(t.name)}</h3><p>${esc(t.focus)}</p><div><strong>Cursos</strong><div class="linklist" style="margin-top:10px">${t.courses.map(c => `<a class="linkcard" href="${c.url}" target="_blank" rel="noopener"><strong>${esc(c.name)}</strong><small>${esc(c.why)}</small></a>`).join('')}</div></div><div><strong>Objetivos</strong><ul>${t.goals.map(g => `<li>${esc(g)}</li>`).join('')}</ul></div></div>`).join(''));

  safeHTML('groupSummaryBox', group ? `<strong>${esc(group.name)}</strong><br>Código: <code>${esc(group.invite_code)}</code><br><small>Fase-alvo: ${esc(group.target_stage)}</small>` : 'Você ainda não participa de um grupo.');
  safeHTML('memberList', roster.length ? roster.map(m => {
    const summary = memberSummary[m.id] || {};
    const deltaM = group ? Math.max(0, Number(group.target_stage) - Number(m.stage)) : 0;
    return `<button class="member glow member-open" data-member="${esc(m.id)}" style="text-align:left;background:#0e162d"><strong>${esc(m.display_name)}</strong><div class="role">@${esc(m.username)} • Stage ${esc(m.stage)}${group && m.id===group.owner_id ? ' • fundador' : ''}</div><div class="delta">${deltaM ? `Em recuperação: faltam ${deltaM} fase(s)` : 'Na fase-alvo ou acima'}</div>${summary.latest ? `<div class="small" style="margin-top:6px">Último registro: ${new Date(summary.latest).toLocaleDateString('pt-BR')}</div>` : ''}</button>`;
  }).join('') : '<div class="small">Nenhum membro encontrado ainda.</div>');
  safeHTML('catchupBox', !group ? 'Entre em um grupo para ver sua trajetória com a equipe.' : delta ? `Você precisa alcançar Stage ${group.target_stage}. Próximas fases: <ul>${TRACKS.filter(t => t.stage > profile.stage && t.stage <= group.target_stage).map(t => `<li>${esc(t.name)}</li>`).join('')}</ul>` : 'Você está alinhado com a fase atual do grupo.');

  const pn = el('profileName'); if (pn) pn.value = profile.display_name || '';
  const pu = el('profileUser'); if (pu) pu.value = profile.username || '';
  const pe = el('profileEnglish'); if (pe) pe.value = profile.english_level || 'Intermediário';
  const ps = el('profileStage'); if (ps) ps.value = String(profile.stage || 0);
  const adv = el('advanceStageBtn'); if (adv) adv.disabled = !group || group.owner_id !== me.id || Number(group.target_stage) >= 4;
  safeHTML('scoreHistory', scores.length ? scores.slice(0,6).map(s => `<div class="linkcard"><div class="split"><strong>${esc(s.resource)}</strong><span class="pill">${esc(s.score)}%</span></div><small>${new Date(s.created_at).toLocaleDateString('pt-BR')} • ${esc(s.notes || '')}</small></div>`).join('') : '<div class="small">Nenhuma nota registrada ainda.</div>');

  bindMemberButtons();
}

function setupStatic(){
  safeHTML('examLinks', EXTERNAL_EXAMS.map(x => `<a class="linkcard" href="${x.url}" target="_blank" rel="noopener"><strong>${esc(x.title)}</strong><small>${esc(x.cat)} • ${esc(x.desc)}</small></a>`).join(''));
  safeHTML('labLinks', LABS.map(x => `<a class="linkcard" href="${x.url}" target="_blank" rel="noopener"><strong>${esc(x.title)}</strong><small>${esc(x.cat)} • ${esc(x.desc)}</small></a>`).join(''));
  const scoreResource = el('scoreResource');
  if (scoreResource) scoreResource.innerHTML = [...EXTERNAL_EXAMS, ...LABS, ...EXAMS.map(x=>({title:x.name}))].map(x => `<option>${esc(x.title)}</option>`).join('');
  safeHTML('internalExamTable', EXAMS.map((e,i) => `<tr><td><strong>${esc(e.name)}</strong></td><td>${esc(e.date)}</td><td>${esc(e.base)}</td><td><button class="btn ghost sm" type="button" data-quiz="${i}">Fazer prova</button></td></tr>`).join(''));
  injectScheduleConfigurator();
}

function injectScheduleConfigurator(){
  const schedulePage = el('schedule');
  if (!schedulePage || bySel('#rtcSchedulePrefs', schedulePage)) return;
  const block = document.createElement('div');
  block.className = 'panel card glow';
  block.id = 'rtcSchedulePrefs';
  const prefs = getPrefs();
  block.innerHTML = `
    <div class="section-head"><div><div class="eyebrow">Rotina adaptável</div><h2>Monte sua carga de estudo</h2></div><span class="pill blue">personalizável</span></div>
    <p class="small">Escolha quantos dias quer estudar e quantos minutos por dia. O calendário e as sugestões se ajustam automaticamente.</p>
    <div class="field-grid">
      <div>
        <label>Minutos por dia</label>
        <select id="planMinutes">${[15,30,45,60,75,90,120].map(m=>`<option value="${m}" ${prefs.minutes===m?'selected':''}>${m} min</option>`).join('')}</select>
      </div>
      <div>
        <label>Dias por semana</label>
        <div id="planDays" class="split" style="gap:8px;flex-wrap:wrap"></div>
      </div>
    </div>
    <div class="small" style="margin-top:10px">Dica: se quiser estudar 3x por semana, Segunda / Quarta / Sexta funciona muito bem. Mas você pode adaptar totalmente.</div>
    <div class="split" style="margin-top:14px"><button id="savePlanPrefs" class="btn primary" type="button">Salvar rotina</button><button id="resetPlanPrefs" class="btn ghost" type="button">Voltar ao padrão</button></div>
  `;
  schedulePage.insertBefore(block, schedulePage.firstChild);
  const holder = el('planDays');
  if (holder) holder.innerHTML = DAYS.map(day => `<label class="status ${prefs.days.includes(day)?'done':''}" style="cursor:pointer"><input type="checkbox" value="${day}" ${prefs.days.includes(day)?'checked':''} style="width:auto;margin-right:6px">${day}</label>`).join('');
  el('savePlanPrefs')?.addEventListener('click', () => {
    const minutes = Number(el('planMinutes')?.value || 60);
    const days = all('#planDays input:checked').map(i => i.value);
    if (!days.length) return toast('Selecione pelo menos um dia.');
    savePrefs({ ...getPrefs(), minutes, days });
    render();
    toast('Rotina salva com sucesso.');
  });
  el('resetPlanPrefs')?.addEventListener('click', () => {
    savePrefs({ days:[...DEFAULT_DAYS], minutes:60, focusMap:{} });
    const minutesSel = el('planMinutes'); if (minutesSel) minutesSel.value = '60';
    all('#planDays input').forEach(i => { i.checked = DEFAULT_DAYS.includes(i.value); i.parentElement.classList.toggle('done', i.checked); });
    render();
  });
  all('#planDays input').forEach(inp => inp.addEventListener('change', () => inp.parentElement.classList.toggle('done', inp.checked)));
}

async function handleResult(res, okText){ if (res.error) throw res.error; if (okText) toast(okText); await refresh(); }

function bindMemberButtons(){
  all('.member-open').forEach(btn => btn.onclick = () => {
    const m = roster.find(x => x.id === btn.dataset.member); if (!m) return;
    const summary = memberSummary[m.id] || {};
    const delta = group ? Math.max(0, Number(group.target_stage) - Number(m.stage)) : 0;
    const overlay = document.createElement('div');
    overlay.className='modal-backdrop show';
    overlay.innerHTML = `<div class="panel modal glow"><div class="section-head"><div><div class="eyebrow">Perfil da comunidade</div><h2>${esc(m.display_name)}</h2></div><button class="btn ghost sm" type="button" id="closeMemberModal">Fechar</button></div><div class="grid cols2"><div class="neo-card"><strong>@${esc(m.username)}</strong><p class="small" style="margin-top:8px">Nível de inglês: ${esc(m.english_level || 'não informado')}</p><p class="small">Stage atual: ${esc(m.stage)}</p><p class="small">Status no grupo: ${delta ? `precisa avançar ${delta} fase(s)` : 'alinhado com a fase-alvo'}</p></div><div class="neo-card"><strong>Evolução visível</strong><p class="small" style="margin-top:8px">Sessões visíveis: ${esc(summary.sessions ?? '—')}</p><p class="small">Sessões concluídas: ${esc(summary.done ?? '—')}</p><p class="small">Média de simulados: ${summary.avg ?? '—'}${summary.avg != null ? '%' : ''}</p><p class="small">Última atividade: ${summary.latest ? new Date(summary.latest).toLocaleDateString('pt-BR') : '—'}</p></div></div><div class="notice info" style="margin-top:14px">Alguns estudantes preferem não compartilhar seus resultados. Quando isso acontecer, os indicadores aparecerão como “—”.</div></div>`;
    document.body.append(overlay);
    overlay.querySelector('#closeMemberModal').onclick = () => overlay.remove();
    overlay.addEventListener('click', (e)=>{ if(e.target === overlay) overlay.remove(); });
  });
}

function showQuiz(cycle){
  const overlay=document.createElement('div'); overlay.className='modal-backdrop show';
  const count=cycle<2?5:7; const qs=QUESTIONS.slice(0,count);
  overlay.innerHTML=`<div class="panel modal glow"><div class="section-head"><h2>Simulado ${cycle+1} — Road to Cyber</h2><button type="button" class="btn ghost sm" id="quizClose">Fechar</button></div><p class="small">Questões autorais de revisão.</p><form id="quizForm">${qs.map((q,i)=>`<div class="neo-card" style="margin:12px 0"><strong>${i+1}. ${esc(q.q)}</strong>${q.opts.map((o,j)=>`<label style="margin-top:9px"><input style="width:auto;margin-right:7px" type="radio" name="question${i}" value="${j}" required />${esc(o)}</label>`).join('')}</div>`).join('')}<button class="btn primary full" type="submit">Corrigir e registrar nota</button></form></div>`;
  document.body.append(overlay);
  overlay.querySelector('#quizClose').onclick=()=>overlay.remove();
  overlay.querySelector('#quizForm').onsubmit=async e=>{
    e.preventDefault();
    const fd=new FormData(e.target); let right=0; qs.forEach((q,i)=>{ if(Number(fd.get('question'+i))===q.a) right++; });
    const score=Math.round(right/qs.length*100);
    const res=await sb.from('exam_scores').insert({user_id:me.id,resource:EXAMS[cycle]?.name||'Road to Cyber',score,notes:`Simulado autoral: ${right}/${qs.length} acertos`});
    if(res.error) return toast(errorText(res.error));
    overlay.remove(); toast(`Você acertou ${right}/${qs.length} e tirou ${score}%. Nota salva.`); refresh();
  };
}

function startMatrix(){
  // Slower cyber rain with rare character glitches; respects explicit user preference.
  const canvas=el('matrix');
  if (!canvas || canvas.dataset.rtcRainStarted==='1') return;
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
  canvas.dataset.rtcRainStarted='1';
  const jp=[...'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン学習未来雲網守心'];
  const bits=['0','1'];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=el('motionToggle');
  const row=toggle?.closest('.motion-row');
  let saved=null, fxSaved=null;
  try {saved=localStorage.getItem('rtc_matrix_enabled');fxSaved=localStorage.getItem('rtc_interface_fx');}catch(_){ }
  // A manual choice overrides the system default; otherwise honor reduced-motion.
  if(toggle)toggle.checked=saved==='true'?true:saved==='false'?false:!reduced.matches;
  const fxRow=document.createElement('label');
  fxRow.className='motion-row rtc-fx-setting';fxRow.htmlFor='rtcInterfaceFx';
  fxRow.innerHTML='<span><strong>Transições de tela</strong><small>Apagão digital e varredura neon ao navegar. Desative se preferir uma interface mais simples.</small></span><input id="rtcInterfaceFx" type="checkbox">';
  if(row && !document.getElementById('rtcInterfaceFx'))row.after(fxRow);
  const fx=document.getElementById('rtcInterfaceFx');
  if(fx)fx.checked=fxSaved==='true'?true:fxSaved==='false'?false:!reduced.matches;
  function syncFx(){
    document.body.dataset.motion=toggle?.checked?'on':'off';
    document.body.dataset.interfaceFx=fx?.checked?'on':'off';
    try{localStorage.setItem('rtc_matrix_enabled',toggle?.checked?'true':'false');localStorage.setItem('rtc_interface_fx',fx?.checked?'true':'false');}catch(_){ }
  }
  window.rtcFxEnabled=()=>document.body.dataset.interfaceFx!=='off';
  toggle?.addEventListener('change',()=>{syncFx();ctx.clearRect(0,0,width,height);});
  fx?.addEventListener('change',syncFx);syncFx();
  if(reduced.matches && saved===null){
    const hint=document.createElement('p');hint.className='small rtc-fx-hint';hint.textContent='Seu dispositivo está configurado para reduzir movimento. Ative os efeitos acima se quiser vê-los mesmo assim.';
    fxRow.after(hint);
  }
  let width=0,height=0,cell=24,streams=[],last=0,wasActive=false;
  const glyph=(japanese)=>{const arr=japanese?jp:bits;return arr[Math.floor(Math.random()*arr.length)];};
  const isActive=()=>!document.hidden && toggle?.checked!==false;
  function resize(){
    width=innerWidth;height=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cell=width<680?24:25;
    streams=Array.from({length:Math.ceil(width/cell)},(_,i)=>{
      const japanese=i%4!==0, length=8+Math.floor(Math.random()*8);
      return { head:Math.random()*(height/cell+30),speed:.038+Math.random()*.084,length,japanese,
        tint:i%17===0?'#ff61d6':i%12===0?'#b3ff84':'#4af5f7',
        glyphs:Array.from({length},()=>glyph(japanese)),glitch:-1,glitchEnd:0};
    });
    ctx.clearRect(0,0,width,height);
  }
  function draw(time){
    requestAnimationFrame(draw);
    if(!isActive()){
      if(wasActive)ctx.clearRect(0,0,width,height);
      wasActive=false;last=time;return;
    }
    wasActive=true;
    if(time-last<85)return; // 11 fps, slow + efficient
    const factor=Math.min(1.6,Math.max(.6,(time-last)/85)); last=time;
    ctx.clearRect(0,0,width,height);
    ctx.textBaseline='top';ctx.textAlign='left';ctx.font=`600 ${width<680?15:17}px ui-monospace, monospace`;
    for(let i=0;i<streams.length;i++){
      const s=streams[i],x=i*cell+2;
      if(Math.random()<.012){s.glitch=Math.floor(Math.random()*s.length);s.glitchEnd=time+150;}
      for(let t=0;t<s.length;t++){
        const y=(s.head-t)*cell;
        if(y<-cell||y>height+cell)continue;
        const glitch=t===s.glitch && time<s.glitchEnd;
        if(glitch)s.glyphs[t]=glyph(!s.japanese); // character or binary switches briefly
        const alpha=Math.pow(1-t/s.length,1.65);
        ctx.globalAlpha=alpha*(glitch?1:.75);
        ctx.fillStyle=glitch?'#ff7ee7':t===0?'#e3ffff':s.tint;
        ctx.shadowBlur=(t===0||glitch)?11:0;ctx.shadowColor=glitch?'#ff66ec':s.tint;
        ctx.fillText(s.glyphs[t],x,y);
      }
      s.head+=s.speed*factor;
      if((s.head-s.length)*cell>height+cell){s.head=-Math.random()*16;s.glyphs=Array.from({length:s.length},()=>glyph(s.japanese));}
    }
    ctx.globalAlpha=1;ctx.shadowBlur=0;
  }
  window.addEventListener('resize',resize,{passive:true});resize();requestAnimationFrame(draw);
}
function bind(){
  el('tabLoginBtn')?.addEventListener('click', ()=>setAuthTab('login'));
  el('tabSignupBtn')?.addEventListener('click', ()=>setAuthTab('signup'));
  all('.nav button').forEach(b=>b.onclick=()=>{
    all('.page').forEach(p=>p.classList.toggle('active', p.id===b.dataset.page));
    all('.nav button').forEach(x=>x.classList.toggle('active', x===b));
    safeText('crumbTitle', b.textContent.trim());
    localStorage.setItem(pageKey(), b.dataset.page);
  });

  el('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if(!sb) return message('Configure o config.js antes de entrar.','warn');
    try {
      hideMessage();
      const res = await sb.auth.signInWithPassword({ email: el('loginUser').value.trim(), password: el('loginPass').value });
      if(res.error) throw res.error;
      await startSession(res.data.session);
    } catch(err) { message(errorText(err), 'warn'); }
  });

  el('googleBtn')?.addEventListener('click', async ()=>{
    if(!sb) return message('Configure o config.js antes do login.','warn');
    try {
      const code = currentInvite(); if (code) localStorage.setItem('rtc_pending_invite', code);
      const res = await sb.auth.signInWithOAuth({ provider:'google', options:{ redirectTo: urlBase() + (code ? `?convite=${encodeURIComponent(code)}` : '') } });
      if (res.error) throw res.error;
    } catch(err) { message(errorText(err), 'warn'); }
  });

  el('forgotBtn')?.addEventListener('click', async ()=>{
    const email = el('loginUser')?.value?.trim();
    if (!email) return message('Digite seu e-mail primeiro.', 'warn');
    const res = await sb.auth.resetPasswordForEmail(email, { redirectTo: urlBase() });
    if (res.error) return message(errorText(res.error),'warn');
    message('Se o e-mail estiver autorizado/configurado, você receberá instruções de recuperação.', 'good');
  });

  el('resetForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const pass = el('resetPassword').value;
      if (pass.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
      const res = await sb.auth.updateUser({ password: pass });
      if (res.error) throw res.error;
      resetMode = false; el('resetForm').classList.add('hidden'); message('Senha atualizada. Faça login normalmente.','good');
    } catch(err){ message(errorText(err), 'warn'); }
  });

  el('createGroupForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = el('groupName')?.value?.trim(); const target = Number(el('groupTarget')?.value || 0);
    if (!name) return toast('Informe o nome do grupo.');
    const res = await sb.rpc('rtc_create_group', { p_name:name, p_target_stage: target });
    if (res.error) return toast(errorText(res.error));
    el('groupModalWrap')?.classList.remove('show'); toast('Grupo criado com sucesso.'); refresh();
  });

  el('joinGroupForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const code = el('joinCode')?.value?.trim();
    if (!code) return;
    const res = await sb.rpc('rtc_join_group', { p_invite_code: code });
    if (res.error) return toast(errorText(res.error));
    el('groupModalWrap')?.classList.remove('show'); toast('Você entrou no grupo.'); refresh();
  });

  el('copyInviteBtn')?.addEventListener('click', async ()=>{
    if (!group?.invite_code) return toast('Crie ou entre em um grupo primeiro.');
    const link = `${urlBase()}?convite=${encodeURIComponent(group.invite_code)}`;
    await navigator.clipboard.writeText(link); toast('Link de convite copiado.');
  });
  el('openGroupModal')?.addEventListener('click', ()=>el('groupModalWrap')?.classList.add('show'));
  el('communityCreateGroup')?.addEventListener('click', ()=>el('groupModalWrap')?.classList.add('show'));
  el('communityJoinGroup')?.addEventListener('click', ()=>el('groupModalWrap')?.classList.add('show'));
  el('closeGroupModal')?.addEventListener('click', ()=>el('groupModalWrap')?.classList.remove('show'));
  el('advanceStageBtn')?.addEventListener('click', async ()=>{
    if (!group) return;
    const next = Math.min(4, Number(group.target_stage)+1);
    const res = await sb.from('study_groups').update({ target_stage: next }).eq('id', group.id);
    if (res.error) return toast(errorText(res.error));
    toast('Fase do grupo avançada.'); refresh();
  });

  el('sessionForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      user_id: me.id,
      session_day: el('sessionDay').value,
      status: el('sessionStatus').value,
      focus: el('sessionFocus').value,
      duration_minutes: parseInt(String(el('sessionDuration').value).replace(/\D/g,''),10) || getPrefs().minutes,
      notes: el('sessionNotes').value.trim()
    };
    const res = await sb.from('study_sessions').insert(payload);
    if (res.error) return toast(errorText(res.error));
    e.target.reset(); toast('Sessão registrada.'); refresh();
  });
  el('fillWeekPlan')?.addEventListener('click', ()=>{
    const plan = routinePlan()[0]; if (!plan) return;
    el('sessionDay').value = plan.day; el('sessionFocus').value = plan.focus; el('sessionDuration').value = plan.duration; el('sessionNotes').value = 'Sessão conforme plano sugerido';
  });

  el('scoreForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const res = await sb.from('exam_scores').insert({ user_id: me.id, resource: el('scoreResource').value, score: Number(el('scoreValue').value || 0), notes: el('scoreNotes').value.trim() });
    if (res.error) return toast(errorText(res.error));
    e.target.reset(); toast('Resultado salvo.'); refresh();
  });

  el('saveProfileBtn')?.addEventListener('click', async ()=>{
    const res = await sb.from('profiles').update({ display_name: el('profileName').value.trim(), username: el('profileUser').value.trim(), english_level: el('profileEnglish').value, stage: Number(el('profileStage').value) }).eq('id', me.id);
    if (res.error) return toast(errorText(res.error));
    toast('Perfil atualizado.'); refresh();
  });

  el('openQuickCreate') && (el('openQuickCreate').textContent = 'Convidar colega');
  el('openQuickCreate')?.addEventListener('click', ()=>{ const btn = bySel('[data-page="community"]'); btn?.click(); toast('Use o link de convite para trazer alguém para o grupo.'); });

  const q = el('quickCreateForm');
  if (q) {
    q.innerHTML = `<p>Para adicionar uma pessoa, use o link do seu grupo. Cada colega faz login com a própria conta Google e entra com segurança.</p><button id="quickInvite" class="btn primary" type="button">Copiar link de convite</button><div class="notice info" style="margin-top:12px">Depois que a pessoa entrar, você poderá abrir o perfil dela pela comunidade e acompanhar a evolução visível.</div>`;
    q.querySelector('#quickInvite')?.addEventListener('click', ()=>el('copyInviteBtn')?.click());
  }

  el('backupBtn')?.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify({version:7, exported_at:new Date().toISOString(), profile, sessions, scores}, null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'road_to_cyber_backup.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 300);
  });
  el('restoreFile')?.addEventListener('change', async e => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.sessions) || !Array.isArray(data.scores)) throw new Error('Backup incompatível.');
      if (!confirm('Importar os registros desse backup para a sua conta?')) return;
      const ses = data.sessions.map(s => ({ user_id: me.id, session_day:s.session_day, status:s.status, focus:s.focus, duration_minutes:+s.duration_minutes || 0, notes:s.notes || '' }));
      const sc = data.scores.map(s => ({ user_id: me.id, resource:s.resource, score:+s.score || 0, notes:s.notes || '' }));
      if (ses.length) { const r = await sb.from('study_sessions').insert(ses); if (r.error) throw r.error; }
      if (sc.length) { const r = await sb.from('exam_scores').insert(sc); if (r.error) throw r.error; }
      toast('Backup importado.'); refresh();
    } catch(err) { toast('Importação não concluída: ' + errorText(err)); }
    finally { e.target.value = ''; }
  });

  bySel('#internalExamTable')?.addEventListener('click', e => {
    const b = e.target.closest('[data-quiz]'); if (b) showQuiz(Number(b.dataset.quiz));
  });

  el('logoutBtn')?.addEventListener('click', async ()=>{ await sb.auth.signOut(); });
  el('logoutMobileBtn')?.addEventListener('click', async ()=>{ await sb.auth.signOut(); });
}

function initialize(){
  // likely cause of previous crash: mismatched HTML/JS versions. This file is defensive and expects the matching index.
  const signupTab = el('tabSignupBtn'); if (signupTab) signupTab.style.display = 'none';
  el('signupForm')?.classList.add('hidden');
  const firstLoginLabel = bySel('#loginForm label'); if (firstLoginLabel) firstLoginLabel.textContent = 'E-mail';
  if (el('loginUser')) { el('loginUser').placeholder = 'voce@email.com'; el('loginUser').type = 'email'; }
  if (el('suEmail')) el('suEmail').required = true;
  if (el('suPass')) el('suPass').minLength = 6;
  const suUserWrap = el('suUser')?.closest('div'); if (suUserWrap) suUserWrap.classList.add('hidden');
  const demo = el('demoSeedBtn'); if (demo) demo.remove();
  const loginFooter = bySel('#loginForm .auth-footer');
  if (loginFooter) loginFooter.innerHTML = '<small>Você continua conectado até escolher sair da conta.</small><button class="btn ghost sm" id="forgotBtn" type="button">Recuperar senha</button>';
  const card = bySel('#authView .auth-card');
  if (card && !el('googleBtn')) {
    const btn = document.createElement('button');
    btn.id = 'googleBtn'; btn.className = 'btn primary full'; btn.type = 'button'; btn.style.marginBottom='14px'; btn.textContent='Entrar com Google';
    const p = document.createElement('p'); p.className='small'; p.style.marginTop='-6px'; p.textContent='Use sua conta Google para acompanhar estudos, fazer provas e participar da comunidade.';
    card.insertBefore(p, el('authMessage')?.nextSibling || el('loginForm'));
    card.insertBefore(btn, p);
  }
  if (card && !el('resetForm')) {
    const form = document.createElement('form');
    form.id='resetForm'; form.className='hidden'; form.style.marginTop='16px';
    form.innerHTML='<label>Defina uma nova senha</label><input id="resetPassword" type="password" minlength="6" required placeholder="Nova senha (mínimo 6 caracteres)" /><button class="btn primary full" style="margin-top:10px" type="submit">Salvar nova senha</button>';
    card.append(form);
  }
  safeText('sideUserMeta', 'Sua conta');
  setupStatic(); bind(); startMatrix(); setAuthTab('login'); showLogin();

  if (!ready) { message('Configuração pendente: edite config.js com o Project URL e a publishable key do Supabase.', 'warn'); return; }

  sb.auth.onAuthStateChange((event, session) => {
    setTimeout(()=>{
      if (event === 'PASSWORD_RECOVERY') { el('resetForm')?.classList.remove('hidden'); resetMode = true; showLogin(); message('Crie uma nova senha abaixo.', 'info'); }
      else if (['SIGNED_IN','SIGNED_OUT','TOKEN_REFRESHED','INITIAL_SESSION'].includes(event)) { if (!resetMode) startSession(session); }
    }, 0);
  });
  sb.auth.getSession().then(({data,error})=>{ if(error) message(errorText(error), 'warn'); else startSession(data.session); });

  const savedPage = localStorage.getItem(pageKey());
  if (savedPage) {
    const btn = bySel(`.nav button[data-page="${savedPage}"]`); btn?.click();
  }
}

initialize();
