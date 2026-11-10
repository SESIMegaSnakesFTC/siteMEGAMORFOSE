import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Play, X, Video } from 'lucide-react';
import type { AreaId, ContentItem } from '../scripts/types';
import { areaById } from '../scripts/areas';
import { fieldList, fieldStr } from '../scripts/contentTypes';
import { useStore } from '../scripts/store';
import { Avatar, cx, DemoTag, embedUrl } from './ui';

// Depoimentos são sempre em vídeo: uma pessoa real contando o que viveu.
// Eles aparecem dentro das etapas das áreas, das oportunidades e das bolsas.

export type Stage = 'descobrir' | 'praticar' | 'participar' | 'futuro';

/** Escolhe depoimentos: primeiro os ligados aos IDs informados, depois os da área/etapa. */
export function useTestimonials({ ids = [], area, stage, abroad, limit = 3 }: { ids?: string[]; area?: AreaId; stage?: Stage; abroad?: boolean; limit?: number }) {
  const { items } = useStore();
  const stories = items.filter((i) => i.type === 'story');
  const linked = stories.filter((s) => fieldList(s, 'relatedTo').some((r) => ids.includes(r)));
  const byContext = stories.filter(
    (s) => !linked.includes(s) && (area === undefined || s.area === area) && (stage === undefined || fieldStr(s, 'stage') === stage) && (abroad === undefined || (s.fields.abroad === true) === abroad),
  );
  const hasContext = area !== undefined || stage !== undefined || abroad !== undefined;
  return [...linked, ...(hasContext ? byContext : [])].slice(0, limit);
}

export function VideoCard({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const area = areaById(item.area);
  const person = fieldStr(item, 'person');
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-full w-full flex-col overflow-hidden rounded-3xl bg-white text-left shadow-card ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-eletric-500"
        aria-label={`Assistir depoimento de ${person}: ${item.title}`}
      >
        <div className={cx('relative w-full overflow-hidden bg-gradient-to-br', area.gradient, compact ? 'aspect-[16/10]' : 'aspect-video')}>
          {item.cover ? (
            <img src={item.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(white_1.2px,transparent_1.2px)] [background-size:16px_16px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink"><Video className="h-3.5 w-3.5" /> Depoimento</span>
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-ink shadow-lift transition group-hover:scale-110"><Play className="ml-1 h-6 w-6 fill-current" /></span>
          </span>
          <span className="absolute bottom-3 left-3 flex items-center gap-2 text-sm font-semibold text-white"><Avatar name={person} className="h-8 w-8 text-xs ring-2 ring-white/70" /> {person.replace(/\s*\(.*\)/, '')}</span>
          {item.duration && <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2 py-0.5 text-xs font-semibold text-white"><Clock className="h-3 w-3" /> {item.duration}</span>}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          {fieldStr(item, 'context') && <p className={cx('text-xs font-bold uppercase tracking-wide', area.text)}>{fieldStr(item, 'context')}</p>}
          <p className="font-display font-bold leading-snug text-ink">{item.title}</p>
          <p className="text-sm text-ink-muted">{person}{fieldStr(item, 'role') ? ` · ${fieldStr(item, 'role')}` : ''}</p>
          {item.demo && <div className="mt-auto pt-2"><DemoTag /></div>}
        </div>
      </button>
      {open && <VideoModal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}

export function VideoModal({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const src = embedUrl(item.videoUrl);
  const area = areaById(item.area);
  const tips = fieldList(item, 'tips');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-3xl animate-fadeup overflow-y-auto rounded-t-4xl bg-white sm:rounded-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {src ? (
            <iframe src={src} title={item.title} className="aspect-video w-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
          ) : (
            <div className={cx('grid aspect-video w-full place-items-center bg-gradient-to-br p-6 text-center text-white', area.gradient)}>
              <div>
                <Avatar name={fieldStr(item, 'person')} className="mx-auto h-20 w-20 text-2xl ring-8 ring-white/20" />
                <p className="mt-4 font-display text-lg font-bold">Vídeo ainda não gravado</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-white/90">Este é um depoimento demonstrativo. Quando a equipe colar o link do YouTube ou Vimeo no painel, o vídeo toca aqui.</p>
              </div>
            </div>
          )}
          <button onClick={onClose} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-card" aria-label="Fechar vídeo"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 p-5 sm:p-6">
          {fieldStr(item, 'context') && <p className={cx('text-xs font-bold uppercase tracking-wide', area.text)}>{fieldStr(item, 'context')}</p>}
          <h2 className="font-display text-xl font-bold sm:text-2xl">{item.title}</h2>
          <p className="text-sm text-ink-muted">{[fieldStr(item, 'person'), fieldStr(item, 'role'), fieldStr(item, 'institution'), fieldStr(item, 'country')].filter(Boolean).join(' · ')}</p>
          <p className="text-ink-soft">{item.summary}</p>
          {tips.length > 0 && (
            <div className="rounded-2xl bg-paper p-4">
              <p className="text-sm font-bold">Dicas que aparecem no vídeo</p>
              <ul className="mt-1 space-y-1 text-sm text-ink-soft">{tips.map((t) => <li key={t}>• {t}</li>)}</ul>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {item.demo && <DemoTag />}
            <Link to="/inspiracao" onClick={onClose} className="text-sm font-semibold text-grape-700">Ver todos os depoimentos</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialRow({ items, title = 'Quem já passou por aqui', text }: { items: ContentItem[]; title?: string; text?: string }) {
  if (!items.length) return null;
  return (
    <div className="rounded-3xl bg-bubble-50/60 p-4 ring-1 ring-bubble-100 sm:p-5">
      <p className="flex items-center gap-2 font-display font-bold text-ink"><Video className="h-5 w-5 text-bubble-600" /> {title}</p>
      {text && <p className="mt-0.5 text-sm text-ink-soft">{text}</p>}
      <div className={cx('mt-4 grid gap-4', items.length > 1 && 'sm:grid-cols-2', items.length > 2 && 'lg:grid-cols-3')}>
        {items.map((s) => <VideoCard key={s.id} item={s} compact />)}
      </div>
    </div>
  );
}
