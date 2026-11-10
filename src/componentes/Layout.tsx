import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass, Home, Menu, Search, X, Rocket, Sparkles, Users, Route, LogOut, Shield, User, CornerDownLeft,
  Instagram, Youtube, Mail, Info, CheckCircle2, AlertTriangle, UserCheck,
} from 'lucide-react';
import { useStore } from '../scripts/store';
import { searchAll } from '../scripts/search';
import { typeDef } from '../scripts/contentTypes';
import type { ContentType } from '../scripts/types';
import { Logo } from './art';
import { Avatar, btn, cx, TYPE_ICON } from './ui';

export const NAV = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/explorar', label: 'Áreas', icon: Compass },
  { to: '/oportunidades', label: 'Oportunidades', icon: Rocket },
  { to: '/inspiracao', label: 'Inspiração', icon: Sparkles },
  { to: '/comunidade', label: 'Comunidade', icon: Users },
  { to: '/minha-jornada', label: 'Minha Jornada', icon: Route },
];

const MOBILE_TABS = [NAV[0], NAV[1], NAV[2], NAV[4], NAV[5]];

export default function Layout() {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const loc = useLocation();
  const { mode, toasts } = useStore();

  useEffect(() => {
    setMenu(false);
    setSearch(false);
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Pular para o conteúdo
      </a>
      {mode === 'demo' && (
        <div className="bg-ink px-4 py-1.5 text-center text-xs text-white/80">
          <Info className="mr-1 inline h-3.5 w-3.5" aria-hidden />
          Modo demonstração: conteúdos de exemplo e dados salvos apenas neste navegador.{' '}
          <Link to="/sobre#tecnico" className="font-semibold text-white underline underline-offset-2">Saiba mais</Link>
        </div>
      )}
      <Header onMenu={() => setMenu(true)} onSearch={() => setSearch(true)} />
      {menu && <MobileMenu onClose={() => setMenu(false)} />}
      {search && <SearchPalette onClose={() => setSearch(false)} />}
      <main id="conteudo" className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <nav aria-label="Navegação rápida" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5">
          {MOBILE_TABS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => cx('flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold', isActive ? 'text-grape-600' : 'text-ink-muted')}>
                <Icon className="h-5 w-5" aria-hidden />
                {label.replace(' STEM', '')}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} className={cx('pointer-events-auto flex animate-fadeup items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lift', t.tone === 'error' ? 'bg-bubble-600 text-white' : t.tone === 'info' ? 'bg-ink text-white' : 'bg-leaf-600 text-white')}>
            {t.tone === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function Header({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-lg">
      <div className="container-x flex h-16 items-center gap-3">
        <Link to="/" aria-label="MegaMorfose, página inicial" className="shrink-0"><Logo /></Link>
        <nav aria-label="Principal" className="ml-4 hidden flex-1 lg:block">
          <ul className="flex items-center gap-0.5">
            {NAV.slice(1).map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} className={({ isActive }) => cx('rounded-full px-3 py-2 text-sm font-semibold transition xl:px-3.5', isActive ? 'bg-grape-50 text-grape-700' : 'text-ink-soft hover:bg-ink/5 hover:text-ink')}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onSearch} className="flex h-10 items-center gap-2 rounded-full bg-paper px-3 text-sm text-ink-muted ring-1 ring-line transition hover:ring-ink/20 sm:pr-2" aria-label="Buscar na plataforma">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-line xl:inline">Ctrl K</kbd>
          </button>
          <UserMenu />
          <button onClick={onMenu} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-line lg:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function UserMenu() {
  const { user, signOut, isAdmin, isMentor } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  if (!user)
    return (
      <Link to="/entrar" className={cx(btn('dark', 'sm'), 'hidden sm:inline-flex')}>
        Entrar
      </Link>
    );
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" aria-label="Menu do perfil" className="rounded-full ring-2 ring-white transition hover:ring-grape-100">
        <Avatar name={user.name} className="h-10 w-10 text-sm" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-60 animate-fadeup rounded-2xl bg-white p-2 shadow-lift ring-1 ring-line">
          <p className="px-3 py-2 text-sm"><span className="block font-bold text-ink">{user.name}</span><span className="text-xs text-ink-muted">{user.email}</span></p>
          {user.role === 'student' && <Link role="menuitem" to="/meu-plano" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-paper"><UserCheck className="h-4 w-4" /> Meu plano</Link>}
          {isMentor && <Link role="menuitem" to="/mentor" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-tang-700 hover:bg-tang-50"><UserCheck className="h-4 w-4" /> Hub do mentor</Link>}
          {isAdmin && <Link role="menuitem" to="/equipe" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-leaf-700 hover:bg-leaf-50"><Users className="h-4 w-4" /> Hub da equipe</Link>}
          <Link role="menuitem" to="/minha-jornada" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-paper"><Route className="h-4 w-4" /> Minha Jornada</Link>
          <Link role="menuitem" to="/minha-jornada/perfil" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-paper"><User className="h-4 w-4" /> Editar perfil</Link>
          {isAdmin && <Link role="menuitem" to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-grape-700 hover:bg-grape-50"><Shield className="h-4 w-4" /> Painel administrativo</Link>}
          <button role="menuitem" onClick={() => { setOpen(false); signOut(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper"><LogOut className="h-4 w-4" /> Sair</button>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const { user, isAdmin } = useStore();
  const extras = [
    ['/futuro-academico', 'Seu Futuro Acadêmico'], ['/por-onde-comecar', 'Por onde começar?'], ['/calendario', 'Calendário STEM'],
    ['/mapa', 'Mapa de oportunidades'], ['/vitrine', 'Vitrine de projetos'], ['/desafio', 'Desafio do mês'], ['/glossario', 'Glossário'], ['/recursos', 'Central de recursos'],
  ];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm animate-fadeup flex-col overflow-y-auto bg-white p-5 shadow-lift">
        <div className="mb-4 flex items-center justify-between">
          <Logo />
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-line" aria-label="Fechar menu"><X className="h-5 w-5" /></button>
        </div>
        <ul className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={({ isActive }) => cx('flex items-center gap-3 rounded-2xl px-3 py-3 font-semibold', isActive ? 'bg-grape-50 text-grape-700' : 'text-ink')}>
                <Icon className="h-5 w-5" /> {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <p className="mb-2 mt-6 px-3 text-xs font-bold uppercase tracking-widest text-ink-muted">Mais</p>
        <ul className="grid grid-cols-2 gap-1">
          {extras.map(([to, label]) => (
            <li key={to}><Link to={to} className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:bg-paper">{label}</Link></li>
          ))}
        </ul>
        <div className="mt-auto space-y-2 pt-6">
          {user?.role === 'student' && <Link to="/meu-plano" className={cx(btn('primary'), 'w-full')}><UserCheck className="h-4 w-4" /> Meu plano</Link>}
          {user && (user.role === 'mentor' || isAdmin) && <Link to="/mentor" className={cx(btn('secondary'), 'w-full')}><UserCheck className="h-4 w-4" /> Hub do mentor</Link>}
          {isAdmin && <Link to="/equipe" className={cx(btn('secondary'), 'w-full')}><Users className="h-4 w-4" /> Hub da equipe</Link>}
          {isAdmin && <Link to="/admin" className={cx(btn('secondary'), 'w-full')}><Shield className="h-4 w-4" /> Painel administrativo</Link>}
          {!user && <Link to="/entrar" className={cx(btn('dark'), 'w-full')}>Entrar</Link>}
          {!user && <Link to="/cadastrar" className={cx(btn('primary'), 'w-full')}>Criar conta grátis</Link>}
        </div>
      </div>
    </div>
  );
}

function SearchPalette({ onClose }: { onClose: () => void }) {
  const { items } = useStore();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const nav = useNavigate();
  const res = searchAll(items, q);
  const flat: { key: string; to: string; title: string; sub: string; type?: ContentType }[] = [...res.pages.map((p) => ({ key: p.to, to: p.to, title: p.title, sub: 'Página' })), ...res.items.slice(0, 8).map((i) => ({ key: i.id, to: `/conteudo/${i.id}`, title: i.title, sub: typeDef(i.type).label, type: i.type }))];
  const go = (to: string) => { onClose(); nav(to); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const suggestions = ['robótica', 'bolsa', 'jovem aprendiz', 'Arduino', 'olimpíada', 'clube'];

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/30 p-4 pt-[10vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Buscar" onClick={onClose}>
      <div className="w-full max-w-xl animate-fadeup overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-line" onClick={(e) => e.stopPropagation()}>
        <form
          onSubmit={(e) => { e.preventDefault(); if (flat[active]) go(flat[active].to); else if (q.trim()) go(`/busca?q=${encodeURIComponent(q.trim())}`); }}
          className="flex items-center gap-3 border-b border-line px-4"
        >
          <Search className="h-5 w-5 text-ink-muted" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            }}
            placeholder="Buscar cursos, oportunidades, histórias…"
            aria-label="Termo de busca"
            className="h-14 flex-1 border-0 bg-transparent text-base outline-none focus:ring-0"
          />
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-xs font-semibold text-ink-muted ring-1 ring-line">Esc</button>
        </form>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!q && (
            <div className="p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-muted">Sugestões</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => <button key={s} onClick={() => setQ(s)} className="rounded-full bg-paper px-3 py-1.5 text-sm font-medium ring-1 ring-line hover:ring-ink/20">{s}</button>)}
              </div>
            </div>
          )}
          {q && !flat.length && <p className="p-6 text-center text-sm text-ink-soft">Nada encontrado para “{q}”. Tente outra palavra.</p>}
          <ul>
            {flat.map((r, idx) => {
              const Icon = r.type ? TYPE_ICON[r.type] : Compass;
              return (
                <li key={r.key}>
                  <button onMouseEnter={() => setActive(idx)} onClick={() => go(r.to)} className={cx('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left', idx === active && 'bg-paper')}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-grape-50 text-grape-700"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{r.title}</span><span className="text-xs text-ink-muted">{r.sub}</span></span>
                    {idx === active && <CornerDownLeft className="h-4 w-4 text-ink-muted" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {q && res.items.length > 8 && (
            <button onClick={() => go(`/busca?q=${encodeURIComponent(q)}`)} className="w-full rounded-2xl p-3 text-sm font-semibold text-grape-700 hover:bg-grape-50">
              Ver todos os {res.items.length} resultados
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const cols: [string, [string, string][]][] = [
    ['Áreas', [['/explorar/ia-visao-computacional', 'AI & Visão Computacional'], ['/explorar/eletronica', 'Eletrônica'], ['/explorar/mecanica', 'Mecânica'], ['/explorar?biblioteca=1', 'Biblioteca de conteúdos']]],
    ['Oportunidades', [['/oportunidades', 'Todas as oportunidades'], ['/futuro-academico', 'Seu Futuro Acadêmico'], ['/calendario', 'Calendário STEM'], ['/mapa', 'Mapa de oportunidades']]],
    ['Links úteis', [['/por-onde-comecar', 'Por onde começar?'], ['/glossario', 'Glossário STEM'], ['/recursos', 'Central de recursos'], ['/privacidade', 'Privacidade e segurança']]],
  ];
  return (
    <footer className="mt-10 border-t border-line bg-white pb-20 lg:pb-0">
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
            Um projeto educacional da equipe de robótica de Boituva/SP, competidora da <em>FIRST</em> Tech Challenge. Transformar curiosidade em possibilidade e possibilidade em oportunidade.
          </p>
          <div className="mt-4 flex gap-2">
            {/* Endereços reais das redes sociais devem ser configurados pela equipe (src/componentes/Layout.tsx → SOCIAL). */}
            {SOCIAL.map(({ label, icon: Icon, href }) => (
              href ? (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full bg-paper ring-1 ring-line hover:text-grape-600"><Icon className="h-4 w-4" /></a>
              ) : (
                <span key={label} title={`${label}: link ainda não configurado`} className="grid h-10 w-10 cursor-not-allowed place-items-center rounded-full bg-paper text-ink-muted/60 ring-1 ring-line"><Icon className="h-4 w-4" /><span className="sr-only">{label} (em breve)</span></span>
              )
            ))}
          </div>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <p className="mb-3 text-sm font-bold text-ink">{title}</p>
            <ul className="space-y-2">
              {links.map(([to, label]) => <li key={to}><Link to={to} className="text-sm text-ink-soft hover:text-grape-700">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MegaMorfose · Equipe de robótica de Boituva/SP. Todos os direitos reservados.</p>
          <p className="flex gap-4">
            <Link to="/sobre" className="hover:text-ink">Sobre e créditos</Link>
            <Link to="/sobre#contato" className="hover:text-ink">Contato</Link>
            <Link to="/privacidade" className="hover:text-ink">Privacidade</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export const SOCIAL = [
  { label: 'Instagram', icon: Instagram, href: '' },
  { label: 'YouTube', icon: Youtube, href: '' },
  { label: 'E-mail', icon: Mail, href: '' },
];
