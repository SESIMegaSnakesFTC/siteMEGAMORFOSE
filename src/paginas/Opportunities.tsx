import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Briefcase, CalendarDays, GraduationCap, HeartHandshake, Map, Rocket, School, Search, SlidersHorizontal, Sparkles, Trophy, X, type LucideIcon } from 'lucide-react';
import { TestimonialRow, useTestimonials } from '../componentes/testimonials';
import { btn, cx, Grid, ItemCard, ItemList, Notice, Select, useSeo } from '../componentes/ui';
import { AREA_OPTIONS } from '../scripts/areas';
import { fieldStr } from '../scripts/contentTypes';
import { norm } from '../scripts/search';
import { useStore } from '../scripts/store';
import type { ContentItem, ContentType } from '../scripts/types';

// Oportunidades em formato guiado: primeiro a pessoa diz o que quer, depois entende
// como funciona (3 passos), assiste a quem já participou e só então vê a lista.

interface Path {
  id: string;
  want: string; // a pergunta, na voz do estudante
  title: string;
  icon: LucideIcon;
  color: string;
  type: ContentType;
  intro: string;
  how: [string, string][];
  filters: { key: string; label: string }[];
  toggle?: { key: string; label: string };
  guides: string[];
  guidesTitle: string;
}

const PATHS: Path[] = [
  {
    id: 'projetos', want: 'Quero participar de um projeto', title: 'Projetos e voluntariado', icon: HeartHandshake, color: 'from-leaf-500 to-eletric-500', type: 'opportunity',
    intro: 'Projetos científicos, sociais e de tecnologia onde você aprende fazendo junto com outras pessoas. Não precisa ter experiência.',
    how: [['Escolha um tema', 'Algo que te dá curiosidade. Comece pelos que aceitam iniciantes.'], ['Leia os requisitos', 'Idade, horário e se é online ou presencial.'], ['Inscreva-se no site oficial', 'Apresente-se e diga quanto tempo você tem.']],
    filters: [{ key: 'category', label: 'Tipo de projeto' }, { key: 'modality', label: 'Modalidade' }],
    toggle: { key: 'beginnerFriendly', label: 'Só os que aceitam iniciantes' },
    guides: ['g-part-1'], guidesTitle: 'Antes de começar',
  },
  {
    id: 'programas', want: 'Quero aprender em um programa', title: 'Programas educacionais', icon: Rocket, color: 'from-eletric-500 to-grape-500', type: 'program',
    intro: 'Formações gratuitas, bootcamps, mentorias e iniciação científica. Uma forma organizada de aprender com acompanhamento.',
    how: [['Veja a duração', 'Programas vão de algumas semanas a um ano.'], ['Confira o público', 'Muitos são só para estudantes de escola pública ou de certa idade.'], ['Fique de olho no prazo', 'As inscrições abrem poucas vezes por ano.']],
    filters: [{ key: 'category', label: 'Tipo de programa' }, { key: 'modality', label: 'Modalidade' }],
    guides: [], guidesTitle: '',
  },
  {
    id: 'olimpiadas', want: 'Quero competir e testar meus conhecimentos', title: 'Olimpíadas e competições', icon: Trophy, color: 'from-sun-400 to-tang-500', type: 'competition',
    intro: 'Provas e desafios de matemática, física, informática, robótica e mais. Participar já é uma vitória: você aprende a resolver problemas.',
    how: [['Escolha uma área', 'Comece pela matéria de que você mais gosta.'], ['Fale com a escola', 'Muitas vezes a inscrição é feita pela escola.'], ['Treine com provas antigas', 'Um pouco por dia, de preferência em grupo.']],
    filters: [{ key: 'category', label: 'Matéria' }, { key: 'modality', label: 'Modalidade' }],
    guides: ['g-olimp-1', 'r-8'], guidesTitle: 'Como começar a estudar',
  },
  {
    id: 'empregos', want: 'Quero meu primeiro trabalho', title: 'Jovem Aprendiz e empregos', icon: Briefcase, color: 'from-tang-500 to-bubble-500', type: 'job',
    intro: 'Jovem Aprendiz, estágios e primeiras vagas em tecnologia, engenharia e automação. Sem experiência? É exatamente para isso que elas existem.',
    how: [['Monte seu currículo', 'Projetos, cursos e atividades contam muito.'], ['Escolha vagas perto de você', 'Use o filtro de localização e modalidade.'], ['Prepare-se para a entrevista', 'Treine contar o que você já fez.']],
    filters: [{ key: 'category', label: 'Tipo de vaga' }, { key: 'field', label: 'Área' }, { key: 'modality', label: 'Modalidade' }, { key: 'location', label: 'Cidade' }],
    guides: ['g-car-1', 'g-car-2', 'g-car-3', 'g-car-4', 'g-car-5'], guidesTitle: 'Prepare-se antes de se candidatar',
  },
  {
    id: 'escola', want: 'Quero criar algo na minha escola', title: 'Oportunidades na escola', icon: School, color: 'from-bubble-500 to-grape-500', type: 'school_guide',
    intro: 'Se a oportunidade ainda não existe onde você estuda, você pode ser quem começa: um clube, um grupo de estudos ou uma feira de ciências.',
    how: [['Junte 3 a 5 colegas', 'Pessoas com a mesma vontade.'], ['Convide um professor', 'Ele ajuda a conversar com a direção.'], ['Comece pequeno', 'Um encontro por semana já é um clube.']],
    filters: [], guides: ['r-4', 'r-5', 'r-6'], guidesTitle: 'Modelos prontos para usar',
  },
];

