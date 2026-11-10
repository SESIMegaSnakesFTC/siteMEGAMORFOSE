import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './componentes/Layout';
import { useStore } from './scripts/store';
import Home from './paginas/Home';
import Explore from './paginas/Explore';
import AreaPage from './paginas/AreaPage';
import PathPage from './paginas/PathPage';
import Opportunities from './paginas/Opportunities';
import Academic from './paginas/Academic';
import Inspiration from './paginas/Inspiration';
import Community from './paginas/Community';
import Journey from './paginas/Journey';
import ProfileEdit from './paginas/ProfileEdit';
import Detail from './paginas/Detail';
import SearchPage from './paginas/SearchPage';
import { Login, Register } from './paginas/Auth';
import { CalendarPage, MapPage, Glossary, Resources, Showcase, Challenge, Quiz } from './paginas/Extras';
import { About, Privacy, NotFound } from './paginas/Static';
import { MentorHub, MyPlan, StudentPlan, TeamHub } from './paginas/Mentoria';

// O painel administrativo é carregado sob demanda: estudantes não baixam esse código.
const Admin = lazy(() => import('./painel-admin/Admin'));

function Loading() {
  return <div className="container-x py-24 text-center text-ink-muted" role="status">Carregando…</div>;
}

// /aprender agora faz parte de /explorar (Áreas); links antigos continuam funcionando.
function ToAreas() {
  const loc = useLocation();
  return <Navigate to={`/explorar${loc.search || '?biblioteca=1'}`} replace />;
}

function RequireAuth({ children, admin = false, mentor = false }: { children: ReactNode; admin?: boolean; mentor?: boolean }) {
  const { user, authReady, isMentor } = useStore();
  const loc = useLocation();
  if (!authReady) return <Loading />;
  if (!user) return <Navigate to={`/entrar?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  if (mentor && !isMentor) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explorar" element={<Explore />} />
        <Route path="explorar/:slug" element={<AreaPage />} />
        <Route path="aprender" element={<ToAreas />} />
        <Route path="aprender/trilhas/:id" element={<PathPage />} />
        <Route path="oportunidades" element={<Opportunities />} />
        <Route path="oportunidades/:tab" element={<Opportunities />} />
        <Route path="futuro-academico" element={<Academic />} />
        <Route path="inspiracao" element={<Inspiration />} />
        <Route path="comunidade" element={<Community />} />
        <Route path="minha-jornada" element={<Journey />} />
        <Route path="minha-jornada/perfil" element={<RequireAuth><ProfileEdit /></RequireAuth>} />
        <Route path="meu-plano" element={<RequireAuth><MyPlan /></RequireAuth>} />
        <Route path="mentor" element={<RequireAuth mentor><MentorHub /></RequireAuth>} />
        <Route path="mentor/aluno/:id" element={<RequireAuth mentor><StudentPlan /></RequireAuth>} />
        <Route path="equipe" element={<RequireAuth admin><TeamHub /></RequireAuth>} />
        <Route path="conteudo/:id" element={<Detail />} />
        <Route path="busca" element={<SearchPage />} />
        <Route path="calendario" element={<CalendarPage />} />
        <Route path="mapa" element={<MapPage />} />
        <Route path="por-onde-comecar" element={<Quiz />} />
        <Route path="glossario" element={<Glossary />} />
        <Route path="recursos" element={<Resources />} />
        <Route path="vitrine" element={<Showcase />} />
        <Route path="desafio" element={<Challenge />} />
        <Route path="entrar" element={<Login />} />
        <Route path="cadastrar" element={<Register />} />
        <Route path="sobre" element={<About />} />
        <Route path="privacidade" element={<Privacy />} />
        <Route path="admin/*" element={<RequireAuth admin><Suspense fallback={<Loading />}><Admin /></Suspense></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
