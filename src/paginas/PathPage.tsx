import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Clock, Trophy } from 'lucide-react';
import { btn, Chip, cx, ProgressBar, useSeo } from '../componentes/ui';
import { areaById, levelLabel } from '../scripts/areas';
import { fieldList, typeDef } from '../scripts/contentTypes';
import { pathProgress } from '../scripts/gamification';
import { useStore } from '../scripts/store';
import { NotFound } from './Static';

export default function PathPage() {
  const { id = '' } = useParams();
  const { byId, data, toggle, toast, user, loading } = useStore();
  const path = byId(id);
  useSeo(path?.title ?? 'Trilha', path?.summary);
  if (loading) return <div className="container-x py-24 text-center text-ink-muted" role="status">Carregando…</div>;
  if (!path || path.type !== 'path') return <NotFound />;

  const area = areaById(path.area);
  const steps = fieldList(path, 'items').map((sid) => byId(sid)).filter((s) => s && s.status === 'published');
  const prog = pathProgress(path, data.completed);
  const nextStep = steps.find((s) => !data.completed.includes(s!.id));

  return (
    <>
      <section className={cx('bg-gradient-to-br text-white', area.gradient)}>
        <div className="container-x py-10 sm:py-14">
          <Link to="/explorar" className="inline-flex items-center gap-1 text-sm font-semibold text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> Áreas</Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/80">Trilha de aprendizagem · {area.name}</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-5xl">{path.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/90">{path.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip className="bg-white/20 text-white">{steps.length} etapas</Chip>
            {path.duration && <Chip className="bg-white/20 text-white" icon={Clock}>{path.duration}</Chip>}
            {path.level && <Chip className="bg-white/20 text-white">{levelLabel(path.level)}</Chip>}
          </div>
          <div className="mt-6 max-w-md rounded-2xl bg-white/15 p-4 backdrop-blur">
            <div className="mb-2 flex justify-between text-sm font-semibold"><span>Seu progresso</span><span>{prog.done}/{prog.total} · {prog.pct}%</span></div>
            <ProgressBar pct={prog.pct} color="from-white to-sun-400" label="Progresso da trilha" />
            {!user && <p className="mt-2 text-xs text-white/80"><Link to="/entrar" className="font-bold underline">Entre</Link> para salvar seu progresso.</p>}
          </div>
        </div>
      </section>
      <div className="container-x py-10">
        {prog.pct === 100 && (
          <div className="mb-8 flex items-center gap-4 rounded-3xl bg-leaf-50 p-5 ring-1 ring-leaf-100">
            <Trophy className="h-10 w-10 text-leaf-600" />
            <div><p className="font-display text-lg font-bold text-leaf-700">Trilha concluída! +50 pontos</p><p className="text-sm text-leaf-700/80">Que tal explorar a próxima área ou uma oportunidade relacionada?</p></div>
          </div>
        )}
        <ol className="relative space-y-4 before:absolute before:bottom-6 before:left-[22px] before:top-6 before:w-0.5 before:bg-line">
          {steps.map((s, idx) => {
            const done = data.completed.includes(s!.id);
            const isNext = s === nextStep;
            return (
              <li key={s!.id} className="relative flex gap-4">
                <button
                  onClick={async () => { if (await toggle('completed', s!.id)) toast(done ? 'Etapa desmarcada.' : 'Etapa concluída! +10 pontos', done ? 'info' : 'ok'); }}
                  aria-label={done ? `Desmarcar etapa ${idx + 1}` : `Marcar etapa ${idx + 1} como concluída`}
                  aria-pressed={done}
                  className={cx('relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full ring-4 ring-paper transition', done ? 'bg-leaf-500 text-white' : isNext ? cx(area.solid, 'text-white') : 'bg-white text-ink-muted ring-line')}
                >
                  {done ? <CheckCircle2 className="h-6 w-6" /> : isNext ? <span className="font-display font-bold">{idx + 1}</span> : <Circle className="h-5 w-5" />}
                </button>
                <Link to={`/conteudo/${s!.id}`} className={cx('flex-1 rounded-3xl bg-white p-5 shadow-card ring-1 transition hover:shadow-lift', isNext ? 'ring-2 ring-grape-200' : 'ring-line')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Etapa {idx + 1}</span>
                    <Chip className={typeDef(s!.type).color}>{typeDef(s!.type).label}</Chip>
                    {s!.duration && <Chip icon={Clock}>{s!.duration}</Chip>}
                    {isNext && <Chip className="bg-grape-500 text-white">Próxima</Chip>}
                  </div>
                  <h2 className="mt-2 font-display text-lg font-bold">{s!.title}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{s!.summary}</p>
                </Link>
              </li>
            );
          })}
        </ol>
        {nextStep && <div className="mt-8 text-center"><Link to={`/conteudo/${nextStep.id}`} className={btn('primary', 'lg')}>{prog.done ? 'Continuar de onde parei' : 'Começar a trilha'}</Link></div>}
      </div>
    </>
  );
}
