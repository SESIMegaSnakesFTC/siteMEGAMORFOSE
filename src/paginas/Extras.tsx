import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Globe2, MapPin, RotateCcw, Search, Sparkles, Trophy, Wifi } from 'lucide-react';
import { AreaArt } from '../componentes/art';
import { PathCard } from '../componentes/cards';
import {
  btn, Chip, cx, DemoTag, EmptyState, FilterPills, formatDate, Grid, ItemCard, ItemList, Notice, PageHero, ProgressBar,
  SectionHeader, useSeo,
} from '../componentes/ui';
import { AREAS, areaById } from '../scripts/areas';
import { fieldList, fieldStr, typeDef } from '../scripts/contentTypes';
import { norm } from '../scripts/search';
import { useStore } from '../scripts/store';
import type { AreaId, ContentItem } from '../scripts/types';

// ─────────────────────────── Calendário ───────────────────────────

interface CalEntry { date: string; item: ContentItem; label: string }

export function CalendarPage() {
  useSeo('Calendário STEM', 'Olimpíadas, inscrições, workshops, feiras e prazos importantes.');
  const { items } = useStore();
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(null);
  const [cat, setCat] = useState('todos');

  const entries = useMemo<CalEntry[]>(() => {
    const list: CalEntry[] = [];
    for (const i of items) {
      if (i.type === 'event' && fieldStr(i, 'date')) list.push({ date: fieldStr(i, 'date'), item: i, label: i.category ?? 'Evento' });
      else if (fieldStr(i, 'deadline') && !fieldStr(i, 'oppStatus').includes('encerradas')) list.push({ date: fieldStr(i, 'deadline'), item: i, label: `Prazo · ${typeDef(i.type).label}` });
    }
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [items]);

  const cats = ['todos', 'Workshop', 'Prazo', 'Competição', 'Feira científica', 'Evento'];
  const matchCat = (e: CalEntry) => cat === 'todos' || (cat === 'Prazo' ? e.label.startsWith('Prazo') : e.label === cat || (cat === 'Competição' && e.item.type === 'competition'));
  const filtered = entries.filter(matchCat);

  const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const first = new Date(month);
  const startPad = first.getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthKey = key(month).slice(0, 7);
  const monthEntries = filtered.filter((e) => e.date.startsWith(monthKey));
  const shown = selected ? filtered.filter((e) => e.date === selected) : monthEntries;
  const upcoming = filtered.filter((e) => e.date >= key(today)).slice(0, 5);

  return (
    <>
      <PageHero eyebrow="Calendário STEM" title="Não perca nenhum prazo" text="Olimpíadas, inscrições de programas, workshops, feiras científicas e competições em um só calendário." gradient="from-grape-500 to-tang-500" />
      <div className="container-x py-10">
        <div className="mb-6"><FilterPills label="Tipo" value={cat} onChange={(v) => { setCat(v); setSelected(null); }} options={cats.map((c) => ({ value: c, label: c === 'todos' ? 'Tudo' : c === 'Prazo' ? 'Prazos de inscrição' : c }))} /></div>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <section className="card p-4 sm:p-6" aria-label="Calendário mensal">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => { setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); setSelected(null); }} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-line hover:bg-paper" aria-label="Mês anterior"><ChevronLeft className="h-5 w-5" /></button>
              <h2 className="font-display text-xl font-bold capitalize" aria-live="polite">{month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
              <button onClick={() => { setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); setSelected(null); }} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-line hover:bg-paper" aria-label="Próximo mês"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-ink-muted">{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={i} className="py-1">{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startPad }).map((_, i) => <div key={`p${i}`} />)}
              {Array.from({ length: days }).map((_, i) => {
                const d = key(new Date(month.getFullYear(), month.getMonth(), i + 1));
                const evs = filtered.filter((e) => e.date === d);
                const isToday = d === key(today);
                return (
                  <button
                    key={d}
                    onClick={() => setSelected(selected === d ? null : d)}
                    aria-pressed={selected === d}
                    aria-label={`${i + 1}${evs.length ? `, ${evs.length} evento(s)` : ''}`}
                    className={cx('flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-semibold transition', selected === d ? 'bg-ink text-white' : evs.length ? 'bg-grape-50 text-grape-700 hover:bg-grape-100' : 'hover:bg-paper', isToday && selected !== d && 'ring-2 ring-eletric-500')}
                  >
                    {i + 1}
                    {evs.length > 0 && <span className="mt-0.5 flex gap-0.5">{evs.slice(0, 3).map((e, j) => <span key={j} className={cx('h-1.5 w-1.5 rounded-full', e.label.startsWith('Prazo') ? 'bg-tang-500' : areaById(e.item.area).solid)} />)}</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 flex flex-wrap gap-3 text-xs text-ink-muted"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-tang-500" /> Prazos</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-grape-500" /> Eventos</span><span className="flex items-center gap-1"><span className="h-3 w-3 rounded ring-2 ring-eletric-500" /> Hoje</span></p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-xl font-bold">{selected ? formatDate(selected, { day: '2-digit', month: 'long' }) : 'Neste mês'}</h2>
            {shown.length ? (
              <ul className="space-y-2">{shown.map((e) => <EntryRow key={e.item.id + e.date} e={e} />)}</ul>
            ) : (
              <p className="rounded-2xl bg-white p-4 text-sm text-ink-muted ring-1 ring-line">Nada marcado {selected ? 'neste dia' : 'neste mês'}.</p>
            )}
            <h2 className="mb-3 mt-8 font-display text-xl font-bold">Próximos</h2>
            <ul className="space-y-2">{upcoming.map((e) => <EntryRow key={e.item.id + e.date + 'u'} e={e} />)}</ul>
          </section>
        </div>
      </div>
    </>
  );
}

function EntryRow({ e }: { e: CalEntry }) {
  const d = new Date(`${e.date}T12:00:00`);
  return (
    <li>
      <Link to={`/conteudo/${e.item.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line transition hover:shadow-card">
        <span className={cx('flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-white', e.label.startsWith('Prazo') ? 'bg-tang-500' : areaById(e.item.area).solid)}>
          <span className="font-display text-lg font-bold leading-none">{d.getDate()}</span>
          <span className="text-[10px] font-bold uppercase">{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{e.item.title}</span>
          <span className="text-xs text-ink-muted">{e.label}{e.item.demo ? ' · demonstrativo' : ''}</span>
        </span>
      </Link>
    </li>
  );
}

// ─────────────────────────── Mapa ───────────────────────────

const SCOPES = [
  { v: 'Local', label: 'Local', desc: 'Boituva e região', color: 'bg-leaf-500', ring: 'border-leaf-500', r: 22 },
  { v: 'Estadual', label: 'Estadual', desc: 'Estado de São Paulo', color: 'bg-eletric-500', ring: 'border-eletric-500', r: 46 },
  { v: 'Nacional', label: 'Nacional', desc: 'Todo o Brasil', color: 'bg-grape-500', ring: 'border-grape-500', r: 72 },
  { v: 'Internacional', label: 'Internacional', desc: 'Outros países', color: 'bg-tang-500', ring: 'border-tang-500', r: 98 },
];

export function MapPage() {
  useSeo('Mapa de oportunidades', 'Explore oportunidades locais, estaduais, nacionais e internacionais.');
  const { items } = useStore();
  const [scope, setScope] = useState('Local');
  const [online, setOnline] = useState<'todas' | 'presencial' | 'online'>('todas');
  const withScope = items.filter((i) => fieldStr(i, 'scope'));
  const count = (s: string) => withScope.filter((i) => fieldStr(i, 'scope') === s).length;
  const list = withScope.filter((i) => fieldStr(i, 'scope') === scope && (online === 'todas' || (online === 'online' ? ['Online', 'Remoto'].includes(fieldStr(i, 'modality')) : !['Online', 'Remoto'].includes(fieldStr(i, 'modality')))));
  const current = SCOPES.find((s) => s.v === scope)!;

  return (
    <>
      <PageHero eyebrow="Mapa de oportunidades" title="Do seu bairro para o mundo" text="Comece pelo que está perto e descubra até onde você pode chegar. Toque em um círculo para ver as oportunidades de cada alcance." gradient="from-leaf-500 to-tang-500" />
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1fr_1.4fr]">
        <section aria-label="Alcance das oportunidades">
          <div className="relative mx-auto aspect-square w-full max-w-md">
            {[...SCOPES].reverse().map((s) => (
              <button
                key={s.v}
                onClick={() => setScope(s.v)}
                aria-pressed={scope === s.v}
                aria-label={`${s.label}: ${count(s.v)} oportunidades`}
                className={cx('absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed transition', s.ring, scope === s.v ? 'bg-white shadow-lift' : 'bg-white/60 hover:bg-white')}
                style={{ width: `${s.r}%`, height: `${s.r}%` }}
              >
                <span className={cx('absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold text-white sm:text-xs', s.color)}>{s.label} · {count(s.v)}</span>
              </button>
            ))}
            <span className="pointer-events-none absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-white shadow-lift"><MapPin className="h-5 w-5" /></span>
          </div>
          <p className="mt-4 text-center text-sm text-ink-muted">Você está aqui: Boituva/SP</p>
          <Notice>Um mapa geográfico interativo pode ser adicionado futuramente usando as cidades cadastradas em cada oportunidade.</Notice>
        </section>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">{current.label}</h2>
              <p className="text-sm text-ink-muted">{current.desc}</p>
            </div>
            <FilterPills label="Modalidade" value={online} onChange={setOnline} options={[{ value: 'todas', label: 'Todas' }, { value: 'presencial', label: 'Presencial/híbrido' }, { value: 'online', label: 'Online' }]} />
          </div>
          {list.length ? (
            <ul className="space-y-3">
              {list.map((i) => (
                <li key={i.id}>
                  <Link to={`/conteudo/${i.id}`} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-line transition hover:shadow-card">
                    <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white', current.color)}>{['Online', 'Remoto'].includes(fieldStr(i, 'modality')) ? <Wifi className="h-5 w-5" /> : i.type === 'event' ? <CalendarDays className="h-5 w-5" /> : <Globe2 className="h-5 w-5" />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{i.title}</span>
                      <span className="text-sm text-ink-muted">{[typeDef(i.type).label, fieldStr(i, 'location') || fieldStr(i, 'country'), fieldStr(i, 'modality')].filter(Boolean).join(' · ')}</span>
                    </span>
                    {i.demo && <DemoTag className="self-start" />}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Nenhuma oportunidade com esse filtro" text="Tente outro alcance ou modalidade." />
          )}
        </section>
      </div>
    </>
  );
}

// ─────────────────────────── Glossário ───────────────────────────

export function Glossary() {
  useSeo('Glossário STEM', 'Termos técnicos de ciência, tecnologia, engenharia e matemática explicados de um jeito simples.');
  const { items } = useStore();
  const [q, setQ] = useState('');
  const [letter, setLetter] = useState('');
  const terms = items.filter((i) => i.type === 'glossary').sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  const letters = [...new Set(terms.map((t) => norm(t.title)[0].toUpperCase()))];
  const shown = terms.filter((t) => (!letter || norm(t.title)[0].toUpperCase() === letter) && (!q || norm(`${t.title} ${t.summary}`).includes(norm(q))));
  return (
    <>
      <PageHero eyebrow="Glossário STEM" title="Palavras difíceis, explicadas fácil" text="Encontrou um termo que não conhece? Ele provavelmente está aqui, com um exemplo do dia a dia." gradient="from-sun-400 to-tang-500" />
      <div className="container-x py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="relative sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar termo…" className="input pl-9" aria-label="Buscar termo" />
          </span>
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setLetter('')} className={cx('h-9 rounded-lg px-3 text-sm font-bold', !letter ? 'bg-ink text-white' : 'bg-white ring-1 ring-line')}>Todas</button>
            {letters.map((l) => <button key={l} onClick={() => setLetter(l)} aria-pressed={letter === l} className={cx('h-9 w-9 rounded-lg text-sm font-bold', letter === l ? 'bg-ink text-white' : 'bg-white ring-1 ring-line hover:ring-ink/20')}>{l}</button>)}
          </div>
        </div>
        {shown.length ? (
          <dl className="grid gap-3 md:grid-cols-2">
            {shown.map((t) => {
              const area = areaById(t.area);
              return (
                <div key={t.id} className="card p-5">
                  <dt className="flex items-center justify-between gap-2"><span className="font-display text-lg font-bold">{t.title}</span>{t.area !== 'geral' && <Chip className={cx(area.soft, area.text)}>{area.short}</Chip>}</dt>
                  <dd className="mt-1 text-ink-soft">{t.summary}</dd>
                  {fieldStr(t, 'example') && <dd className="mt-3 rounded-xl bg-paper p-3 text-sm"><strong>Exemplo:</strong> {fieldStr(t, 'example')}</dd>}
                </div>
              );
            })}
          </dl>
        ) : <EmptyState title="Termo não encontrado" text="Sugira novos termos para a equipe MegaMorfose." />}
      </div>
    </>
  );
}

// ─────────────────────────── Recursos ───────────────────────────

export function Resources() {
  useSeo('Central de recursos', 'Modelos de currículo, portfólio, guias de estudo, templates para clubes e planilhas.');
  const { items } = useStore();
  const [cat, setCat] = useState('todos');
  const res = items.filter((i) => i.type === 'resource');
  const cats = [...new Set(res.map((r) => r.category).filter(Boolean))] as string[];
  return (
    <>
      <PageHero eyebrow="Central de recursos" title="Modelos prontos para você usar" text="Currículo, portfólio, guias de estudo, templates para clubes, planilhas e materiais para projetos." gradient="from-leaf-500 to-grape-500" />
      <div className="container-x py-10">
        <div className="mb-6"><FilterPills label="Categoria" value={cat} onChange={setCat} options={[{ value: 'todos', label: 'Todos' }, ...cats.map((c) => ({ value: c, label: c }))]} /></div>
        <ItemList items={res.filter((r) => cat === 'todos' || r.category === cat)} cols={4} />
      </div>
    </>
  );
}

// ─────────────────────────── Vitrine ───────────────────────────

export function Showcase() {
  useSeo('Vitrine de projetos', 'Projetos de robótica, programação, eletrônica, IA, mecânica e ciências feitos por estudantes.');
  const { items } = useStore();
  const [cat, setCat] = useState('todos');
  const list = items.filter((i) => i.type === 'showcase' && (cat === 'todos' || i.category === cat));
  return (
    <>
      <PageHero eyebrow="Vitrine de projetos" title="Feito por estudantes" text="Inspire-se no que outros jovens estão construindo e mostre o seu projeto também." gradient="from-tang-500 to-bubble-500">
        <Link to="/comunidade" className={btn('primary')}>Compartilhar meu projeto</Link>
      </PageHero>
      <div className="container-x py-10">
        <div className="mb-6"><FilterPills label="Categoria" value={cat} onChange={setCat} options={[{ value: 'todos', label: 'Todos' }, ...(typeDef('showcase').categories ?? []).map((c) => ({ value: c, label: c }))]} /></div>
        <ItemList items={list} />
        <p className="mt-6 text-sm text-ink-muted">Projetos enviados pela comunidade são revisados pela equipe antes de entrar na vitrine.</p>
      </div>
    </>
  );
}

// ─────────────────────────── Desafio do mês ───────────────────────────

export function Challenge() {
  useSeo('Desafio do mês', 'Um desafio prático de STEM por mês para experimentar, construir e compartilhar.');
  const { items, data, toggle, toast } = useStore();
  const challenges = items.filter((i) => i.type === 'challenge').sort((a, b) => fieldStr(b, 'month').localeCompare(fieldStr(a, 'month')));
  const current = challenges.find((c) => c.featured) ?? challenges[0];
  const [accepted, setAccepted] = useState(false);
  if (!current) return <div className="container-x py-20"><EmptyState title="O próximo desafio está chegando" text="Volte em breve!" /></div>;
  const done = data.challengesDone.includes(current.id);
  const steps = fieldList(current, 'steps');
  const area = areaById(current.area);
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-bubble-500 to-tang-500 text-white">
        <AreaArt area={current.area} className="absolute -bottom-6 -right-6 w-64 opacity-60 sm:w-80" />
        <div className="container-x relative py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-white/80">Desafio do mês</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-5xl">{current.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/90">{current.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip className="bg-white/20 text-white" icon={Trophy}>{String(current.fields.points ?? 30)} pontos</Chip>
            {current.duration && <Chip className="bg-white/20 text-white">{current.duration}</Chip>}
            <Chip className="bg-white/20 text-white">{area.name}</Chip>
          </div>
        </div>
      </section>
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {current.body && <p className="mb-6 text-lg text-ink-soft">{current.body}</p>}
          <h2 className="mb-3 font-display text-xl font-bold">Sua missão</h2>
          <ol className="space-y-2">{steps.map((s, i) => <li key={i} className="flex gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-line"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-bubble-500 text-sm font-bold text-white">{i + 1}</span><span className="pt-0.5">{s}</span></li>)}</ol>
        </div>
        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">Materiais</h2>
            <ul className="mt-2 space-y-1 text-ink-soft">{fieldList(current, 'materials').map((m) => <li key={m}>• {m}</li>)}</ul>
          </div>
          <div className="card space-y-3 p-5">
            {done ? (
              <>
                <p className="font-display text-lg font-bold text-leaf-700">🎉 Desafio concluído!</p>
                <Link to="/comunidade" className={cx(btn('primary'), 'w-full')}>Compartilhar no mural</Link>
                <button onClick={() => toggle('challengesDone', current.id, false)} className={cx(btn('ghost', 'sm'), 'w-full')}>Desfazer</button>
              </>
            ) : accepted ? (
              <>
                <p className="text-sm text-ink-soft">Boa! Quando terminar, marque aqui para ganhar seus pontos.</p>
                <button onClick={async () => { if (await toggle('challengesDone', current.id, true)) toast(`Desafio concluído! +${current.fields.points ?? 30} pontos 🏆`); }} className={cx(btn('dark', 'lg'), 'w-full')}>Concluí o desafio</button>
              </>
            ) : (
              <button onClick={() => setAccepted(true)} className={cx(btn('primary', 'lg'), 'w-full')}>Aceitar desafio</button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

// ─────────────────────────── Por onde começar? ───────────────────────────

type Score = Partial<Record<AreaId | 'learn' | 'opp' | 'uni' | 'job' | 'comm', number>>;
const QUESTIONS: { q: string; options: { label: string; emoji: string; score: Score }[] }[] = [
  { q: 'O que você mais gosta de fazer no tempo livre?', options: [
    { label: 'Jogar, usar apps e mexer no celular', emoji: '📱', score: { ia: 2 } },
    { label: 'Desmontar coisas para ver como funcionam', emoji: '🔩', score: { mecanica: 2, eletronica: 1 } },
    { label: 'Criar, desenhar e inventar', emoji: '🎨', score: { ia: 1, mecanica: 1 } },
    { label: 'Consertar aparelhos e fios', emoji: '🔌', score: { eletronica: 2 } },
  ] },
  { q: 'Qual destas perguntas te deixa mais curioso(a)?', options: [
    { label: 'Como o celular reconhece meu rosto?', emoji: '🤳', score: { ia: 2 } },
    { label: 'Como a eletricidade chega até a lâmpada?', emoji: '💡', score: { eletronica: 2 } },
    { label: 'Como um guindaste levanta tanto peso?', emoji: '🏗️', score: { mecanica: 2 } },
    { label: 'Como um robô decide para onde ir?', emoji: '🤖', score: { ia: 1, eletronica: 1, mecanica: 1 } },
  ] },
  { q: 'Em um projeto em grupo, você prefere…', options: [
    { label: 'Programar e pensar na lógica', emoji: '🧠', score: { ia: 2 } },
    { label: 'Montar e ligar as peças', emoji: '🛠️', score: { eletronica: 1, mecanica: 1 } },
    { label: 'Projetar e desenhar a estrutura', emoji: '📐', score: { mecanica: 2 } },
    { label: 'Organizar e apresentar o resultado', emoji: '🎤', score: { comm: 2 } },
  ] },
  { q: 'Qual é o seu principal objetivo agora?', options: [
    { label: 'Aprender algo novo do zero', emoji: '🌱', score: { learn: 3 } },
    { label: 'Participar de projetos ou olimpíadas', emoji: '🏆', score: { opp: 3 } },
    { label: 'Me preparar para a faculdade', emoji: '🎓', score: { uni: 3 } },
    { label: 'Conseguir meu primeiro trabalho', emoji: '💼', score: { job: 3 } },
  ] },
  { q: 'Quanto tempo você tem por semana?', options: [
    { label: 'Menos de 1 hora', emoji: '⏱️', score: { learn: 1 } },
    { label: '1 a 3 horas', emoji: '🕐', score: { learn: 1, opp: 1 } },
    { label: 'Mais de 3 horas', emoji: '🚀', score: { opp: 2 } },
    { label: 'Ainda não sei', emoji: '🤔', score: { learn: 1 } },
  ] },
];

const GOALS = {
  learn: { title: 'Aprender do zero', to: '/explorar', text: 'Comece por uma trilha para iniciantes e vá no seu ritmo.' },
  opp: { title: 'Projetos e olimpíadas', to: '/oportunidades/projetos', text: 'Encontre projetos que aceitam iniciantes e olimpíadas para começar.' },
  uni: { title: 'Faculdade', to: '/futuro-academico', text: 'Entenda ENEM, SISU, bolsas e até como estudar fora.' },
  job: { title: 'Primeiro trabalho', to: '/oportunidades/empregos', text: 'Veja vagas de Jovem Aprendiz e aprenda a montar seu currículo.' },
  comm: { title: 'Comunidade e liderança', to: '/oportunidades/escola', text: 'Que tal fundar um clube na sua escola? Veja os guias.' },
};

export function Quiz() {
  useSeo('Por onde começar?', 'Responda 5 perguntas e receba sugestões de áreas, conteúdos e oportunidades.');
  const { items, user, saveProfile, toast } = useStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const finished = answers.length === QUESTIONS.length;
  const total: Score = {};
  answers.forEach((a, qi) => Object.entries(QUESTIONS[qi].options[a].score).forEach(([k, v]) => { total[k as keyof Score] = (total[k as keyof Score] ?? 0) + (v ?? 0); }));
  const areaRank = AREAS.map((a) => ({ a, s: total[a.id] ?? 0 })).sort((x, y) => y.s - x.s);
  const top = areaRank[0].a;
  const goalKey = (['learn', 'opp', 'uni', 'job', 'comm'] as const).reduce((best, k) => ((total[k] ?? 0) > (total[best] ?? 0) ? k : best), 'learn' as const);
  const goal = GOALS[goalKey];
  const path = items.find((i) => i.type === 'path' && i.area === top.id);
  const starter = items.filter((i) => i.area === top.id && i.level === 'iniciante' && ['video', 'tutorial', 'practice'].includes(i.type)).slice(0, 3);

  const pick = (i: number) => {
    const next = [...answers.slice(0, step), i];
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setTimeout(() => setStep(step + 1), 180);
  };
  const reset = () => { setAnswers([]); setStep(0); };

  if (finished)
    return (
      <div className="container-x py-10">
        <section className={cx('relative overflow-hidden rounded-4xl bg-gradient-to-br p-6 text-white shadow-lift sm:p-10', top.gradient)}>
          <AreaArt area={top.id} className="absolute -bottom-6 -right-6 w-56 opacity-80 sm:w-72" />
          <p className="relative text-xs font-bold uppercase tracking-widest text-white/80">Seu resultado</p>
          <h1 className="relative mt-2 max-w-xl font-display text-3xl font-bold sm:text-5xl">Comece por {top.name}!</h1>
          <p className="relative mt-3 max-w-xl text-lg text-white/90">{top.tagline} Pelas suas respostas, essa área combina com sua curiosidade. Mas lembre: você pode explorar todas.</p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <Link to={`/explorar/${top.slug}`} className={cx(btn('secondary', 'lg'), 'text-ink')}>Explorar {top.short} <ArrowRight className="h-5 w-5" /></Link>
            {user && !user.interests.includes(top.id) && (
              <button onClick={async () => { await saveProfile({ ...user, interests: [...user.interests, top.id] }); toast('Área adicionada aos seus interesses!'); }} className={cx(btn('ghost', 'lg'), 'text-white ring-1 ring-white/40 hover:bg-white/10 hover:text-white')}>Salvar no meu perfil</button>
            )}
          </div>
        </section>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {areaRank.map(({ a, s }) => (
            <div key={a.id} className="card p-4">
              <div className="mb-2 flex justify-between text-sm font-semibold"><span>{a.short}</span><span>{Math.round((s / Math.max(1, areaRank[0].s)) * 100)}%</span></div>
              <ProgressBar pct={Math.round((s / Math.max(1, areaRank[0].s)) * 100)} color={a.gradient} label={`Afinidade com ${a.name}`} />
            </div>
          ))}
        </div>
        <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <SectionHeader title="Seu primeiro passo" />
            {path && <PathCard item={path} />}
            <Link to={goal.to} className="mt-4 block rounded-3xl bg-sun-50 p-5 ring-1 ring-sun-100 hover:bg-sun-100">
              <p className="text-xs font-bold uppercase tracking-widest text-sun-700">Seu objetivo: {goal.title}</p>
              <p className="mt-1 text-ink">{goal.text}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-ink">Ver agora <ArrowRight className="h-4 w-4" /></span>
            </Link>
          </div>
          <div>
            <SectionHeader title="Conteúdos para começar" />
            <Grid>{starter.map((s) => <ItemCard key={s.id} item={s} />)}</Grid>
          </div>
        </section>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className={btn('secondary')}><RotateCcw className="h-4 w-4" /> Refazer o teste</button>
          {!user && <Link to="/cadastrar" className={btn('primary')}>Criar conta e salvar resultado</Link>}
        </div>
      </div>
    );

  const Q = QUESTIONS[step];
  return (
    <div className="container-x max-w-2xl py-10 sm:py-16">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-grape-600"><Sparkles className="h-4 w-4" /> Por onde começar?</p>
      <div className="mt-4"><ProgressBar pct={Math.round((step / QUESTIONS.length) * 100)} label="Progresso do teste" /></div>
      <p className="mt-2 text-sm text-ink-muted">Pergunta {step + 1} de {QUESTIONS.length}</p>
      <h1 key={step} className="mt-6 animate-fadeup font-display text-2xl font-bold sm:text-3xl">{Q.q}</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={Q.q}>
        {Q.options.map((o, i) => (
          <button key={o.label} role="radio" aria-checked={answers[step] === i} onClick={() => pick(i)} className={cx('flex items-center gap-3 rounded-3xl bg-white p-4 text-left font-semibold ring-1 transition hover:-translate-y-0.5 hover:shadow-card', answers[step] === i ? 'ring-2 ring-grape-500' : 'ring-line')}>
            <span className="text-3xl" aria-hidden>{o.emoji}</span>{o.label}
          </button>
        ))}
      </div>
      {step > 0 && <button onClick={() => setStep(step - 1)} className={cx(btn('ghost', 'sm'), 'mt-6')}><ArrowLeft className="h-4 w-4" /> Voltar</button>}
    </div>
  );
}
