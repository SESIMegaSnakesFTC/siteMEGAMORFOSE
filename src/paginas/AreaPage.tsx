import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, ChevronDown, Circle, Lightbulb } from 'lucide-react';
import { AreaArt } from '../componentes/art';
import { MentorMoment } from '../componentes/mentoria';
import { TestimonialRow, useTestimonials } from '../componentes/testimonials';
import { btn, cx, Grid, ItemCard, ProgressBar, useSeo } from '../componentes/ui';
import { AREAS, areaBySlug, type AreaMeta } from '../scripts/areas';
import { fieldList, fieldStr } from '../scripts/contentTypes';
import { useStore } from '../scripts/store';
import type { ContentItem } from '../scripts/types';
import { NotFound } from './Static';

// A página de cada área é uma linha de aprendizagem: 6 etapas em ordem, uma aberta por vez.
// O estudante sempre sabe onde está e qual é o próximo passo.

export const STAGES = [
  { key: 'descobrir', title: 'Descubra', sub: 'O que é e onde aparece no seu dia a dia' },
  { key: 'comecar', title: 'Dê os primeiros passos', sub: 'Uma sequência curta para quem está começando do zero' },
  { key: 'praticar', title: 'Pratique', sub: 'Mão na massa com tutoriais e projetos simples' },
  { key: 'aprofundar', title: 'Aprofunde', sub: 'Cursos gratuitos para ir mais longe' },
  { key: 'participar', title: 'Participe', sub: 'Projetos, programas e competições para colocar em prática' },
  { key: 'futuro', title: 'Planeje seu futuro', sub: 'Cursos, faculdades e primeiras vagas nesta área' },
] as const;

const read = (k: string): number[] => { try { return JSON.parse(localStorage.getItem(k) ?? '[]'); } catch { return []; } };
const write = (k: string, v: number[]) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } };

export default function AreaPage() {
  const { slug } = useParams();
  const area = areaBySlug(slug);
  useSeo(area?.name ?? 'Área não encontrada', area?.tagline);
  if (!area) return <NotFound />;
  return <AreaLine key={area.id} area={area} />;
}

