import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { PathCard } from '../componentes/cards';
import { btn, FilterPills, Grid, ItemList, SectionHeader, Select, SkeletonGrid } from '../componentes/ui';
import { AREA_OPTIONS, LEVELS } from '../scripts/areas';
import { LEARNING_TYPES } from '../scripts/contentTypes';
import { norm } from '../scripts/search';
import { useStore } from '../scripts/store';
import type { ContentItem } from '../scripts/types';

const CATS: { value: string; label: string; match: (i: ContentItem) => boolean }[] = [
  { value: 'todos', label: 'Tudo', match: () => true },
  { value: 'cursos', label: 'Cursos gratuitos', match: (i) => i.type === 'course' },
  { value: 'tutoriais', label: 'Tutoriais', match: (i) => i.type === 'tutorial' },
  { value: 'equipe', label: 'Vídeos da equipe', match: (i) => i.type === 'video' },
  { value: 'guias', label: 'Guias para iniciantes', match: (i) => i.type === 'guide' },
  { value: 'ferramentas', label: 'Ferramentas digitais', match: (i) => i.type === 'tool' },
  { value: 'materiais', label: 'Materiais de estudo', match: (i) => i.type === 'material' },
  { value: 'projetos', label: 'Projetos práticos', match: (i) => i.type === 'practice' },
];

// A biblioteca completa (todos os conteúdos com filtros). Fica dentro da página Áreas (/explorar).
export function Library() {
  const { items, data } = useStore();
  const [params, setParams] = useSearchParams();
  const cat = params.get('categoria') ?? 'todos';
  const [area, setArea] = useState(params.get('area') ?? '');
  const [level, setLevel] = useState('');
  const [q, setQ] = useState('');
  const [saved, setSaved] = useState(false);
  const [showLib, setShowLib] = useState(params.has('categoria') || params.has('biblioteca') || params.has('area'));

  const ref = useRef<HTMLElement>(null);
  // Quem chega por um link da biblioteca (?biblioteca, ?categoria, ?area) vai direto para ela.
  useEffect(() => { if (showLib) setTimeout(() => ref.current?.scrollIntoView({ block: 'start' }), 80); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const total = items.filter((i) => LEARNING_TYPES.includes(i.type)).length;
  const library = useMemo(() => {
    const match = CATS.find((c) => c.value === cat)?.match ?? (() => true);
    return items.filter(
      (i) =>
        LEARNING_TYPES.includes(i.type) && match(i) && (!area || i.area === area) && (!level || i.level === level) &&
        (!q || norm(`${i.title} ${i.summary} ${i.tags.join(' ')}`).includes(norm(q))) && (!saved || data.bookmarks.includes(i.id)),
    );
  }, [items, cat, area, level, q, saved, data.bookmarks]);

  return (
    <section ref={ref} id="biblioteca" className="section scroll-mt-20 pt-8">
      <div className="container-x">
        <SectionHeader eyebrow="Já sabe o que procura?" title="Biblioteca completa" text="Todos os vídeos, cursos, tutoriais e materiais, com filtros por categoria, área e nível." />
        {!showLib ? (
          <button onClick={() => setShowLib(true)} className={btn('secondary')}>Abrir a biblioteca ({total} conteúdos)</button>
        ) : (
          <>
            <div className="mb-4">
              <FilterPills label="Categoria" value={cat} onChange={(v) => setParams(v === 'todos' ? { biblioteca: '1' } : { categoria: v }, { replace: true })} options={CATS} />
            </div>
            <div className="mb-6 grid gap-3 rounded-3xl bg-white p-4 shadow-card ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
              <label className="flex flex-col gap-1 text-xs font-semibold text-ink-muted">
                Buscar
                <span className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: Arduino, engrenagens, IA…" className="input h-10 pl-9" />
                </span>
              </label>
              <Select label="Área" value={area} onChange={setArea} options={[{ value: '', label: 'Todas as áreas' }, ...AREA_OPTIONS]} />
              <Select label="Nível" value={level} onChange={setLevel} options={[{ value: '', label: 'Todos os níveis' }, ...LEVELS]} />
              <label className="flex h-10 cursor-pointer items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="h-4 w-4 rounded text-grape-600" /> Só meus favoritos
              </label>
            </div>
            <div className="mb-3 flex items-center justify-between text-sm text-ink-muted">
              <span aria-live="polite">{library.length} conteúdo(s)</span>
              {(area || level || q || saved) && <button onClick={() => { setArea(''); setLevel(''); setQ(''); setSaved(false); }} className="inline-flex items-center gap-1 font-semibold text-grape-700"><X className="h-4 w-4" /> Limpar</button>}
            </div>
            <ItemList items={library} />
          </>
        )}
      </div>
    </section>
  );
}

// Trilhas curtas (sequências de conteúdos para iniciantes).
export function Trails() {
  const { items, loading } = useStore();
  const paths = items.filter((i) => i.type === 'path');
  return (
    <section className="section pb-6">
      <div className="container-x">
        <SectionHeader eyebrow="Atalho" title="Trilhas para começar do zero" text="Cada trilha tem cerca de 5 etapas curtas, na ordem certa. Seu progresso fica salvo." />
        {loading ? <SkeletonGrid n={3} /> : <Grid>{paths.map((p) => <PathCard key={p.id} item={p} />)}</Grid>}
      </div>
    </section>
  );
}
