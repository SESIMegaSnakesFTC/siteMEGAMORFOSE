import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Award, BookA, BookOpen, Bookmark, BookmarkCheck, Briefcase, CalendarDays, CheckCircle2, Circle, Clock, ExternalLink,
  FileText, Flag, FolderDown, GraduationCap, Hammer, HeartHandshake, Info, Landmark, Lightbulb, ListChecks, PlayCircle,
  Rocket, Route, School, Sparkles, Trophy, Wrench, type LucideIcon, AlertTriangle, SearchX,
} from 'lucide-react';
import type { ContentItem, ContentType } from '../scripts/types';
import { areaById, levelLabel } from '../scripts/areas';
import { fieldStr, typeDef } from '../scripts/contentTypes';
import { useStore } from '../scripts/store';
import { AreaArt } from './art';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const TYPE_ICON: Record<ContentType, LucideIcon> = {
  video: PlayCircle, tutorial: ListChecks, course: GraduationCap, tool: Wrench, guide: BookOpen, material: FileText,
  practice: Hammer, path: Route, opportunity: HeartHandshake, program: Rocket, job: Briefcase, competition: Trophy,
  school_guide: School, scholarship: Award, university: Landmark, story: Sparkles, event: CalendarDays, showcase: Lightbulb,
  resource: FolderDown, glossary: BookA, challenge: Flag,
};

