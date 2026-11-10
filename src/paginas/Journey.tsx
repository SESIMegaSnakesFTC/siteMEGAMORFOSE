import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle2, Circle, Plus, Settings, Trash2, Trophy, Award } from 'lucide-react';
import { PathCard } from '../componentes/cards';
import { MentorStrip } from '../componentes/mentoria';
import { Avatar, btn, Chip, cx, EmptyState, Grid, ItemCard, PageHero, ProgressBar, SectionHeader, useSeo } from '../componentes/ui';
import { AREAS, AREA_OPTIONS, areaById } from '../scripts/areas';
import { LEARNING_TYPES } from '../scripts/contentTypes';
import { computeStats } from '../scripts/gamification';
import { newId } from '../scripts/backend';
import { useStore } from '../scripts/store';
import type { AreaId, PlannedProject } from '../scripts/types';

export default function Journey() {
  useSeo('Minha Jornada', 'Acompanhe seu progresso, conteúdos salvos, objetivos e conquistas.');
  const { user, authReady } = useStore();
  if (!authReady) return <div className="container-x py-24 text-center text-ink-muted" role="status">Carregando…</div>;
  return user ? <Dashboard /> : <Guest />;
}

function Guest() {
  return (
    <>
      <PageHero eyebrow="Minha Jornada" title="Seu espaço para crescer" text="Crie sua conta grátis para salvar conteúdos e oportunidades, acompanhar trilhas, definir objetivos e conquistar badges." gradient="from-leaf-500 to-grape-500">
        <Link to="/cadastrar" className={btn('primary', 'lg')}>Criar conta grátis</Link>
        <Link to="/entrar?next=/minha-jornada" className={btn('secondary', 'lg')}>Já tenho conta</Link>
      </PageHero>
      <div className="container-x grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['📌', 'Favoritos', 'Guarde cursos, vídeos e oportunidades para ver depois.'],
          ['🥾', 'Trilhas', 'Siga sequências de conteúdos e veja seu progresso.'],
          ['🎯', 'Objetivos', 'Anote suas metas e projetos que quer construir.'],
          ['🏅', 'Conquistas', 'Ganhe pontos e badges aprendendo, sem competição.'],
        ].map(([e, t, d]) => (
          <div key={t} className="card p-6"><span className="text-3xl" aria-hidden>{e}</span><p className="mt-3 font-display text-lg font-bold">{t}</p><p className="mt-1 text-sm text-ink-soft">{d}</p></div>
        ))}
      </div>
    </>
  );
}

