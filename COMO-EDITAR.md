# Como editar o site MegaMorfose no VS Code

## 1. Abrir pela primeira vez

1. Instale o **Node.js** (versão LTS) em nodejs.org e o **VS Code**.
2. Extraia o `megamorfose-codigo.zip`.
3. No VS Code: **Arquivo → Abrir pasta…** e escolha a pasta `megamorfose`.
4. Aceite instalar as extensões recomendadas (Tailwind CSS IntelliSense etc.).
5. Abra o terminal (**Terminal → Novo terminal**) e rode, uma vez:
   ```
   npm install
   ```
6. Para ver o site enquanto edita:
   ```
   npm run dev
   ```
   Abra http://localhost:5173. Cada vez que você salva um arquivo, a página atualiza sozinha.

## 2. Onde fica cada coisa

| Quero mexer em… | Pasta / arquivo |
|---|---|
| **Fotos e imagens** | `public/imagens/` (subpastas `logo`, `equipe`, `areas`, `depoimentos`, `projetos`, `eventos`) |
| **Uma página** | `src/paginas/` (tabela abaixo) |
| **Menu, rodapé, redes sociais** | `src/componentes/Layout.tsx` |
| **Cartões, botões, vídeos** | `src/componentes/` (`cards.tsx`, `ui.tsx`, `testimonials.tsx`) |
| **Ilustrações das áreas** | `src/componentes/art.tsx` |
| **CSS (estilos gerais)** | `src/estilos/estilo.css` |
| **Cores e fontes** | `tailwind.config.js` |
| **Lógica em JavaScript/TypeScript** | `src/scripts/` (login e dados `backend.ts`, pontos `gamification.ts`, busca `search.ts`, áreas `areas.ts`) |
| **Textos e conteúdos de exemplo** | `src/dados/seed.ts` |
| **Painel administrativo** | `src/painel-admin/Admin.tsx` |
| **Banco de dados** | `supabase/` |

Os arquivos `.tsx` juntam o HTML da página e o JavaScript dela (é o jeito do React). O estilo de cada elemento fica no próprio HTML, nas classes `className="..."` (Tailwind), e o CSS geral fica em `src/estilos/estilo.css`.

## 3. Qual arquivo é cada página

| Endereço | Arquivo em `src/paginas/` |
|---|---|
| `/` (início) | `Home.tsx` |
| `/explorar` (Áreas) | `Explore.tsx` (a biblioteca e as trilhas ficam em `Learn.tsx`) |
| `/explorar/ia-visao-computacional`, `/eletronica`, `/mecanica` | `AreaPage.tsx` (as 6 etapas ficam em `STAGES`) |
| `/aprender/trilhas/...` | `PathPage.tsx` |
| `/oportunidades` e subpáginas | `Opportunities.tsx` (os caminhos ficam em `PATHS`) |
| `/futuro-academico` | `Academic.tsx` |
| `/inspiracao` | `Inspiration.tsx` |
| `/comunidade` | `Community.tsx` |
| `/minha-jornada` | `Journey.tsx` · perfil: `ProfileEdit.tsx` |
| `/meu-plano`, `/mentor`, `/mentor/aluno/...`, `/equipe` | `Mentoria.tsx` |
| `/conteudo/...` (detalhe) | `Detail.tsx` |
| `/busca` | `SearchPage.tsx` |
| `/calendario`, `/mapa`, `/por-onde-comecar`, `/glossario`, `/recursos`, `/vitrine`, `/desafio` | `Extras.tsx` |
| `/entrar`, `/cadastrar` | `Auth.tsx` |
| `/sobre`, `/privacidade`, página não encontrada | `Static.tsx` |

Para criar uma página nova: copie um arquivo de `src/paginas/`, mude o nome e registre o endereço em `src/App.tsx` (lista de `<Route path=...>`).

## 4. Usar uma foto

1. Coloque o arquivo em `public/imagens/<subpasta>/`, por exemplo `public/imagens/equipe/time-2026.jpg`. Use nomes sem espaço nem acento.
2. No código, use o caminho começando em `/imagens/`:
   ```tsx
   <img src="/imagens/equipe/time-2026.jpg" alt="Equipe MegaMorfose em 2026" className="rounded-3xl" />
   ```
3. Nos conteúdos cadastrados pelo painel, cole o mesmo caminho (`/imagens/...`) no campo de imagem, ou envie a imagem pelo próprio painel.

Prefira JPG/WebP com até 300 KB para o site continuar rápido.

## 5. Publicar

```
npm run build
```
Gera a pasta `dist/` com o site pronto (HTML, CSS, JS e imagens separados). Envie essa pasta para Vercel, Netlify ou Cloudflare Pages. Para GitHub Pages, veja o `README.md`.
