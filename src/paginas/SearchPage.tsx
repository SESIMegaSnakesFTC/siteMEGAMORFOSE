import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Compass, Search } from 'lucide-react';
import { EmptyState, FilterPills, ItemList, useSeo } from '../componentes/ui';
import { searchAll } from '../scripts/search';
import { TYPES } from '../scripts/contentTypes';
import { useStore } from '../scripts/store';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [draft, setDraft] = useState(q);
  const [type, setType] = useState('todos');
  const { items } = useStore();
  useSeo(q ? `Busca: ${q}` : 'Buscar');
  const res = searchAll(items, q);
  const types = [...new Set(res.items.map((i) => i.type))];
  const shown = res.items.filter((i) => type === 'todos' || i.type === type);

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold">Buscar</h1>
      <form onSubmit={(e) => { e.preventDefault(); setType('todos'); setParams(draft.trim() ? { q: draft.trim() } : {}); }} className="mt-4 flex gap-2" role="search">
        <span className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          <input value={draft} onChange={(e) => setDraft(e.target.value)} className="input h-12 pl-12 text-base" placeholder="O que você quer aprender ou encontrar?" aria-label="Termo de busca" />
        </span>
        <button className="h-12 rounded-full bg-ink px-6 font-semibold text-white">Buscar</button>
      </form>
      {q && (
        <>
          <p className="mt-6 text-sm text-ink-muted" aria-live="polite">{res.items.length + res.pages.length} resultado(s) para “{q}”</p>
          {res.pages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {res.pages.map((p) => <Link key={p.to} to={p.to} className="inline-flex items-center gap-2 rounded-full bg-grape-50 px-4 py-2 text-sm font-semibold text-grape-700 hover:bg-grape-100"><Compass className="h-4 w-4" /> {p.title}</Link>)}
            </div>
          )}
          {types.length > 1 && <div className="mt-6"><FilterPills label="Tipo" value={type} onChange={setType} options={[{ value: 'todos', label: 'Todos' }, ...TYPES.filter((t) => types.includes(t.type)).map((t) => ({ value: t.type, label: t.plural }))]} /></div>}
          <div className="mt-6">
            <ItemList items={shown} empty={<EmptyState title="Nada encontrado" text="Tente palavras mais simples, como “robô”, “curso” ou “bolsa”." />} />
          </div>
        </>
      )}
    </div>
  );
}
