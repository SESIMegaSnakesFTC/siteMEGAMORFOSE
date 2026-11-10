import { Link } from 'react-router-dom';
import { ArrowRight, Route as RouteIcon } from 'lucide-react';
import type { ContentItem } from '../scripts/types';
import { AREAS, areaById, levelLabel, type AreaMeta } from '../scripts/areas';
import { fieldList } from '../scripts/contentTypes';
import { pathProgress } from '../scripts/gamification';
import { useStore } from '../scripts/store';
import { AreaArt } from './art';
import { cx, ProgressBar } from './ui';

export function AreaCard({ area, big = false }: { area: AreaMeta; big?: boolean }) {
  return (
    <Link
      to={`/explorar/${area.slug}`}
      className={cx('group relative flex flex-col overflow-hidden rounded-4xl bg-gradient-to-br p-6 text-white shadow-lift transition duration-300 hover:-translate-y-1.5 sm:p-7', area.gradient, big ? 'min-h-[360px]' : 'min-h-[280px]')}
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(white_1.2px,transparent_1.2px)] [background-size:18px_18px]" />
      <AreaArt area={area.id} className="absolute -bottom-4 -right-4 w-48 transition duration-500 group-hover:scale-110 sm:w-56" />
      <div className="relative">
        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">Workshop · 50 min</span>
        <h3 className="mt-4 max-w-[14ch] font-display text-2xl font-bold leading-tight sm:text-3xl">{area.name}</h3>
        <p className="mt-2 max-w-[28ch] text-white/90">{area.tagline}</p>
      </div>
      <span className="relative mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink transition group-hover:gap-3">
        Explorar <ArrowRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}

export function AreaTriptych() {
  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
      {AREAS.map((a) => <AreaCard key={a.id} area={a} big />)}
    </div>
  );
}

export function PathCard({ item }: { item: ContentItem }) {
  const { data } = useStore();
  const area = areaById(item.area);
  const prog = pathProgress(item, data.completed);
  return (
    <Link to={`/aprender/trilhas/${item.id}`} className="group flex h-full flex-col rounded-3xl bg-white p-5 shadow-card ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className={cx('grid h-11 w-11 place-items-center rounded-2xl text-white', area.solid)}><RouteIcon className="h-5 w-5" /></span>
        <span className="text-xs font-semibold text-ink-muted">{fieldList(item, 'items').length} etapas · {item.duration}</span>
      </div>
      <h3 className="mt-4 font-display text-lg font-bold leading-snug text-ink group-hover:text-grape-700">{item.title}</h3>
      <p className="mt-1 text-sm text-ink-soft">{item.summary}</p>
      <div className="mt-auto pt-4">
        <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink-muted">
          <span>{prog.done ? `${prog.done} de ${prog.total} concluídas` : levelLabel(item.level)}</span>
          <span>{prog.pct}%</span>
        </div>
        <ProgressBar pct={prog.pct} label={`Progresso da trilha ${item.title}`} />
      </div>
    </Link>
  );
}