export default function Opportunities() {
  const { tab = '' } = useParams();
  const path = PATHS.find((p) => p.id === tab);
  useSeo(path ? path.title : 'Oportunidades', 'Projetos, programas, olimpíadas, Jovem Aprendiz e oportunidades na sua escola, explicados passo a passo.');
  return path ? <PathView path={path} /> : <Chooser />;
}

function Chooser() {
  const { items } = useStore();
  const openCount = (t: ContentType) => items.filter((i) => i.type === t && !fieldStr(i, 'oppStatus').includes('encerradas')).length;
  return (
    <div className="container-x max-w-5xl py-10 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-leaf-600">Oportunidades</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">O que você quer fazer agora?</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-soft">Escolha uma opção. Em cada uma, a gente explica como funciona, mostra quem já participou e só depois as oportunidades.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {PATHS.map((p) => (
          <li key={p.id}>
            <Link to={`/oportunidades/${p.id}`} className="group flex h-full items-center gap-4 rounded-3xl bg-white p-4 shadow-card ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
              <span className={cx('grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white', p.color)}><p.icon className="h-6 w-6" /></span>
              <span className="min-w-0 flex-1">
                <strong className="block font-display text-lg leading-snug text-ink">{p.want}</strong>
                <span className="text-sm text-ink-muted">{p.title}{p.type !== 'school_guide' ? ` · ${openCount(p.type)} abertas` : ''}</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-ink-muted transition group-hover:translate-x-1 group-hover:text-ink" />
            </Link>
          </li>
        ))}
        <li>
          <Link to="/futuro-academico" className="group flex h-full items-center gap-4 rounded-3xl bg-ink p-4 text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15"><GraduationCap className="h-6 w-6 text-sun-400" /></span>
            <span className="min-w-0 flex-1"><strong className="block font-display text-lg leading-snug">Quero ir para a faculdade ou estudar fora</strong><span className="text-sm text-white/70">Universidades, bolsas e intercâmbio</span></span>
            <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
          </Link>
        </li>
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
        <Link to="/por-onde-comecar" className="inline-flex items-center gap-2 font-semibold text-grape-700"><Sparkles className="h-4 w-4" /> Não sei o que quero: fazer o teste</Link>
        <Link to="/calendario" className="inline-flex items-center gap-2 font-semibold text-ink-soft hover:text-ink"><CalendarDays className="h-4 w-4" /> Calendário de prazos</Link>
        <Link to="/mapa" className="inline-flex items-center gap-2 font-semibold text-ink-soft hover:text-ink"><Map className="h-4 w-4" /> Perto de mim</Link>
      </div>
    </div>
  );
}

