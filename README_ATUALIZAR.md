# ROAD TO CYBER V8 — Community & Neon Edition

Esta atualização foi construída **sobre a V7.1 que já estava funcionando**. Não recrie o banco nem apague dados.

## Novidades
- Matrix com caracteres japoneses e binário ao fundo (mantido da V7.1 e reforçado visualmente).
- Transição de "apagão / loading" de aproximadamente 0,7 s entre abas; respeita preferência de movimento reduzido e o botão de desligar animações.
- Tipografia legível e cartões com animações suaves.
- Logo aprovada no login, favicon e lateral.
- Busca de **perfis públicos opt-in** de outros estudantes.
- Perfil de qualquer integrante do mesmo grupo, clicável.
- Capa, avatar e bio personalizáveis.
- Capas Sakura.exe e 守 Guardian desbloqueáveis após dois meses desde a primeira sessão concluída **e pelo menos oito sessões concluídas**.
- Estatísticas públicas apenas agregadas; anotações individuais continuam privadas.

## 1) Backup
Antes de começar, baixe os arquivos atuais do seu repositório e, opcionalmente, exporte seu progresso em Configurações > Ferramentas de dados.

## 2) SQL: executar ANTES de publicar os arquivos novos
1. Acesse Supabase > **SQL Editor > New query** no **mesmo projeto** usado pela V7.1.
2. Abra `03_comunidade_perfis.sql`, copie todo o conteúdo e execute **Run** uma única vez.
3. Confira o resultado da consulta no final: deve retornar os totais dos perfis e `rls_ativo = true`.
4. Não reexecute o SQL da V5 nem desative RLS.

Este SQL adiciona somente os campos de personalização, um bucket público **exclusivo para avatares** e funções controladas de leitura agregada e atualização de aparência. Não exclui membros, provas ou sessões existentes.

**Privacidade:** por padrão ninguém aparece na busca pública. O estudante deve ativar "Quero aparecer na busca" nas configurações. Colegas do mesmo grupo permanecem visíveis pelas regras existentes. Os arquivos enviados ao bucket de avatares têm URL pública: não envie fotos sigilosas ou de terceiros.

## 3) GitHub Pages: arquivos que você deve atualizar
Na branch e pasta usadas pelo seu Pages, mantenha `config.js` como está e faça upload de:

- `index.html` **(substituir o arquivo existente)**
- `app.js` **(esta cópia preserva a V7.1 funcional)**
- `community.css` **(novo)**
- `community.js` **(novo)**
- pasta `assets/` com `road_to_cyber_logo.png`, `icon.png` e `favicon.png`.

**Importante:** `index (4).html` não substitui `index.html`. Confira os nomes exatos dos arquivos no repositório e não deixe cópias numeradas na raiz.

### Estrutura na raiz
```
index.html
app.js
community.css
community.js
config.js          # manter a versão já existente; nunca colocar secret/service_role aqui
assets/
    icon.png
    favicon.png
    road_to_cyber_logo.png
```

O arquivo SQL e o README não precisam ser publicados no GitHub; guarde-os localmente.

## 4) Verificar
1. Abra o Pages em aba anônima: título `Road to Cyber — Comunidade Online (V8)`.
2. Faça login com Google.
3. Confirme Dashboard, Trilhas, Rotina e Simulados (V7.1 preservados).
4. Vá para **Configurações → Seu cartão de estudante**; escolha uma capa inicial, escreva sua bio e salve.
5. Clique em **Comunidade**; somente perfis opt-in aparecem na busca. Clique em um cartão.
6. Confira no Supabase > Table Editor que a coluna `is_public` só fica `true` após o estudante autorizar.
7. Teste com uma **segunda conta Google** e verifique que não consegue visualizar anotações privadas da primeira.

## Sobre o desbloqueio de dois meses
O banco verifica a data da primeira sessão concluída e exige pelo menos 8 sessões concluídas, independentemente de você trocar de navegador. É um incentivo à constância, não uma certificação profissional. As capas não são liberadas por alterar a fase manualmente.

## Limitações conhecidas
- O banco online precisa continuar disponível; este pacote não cria um servidor novo.
- A integração real Supabase/Google/storage depende do seu projeto; os testes automáticos desta entrega usaram um banco simulado.
- Capas vêm da biblioteca do projeto; não há upload de capas próprias nesta versão. Avatares pessoais podem ser enviados ao Storage.
- O diretório lista até 150 perfis públicos por consulta; paginação poderá ser adicionada quando a comunidade crescer.
- O Google Fonts depende de internet. Existe uma pilha de fontes de sistema de fallback.
- A publicação e a migração devem ser concluídas em conjunto para liberar personalização. Se a migração faltar, as telas principais ainda funcionam e a seção de perfil mostrará uma explicação.

## Segurança de dados
O Supabase Auth mantém a identidade do usuário. RLS continua habilitado. A função de estatísticas só retorna contagem de sessões, horas, nota média e datas resumidas para pessoas do mesmo grupo ou perfis públicos, sem disponibilizar conteúdos de anotações. Nunca publique `service_role`, JWT secrets ou senhas no GitHub.