function Dashboard() {
  const { user, data, items, saveProfile, toast, byId } = useStore();
  const profile = user!;
  const stats = computeStats(profile, data, items);
  const saved = data.bookmarks.map(byId).filter((i) => i && i.status === 'published');
  const savedLearning = saved.filter((i) => LEARNING_TYPES.includes(i!.type));
  const savedOpps = saved.filter((i) => !LEARNING_TYPES.includes(i!.type));
  const paths = items.filter((i) => i.type === 'path');
  const recommended = items.filter((i) => LEARNING_TYPES.includes(i.type) && (profile.interests.length ? profile.interests.includes(i.area) : true) && !data.completed.includes(i.id) && i.level === 'iniciante').slice(0, 3);
  const challenge = items.find((i) => i.type === 'challenge');
  const [tab, setTab] = useState<'conteudos' | 'oportunidades'>('conteudos');

  const save = async (p: typeof profile, msg?: string) => {
    try {
      await saveProfile(p);
      if (msg) toast(msg);
    } catch {
      toast('Não foi possível salvar.', 'error');
    }
  };

  return (
    <div className="container-x py-8 sm:py-12">
      {/* Cabeçalho */}
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-grape-500 via-eletric-500 to-leaf-500 p-6 text-white shadow-lift sm:p-8">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(white_1.2px,transparent_1.2px)] [background-size:18px_18px]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <Avatar name={profile.name} className="h-20 w-20 text-2xl ring-4 ring-white/30" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white/80">Olá,</p>
            <h1 className="font-display text-3xl font-bold">{profile.name.split(' ')[0]} 👋</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.interests.length ? profile.interests.map((a) => <Chip key={a} className="bg-white/20 text-white">{areaById(a).short}</Chip>) : <Link to="/minha-jornada/perfil" className="text-sm font-semibold underline">Escolha suas áreas de interesse</Link>}
            </div>
          </div>
          <div className="w-full rounded-3xl bg-white/15 p-4 backdrop-blur md:w-72">
            <div className="flex items-end justify-between">
              <div><p className="text-xs font-bold uppercase tracking-wider text-white/80">Nível</p><p className="font-display text-xl font-bold">{stats.level}</p></div>
              <p className="font-display text-3xl font-bold">{stats.points}<span className="text-sm font-semibold text-white/80"> pts</span></p>
            </div>
            <div className="mt-3"><ProgressBar pct={stats.levelPct} color="from-white to-sun-400" label="Progresso até o próximo nível" /></div>
            <p className="mt-1.5 text-xs text-white/80">{stats.nextLevel ? `${stats.nextLevel.min - stats.points} pts para ${stats.nextLevel.name}` : 'Nível máximo! 🎉'}</p>
          </div>
        </div>
        <Link to="/minha-jornada/perfil" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30" aria-label="Configurações do perfil"><Settings className="h-5 w-5" /></Link>
      </section>

      <MentorStrip />

      {/* Números */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Conteúdos concluídos', data.completed.length, 'text-leaf-600'],
          ['Itens salvos', data.bookmarks.length, 'text-grape-600'],
          ['Trilhas completas', stats.pathsDone.length, 'text-eletric-600'],
          ['Badges', stats.badges.filter((b) => b.earned).length, 'text-tang-600'],
        ].map(([l, v, c]) => (
          <div key={l as string} className="card p-4"><p className={cx('font-display text-3xl font-bold', c as string)}>{v}</p><p className="text-sm text-ink-soft">{l}</p></div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-12">
          <section>
            <SectionHeader title="Minhas trilhas" text="Continue de onde parou." />
            <Grid cols={2}>{paths.map((p) => <PathCard key={p.id} item={p} />)}</Grid>
          </section>

          <section>
            <SectionHeader title="Salvos" action={<div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-line">{(['conteudos', 'oportunidades'] as const).map((t) => <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className={cx('rounded-full px-3 py-1.5 text-sm font-semibold', tab === t ? 'bg-ink text-white' : 'text-ink-soft')}>{t === 'conteudos' ? `Conteúdos (${savedLearning.length})` : `Oportunidades (${savedOpps.length})`}</button>)}</div>} />
            {(tab === 'conteudos' ? savedLearning : savedOpps).length ? (
              <Grid cols={2}>{(tab === 'conteudos' ? savedLearning : savedOpps).map((i) => <ItemCard key={i!.id} item={i!} />)}</Grid>
            ) : (
              <EmptyState title="Nada salvo ainda" text={`Toque no ícone de marcador para salvar ${tab === 'conteudos' ? 'cursos e vídeos' : 'oportunidades'}.`} action={<Link to={tab === 'conteudos' ? '/explorar?biblioteca=1' : '/oportunidades'} className={btn('secondary', 'sm')}><Bookmark className="h-4 w-4" /> Explorar</Link>} />
            )}
          </section>

          <section>
            <SectionHeader title="Recomendados para você" text={profile.interests.length ? 'Com base nas suas áreas de interesse.' : 'Conteúdos para iniciantes.'} />
            <Grid>{recommended.map((i) => <ItemCard key={i.id} item={i} />)}</Grid>
          </section>

          <ProjectsBoard onSave={(pp) => save({ ...profile, plannedProjects: pp })} projects={profile.plannedProjects} />
        </div>

        <aside className="space-y-8">
          <section>
            <h2 className="mb-3 font-display text-xl font-bold">Conquistas</h2>
            <ul className="grid grid-cols-2 gap-2">
              {stats.badges.map((b) => (
                <li key={b.id} className={cx('rounded-2xl p-3 text-center ring-1 transition', b.earned ? 'bg-white ring-sun-400 shadow-card' : 'bg-paper ring-line opacity-60 grayscale')} title={b.description}>
                  <span className="text-3xl" aria-hidden>{b.emoji}</span>
                  <p className="mt-1 text-xs font-bold">{b.name}</p>
                  <p className="text-[11px] text-ink-muted">{b.earned ? 'Conquistado!' : b.description}</p>
                </li>
              ))}
            </ul>
          </section>

          <Goals goals={profile.goals} onSave={(g, msg) => save({ ...profile, goals: g }, msg)} />

          {challenge && (
            <Link to="/desafio" className="block rounded-3xl bg-gradient-to-br from-bubble-500 to-tang-500 p-5 text-white shadow-card">
              <p className="text-xs font-bold uppercase tracking-widest text-white/80">Desafio do mês</p>
              <p className="mt-1 font-display text-lg font-bold">{challenge.title}</p>
              <p className="mt-2 text-sm">{data.challengesDone.includes(challenge.id) ? '✅ Concluído!' : `Vale ${challenge.fields.points ?? 30} pontos →`}</p>
            </Link>
          )}

          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Award className="h-5 w-5 text-sun-500" /> Certificados</h2>
            <p className="mt-1 text-sm text-ink-soft">Quando a equipe emitir certificados de workshops e trilhas, eles aparecerão aqui para download.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Goals({ goals, onSave }: { goals: { id: string; text: string; done: boolean }[]; onSave: (g: typeof goals, msg?: string) => void }) {
  const [text, setText] = useState('');
  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave([...goals, { id: newId(), text: text.trim().slice(0, 120), done: false }], 'Objetivo adicionado!');
    setText('');
  };
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-bold">Meus objetivos</h2>
      <form onSubmit={add} className="mb-3 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: Participar de uma olimpíada" className="input" aria-label="Novo objetivo" maxLength={120} />
        <button className={btn('dark', 'sm')} aria-label="Adicionar objetivo"><Plus className="h-4 w-4" /></button>
      </form>
      {goals.length ? (
        <ul className="space-y-2">
          {goals.map((g) => (
            <li key={g.id} className="flex items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-line">
              <button onClick={() => onSave(goals.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)), g.done ? undefined : 'Objetivo concluído! +5 pontos')} aria-pressed={g.done} aria-label={g.done ? 'Marcar como pendente' : 'Marcar como concluído'}>
                {g.done ? <CheckCircle2 className="h-5 w-5 text-leaf-500" /> : <Circle className="h-5 w-5 text-ink-muted" />}
              </button>
              <span className={cx('flex-1 text-sm', g.done && 'text-ink-muted line-through')}>{g.text}</span>
              <button onClick={() => onSave(goals.filter((x) => x.id !== g.id))} className="text-ink-muted hover:text-bubble-600" aria-label="Remover objetivo"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Escreva algo que você quer conquistar. Pode ser pequeno!</p>
      )}
    </section>
  );
}

const STAGES: { v: PlannedProject['stage']; l: string }[] = [
  { v: 'ideia', l: '💡 Ideia' },
  { v: 'fazendo', l: '🔧 Fazendo' },
  { v: 'concluido', l: '🚀 Concluído' },
];

function ProjectsBoard({ projects, onSave }: { projects: PlannedProject[]; onSave: (p: PlannedProject[]) => void }) {
  const [title, setTitle] = useState('');
  const [area, setArea] = useState<AreaId>(AREAS[0].id);
  return (
    <section>
      <SectionHeader title="Projetos que quero desenvolver" text="Organize suas ideias e acompanhe o andamento." />
      <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) { onSave([...projects, { id: newId(), title: title.trim().slice(0, 80), area, stage: 'ideia' }]); setTitle(''); } }} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do projeto" className="input" aria-label="Nome do projeto" />
        <select value={area} onChange={(e) => setArea(e.target.value as AreaId)} className="input sm:w-48" aria-label="Área do projeto">{AREA_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select>
        <button className={btn('dark')}><Plus className="h-4 w-4" /> Adicionar</button>
      </form>
      <div className="grid gap-3 md:grid-cols-3">
        {STAGES.map((s) => (
          <div key={s.v} className="rounded-3xl bg-paper p-3 ring-1 ring-line">
            <p className="mb-2 px-1 text-sm font-bold">{s.l} <span className="text-ink-muted">({projects.filter((p) => p.stage === s.v).length})</span></p>
            <ul className="space-y-2">
              {projects.filter((p) => p.stage === s.v).map((p) => (
                <li key={p.id} className="rounded-2xl bg-white p-3 text-sm shadow-card ring-1 ring-line">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-ink-muted">{areaById(p.area).short}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <label className="sr-only" htmlFor={`st-${p.id}`}>Etapa</label>
                    <select id={`st-${p.id}`} value={p.stage} onChange={(e) => onSave(projects.map((x) => (x.id === p.id ? { ...x, stage: e.target.value as PlannedProject['stage'] } : x)))} className="h-8 flex-1 rounded-lg border-0 bg-paper py-0 text-xs ring-1 ring-line">
                      {STAGES.map((st) => <option key={st.v} value={st.v}>{st.l}</option>)}
                    </select>
                    <button onClick={() => onSave(projects.filter((x) => x.id !== p.id))} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:text-bubble-600" aria-label={`Remover ${p.title}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {projects.some((p) => p.stage === 'concluido') && (
        <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft"><Trophy className="h-4 w-4 text-sun-500" /> Terminou um projeto? Compartilhe no <Link to="/comunidade" className="font-semibold text-grape-700">mural da comunidade</Link>!</p>
      )}
    </section>
  );
}

