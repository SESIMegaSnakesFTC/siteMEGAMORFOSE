import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, MapPin, Route as RouteIcon, Share2 } from 'lucide-react';
import {
  Avatar, BookmarkButton, Chip, CompleteButton, Cover, cx, DemoTag, ExternalCta, formatDate, Grid, isExternal, ItemCard,
  Notice, OppStatus, SectionHeader, useSeo, VideoEmbed,
} from '../componentes/ui';
import { areaById, levelLabel } from '../scripts/areas';
import { fieldList, fieldStr, LEARNING_TYPES, OPPORTUNITY_TYPES, typeDef } from '../scripts/contentTypes';
import { useStore } from '../scripts/store';
import type { ContentItem } from '../scripts/types';
import { NotFound } from './Static';
import { TestimonialRow, useTestimonials } from '../componentes/testimonials';

const LIST_ORDERED = new Set(['steps', 'howTo', 'items']);

export default function Detail() {
  const { id = '' } = useParams();
  const { byId, items, loading, isAdmin, toast } = useStore();
  const nav = useNavigate();
  const item = byId(id);
  const testimonials = useTestimonials({ ids: [id] }).filter((t) => t.id !== id);
  useSeo(item?.title ?? 'Conteúdo', item?.summary);

  if (loading) return <div className="container-x py-24 text-center text-ink-muted" role="status">Carregando…</div>;
  if (!item || (item.status !== 'published' && !isAdmin)) return <NotFound />;
  if (item.type === 'path') return <Navigate to={`/aprender/trilhas/${item.id}`} replace />;

  const def = typeDef(item.type);
  const area = areaById(item.area);
  const isStory = item.type === 'story';
  const paths = items.filter((p) => p.type === 'path' && fieldList(p, 'items').includes(item.id));
  const related = items.filter((i) => i.id !== item.id && i.type === item.type && (i.area === item.area || item.area === 'geral')).slice(0, 3);
  const showVideo = !!item.videoUrl || item.type === 'video' || isStory;
  const deadline = fieldStr(item, 'deadline');
  const date = fieldStr(item, 'date');
  const isOpp = OPPORTUNITY_TYPES.includes(item.type);
  const NO_CTA = ['glossary', 'story', 'guide', 'school_guide', 'challenge', 'video'];
  const showCta = !NO_CTA.includes(item.type) && (!LEARNING_TYPES.includes(item.type) || isExternal(item.url) || ['course', 'tool', 'material'].includes(item.type));

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: item.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast('Link copiado!');
      }
    } catch {
      /* compartilhamento cancelado */
    }
  };

  const specific = def.fields.filter((f) => !['person', 'abroad', 'links', 'items', 'relatedTo', 'stage', 'context'].includes(f.key) && item.fields[f.key] !== undefined && item.fields[f.key] !== '' && item.fields[f.key] !== null && !(Array.isArray(item.fields[f.key]) && !(item.fields[f.key] as string[]).length));
  const facts = specific.filter((f) => f.kind !== 'list' && f.kind !== 'textarea');
  const lists = specific.filter((f) => f.kind === 'list' || f.kind === 'textarea');
  const links = fieldList(item, 'links').map((l) => { const [t, u] = l.split('|').map((s) => s.trim()); return { t, u: u ?? t }; });

  return (
    <article>
      <div className="border-b border-line bg-white">
        <div className="container-x py-6 sm:py-10">
          <button onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          {item.status !== 'published' && <div className="mb-4"><Notice tone="warn">Pré-visualização do administrador: este conteúdo está como <strong>{item.status === 'draft' ? 'rascunho' : 'arquivado'}</strong> e não aparece para estudantes.</Notice></div>}
          <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Chip className={def.color}>{def.label}</Chip>
                {item.area !== 'geral' && <Chip className={cx(area.soft, area.text)}>{area.name}</Chip>}
                {item.category && <Chip>{item.category}</Chip>}
                {item.demo && <DemoTag />}
              </div>
              {isStory ? (
                <div className="mt-5 flex items-center gap-4">
                  {item.cover ? <img src={item.cover} alt={`Foto de ${fieldStr(item, 'person')}`} className="h-20 w-20 rounded-full object-cover" /> : <Avatar name={fieldStr(item, 'person')} className="h-20 w-20 text-2xl" />}
                  <div>
                    <p className="font-display text-xl font-bold">{fieldStr(item, 'person')}</p>
                    <p className="text-sm text-ink-muted">{[fieldStr(item, 'role'), fieldStr(item, 'institution'), fieldStr(item, 'country')].filter(Boolean).join(' · ')}</p>
                  </div>
                </div>
              ) : null}
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{item.title}</h1>
              <p className="mt-3 text-lg text-ink-soft">{item.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.level && <Chip>{levelLabel(item.level)}</Chip>}
                {item.duration && <Chip icon={Clock}>{item.duration}</Chip>}
                <OppStatus item={item} />
                {deadline && <Chip icon={CalendarDays} className="bg-tang-50 text-tang-700">Prazo: {formatDate(deadline)}</Chip>}
                {date && <Chip icon={CalendarDays} className="bg-grape-50 text-grape-700">{formatDate(date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</Chip>}
                {fieldStr(item, 'location') && <Chip icon={MapPin}>{fieldStr(item, 'location')}</Chip>}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {showCta && <ExternalCta url={item.url} label={def.cta} />}
                {LEARNING_TYPES.includes(item.type) && <CompleteButton id={item.id} />}
                {item.type === 'challenge' && <Link to="/desafio" className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-white">Ir para o desafio</Link>}
                <BookmarkButton id={item.id} className="h-12 w-12" />
                <button onClick={share} className="grid h-12 w-12 place-items-center rounded-full bg-white ring-1 ring-line hover:bg-paper" aria-label="Compartilhar"><Share2 className="h-[18px] w-[18px]" /></button>
              </div>
            </div>
            <div>
              {showVideo ? <VideoEmbed item={item} /> : item.type !== 'glossary' && <div className="aspect-[16/10] overflow-hidden rounded-3xl shadow-lift"><Cover item={item} size="lg" /></div>}
            </div>
          </div>
        </div>
      </div>

      <div className="container-x grid gap-10 py-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-8">
          {item.body && (
            <div className="prose-mm max-w-none text-[17px]">
              {item.body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}
          <TestimonialRow items={testimonials} title="Vídeo de quem já viveu isso" />
          {lists.map((f) => {
            const values = f.kind === 'textarea' ? [fieldStr(item, f.key)] : fieldList(item, f.key);
            const ordered = LIST_ORDERED.has(f.key);
            return (
              <section key={f.key}>
                <h2 className="mb-3 font-display text-xl font-bold">{f.label}</h2>
                {f.kind === 'textarea' ? <p className="text-ink-soft">{values[0]}</p> : ordered ? (
                  <ol className="space-y-2">
                    {values.map((v, i) => (
                      <li key={i} className="flex gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-line"><span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white', area.solid)}>{i + 1}</span><span className="pt-0.5 text-ink-soft">{v}</span></li>
                    ))}
                  </ol>
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {values.map((v, i) => <li key={i} className="flex gap-2 rounded-2xl bg-white p-3 text-sm text-ink-soft ring-1 ring-line"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-grape-500" />{v}</li>)}
                  </ul>
                )}
              </section>
            );
          })}
          {links.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-xl font-bold">Links úteis</h2>
              <ul className="space-y-2">{links.map((l) => <li key={l.u}>{isExternal(l.u) ? <a href={l.u} target="_blank" rel="noopener noreferrer" className="font-semibold text-eletric-600 underline underline-offset-2">{l.t}</a> : <span>{l.t}</span>}</li>)}</ul>
            </section>
          )}
          {(isOpp || ['scholarship', 'university'].includes(item.type) || item.fields.abroad) && (
            <Notice tone="warn">Requisitos, prazos e condições podem mudar. Confirme sempre na página oficial antes de se inscrever.</Notice>
          )}
        </div>
        <aside className="space-y-4">
          {facts.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 font-display font-bold">Informações</h2>
              <dl className="space-y-3 text-sm">
                {facts.map((f) => {
                  const v = item.fields[f.key];
                  const display = f.kind === 'boolean' ? (v ? 'Sim' : 'Não') : f.kind === 'date' ? formatDate(String(v)) : String(v);
                  return (
                    <div key={f.key} className="flex justify-between gap-4 border-b border-line pb-2 last:border-0">
                      <dt className="text-ink-muted">{f.label}</dt>
                      <dd className="text-right font-semibold text-ink">{display}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}
          {paths.map((p) => (
            <Link key={p.id} to={`/aprender/trilhas/${p.id}`} className="flex items-center gap-3 rounded-3xl bg-grape-50 p-4 ring-1 ring-grape-100 hover:bg-grape-100">
              <RouteIcon className="h-5 w-5 text-grape-700" />
              <span className="text-sm"><span className="block text-xs font-bold uppercase tracking-wider text-grape-700">Faz parte da trilha</span><strong>{p.title}</strong></span>
            </Link>
          ))}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">{item.tags.map((t) => <Link key={t} to={`/busca?q=${encodeURIComponent(t)}`} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-soft ring-1 ring-line hover:text-ink">#{t}</Link>)}</div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-x pb-12">
          <SectionHeader title="Veja também" />
          <Grid>{related.map((r: ContentItem) => <ItemCard key={r.id} item={r} />)}</Grid>
        </section>
      )}
    </article>
  );
}