function PathView({ path }: { path: Path }) {
  const { items, byId } = useStore();
  const list = useMemo(() => items.filter((i) => i.type === path.type), [items, path.type]);
  const testimonials = useTestimonials({ ids: list.map((i) => i.id), limit: 3 });
  const guides = path.guides.map(byId).filter((g): g is ContentItem => !!g && g.status === 'published');
  const others = PATHS.filter((p) => p.id !== path.id);

  return (
    <>
      <section className={cx('bg-gradient-to-br text-white', path.color)}>
        <div className="container-x max-w-5xl py-10 sm:py-12">
          <Link to="/oportunidades" className="inline-flex items-center gap-1 text-sm font-semibold text-white/85 hover:text-white"><ArrowLeft className="h-4 w-4" /> O que você quer fazer?</Link>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">{path.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/90">{path.intro}</p>
        </div>
      </section>
      <div className="container-x max-w-5xl space-y-12 py-10">
        <section aria-labelledby="como">
          <h2 id="como" className="font-display text-xl font-bold">Como funciona, em 3 passos</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {path.how.map(([t, d], i) => (
              <li key={t} className="rounded-3xl bg-white p-5 ring-1 ring-line">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-display font-bold text-white">{i + 1}</span>
                <p className="mt-3 font-bold text-ink">{t}</p>
                <p className="mt-1 text-sm text-ink-soft">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <TestimonialRow items={testimonials} title="Quem já participou conta como foi" text="Assista antes de escolher: são pessoas que começaram de onde você está." />

        <section aria-labelledby="lista">
          <h2 id="lista" className="mb-4 font-display text-xl font-bold">{path.type === 'school_guide' ? 'Guias passo a passo' : 'Oportunidades abertas'}</h2>
          <Browser list={list} path={path} />
        </section>

        {guides.length > 0 && (
          <section>
            <h2 className="mb-4 font-display text-xl font-bold">{path.guidesTitle}</h2>
            <Grid cols={guides.length >= 3 ? 3 : 2}>{guides.map((g) => <ItemCard key={g.id} item={g} compact />)}</Grid>
          </section>
        )}

        {path.type !== 'school_guide' && <Notice tone="warn">Requisitos, prazos e condições podem mudar. Sempre confirme na página oficial antes de se inscrever.</Notice>}

        <section className="border-t border-line pt-8">
          <p className="mb-3 text-sm font-bold text-ink-muted">Ou talvez você queira…</p>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => <Link key={o.id} to={`/oportunidades/${o.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-soft ring-1 ring-line hover:text-ink">{o.want}</Link>)}
          </div>
        </section>
      </div>
    </>
  );
}

function Browser({ list, path }: { list: ContentItem[]; path: Path }) {
  const [showFilters, setShowFilters] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const [q, setQ] = useState('');
  const [area, setArea] = useState('');
  const [vals, setVals] = useState<Record<string, string>>({});
  const [toggle, setToggle] = useState(false);

  const value = (i: ContentItem, key: string) => (key === 'category' ? i.category ?? '' : fieldStr(i, key));
  const optionsFor = (key: string) => [...new Set(list.map((i) => value(i, key)).filter(Boolean))].sort();
  const closed = (i: ContentItem) => fieldStr(i, 'oppStatus').includes('encerradas');

  const filtered = list
    .filter(
      (i) =>
        (!q || norm(`${i.title} ${i.summary} ${Object.values(i.fields).flat().join(' ')}`).includes(norm(q))) &&
        (!area || i.area === area) &&
        path.filters.every((f) => !vals[f.key] || value(i, f.key) === vals[f.key]) &&
        (!toggle || !path.toggle || i.fields[path.toggle.key] === true),
    )
    .sort((a, b) => (fieldStr(a, 'deadline') || '9').localeCompare(fieldStr(b, 'deadline') || '9'));
  const open = filtered.filter((i) => !closed(i));
  const closedList = filtered.filter(closed);
  const active = q || area || toggle || Object.values(vals).some(Boolean);
  const hasFilters = path.filters.length > 0;

  return (
    <div>
      {hasFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} className={btn(showFilters ? 'dark' : 'secondary', 'sm')}><SlidersHorizontal className="h-4 w-4" /> Filtrar</button>
          {path.toggle && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-semibold ring-1 ring-line">
              <input type="checkbox" checked={toggle} onChange={(e) => setToggle(e.target.checked)} className="h-4 w-4 rounded" /> {path.toggle.label}
            </label>
          )}
          {active && <button onClick={() => { setQ(''); setArea(''); setVals({}); setToggle(false); }} className="inline-flex items-center gap-1 text-sm font-semibold text-grape-700"><X className="h-4 w-4" /> Limpar</button>}
          <span className="ml-auto text-sm text-ink-muted" aria-live="polite">{open.length} aberta(s)</span>
        </div>
      )}
      {showFilters && (
        <div className="mb-5 grid animate-fadeup gap-3 rounded-3xl bg-white p-4 ring-1 ring-line sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-muted sm:col-span-2 lg:col-span-1">
            Buscar
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, organização, cidade…" className="input h-10 pl-9" />
            </span>
          </label>
          <Select label="Área STEM" value={area} onChange={setArea} options={[{ value: '', label: 'Todas' }, ...AREA_OPTIONS]} />
          {path.filters.map((f) => (
            <Select key={f.key} label={f.label} value={vals[f.key] ?? ''} onChange={(v) => setVals((s) => ({ ...s, [f.key]: v }))} options={[{ value: '', label: 'Todos' }, ...optionsFor(f.key).map((o) => ({ value: o, label: o }))]} />
          ))}
        </div>
      )}
      <ItemList items={open} />
      {closedList.length > 0 && (
        <div className="mt-6">
          <button onClick={() => setShowClosed((s) => !s)} className={btn('ghost', 'sm')}>{showClosed ? 'Esconder' : `Ver ${closedList.length} com inscrições encerradas`}</button>
          {showClosed && <div className="mt-3 opacity-80"><ItemList items={closedList} /></div>}
        </div>
      )}
    </div>
  );
}
