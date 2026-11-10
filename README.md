# MegaMorfose — Plataforma educacional STEM

Plataforma da equipe de robótica de Boituva/SP (FIRST Tech Challenge) para aproximar jovens de STEM: aprendizado, oportunidades, inspiração e comunidade.

## Como rodar

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # versão de produção em dist/
npm run build:preview  # um único index.html (dist-preview/) para demonstração
```

Sem configuração, roda em **modo demonstração**: conteúdos de exemplo e contas/progresso salvos no navegador (localStorage).
Conta de admin da demonstração: `admin@megamorfose.demo` / `megamorfose` (existe só no navegador local).

## Versão 2 (09/11/2026): site mais direto e guiado

- **Home enxuta**: só a mensagem, o caminho em 3 passos e as portas de entrada (as 3 áreas + "não sei qual escolher", "quero uma oportunidade", "quero pensar na faculdade").
- **Áreas como linha de aprendizagem**: cada área tem 6 etapas em ordem (Descubra → Primeiros passos → Pratique → Aprofunde → Participe → Planeje seu futuro), uma aberta por vez, com botão "Próxima etapa", progresso e no máximo 3 itens por etapa ("Mostrar mais" para o resto).
- **Oportunidades guiadas**: a pessoa escolhe o que quer ("Quero participar de um projeto", "Quero competir"…); cada caminho mostra "como funciona em 3 passos", vídeos de quem participou e só então a lista. Filtros ficam recolhidos e inscrições encerradas ficam escondidas.
- **Depoimentos só em vídeo**: o tipo "Depoimento em vídeo" substitui os relatos escritos. Cada vídeo pode ser ligado a oportunidades/olimpíadas/bolsas (campo "Conteúdos relacionados") e a uma etapa da área; ele aparece automaticamente nesses lugares. Enquanto o link do YouTube/Vimeo não é cadastrado, o player mostra "Vídeo ainda não gravado".
- **Aprender**: começa pela escolha de uma trilha; a biblioteca completa fica atrás de um botão.

## Versão 3 (10/11/2026): Áreas + mentoria

- **Áreas**: "Explorar STEM" e "Aprender" viraram uma aba só (`/explorar`). As 3 áreas, as trilhas e a biblioteca (fechada até a pessoa abrir). Links antigos de `/aprender` continuam funcionando.
- **Escolha no cadastro**: "Quero um mentor" ou "Vou explorar sozinho". Quem escolheu explorar sozinho pode pedir um mentor depois (botão "Quero um mentor" em Meu plano, Minha Jornada e nas etapas Pratique e Participe de cada área).
- **Meu plano** (`/meu-plano`): próximo passo, próximo encontro, metas (o aluno marca as feitas), registro do que foi combinado e progresso nas linhas. O aluno pode cancelar o pedido ou parar a mentoria.
- **Hub do mentor** (`/mentor`): os alunos ligados ao mentor, quem precisa de atenção (sem acessar há 14 dias, sem plano, sem encontro marcado), agenda da semana. Em cada aluno (`/mentor/aluno/:id`) o mentor edita o próximo passo, o encontro, as metas e registra os encontros.
- **Hub da equipe** (`/equipe`, só admin): números gerais, fila de quem aguarda mentor (com sugestão por área em comum e menor carga), alunos por mentor (mover de mentor), adicionar ou remover mentores, tabela de todos os estudantes.
- **Segurança**: não há chat. O plano fica visível só para o aluno, o mentor dele e a equipe. O aluno não consegue escolher o próprio mentor nem virar mentor (garantido no banco). Mentor vê só os próprios alunos e não vê e-mails.
- **Contas de teste (modo demonstração, senha `megamorfose`)**: equipe `admin@megamorfose.demo`, mentora `mentora@megamorfose.demo`, aluna com mentora `aluna@megamorfose.demo`.

## 1. Funcionalidades implementadas

- **Navegação**: menu principal com as 7 seções, barra inferior no celular, menu lateral, busca global (botão ou `Ctrl+K`) e página `/busca`.
- **Explorar STEM**: 3 páginas de área com identidade visual própria, as 10 seções pedidas, “Comece por aqui” (trilha para iniciantes) e filtro por nível (Iniciante/Intermediário/Avançado). Cards mostram tipo, nível, duração e área.
- **Aprender**: biblioteca com 7 categorias, filtros por área, nível, busca e “só favoritos”; 3 trilhas com progresso por etapa.
- **Oportunidades**: visão geral + 5 categorias (projetos e voluntariado, programas, Jovem Aprendiz e empregos, olimpíadas, oportunidades na escola), cada uma com filtros próprios (modalidade, localização, área profissional, status, “aceita iniciantes”), guias educativos (currículo, entrevista, portfólio, LinkedIn, como começar nas olimpíadas, participar sem experiência) e 8 guias para criar clubes/feiras na escola.
- **Seu Futuro Acadêmico**: Brasil (faculdade, ENEM/SISU, bolsas, iniciação científica, baixa renda) e Exterior (bolsas, summer schools, candidaturas, inglês, cartas, essays, documentos), “Estudantes que chegaram lá” e aviso de confirmação nas páginas oficiais.
- **Inspiração**: galeria de depoimentos em vídeo, filtrada por área.
- **Comunidade** (segura para menores): mural moderado (toda publicação entra como pendente), sem mensagens privadas, bloqueio automático de telefone/e-mail/@/links, denúncia (3 denúncias tiram do ar), “Tenho interesse” em colaborações mediado pela equipe, grupos/clubes/comunidades por área para seguir, próximos eventos.
- **Minha Jornada**: cadastro/login com validação e autorização do responsável para menores, áreas de interesse, nível e pontos, 8 badges, trilhas com progresso, favoritos (conteúdos e oportunidades), recomendações, objetivos pessoais, quadro de projetos (ideia → fazendo → concluído), espaço para certificados, exportar dados e excluir conta (LGPD). Sem ranking entre estudantes, de propósito.
- **Extras**: Calendário STEM (mês a mês, eventos e prazos), Mapa de oportunidades (local → estadual → nacional → internacional, presencial/online), “Por onde começar?” (teste de 5 perguntas com resultado e sugestões), Glossário (22 termos, A–Z), Central de recursos, Vitrine de projetos, Desafio do mês.
- **Painel administrativo** (`/admin`, só admin): visão geral, lista com busca/filtros, criar/editar/duplicar/excluir, publicar/arquivar, destacar, formulário gerado por tipo com validação, envio de imagem, pré-visualização de vídeo, gerenciamento da Home e fila de moderação.
- **Qualidade**: estados de carregamento (skeletons), vazio e erro; páginas 404; SEO por página (título/descrição); acessibilidade (link “pular para o conteúdo”, foco visível, rótulos ARIA, `prefers-reduced-motion`); links externos sempre em nova aba com `noopener`; links ainda não cadastrados aparecem desativados com explicação.

## 2. Páginas criadas

`/` · `/explorar` · `/explorar/ia-visao-computacional` · `/explorar/eletronica` · `/explorar/mecanica` · `/aprender` · `/aprender/trilhas/:id` · `/oportunidades` (+ `/projetos`, `/programas`, `/empregos`, `/olimpiadas`, `/escola`) · `/futuro-academico` · `/inspiracao` · `/comunidade` · `/minha-jornada` · `/minha-jornada/perfil` · `/conteudo/:id` (detalhe de qualquer conteúdo) · `/busca` · `/calendario` · `/mapa` · `/por-onde-comecar` · `/glossario` · `/recursos` · `/vitrine` · `/desafio` · `/entrar` · `/cadastrar` · `/sobre` · `/privacidade` · `/admin/*`

## 3. Tecnologias

React 18 + TypeScript, Vite 5, Tailwind CSS 3, React Router 6, lucide-react (ícones), Supabase (Postgres + Auth + Storage) opcional. Ilustrações próprias em SVG (sem imagens externas).

## 4. Banco de dados

Arquivo: [`supabase/schema.sql`](supabase/schema.sql) (testado em PostgreSQL 16 com as políticas de acesso).

| Tabela | Para quê |
|---|---|
| `profiles` | Usuários/perfis (papel `student`, `mentor` ou `admin`), interesses, objetivos, projetos pessoais, pedido de mentor (`wants_mentor`), mentor definido pela equipe (`mentor_id`) e progresso nas linhas |
| `mentor_plans` | Plano de mentoria de cada aluno: próximo passo, encontro, metas e registros dos encontros |
| `content_items` | **Todas** as entidades editoriais: STEMAreas (campo `area`), Courses, Videos, Tutorials, LearningPaths, Opportunities, Jobs, Scholarships, Universities, Competitions, InspiringStories, Projects (vitrine), Events, guias, recursos, glossário, desafios. Campos específicos de cada tipo ficam em `fields` (jsonb) |
| `bookmarks` | Favoritos |
| `progress` | Conteúdos e desafios concluídos |
| `achievements` | Badges/certificados emitidos oficialmente |
| `communities`, `group_members` | Grupos de estudo, clubes e comunidades por área |
| `community_posts`, `post_reports`, `collab_interests` | Mural moderado, denúncias e interesse em colaborar |

Por que uma tabela de conteúdo única: um novo tipo de conteúdo (ou um novo campo) é adicionado só em `src/scripts/contentTypes.ts`, sem migração de banco e sem criar telas novas no painel.

**Segurança (RLS)**: visitantes leem só conteúdo publicado; estudantes leem e escrevem só os próprios dados; estudante não consegue se promover a admin, nem inserir conteúdo, nem autoaprovar publicação; só admin gerencia conteúdo, imagens e moderação.

## 5. O que depende de configuração externa

1. **Supabase** (banco, login e imagens): crie um projeto em supabase.com, rode `supabase/schema.sql` e, se quiser os exemplos, `supabase/seed.sql` (gerado por `npm run seed:sql`). Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (a chave *anon* é pública por design; nunca use a *service_role* no site). Crie sua conta no site e rode no SQL Editor: `update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'SEU-EMAIL');`. A integração com Supabase está implementada, mas não pôde ser testada contra um projeto real neste ambiente.
2. **Hospedagem**: qualquer host estático (Vercel, Netlify, Cloudflare Pages). Em GitHub Pages, use `VITE_ROUTER=hash`.
3. **Conteúdo real**: todos os itens marcados como “Conteúdo demonstrativo” são fictícios. Links oficiais, vídeos (YouTube/Vimeo), fotos e histórias reais (com autorização das pessoas) precisam ser cadastrados pela equipe.
4. **Redes sociais e contato**: preencha `SOCIAL` em `src/componentes/Layout.tsx` e os textos de `/sobre`.
5. **Revisão jurídica** da página de privacidade antes do lançamento.

## 6. Como adicionar conteúdo pelo painel

1. Entre com uma conta de administrador e abra **Painel administrativo** (menu do perfil) ou `/admin`.
2. **Novo conteúdo** → escolha o tipo (vídeo, curso, vaga, olimpíada, história…).
3. Preencha título, descrição curta, área STEM, categoria, nível, duração, tags, link oficial (https://), link do vídeo e os campos próprios do tipo (ex.: empresa, prazo e requisitos de uma vaga). Listas usam um item por linha.
4. Envie uma imagem de capa (ou cole o link). Sem imagem, a plataforma gera uma ilustração com a cor da área.
5. **Salvar como rascunho** (só admins veem) ou **Salvar e publicar**. Depois, na lista, dá para arquivar, duplicar, destacar ou excluir.
6. **Trilhas**: no campo “Conteúdos da trilha”, cole os IDs dos conteúdos em ordem (o ID aparece na lista do painel).
7. **Home**: na aba “Home”, marque com a estrela o que aparece em cada seção.
8. **Moderação**: aprove ou recuse publicações da comunidade.
9. Para substituir os exemplos: filtre “Só demonstrativos” e edite (desmarcando “Conteúdo demonstrativo”) ou arquive.

## 7. Próximas melhorias recomendadas

- Conectar o Supabase e testar ponta a ponta; recuperação de senha e confirmação de e-mail.
- Fluxo de autorização do responsável por e-mail (hoje é uma declaração no cadastro).
- Grupos/comunidades gerenciados pelo painel (hoje são fixos em `src/dados/seed.ts`).
- Envio de projetos para a Vitrine pelo próprio estudante, com moderação.
- Mapa geográfico real (ex.: Leaflet + OpenStreetMap) usando as cidades cadastradas.
- Certificados em PDF para workshops e trilhas concluídas.
- Notificações de prazos (e-mail) para oportunidades salvas.
- Carregar o cliente Supabase só quando configurado, para reduzir o tamanho do site em modo demonstração.
- Testes automatizados (Playwright) no CI e analytics respeitando a LGPD.

## Estrutura do código

Veja o guia completo em [`COMO-EDITAR.md`](COMO-EDITAR.md).

```
public/imagens/         FOTOS e imagens (logo, equipe, áreas, depoimentos, projetos, eventos)
src/paginas/            um arquivo por PÁGINA do site (Home.tsx, AreaPage.tsx…)
src/componentes/        partes reutilizadas: menu/rodapé (Layout), cartões, vídeos, ilustrações
src/estilos/estilo.css  CSS geral do site
src/scripts/            lógica (JavaScript/TypeScript): dados, login, pontos, busca, tipos de conteúdo
src/dados/seed.ts       textos e conteúdos de demonstração
src/painel-admin/       painel administrativo
supabase/               banco de dados e regras de acesso
```