// ───── SEO básico por página ─────
export function useSeo(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · MegaMorfose` : 'MegaMorfose — Plataforma educacional STEM';
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}

// ───── Botões ─────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger';
const BTN: Record<BtnVariant, string> = {
  primary: 'bg-gradient-to-r from-grape-500 to-eletric-500 text-white shadow-[0_8px_20px_-8px_rgba(124,77,255,.6)] hover:brightness-110',
  secondary: 'bg-white text-ink ring-1 ring-line hover:ring-ink/20 hover:bg-paper',
  ghost: 'text-ink-soft hover:bg-ink/5 hover:text-ink',
  dark: 'bg-ink text-white hover:bg-ink/90',
  danger: 'bg-bubble-50 text-bubble-700 hover:bg-bubble-100',
};
export const btn = (v: BtnVariant = 'primary', size: 'sm' | 'md' | 'lg' = 'md') =>
  cx(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eletric-500',
    size === 'sm' ? 'h-9 px-4 text-sm' : size === 'lg' ? 'px-7 py-3.5 text-base' : 'h-11 px-5 text-sm',
    BTN[v],
  );

export function Chip({ children, className = '', icon: Icon }: { children: ReactNode; className?: string; icon?: LucideIcon }) {
  return (
    <span className={cx('inline-flex max-w-full items-center gap-1 truncate whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', className || 'bg-ink/5 text-ink-soft')}>
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
      {children}
    </span>
  );
}

export function DemoTag({ className = '' }: { className?: string }) {
  return (
    <span title="Exemplo fictício: será substituído por conteúdo real" className={cx('inline-flex items-center gap-1 rounded-full bg-sun-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sun-700', className)}>
      <Info className="h-3 w-3" aria-hidden /> Conteúdo demonstrativo
    </span>
  );
}

export function SectionHeader({ eyebrow, title, text, action, className = '' }: { eyebrow?: string; title: string; text?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cx('mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[.14em] text-grape-600">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
        {text && <p className="mt-2 text-ink-soft">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHero({ eyebrow, title, text, gradient = 'from-grape-500 to-eletric-500', children, art }: { eyebrow?: string; title: string; text: string; gradient?: string; children?: ReactNode; art?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      <div className={cx('pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br opacity-20 blur-3xl', gradient)} />
      <div className="container-x relative grid items-center gap-8 py-10 sm:py-14 md:grid-cols-[1.4fr_1fr]">
        <div className="animate-fadeup">
          {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[.14em] text-grape-600">{eyebrow}</p>}
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">{text}</p>
          {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
        </div>
        <div className="hidden md:block">{art ?? <HeroTiles />}</div>
      </div>
    </section>
  );
}

function HeroTiles() {
  const tiles: { area: ContentItem['area']; g: string; cls: string }[] = [
    { area: 'ia', g: 'from-grape-500 to-bubble-500', cls: 'left-6 top-2 rotate-[-6deg]' },
    { area: 'eletronica', g: 'from-tang-500 to-sun-400', cls: 'right-2 top-10 rotate-[5deg]' },
    { area: 'mecanica', g: 'from-eletric-500 to-leaf-500', cls: 'bottom-0 left-24 rotate-[2deg]' },
  ];
  return (
    <div className="relative mx-auto h-64 w-full max-w-sm" aria-hidden>
      {tiles.map((t, i) => (
        <div key={t.area} className={cx('absolute grid h-36 w-44 place-items-center rounded-4xl bg-gradient-to-br shadow-lift animate-floaty', t.g, t.cls)} style={{ animationDelay: `${i * 0.8}s` }}>
          <AreaArt area={t.area} className="w-32" />
        </div>
      ))}
    </div>
  );
}

// ───── Capa ilustrada (usada quando não há imagem) ─────
export function Cover({ item, className = '', size = 'md' }: { item: ContentItem; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const area = areaById(item.area);
  const Icon = TYPE_ICON[item.type];
  if (item.cover)
    return <img src={item.cover} alt="" loading="lazy" className={cx('h-full w-full object-cover', className)} />;
  return (
    <div className={cx('relative h-full w-full overflow-hidden bg-gradient-to-br', area.gradient, className)}>
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(white_1.2px,transparent_1.2px)] [background-size:16px_16px]" />
      <AreaArt area={item.area} className={cx('absolute -bottom-3 -right-3 opacity-90', size === 'lg' ? 'w-64' : size === 'sm' ? 'w-24' : 'w-36')} />
      <div className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-2xl bg-white/90 text-ink shadow-sm">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      {item.type === 'video' && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/95 shadow-lift"><PlayCircle className="h-7 w-7 text-ink" aria-hidden /></span>
        </div>
      )}
    </div>
  );
}

export function BookmarkButton({ id, className = '' }: { id: string; className?: string }) {
  const { data, toggle, toast } = useStore();
  const saved = data.bookmarks.includes(id);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (await toggle('bookmarks', id)) toast(saved ? 'Removido dos favoritos.' : 'Salvo nos favoritos!', saved ? 'info' : 'ok');
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      className={cx('grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow-sm ring-1 ring-line transition hover:scale-105', saved && 'text-grape-600', className)}
    >
      {saved ? <BookmarkCheck className="h-[18px] w-[18px]" /> : <Bookmark className="h-[18px] w-[18px]" />}
    </button>
  );
}

export const formatDate = (iso?: string, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) => {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR', opts);
};

export function OppStatus({ item }: { item: ContentItem }) {
  const s = fieldStr(item, 'oppStatus');
  if (!s) return null;
  const tone = s.startsWith('Inscrições abertas') ? 'bg-leaf-50 text-leaf-700' : s.includes('encerradas') ? 'bg-ink/5 text-ink-muted' : 'bg-eletric-50 text-eletric-700';
  return <Chip className={tone}>{s === 'Inscrições abertas' ? '● ' : ''}{s}</Chip>;
}

// ───── Card de conteúdo genérico ─────
export function ItemCard({ item, compact = false }: { item: ContentItem; compact?: boolean }) {
  const def = typeDef(item.type);
  const area = areaById(item.area);
  const done = useStore().data.completed.includes(item.id);
  const deadline = fieldStr(item, 'deadline') || fieldStr(item, 'date');
  const org = fieldStr(item, 'org') || fieldStr(item, 'company') || fieldStr(item, 'provider');
  return (
    <Link
      to={`/conteudo/${item.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line transition duration-200 hover:-translate-y-1 hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-eletric-500"
    >
      {!compact && (
        <div className="relative aspect-[16/9]">
          <Cover item={item} />
          <div className="absolute right-3 top-3"><BookmarkButton id={item.id} /></div>
          {done && <Chip className="absolute bottom-3 left-3 bg-leaf-500 text-white" icon={CheckCircle2}>Concluído</Chip>}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip className={def.color}>{def.label}</Chip>
          {item.area !== 'geral' && <Chip className={cx(area.soft, area.text)}>{area.short}</Chip>}
          {item.demo && <DemoTag />}
        </div>
        <h3 className="font-display text-lg font-bold leading-snug text-ink group-hover:text-grape-700">{item.title}</h3>
        <p className="line-clamp-3 text-sm text-ink-soft">{item.summary}</p>
        {org && <p className="text-xs font-medium text-ink-muted">{org}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {item.level && <Chip>{levelLabel(item.level)}</Chip>}
          {item.duration && <Chip icon={Clock}>{item.duration}</Chip>}
          {item.category && !item.level && <Chip>{item.category}</Chip>}
          <OppStatus item={item} />
          {deadline && <Chip icon={CalendarDays}>{formatDate(deadline)}</Chip>}
        </div>
      </div>
    </Link>
  );
}

export function Grid({ children, cols = 3 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  return <div className={cx('grid gap-4 sm:gap-5 sm:grid-cols-2', cols === 3 && 'lg:grid-cols-3', cols === 4 && 'lg:grid-cols-4')}>{children}</div>;
}

export function SkeletonGrid({ n = 6 }: { n?: number }) {
  return (
    <Grid>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-3xl bg-white ring-1 ring-line" aria-hidden>
          <div className="aspect-[16/9] animate-pulse bg-line/70" />
          <div className="space-y-2 p-5">
            <div className="h-4 w-1/3 animate-pulse rounded bg-line" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-line" />
            <div className="h-4 w-full animate-pulse rounded bg-line/70" />
          </div>
        </div>
      ))}
      <span className="sr-only">Carregando conteúdos…</span>
    </Grid>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <SearchX className="mb-3 h-10 w-10 text-ink-muted" aria-hidden />
      <p className="font-display text-lg font-bold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-md text-sm text-ink-soft">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-3xl bg-bubble-50 px-6 py-10 text-center">
      <AlertTriangle className="mb-2 h-8 w-8 text-bubble-600" aria-hidden />
      <p className="font-semibold text-bubble-700">Algo deu errado ao carregar.</p>
      <p className="mt-1 text-sm text-bubble-700/80">{text}</p>
      {onRetry && <button className={cx(btn('secondary', 'sm'), 'mt-4')} onClick={onRetry}>Tentar de novo</button>}
    </div>
  );
}

/** Lista com carregamento/erro/vazio padronizados. */
export function ItemList({ items, empty, cols = 3 }: { items: ContentItem[]; empty?: ReactNode; cols?: 2 | 3 | 4 }) {
  const { loading, error, reload } = useStore();
  if (loading) return <SkeletonGrid n={cols === 4 ? 4 : 3} />;
  if (error) return <ErrorState text={error} onRetry={reload} />;
  if (!items.length) return <>{empty ?? <EmptyState title="Nada por aqui ainda" text="Novos conteúdos serão adicionados em breve pela equipe MegaMorfose." />}</>;
  return <Grid cols={cols}>{items.map((i) => <ItemCard key={i.id} item={i} />)}</Grid>;
}

// ───── Link externo seguro ─────
export const isExternal = (url?: string) => !!url && /^https?:\/\//i.test(url);

export function ExternalCta({ url, label, className = '' }: { url?: string; label: string; className?: string }) {
  if (isExternal(url))
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={cx(btn('primary', 'lg'), className)}>
        {label} <ExternalLink className="h-4 w-4" aria-hidden />
        <span className="sr-only">(abre em nova aba)</span>
      </a>
    );
  return (
    <div className={className}>
      <button type="button" disabled className={btn('secondary', 'lg')}>{label}</button>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted"><Info className="h-3.5 w-3.5" /> Link oficial ainda não cadastrado. A equipe adiciona pelo painel administrativo.</p>
    </div>
  );
}