function AreaLine({ area }: { area: AreaMeta }) {
  const { items, data, byId, user, saveProfile } = useStore();
  const storageKey = `mm:linha:${area.id}`;
  // Com conta, o progresso da linha fica no perfil (o mentor e a equipe conseguem ver).
  // Sem conta, fica só neste navegador.
  const [done, setDone] = useState<number[]>(() => user?.lineProgress?.[area.id] ?? read(storageKey));
  const firstOpen = STAGES.findIndex((_, i) => !done.includes(i));
  const [open, setOpen] = useState<number>(firstOpen < 0 ? 0 : firstOpen);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  // A conta carrega depois da página: quando ela chega, junta o progresso salvo no perfil.
  useEffect(() => {
    const saved = user?.lineProgress?.[area.id];
    if (!saved?.length) return;
    setDone((d) => {
      const merged = [...new Set([...d, ...saved])].sort();
      const first = STAGES.findIndex((_, i) => !merged.includes(i));
      setOpen(first < 0 ? 0 : first);
      return merged;
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    write(storageKey, done);
    if (!user) return;
    const saved = user.lineProgress?.[area.id] ?? [];
    if (saved.length === done.length && saved.every((x) => done.includes(x))) return;
    saveProfile({ ...user, lineProgress: { ...(user.lineProgress ?? {}), [area.id]: done } }).catch(() => undefined);
  }, [done, storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const areaItems = useMemo(() => items.filter((i) => i.area === area.id), [items, area.id]);
  const path = areaItems.find((i) => i.type === 'path');
  const pathIds = path ? fieldList(path, 'items') : [];
  const steps = pathIds.map((id) => byId(id)).filter((s): s is ContentItem => !!s && s.status === 'published');
  const notInPath = (i: ContentItem) => !pathIds.includes(i.id);
  const levelRank = (i: ContentItem) => ({ iniciante: 0, intermediario: 1, avancado: 2 }[i.level ?? 'iniciante']);

  const practice = areaItems.filter((i) => ['tutorial', 'practice', 'tool', 'material'].includes(i.type) && notInPath(i)).sort((a, b) => levelRank(a) - levelRank(b));
  const deeper = areaItems.filter((i) => (i.type === 'course' || (['video', 'tutorial'].includes(i.type) && i.level !== 'iniciante')) && notInPath(i) && !practice.slice(0, 3).includes(i)).sort((a, b) => levelRank(a) - levelRank(b));
  const isClosed = (i: ContentItem) => fieldStr(i, 'oppStatus').includes('encerradas');
  const participate = [...areaItems, ...items.filter((i) => i.area === 'geral')].filter((i) => ['opportunity', 'program', 'competition'].includes(i.type) && !isClosed(i));
  const future = [...areaItems, ...items.filter((i) => i.area === 'geral')].filter((i) => ['job', 'university', 'scholarship'].includes(i.type) && !isClosed(i));

  const tDiscover = useTestimonials({ area: area.id, stage: 'descobrir', limit: 1 });
  const tPractice = useTestimonials({ area: area.id, stage: 'praticar', limit: 1 });
  const tParticipate = useTestimonials({ ids: participate.map((i) => i.id), area: area.id, stage: 'participar', limit: 2 });
  const tFuture = useTestimonials({ area: area.id, stage: 'futuro', limit: 2 });

  const pathDone = steps.filter((s) => data.completed.includes(s.id)).length;
  const pct = Math.round((done.length / STAGES.length) * 100);

  const goNext = (i: number) => {
    setDone((d) => [...new Set([...d, i])]);
    const next = i + 1 < STAGES.length ? i + 1 : -1;
    setOpen(next);
    if (next >= 0) setTimeout(() => refs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const content: ReactNode[] = [
    // 1. Descubra
    <div key="d" className="space-y-5">
      <p className="text-ink-soft">{area.intro}</p>
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-bold text-ink"><Lightbulb className={cx('h-4 w-4', area.text)} /> Você já usa isso sem perceber</p>
        <ul className="grid gap-2 sm:grid-cols-2">{area.everyday.map((e) => <li key={e} className={cx('rounded-2xl px-4 py-3 text-sm font-semibold text-ink', area.soft)}>{e}</li>)}</ul>
      </div>
      <TestimonialRow items={tDiscover} title="Como foi a descoberta para quem começou" />
    </div>,
    // 2. Primeiros passos
    <div key="c" className="space-y-4">
      <p className="text-ink-soft">Siga na ordem. Cada etapa leva poucos minutos e você pode marcar o que já fez.</p>
      <ol className="space-y-2">
        {steps.map((s, idx) => {
          const ok = data.completed.includes(s.id);
          return (
            <li key={s.id}>
              <Link to={`/conteudo/${s.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line transition hover:shadow-card">
                <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold', ok ? 'bg-leaf-500 text-white' : cx(area.soft, area.text))}>{ok ? <Check className="h-4 w-4" /> : idx + 1}</span>
                <span className="min-w-0 flex-1"><span className="block font-semibold text-ink">{s.title}</span><span className="text-xs text-ink-muted">{s.duration}</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" />
              </Link>
            </li>
          );
        })}
      </ol>
      {path && (
        <div className="flex flex-wrap items-center gap-3">
          <Link to={`/aprender/trilhas/${path.id}`} className={btn('dark', 'sm')}>{pathDone ? `Continuar trilha (${pathDone}/${steps.length})` : 'Abrir a trilha completa'}</Link>
        </div>
      )}
    </div>,
    // 3. Pratique
    <div key="p" className="space-y-5">
      <ShowMore items={practice} />
      <MentorMoment text="mostre o que você montou ou programou e tire as dúvidas da prática." />
      <TestimonialRow items={tPractice} title="Quem praticou conta como foi" />
    </div>,
    // 4. Aprofunde
    <div key="a" className="space-y-4">
      <p className="text-ink-soft">Já fez as etapas anteriores? Estes cursos gratuitos ajudam a ir mais longe, no seu ritmo.</p>
      <ShowMore items={deeper} />
    </div>,
    // 5. Participe
    <div key="o" className="space-y-5">
      <p className="text-ink-soft">Agora é hora de usar o que aprendeu com outras pessoas. Muitas destas oportunidades aceitam iniciantes.</p>
      <TestimonialRow items={tParticipate} title="Vídeos de quem participou" />
      <ShowMore items={participate} />
      <MentorMoment text="escolham juntos uma oportunidade e combinem os próximos passos da inscrição." />
      <Link to="/oportunidades" className="inline-flex items-center gap-1 text-sm font-bold text-grape-700">Ver todas as oportunidades <ArrowRight className="h-4 w-4" /></Link>
    </div>,
    // 6. Futuro
    <div key="f" className="space-y-5">
      <TestimonialRow items={tFuture} title="Onde essa área pode levar você" />
      <ShowMore items={future} />
      <div className="flex flex-wrap gap-3">
        <Link to="/futuro-academico" className={btn('secondary', 'sm')}>Faculdade e estudar fora</Link>
        <Link to="/oportunidades/empregos" className={btn('secondary', 'sm')}>Jovem Aprendiz e vagas</Link>
      </div>
    </div>,
  ];

  const others = AREAS.filter((a) => a.id !== area.id);

  return (
    <>
      <section className={cx('relative overflow-hidden bg-gradient-to-br text-white', area.gradient)}>
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(white_1.2px,transparent_1.2px)] [background-size:20px_20px]" />
        <div className="container-x relative grid items-center gap-6 py-10 sm:py-14 md:grid-cols-[1.4fr_1fr]">
          <div className="animate-fadeup">
            <Link to="/explorar" className="text-sm font-semibold text-white/80 hover:text-white">← Todas as áreas</Link>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{area.name}</h1>
            <p className="mt-2 text-xl font-medium text-white/95">{area.tagline}</p>
            <div className="mt-6 max-w-md rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="mb-2 flex justify-between text-sm font-semibold"><span>Sua linha de aprendizagem</span><span>{done.length} de {STAGES.length} etapas</span></div>
              <ProgressBar pct={pct} color="from-white to-sun-400" label={`Progresso em ${area.name}`} />
            </div>
          </div>
          <AreaArt area={area.id} className="mx-auto hidden w-full max-w-xs drop-shadow-xl md:block" />
        </div>
      </section>

      <div className="container-x max-w-4xl py-10">
        <ol className="relative space-y-3 before:absolute before:bottom-8 before:left-[19px] before:top-8 before:w-0.5 before:bg-line sm:before:left-[23px]">
          {STAGES.map((s, i) => {
            const isOpen = open === i;
            const isDone = done.includes(i);
            return (
              <li key={s.key} ref={(el) => { refs.current[i] = el; }} className="relative scroll-mt-24">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={`etapa-${i}`}
                  className="flex w-full items-center gap-3 text-left sm:gap-4"
                >
                  <span className={cx('relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full font-display font-bold ring-4 ring-paper transition sm:h-12 sm:w-12', isDone ? 'bg-leaf-500 text-white' : isOpen ? cx(area.solid, 'text-white') : 'bg-white text-ink-muted ring-line')}>
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                  </span>
                  <span className={cx('flex flex-1 items-center justify-between gap-3 rounded-3xl px-4 py-3 transition', isOpen ? 'bg-white shadow-card ring-1 ring-line' : 'hover:bg-white/70')}>
                    <span className="min-w-0">
                      <span className="block text-xs font-bold uppercase tracking-wider text-ink-muted">Etapa {i + 1}</span>
                      <span className="block font-display text-lg font-bold text-ink">{s.title}</span>
                      <span className="block text-sm text-ink-soft">{s.sub}</span>
                    </span>
                    <ChevronDown className={cx('h-5 w-5 shrink-0 text-ink-muted transition', isOpen && 'rotate-180')} />
                  </span>
                </button>
                {isOpen && (
                  <div id={`etapa-${i}`} className="ml-[52px] mt-3 animate-fadeup sm:ml-16">
                    {content[i]}
                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                      {i + 1 < STAGES.length ? (
                        <button onClick={() => goNext(i)} className={btn('primary')}>Próxima etapa: {STAGES[i + 1].title} <ArrowRight className="h-4 w-4" /></button>
                      ) : (
                        <button onClick={() => goNext(i)} className={btn('primary')}><Check className="h-4 w-4" /> Concluir a linha</button>
                      )}
                      {isDone ? <span className="flex items-center gap-1 text-sm font-semibold text-leaf-700"><CheckCircle2 className="h-4 w-4" /> Etapa vista</span> : <span className="flex items-center gap-1 text-sm text-ink-muted"><Circle className="h-4 w-4" /> Sem pressa: volte quando quiser</span>}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {done.length === STAGES.length && (
          <div className="mt-8 rounded-3xl bg-leaf-50 p-5 text-center ring-1 ring-leaf-100">
            <p className="font-display text-lg font-bold text-leaf-700">Você percorreu toda a linha de {area.name}! 🎉</p>
            <p className="text-sm text-leaf-700/80">Que tal conhecer outra área?</p>
          </div>
        )}

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {others.map((o) => (
            <Link key={o.id} to={`/explorar/${o.slug}`} className={cx('group flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r p-4 text-white shadow-card transition hover:shadow-lift', o.gradient)}>
              <AreaArt area={o.id} className="w-16 shrink-0" />
              <span className="flex-1"><span className="block text-xs font-semibold text-white/80">Outra área</span><strong className="font-display text-lg">{o.name}</strong></span>
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/** Mostra 3 itens e esconde o resto atrás de um botão, para não sobrecarregar. */
function ShowMore({ items, n = 3 }: { items: ContentItem[]; n?: number }) {
  const [all, setAll] = useState(false);
  if (!items.length) return <p className="rounded-2xl bg-white p-4 text-sm text-ink-muted ring-1 ring-line">Novos conteúdos desta etapa chegam em breve.</p>;
  return (
    <div>
      <Grid>{(all ? items : items.slice(0, n)).map((i) => <ItemCard key={i.id} item={i} />)}</Grid>
      {items.length > n && (
        <button onClick={() => setAll((a) => !a)} className={cx(btn('ghost', 'sm'), 'mt-3')}>
          {all ? 'Mostrar menos' : `Mostrar mais ${items.length - n}`}
        </button>
      )}
    </div>
  );
}
