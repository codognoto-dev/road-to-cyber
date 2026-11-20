'use strict';
/* Road to Cyber • Career Paths / Study Planner 9.0
   Only public course links in this file. User progress is stored via Supabase RLS. */
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const DAY = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
  const RES = [
    {id:'cs50',name:'CS50x — Ciência da Computação',platform:'Harvard',type:'Gratuito',level:'Iniciante',url:'https://cs50.harvard.edu/x/',desc:'Lógica, algoritmos, C, Python, SQL e fundamentos.'},
    {id:'python-udemy',name:'Python 3 do básico ao avançado',platform:'Udemy',type:'Udemy',level:'Iniciante → Avançado',url:'https://www.udemy.com/course/python-3-do-zero-ao-avancado/',desc:'Python com projetos: começar pelos módulos de lógica.'},
    {id:'kaggle-python',name:'Kaggle Learn — Python',platform:'Kaggle',type:'Gratuito',level:'Iniciante',url:'https://www.kaggle.com/learn/python',desc:'Exercícios curtos de Python direto no navegador.'},
    {id:'network-basics',name:'Networking Basics',platform:'Cisco Networking Academy',type:'Gratuito',level:'Iniciante',url:'https://www.netacad.com/courses/networking-basics',desc:'Redes, protocolos e comunicação entre sistemas.'},
    {id:'linux-bandit',name:'Bandit — laboratórios Linux',platform:'OverTheWire',type:'Gratuito',level:'Iniciante',url:'https://overthewire.org/wargames/bandit/',desc:'Terminal, SSH e manipulação de arquivos em laboratório.'},
    {id:'tryhackme',name:'Pre Security',platform:'TryHackMe',type:'Misto',level:'Iniciante',url:'https://tryhackme.com/path/outline/presecurity',desc:'Fundamentos de redes, Linux e segurança; parte do conteúdo pode exigir plano.'},
    {id:'google-cyber',name:'Google Cybersecurity Professional Certificate',platform:'Coursera',type:'Pago',level:'Iniciante',url:'https://www.coursera.org/professional-certificates/google-cybersecurity',desc:'Formação estruturada em cyber e ferramentas defensivas; valores por região/plano.'},
    {id:'sc900',name:'Fundamentos de segurança, conformidade e identidade',platform:'Microsoft Learn',type:'Gratuito',level:'Iniciante',url:'https://learn.microsoft.com/en-us/training/paths/describe-concepts-of-security-compliance-identity/',desc:'Conceitos para a prova SC-900 (exame pago).' },
    {id:'portswigger',name:'Web Security Academy',platform:'PortSwigger',type:'Gratuito',level:'Intermediário',url:'https://portswigger.net/web-security',desc:'Laboratórios de segurança web em ambiente autorizado.'},
    {id:'azure-fund',name:'Microsoft Azure Fundamentals — Cloud concepts',platform:'Microsoft Learn',type:'Gratuito',level:'Iniciante',url:'https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/',desc:'IaaS, PaaS, SaaS, modelos e conceitos de nuvem.'},
    {id:'aws-skill',name:'AWS Skill Builder — Digital Training',platform:'AWS',type:'Misto',level:'Iniciante → Avançado',url:'https://aws.amazon.com/training/digital/',desc:'Grande catálogo gratuito e labs opcionais pagos.'},
    {id:'aws-udemy',name:'Certificação AWS Cloud Practitioner CLF-C02',platform:'Udemy',type:'Udemy',level:'Iniciante',url:'https://www.udemy.com/course/certificacao-amazon-aws-cloud-practitioner-clf-c02/',desc:'Preparação para fundamentos AWS; confira idioma e edição.'},
    {id:'azure-path',name:'Microsoft Learn para Azure',platform:'Microsoft Learn',type:'Gratuito',level:'Iniciante → Intermediário',url:'https://learn.microsoft.com/en-us/training/azure/',desc:'Trilhas oficiais sobre serviços e administração Azure.'},
    {id:'python-api',name:'Tutorial FastAPI',platform:'FastAPI',type:'Gratuito',level:'Intermediário',url:'https://fastapi.tiangolo.com/pt/tutorial/',desc:'Criar e testar APIs HTTP em Python.'},
    {id:'java-udemy',name:'Java Spring Boot Profissional com Web Services API',platform:'Udemy',type:'Udemy',level:'Intermediário',url:'https://www.udemy.com/course/curso-de-java-spring-boot-profissional-com-web-services-api/',desc:'APIs REST, microsserviços e arquitetura Java.'},
    {id:'backend-map',name:'Roadmap Backend',platform:'roadmap.sh',type:'Gratuito',level:'Todos',url:'https://roadmap.sh/backend',desc:'Mapa para orientar fundamentos, linguagens, APIs e banco.'},
    {id:'sql-fcc',name:'Relational Database Curriculum',platform:'freeCodeCamp',type:'Gratuito',level:'Iniciante',url:'https://www.freecodecamp.org/learn/relational-database/',desc:'PostgreSQL, SQL e fundamentos de bases relacionais.'},
    {id:'odin',name:'Full Stack JavaScript',platform:'The Odin Project',type:'Gratuito',level:'Iniciante → Intermediário',url:'https://www.theodinproject.com/paths/full-stack-javascript',desc:'HTML, CSS, JS, React, Node e projetos.'},
    {id:'mdn',name:'Aprenda desenvolvimento web',platform:'MDN',type:'Gratuito',level:'Iniciante',url:'https://developer.mozilla.org/en-US/docs/Learn_web_development',desc:'Base conceitual de HTML, CSS, JS e acessibilidade.'},
    {id:'frontend-udemy',name:'Formação Front-end — HTML, CSS, JavaScript e React',platform:'Udemy',type:'Udemy',level:'Iniciante → Intermediário',url:'https://www.udemy.com/course/formacao-front-end-html-css-javascript-react-e/',desc:'Curso em português com projetos progressivos.'},
    {id:'react-udemy',name:'React do Zero à Maestria',platform:'Udemy',type:'Udemy',level:'Intermediário',url:'https://www.udemy.com/course/react-do-zero-a-maestria-c-hooks-router-api-projetos/',desc:'React com APIs, rotas e projetos.'},
    {id:'fcc-responsive',name:'Responsive Web Design',platform:'freeCodeCamp',type:'Gratuito',level:'Iniciante',url:'https://www.freecodecamp.org/learn/responsive-web-design-v9/',desc:'Exercícios interativos de HTML e CSS.'},
    {id:'data-zoomcamp',name:'Data Engineering Zoomcamp',platform:'DataTalks.Club',type:'Gratuito',level:'Intermediário',url:'https://github.com/DataTalksClub/data-engineering-zoomcamp',desc:'Pipeline, data warehouse, orquestração e projeto final.'},
    {id:'sql-kaggle',name:'Intro to SQL',platform:'Kaggle',type:'Gratuito',level:'Iniciante',url:'https://www.kaggle.com/learn/intro-to-sql',desc:'Consultas SQL em exercícios guiados.'},
    {id:'python-fcc',name:'Python do freeCodeCamp',platform:'freeCodeCamp',type:'Gratuito',level:'Iniciante',url:'https://www.freecodecamp.org/learn/python-v9/',desc:'Aprenda lógica e Python na prática.'},
    {id:'ml-google',name:'Machine Learning Crash Course',platform:'Google',type:'Gratuito',level:'Intermediário',url:'https://developers.google.com/machine-learning/crash-course',desc:'Fundamentos de modelos, regressão e classificação.'},
    {id:'ml-course',name:'Machine Learning Specialization',platform:'Coursera / DeepLearning.AI',type:'Pago',level:'Intermediário',url:'https://www.coursera.org/specializations/machine-learning-introduction',desc:'Fundamentos de machine learning, assinatura/certificado conforme acesso.'},
    {id:'n8n-docs',name:'n8n Learning Path',platform:'n8n',type:'Gratuito',level:'Iniciante',url:'https://docs.n8n.io/learning-path/',desc:'Fluxos, nodes, HTTP, integrações e automação.'},
    {id:'n8n-udemy',name:'Formação Automação com IA 2026 e n8n',platform:'Udemy',type:'Udemy',level:'Iniciante → Intermediário',url:'https://www.udemy.com/course/automacao-e-criacao-de-agentes-de-ia-com-n8n-n8n-completo/',desc:'Automação de processos e integrações com IA.'},
    {id:'devops-roadmap',name:'Roadmap DevOps',platform:'roadmap.sh',type:'Gratuito',level:'Todos',url:'https://roadmap.sh/devops',desc:'Linux, containers, CI/CD e infraestrutura como código.'},
    {id:'docker-docs',name:'Docker — Get Started',platform:'Docker Docs',type:'Gratuito',level:'Intermediário',url:'https://docs.docker.com/get-started/',desc:'Containers e imagens para aplicações.'},
    {id:'k8s-docs',name:'Kubernetes Basics',platform:'Kubernetes',type:'Gratuito',level:'Intermediário',url:'https://kubernetes.io/docs/tutorials/kubernetes-basics/',desc:'Orquestração de containers com tutorial oficial.'},
    {id:'english-b2',name:'B2 Speaking',platform:'British Council',type:'Gratuito',level:'Intermediário',url:'https://learnenglish.britishcouncil.org/free-resources/speaking/b2',desc:'Prática de speaking para fluência profissional.'},
    {id:'english-cam',name:'Cambridge B2 First — preparation',platform:'Cambridge English',type:'Gratuito',level:'Intermediário',url:'https://www.cambridgeenglish.org/exams-and-tests/first/preparation/',desc:'Provas de exemplo e materiais de inglês B2.'},
    {id:'japan-irodori',name:'Irodori — Japonês para viver no Japão',platform:'Japan Foundation',type:'Gratuito',level:'Iniciante',url:'https://www.irodori-online.jpf.go.jp/',desc:'Situações práticas do cotidiano em japonês.'},
    {id:'japan-minato',name:'Minato — Cursos de japonês',platform:'Japan Foundation',type:'Misto',level:'Iniciante → Intermediário',url:'https://minato-jf.jp/',desc:'Cursos e exercícios de japonês de vários níveis.'},
    {id:'jlpt-official',name:'JLPT — Questões de exemplo oficiais',platform:'JLPT',type:'Gratuito',level:'Iniciante → Intermediário',url:'https://www.jlpt.jp/e/samples/forlearners.html',desc:'Exemplos oficiais da avaliação de língua japonesa.'}
  ];
  const byId = Object.fromEntries(RES.map(r => [r.id,r]));
  const PATHS = [
    {id:'road-to-japan',emoji:'🇯🇵',name:'Road to Japan',tagline:'Cyber + Cloud + automação + inglês + japonês',desc:'Uma jornada inspirada no objetivo de conquistar uma vaga internacional. O destino é uma meta, não uma conquista já alcançada.',color:'cyan',steps:[
      {title:'01 · Fundamentos',goal:'Lógica, Python, redes e Linux',resources:['cs50','python-udemy','kaggle-python','network-basics','linux-bandit']},
      {title:'02 · Cyber e Cloud',goal:'Bases defensivas e serviços de nuvem',resources:['tryhackme','sc900','azure-fund','aws-skill','aws-udemy']},
      {title:'03 · Automação',goal:'Scripts e fluxos para resolver problemas',resources:['n8n-docs','n8n-udemy','python-api']},
      {title:'04 · Comunicação global',goal:'Speaking profissional e japonês para vida e trabalho',resources:['english-b2','english-cam','japan-irodori','japan-minato','jlpt-official']},
      {title:'05 · Portfólio e candidatura',goal:'Um case técnico original, GitHub e mock interview',resources:['backend-map','devops-roadmap','ml-google']}
    ]},
    {id:'cyber',emoji:'🛡️',name:'Cibersegurança',tagline:'Redes, blue team e security engineering',desc:'Construa base técnica antes de avançar para investigações e laboratórios.',steps:[
      {title:'Bases',goal:'Redes, Linux, Python',resources:['network-basics','linux-bandit','python-udemy']},
      {title:'Defesa',goal:'Ameaças, identidade e monitoramento',resources:['tryhackme','google-cyber','sc900']},
      {title:'Laboratório',goal:'Analisar casos em ambientes autorizados',resources:['portswigger','azure-fund']}
    ]},
    {id:'cloud',emoji:'☁️',name:'Engenharia Cloud',tagline:'AWS, Azure, Linux e serviços',desc:'Entenda como infraestrutura em nuvem é construída, monitorada e protegida.',steps:[
      {title:'Infraestrutura',goal:'Linux, redes e cloud básica',resources:['network-basics','linux-bandit','azure-fund']},
      {title:'Plataformas',goal:'AWS e Azure',resources:['aws-skill','aws-udemy','azure-path']},
      {title:'Segurança e operação',goal:'IAM, automação e containers',resources:['sc900','docker-docs','devops-roadmap']}
    ]},
    {id:'backend',emoji:'🧩',name:'Desenvolvimento Backend',tagline:'Python, Java, APIs e bancos de dados',desc:'Aprenda a construir serviços e integrar sistemas.',steps:[
      {title:'Linguagem',goal:'Lógica e Python',resources:['cs50','python-udemy','python-fcc']},
      {title:'APIs e dados',goal:'SQL e REST',resources:['sql-fcc','python-api','backend-map']},
      {title:'Arquitetura',goal:'Java, cloud e containers',resources:['java-udemy','docker-docs','azure-fund']}
    ]},
    {id:'frontend',emoji:'🎨',name:'Desenvolvimento Frontend',tagline:'Interfaces, JavaScript, React e UX',desc:'Projete interfaces acessíveis, rápidas e responsivas.',steps:[
      {title:'Web',goal:'HTML, CSS e acessibilidade',resources:['mdn','fcc-responsive','odin']},
      {title:'JavaScript',goal:'Interfaces dinâmicas',resources:['frontend-udemy','odin']},
      {title:'React',goal:'Aplicações modernas',resources:['react-udemy','frontend-udemy']}
    ]},
    {id:'data',emoji:'📊',name:'Engenharia de Dados',tagline:'SQL, Python e pipelines',desc:'Organize e movimente dados com qualidade e rastreabilidade.',steps:[
      {title:'Bases',goal:'Python e SQL',resources:['python-fcc','sql-kaggle','sql-fcc']},
      {title:'Pipelines',goal:'Extração e transformação',resources:['data-zoomcamp','python-udemy']},
      {title:'Cloud e plataformas',goal:'Warehouse e processamento',resources:['aws-skill','azure-path']}
    ]},
    {id:'ai',emoji:'🤖',name:'IA e Automação',tagline:'Python, n8n e sistemas inteligentes',desc:'Construa automações confiáveis com validação e controle de erros.',steps:[
      {title:'Fundamentos',goal:'Python e lógica',resources:['python-udemy','kaggle-python']},
      {title:'Integrações',goal:'n8n, APIs e webhooks',resources:['n8n-docs','n8n-udemy','python-api']},
      {title:'IA aplicada',goal:'ML e controles',resources:['ml-google','ml-course','sc900']}
    ]},
    {id:'devops',emoji:'⚙️',name:'DevOps e SRE',tagline:'Infraestrutura, containers e observabilidade',desc:'Crie fluxos de entrega confiáveis e acompanhe a saúde dos sistemas.',steps:[
      {title:'Infra',goal:'Linux e redes',resources:['network-basics','linux-bandit','devops-roadmap']},
      {title:'Containers',goal:'Docker e Kubernetes',resources:['docker-docs','k8s-docs']},
      {title:'Nuvem',goal:'AWS/Azure',resources:['aws-skill','azure-path']}
    ]}
  ];
  const S = { user:null, career:'cyber', done:new Set(), synced:false, filtered:'Todos', search:'', initiated:false, plannerReady:false, loading:false, warning:'' };
  const keyCareer = () => `rtc_career_${typeof me!=='undefined'&&me?.id?me.id:'guest'}`;
  const keyProgress = () => `rtc_progress_${typeof me!=='undefined'&&me?.id?me.id:'guest'}`;
  const getClient = () => typeof sb !== 'undefined' ? sb : null;
  const getUser = () => typeof me !== 'undefined' ? me : null;
  const notify = str => { if (typeof toast === 'function') toast(str); else console.info(str); };

  function getLocalCareer(){return localStorage.getItem(keyCareer()) || 'cyber';}
  function readLocalProgress(){try{const a=JSON.parse(localStorage.getItem(keyProgress()) || '[]');return new Set(Array.isArray(a)?a:[]);}catch{return new Set();}}
  async function loadUserData(){
    const user=getUser(), client=getClient(); if(!user||!client||S.loading)return;
    S.loading=true;S.user=user.id;S.synced=false;S.warning='';S.career=getLocalCareer();S.done=readLocalProgress();
    try {
      const [p,c] = await Promise.all([
        client.from('rtc_study_preferences').select('career_id,plan').eq('user_id',user.id).maybeSingle(),
        client.from('rtc_course_progress').select('resource_id').eq('user_id',user.id)
      ]);
      if(p.error || c.error){S.warning='Para salvar trilhas e rotina na nuvem, aplique a migração 06 no Supabase.';}
      else {
        if (p.data) {
          S.career=PATHS.some(x=>x.id===p.data.career_id)?p.data.career_id:'cyber';
          localStorage.setItem(keyCareer(),S.career);
          if(p.data.plan && typeof p.data.plan==='object') {
            localStorage.setItem(`rtc_prefs_${user.id}`,JSON.stringify(p.data.plan));
          }
        }
        S.done=new Set((c.data||[]).map(x=>x.resource_id));
        localStorage.setItem(keyProgress(),JSON.stringify([...S.done]));
        S.synced=true;
      }
    } catch(e){S.warning='Não foi possível conectar o progresso agora. Verifique o Supabase.';}
    finally {S.loading=false; draw(); renderPlanner(); if(typeof render === 'function') render();}
  }

  async function persistSettings(){
    const user=getUser(), client=getClient(); if(!user||!client)return;
    if(!S.synced){notify('A rotina foi salva neste navegador. Execute a migração 06 para sincronizar.'); return;}
    const pref=typeof getPrefs==='function'?getPrefs():{};
    const {error}=await client.from('rtc_study_preferences').upsert({user_id:user.id,career_id:S.career,plan:pref,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(error)notify('Falha ao sincronizar a rotina: '+error.message);
  }
  async function selectCareer(id){
    if(!PATHS.some(x=>x.id===id))return;
    S.career=id;localStorage.setItem(keyCareer(),id);draw();persistSettings();
  }
  async function toggleResource(id){
    const user=getUser(),client=getClient();if(!user||!byId[id])return;
    if(!S.synced)return notify('Para registrar cursos na nuvem, execute a migração 06 no Supabase.');
    const had=S.done.has(id);
    if(had)S.done.delete(id);else S.done.add(id);
    draw();
    const r=had ? await client.from('rtc_course_progress').delete().eq('user_id',user.id).eq('resource_id',id)
      : await client.from('rtc_course_progress').upsert({user_id:user.id,resource_id:id,completed_at:new Date().toISOString()},{onConflict:'user_id,resource_id'});
    if(r.error){if(had)S.done.add(id);else S.done.delete(id);notify('Não foi possível salvar o progresso: '+r.error.message);}
    else localStorage.setItem(keyProgress(),JSON.stringify([...S.done]));
    draw();
  }

  function currentPath(){return PATHS.find(x=>x.id===S.career)||PATHS[0];}
  function allPathRes(path){return [...new Set(path.steps.flatMap(s=>s.resources))].map(x=>byId[x]).filter(Boolean);}
  function panelMarkup(){
    const path=currentPath(), chosen=allPathRes(path), total=chosen.length, done=chosen.filter(x=>S.done.has(x.id)).length;
    const filter = S.filtered, search=S.search.trim().toLowerCase();
    const shown=chosen.filter(x => (filter==='Todos'||x.type===filter) && (!search||(x.name+' '+x.platform+' '+x.desc).toLowerCase().includes(search)));
    return `<div class="rtc-v9-header"><div class="eyebrow">Escolha seu futuro</div><h2>Explore sua trilha</h2><p>Selecione uma carreira, encontre aulas de fontes diferentes e avance no seu ritmo. Você pode mudar de rota quando quiser.</p></div>
      <div class="rtc-path-selector" id="rtcCareerChoices">${PATHS.map(x=>`<button type="button" class="rtc-path-option ${x.id===S.career?'active':''}" data-career="${x.id}" aria-pressed="${x.id===S.career}"><span class="rtc-path-emoji">${x.emoji}</span><strong>${esc(x.name)}</strong><small>${esc(x.tagline)}</small></button>`).join('')}</div>
      <div class="rtc-v9-feature ${path.id==='road-to-japan'?'japan':''}">
        <div class="eyebrow">${esc(path.tagline)}</div><h2>${path.emoji} ${esc(path.name)}</h2><p>${esc(path.desc)}</p><div class="split"><span class="pill lime">${done}/${total} recursos marcados</span><span class="pill">${path.steps.length} etapas</span>${S.synced?'<span class="pill">Progresso online</span>':'<span class="pill amber">Sincronização pendente</span>'}</div>
        <div class="rtc-v9-progress"><span style="width:${total?Math.round(done/total*100):0}%"></span></div>
      </div>
      ${S.warning?`<div class="notice warn" style="margin:14px 0">${esc(S.warning)}</div>`:''}
      <div class="rtc-resource-controls"><label>Buscar curso<input id="rtcFindCourse" type="search" placeholder="Ex.: Python, Azure, redes..." value="${esc(S.search)}"></label><label>Tipo de recurso<select id="rtcCourseFilter">${['Todos','Gratuito','Udemy','Pago','Misto'].map(x=>`<option ${S.filtered===x?'selected':''}>${x}</option>`).join('')}</select></label></div>
      <div class="rtc-resource-grid">${shown.length?shown.map(x => `<article class="rtc-resource"><div class="rtc-resource-top"><span class="pill ${x.type==='Gratuito'?'lime':x.type==='Pago'?'mag':'blue'}">${esc(x.type)}</span><small>${esc(x.level)}</small></div><h3>${esc(x.name)}</h3><div class="small">${esc(x.platform)}</div><p>${esc(x.desc)}</p><div class="rtc-resource-actions"><a class="btn ghost sm" href="${x.url}" target="_blank" rel="noopener noreferrer">Abrir curso ↗</a><button class="btn ${S.done.has(x.id)?'primary':'ghost'} sm" data-resource="${x.id}" type="button">${S.done.has(x.id)?'✓ Concluído':'Marcar conclusão'}</button></div></article>`).join(''):'<div class="notice info">Nenhum curso corresponde a esse filtro.</div>'}</div>
      <div class="rtc-path-stages"><h3>Sequência sugerida</h3>${path.steps.map((s,i)=>`<details ${i===0?'open':''} class="rtc-stage-detail"><summary>${esc(s.title)} <span class="small">${esc(s.goal)}</span></summary><div class="rtc-stage-items">${s.resources.map(id=>byId[id]?`<a href="${byId[id].url}" target="_blank" rel="noopener">${esc(byId[id].name)} ↗</a>`:'').join('')}</div></details>`).join('')}</div>
      <p class="small" style="margin-top:20px">Acesso à Udemy depende da sua assinatura/catálogo corporativo; formações pagas podem oferecer testes ou auditoria gratuita, sem garantir certificado. A conclusão aqui é um registro pessoal, não uma certificação emitida pelo curso.</p>`;
  }
  function draw(){
    if(!getUser())return;
    const target=$('trackCards'); if (!target)return;
    target.className='';target.innerHTML=panelMarkup();
    target.querySelectorAll('[data-career]').forEach(b=>b.onclick=()=>selectCareer(b.dataset.career));
    target.querySelectorAll('[data-resource]').forEach(b=>b.onclick=()=>toggleResource(b.dataset.resource));
    $('rtcFindCourse')?.addEventListener('input',e=>{const pos=e.target.selectionStart??0; S.search=e.target.value; draw(); const n=$('rtcFindCourse'); n?.focus();if(n) n.setSelectionRange(Math.min(pos,n.value.length),Math.min(pos,n.value.length));});
    $('rtcCourseFilter')?.addEventListener('change',e=>{S.filtered=e.target.value; draw();});
    const dash=$('dashboard');
    if(dash && !$('rtcJapanShortcut')){
      const header=dash.querySelector('.hero-app');
      const btn=document.createElement('button'); btn.id='rtcJapanShortcut'; btn.className='btn ghost sm'; btn.type='button'; btn.style.marginTop='10px';btn.textContent='🇯🇵 Ver Road to Japan';
      header?.append(btn);btn.onclick=()=>{selectCareer('road-to-japan');document.querySelector('.nav button[data-page="tracks"]')?.click();};
    }
    if($('rtcJapanShortcut')) $('rtcJapanShortcut').textContent = S.career==='road-to-japan'?'🇯🇵 Minha trilha: Road to Japan':'🇯🇵 Explorar Road to Japan';
  }

  function getPlan(){
    return typeof getPrefs==='function' ? getPrefs() : {days:['Segunda','Quarta','Sexta'],minutes:60,focusMap:{}};
  }
  function routine(){
    const p=getPlan();
    return p.days.map((day,i)=>{
      const time=Number(p.minuteMap?.[day])||Number(p.minutes)||60;
      const focus=p.focusMap?.[day] || (i===1?'Inglês':'Cyber / Cloud');
      return {day,focus,duration:`${time} min`,desc:focus.toLowerCase().includes('japon')?'Aula e revisão de japonês':`Sessão de ${time} minutos em ${focus}. Registre o aprendizado no final.`};
    });
  }
  function renderPlanner(){
    if(!getUser() || !$('schedule'))return;
    const old=$('rtcSchedulePrefs'); if(old) old.classList.add('hidden');
    let node=$('rtcPersonalPlanner');
    if(!node){node=document.createElement('section');node.id='rtcPersonalPlanner';node.className='panel card glow';$('schedule').prepend(node);}
    const p=getPlan();
    node.innerHTML = `<div class="section-head"><div><div class="eyebrow">Sua rotina, seu ritmo</div><h2>Agenda realmente personalizada</h2></div><span class="pill">${p.days.length} dias / semana</span></div>
      <p class="small">Ative os dias de estudo e escreva o foco de cada um. Pode ser Cyber, inglês, japonês, faculdade ou qualquer atividade.</p>
      <div class="rtc-plan-grid">${DAY.map(day=>{
        const active=p.days.includes(day);
        return `<div class="rtc-plan-day ${active?'enabled':''}"><label class="rtc-plan-check"><input type="checkbox" data-plan-day="${day}" ${active?'checked':''}><strong>${day}</strong></label><label>O que estudar?<input type="text" data-plan-focus="${day}" value="${esc(p.focusMap?.[day] || (day==='Terça'||day==='Quinta'?'Japonês':day==='Quarta'?'Inglês':'Cyber / Cloud'))}" placeholder="Ex.: Japonês, Backend, Inglês" maxlength="80" ${active?'':'disabled'}></label><label>Minutos<select data-plan-time="${day}" ${active?'':'disabled'}>${[15,20,25,30,40,45,50,60,75,90,120,150,180].map(m=>`<option value="${m}" ${Number(p.minuteMap?.[day]||p.minutes||60)===m?'selected':''}>${m} min</option>`).join('')}</select></label></div>`;
      }).join('')}</div>
      <div class="split" style="margin-top:16px"><button id="rtcSaveCustomPlan" type="button" class="btn primary">Salvar minha rotina</button><button id="rtcApplyJapanPlan" type="button" class="btn ghost">🇯🇵 Sugestão Road to Japan</button></div><div class="small" id="rtcPlanMessage" style="margin-top:10px">A rotina será associada à sua conta após a sincronização com o Supabase.</div>`;
    node.querySelectorAll('[data-plan-day]').forEach(ck=>ck.onchange=()=>{
      const day=ck.dataset.planDay;const parent=ck.closest('.rtc-plan-day');parent.classList.toggle('enabled',ck.checked);
      parent.querySelectorAll('input[data-plan-focus],select[data-plan-time]').forEach(x=>x.disabled=!ck.checked);
    });
    $('rtcSaveCustomPlan').onclick=()=>{
      const days=[],focusMap={},minuteMap={};
      node.querySelectorAll('[data-plan-day]').forEach(input=>{
        if(!input.checked)return;const day=input.dataset.planDay;
        days.push(day);focusMap[day]=(node.querySelector(`[data-plan-focus="${day}"]`)?.value.trim()||'Estudo livre').slice(0,80);
        minuteMap[day]=Number(node.querySelector(`[data-plan-time="${day}"]`)?.value)||60;
      });
      if(!days.length)return notify('Selecione pelo menos um dia de estudo.');
      const prefs={...getPlan(),days,focusMap,minuteMap};
      localStorage.setItem(`rtc_prefs_${getUser().id}`,JSON.stringify(prefs));
      if(typeof render==='function')render();
      persistSettings();
      notify('Rotina personalizada salva.');
    };
    $('rtcApplyJapanPlan').onclick=()=>{
      const prefs={days:['Segunda','Terça','Quarta','Quinta','Sexta'],minutes:60,focusMap:{Segunda:'Cyber + Cloud',Terça:'Japonês — aula',Quarta:'Inglês — speaking',Quinta:'Japonês — aula',Sexta:'Automação e projetos'},minuteMap:{Segunda:60,Terça:60,Quarta:60,Quinta:60,Sexta:60}};
      localStorage.setItem(`rtc_prefs_${getUser().id}`,JSON.stringify(prefs));
      renderPlanner();if(typeof render==='function')render();persistSettings();notify('Sugestão Road to Japan aplicada. Você pode editá-la.');
    };
    const session=$('sessionDay');
    if(session && !session.dataset.rtcPlanBind){session.dataset.rtcPlanBind='1';session.onchange=adaptSession;}
    adaptSession();
  }
  function adaptSession(){
    const day=$('sessionDay')?.value;if(!day)return;
    const p=getPlan(),focus=p.focusMap?.[day]||'Cyber / Cloud',time=Number(p.minuteMap?.[day]||p.minutes||60);
    const focusSel=$('sessionFocus'); if(focusSel){if(![...focusSel.options].some(x=>x.value===focus))focusSel.add(new Option(focus,focus));focusSel.value=focus;}
    const dur=$('sessionDuration'); if(dur){const v=`${time} min`;if(![...dur.options].some(x=>x.value===v))dur.add(new Option(v,v));dur.value=v;}
  }

  const origRender=(typeof render==='function')?render:null;
  if(origRender){window.render=function(){ origRender(); const id=getUser()?.id;if(!id)return;
    if(S.user!==id && !S.loading){S.user=id;loadUserData();}
    if(S.user===id){draw();renderPlanner();}
  };}
  if(typeof routinePlan==='function')window.routinePlan=routine;

  function init(){if(typeof me!=='undefined'&&me?.id){loadUserData();}
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&getUser()&&S.user!==getUser().id)loadUserData();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