// ───── Vídeo incorporado ─────
export function embedUrl(url?: string) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export function VideoEmbed({ item }: { item: ContentItem }) {
  const src = embedUrl(item.videoUrl);
  if (src)
    return (
      <div className="aspect-video overflow-hidden rounded-3xl bg-ink shadow-lift">
        <iframe src={src} title={item.title} className="h-full w-full" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />
      </div>
    );
  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl shadow-lift">
      <Cover item={{ ...item, type: 'video' }} size="lg" />
      <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 p-3 text-sm text-ink-soft sm:inset-x-4 sm:bottom-4">
        <strong className="text-ink">Vídeo em produção.</strong> Quando a equipe cadastrar o link do YouTube ou Vimeo no painel, ele aparece aqui.
      </div>
    </div>
  );
}

export function ProgressBar({ pct, color = 'from-grape-500 to-eletric-500', label }: { pct: number; color?: string; label?: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cx('h-full rounded-full bg-gradient-to-r transition-all duration-500', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function CompleteButton({ id }: { id: string }) {
  const { data, toggle, toast } = useStore();
  const done = data.completed.includes(id);
  return (
    <button
      type="button"
      className={btn(done ? 'secondary' : 'dark', 'lg')}
      aria-pressed={done}
      onClick={async () => {
        if (await toggle('completed', id)) toast(done ? 'Marcado como não concluído.' : 'Boa! +10 pontos na sua jornada 🎉', done ? 'info' : 'ok');
      }}
    >
      {done ? <CheckCircle2 className="h-5 w-5 text-leaf-600" /> : <Circle className="h-5 w-5" />}
      {done ? 'Concluído' : 'Marcar como concluído'}
    </button>
  );
}

// ───── Filtros ─────
export function FilterPills<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
            value === o.value ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink hover:ring-ink/20',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-ink-muted">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 rounded-xl border-0 bg-white px-3 text-sm font-medium text-ink ring-1 ring-line focus:ring-2 focus:ring-eletric-500">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <div className={cx('flex gap-3 rounded-2xl p-4 text-sm', tone === 'warn' ? 'bg-sun-50 text-sun-700 ring-1 ring-sun-100' : 'bg-eletric-50 text-eletric-700 ring-1 ring-eletric-100')}>
      {tone === 'warn' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" />}
      <div>{children}</div>
    </div>
  );
}

export function Avatar({ name, className = '' }: { name: string; className?: string }) {
  const initials = name.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
  const colors = ['from-grape-500 to-bubble-500', 'from-tang-500 to-sun-400', 'from-eletric-500 to-leaf-500', 'from-leaf-500 to-eletric-500', 'from-bubble-500 to-tang-500'];
  const c = colors[(name.charCodeAt(0) || 0) % colors.length];
  return <span aria-hidden className={cx('grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-display font-bold text-white', c, className)}>{initials || '?'}</span>;
}
