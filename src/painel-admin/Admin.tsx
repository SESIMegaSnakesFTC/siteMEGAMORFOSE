import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Archive, ArrowLeft, Check, Copy, Eye, FilePlus2, Home, LayoutDashboard, ListFilter, MessageSquareWarning, Pencil, RotateCcw,
  Search, Star, Trash2, Upload, X,
} from 'lucide-react';
import { backend, newId } from '../scripts/backend';
import { AREA_OPTIONS, areaById, LEVELS } from '../scripts/areas';
import { TYPES, typeDef, type FieldDef } from '../scripts/contentTypes';
import { norm } from '../scripts/search';
import { useStore } from '../scripts/store';
import type { CommunityPost, ContentItem, ContentType, FieldValue, Status } from '../scripts/types';
import { btn, Chip, cx, DemoTag, embedUrl, formatDate, Notice, TYPE_ICON, useSeo, Cover } from '../componentes/ui';

const STATUS_LABEL: Record<Status, string> = { draft: 'Rascunho', published: 'Publicado', archived: 'Arquivado' };
const STATUS_COLOR: Record<Status, string> = { draft: 'bg-sun-100 text-sun-700', published: 'bg-leaf-50 text-leaf-700', archived: 'bg-ink/5 text-ink-muted' };

export default function Admin() {
  useSeo('Painel administrativo');
  const { mode } = useStore();
  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-grape-600">Equipe MegaMorfose</p>
          <h1 className="font-display text-3xl font-bold">Painel administrativo</h1>
        </div>
        <nav aria-label="Painel" className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none]">
          {[
            ['/admin', 'Visão geral', LayoutDashboard, true],
            ['/admin/conteudos', 'Conteúdos', ListFilter, false],
            ['/admin/novo', 'Novo conteúdo', FilePlus2, false],
            ['/admin/home', 'Home', Home, false],
            ['/admin/moderacao', 'Moderação', MessageSquareWarning, false],
          ].map(([to, label, Icon, end]) => {
            const I = Icon as typeof Home;
            return (
              <NavLink key={to as string} to={to as string} end={end as boolean} className={({ isActive }) => cx('flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold', isActive ? 'bg-ink text-white' : 'bg-white text-ink-soft ring-1 ring-line hover:text-ink')}>
                <I className="h-4 w-4" /> {label as string}
              </NavLink>
            );
          })}
        </nav>
      </div>
      {mode === 'demo' && <div className="mb-6"><Notice tone="warn">Modo demonstração: as alterações ficam salvas apenas neste navegador. Configure o Supabase para que toda a equipe edite o mesmo conteúdo.</Notice></div>}
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="conteudos" element={<ContentList />} />
        <Route path="novo" element={<TypePicker />} />
        <Route path="novo/:type" element={<Editor />} />
        <Route path="editar/:id" element={<Editor />} />
        <Route path="home" element={<HomeManager />} />
        <Route path="moderacao" element={<Moderation />} />
      </Routes>
    </div>
  );
}

// ─────────────── Visão geral ───────────────

function Dashboard() {
  const { allItems, mode, reload, toast } = useStore();
  const [pending, setPending] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => { backend.listPosts(true).then((p) => setPending(p.filter((x) => x.status === 'pending').length)).catch(() => {}); }, []);
  const by = (s: Status) => allItems.filter((i) => i.status === s).length;
  const demoCount = allItems.filter((i) => i.demo).length;
  const groups = [...new Set(TYPES.map((t) => t.group))];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ['Total', allItems.length, 'text-ink'],
          ['Publicados', by('published'), 'text-leaf-600'],
          ['Rascunhos', by('draft'), 'text-sun-700'],
          ['Arquivados', by('archived'), 'text-ink-muted'],
          ['Aguardando moderação', pending, 'text-bubble-600'],
        ].map(([l, v, c]) => <div key={l as string} className="card p-4"><p className={cx('font-display text-3xl font-bold', c as string)}>{v}</p><p className="text-sm text-ink-soft">{l}</p></div>)}
      </div>
      {demoCount > 0 && (
        <Notice tone="warn">
          Há <strong>{demoCount}</strong> conteúdos demonstrativos (fictícios). Substitua-os por conteúdos reais ou arquive-os.{' '}
          <Link to="/admin/conteudos?demo=1" className="font-bold underline">Ver demonstrativos</Link>
        </Notice>
      )}
      {groups.map((g) => (
        <section key={g}>
          <h2 className="mb-3 font-display text-lg font-bold">{g}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TYPES.filter((t) => t.group === g).map((t) => {
              const Icon = TYPE_ICON[t.type];
              const n = allItems.filter((i) => i.type === t.type).length;
              return (
                <div key={t.type} className="card flex items-center gap-3 p-4">
                  <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', t.color)}><Icon className="h-5 w-5" /></span>
                  <Link to={`/admin/conteudos?tipo=${t.type}`} className="min-w-0 flex-1 hover:underline"><p className="truncate text-sm font-bold">{t.plural}</p><p className="text-xs text-ink-muted">{n} itens</p></Link>
                  <Link to={`/admin/novo/${t.type}`} className="grid h-9 w-9 place-items-center rounded-full bg-paper ring-1 ring-line hover:bg-grape-50" aria-label={`Adicionar ${t.label}`}><FilePlus2 className="h-4 w-4" /></Link>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {mode === 'demo' && backend.resetDemo && (
        confirmReset ? (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-sun-50 p-3 text-sm">
            <span className="font-semibold text-sun-700">Restaurar o conteúdo de demonstração? Suas alterações locais serão perdidas.</span>
            <button onClick={async () => { await backend.resetDemo!(); await reload(); setConfirmReset(false); toast('Conteúdo de demonstração restaurado.', 'info'); }} className={btn('dark', 'sm')}>Sim, restaurar</button>
            <button onClick={() => setConfirmReset(false)} className={btn('ghost', 'sm')}>Cancelar</button>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} className={btn('secondary', 'sm')}><RotateCcw className="h-4 w-4" /> Restaurar conteúdo de demonstração</button>
        )
      )}
    </div>
  );
}

// ─────────────── Lista ───────────────

function ContentList() {
  const { allItems, saveItem, deleteItem, toast } = useStore();
  const [params, setParams] = useSearchParams();
  const type = params.get('tipo') ?? '';
  const status = params.get('status') ?? '';
  const demoOnly = params.get('demo') === '1';
  const [q, setQ] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const set = (k: string, v: string) => { const p = new URLSearchParams(params); if (v) p.set(k, v); else p.delete(k); setParams(p, { replace: true }); };

  const list = useMemo(
    () => allItems
      .filter((i) => (!type || i.type === type) && (!status || i.status === status) && (!demoOnly || i.demo) && (!q || norm(`${i.title} ${i.id}`).includes(norm(q))))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [allItems, type, status, demoOnly, q],
  );

  const quick = async (item: ContentItem, patch: Partial<ContentItem>, msg: string) => {
    try { await saveItem({ ...item, ...patch }); toast(msg); } catch (e) { toast(e instanceof Error ? e.message : 'Erro ao salvar.', 'error'); }
  };

  return (
    <div>
      <div className="mb-4 grid gap-3 rounded-3xl bg-white p-4 shadow-card ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <label className="relative"><span className="sr-only">Buscar</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título ou ID" className="input pl-9" /></label>
        <select value={type} onChange={(e) => set('tipo', e.target.value)} className="input" aria-label="Tipo"><option value="">Todos os tipos</option>{TYPES.map((t) => <option key={t.type} value={t.type}>{t.plural}</option>)}</select>
        <select value={status} onChange={(e) => set('status', e.target.value)} className="input" aria-label="Status"><option value="">Todos os status</option>{Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <Link to={type ? `/admin/novo/${type}` : '/admin/novo'} className={btn('primary')}><FilePlus2 className="h-4 w-4" /> Novo</Link>
      </div>
      <div className="mb-3 flex items-center justify-between text-sm text-ink-muted">
        <span>{list.length} item(ns)</span>
        <label className="flex items-center gap-2"><input type="checkbox" checked={demoOnly} onChange={(e) => set('demo', e.target.checked ? '1' : '')} className="h-4 w-4 rounded" /> Só demonstrativos</label>
      </div>
      <ul className="space-y-2">
        {list.map((i) => {
          const def = typeDef(i.type);
          return (
            <li key={i.id} className="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-line sm:flex-row sm:items-center">
              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-xl"><Cover item={i} size="sm" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Chip className={def.color}>{def.label}</Chip>
                  <Chip className={STATUS_COLOR[i.status]}>{STATUS_LABEL[i.status]}</Chip>
                  {i.featured && <Chip className="bg-sun-100 text-sun-700" icon={Star}>Destaque</Chip>}
                  {i.demo && <DemoTag />}
                </div>
                <p className="mt-1 truncate font-semibold">{i.title}</p>
                <p className="text-xs text-ink-muted">ID: <code className="select-all">{i.id}</code> · {areaById(i.area).short} · atualizado {formatDate(i.updatedAt)}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                <IconBtn label="Editar" to={`/admin/editar/${i.id}`}><Pencil className="h-4 w-4" /></IconBtn>
                <IconBtn label="Visualizar" to={i.type === 'path' ? `/aprender/trilhas/${i.id}` : `/conteudo/${i.id}`}><Eye className="h-4 w-4" /></IconBtn>
                <IconBtn label={i.featured ? 'Remover destaque' : 'Destacar'} onClick={() => quick(i, { featured: !i.featured }, i.featured ? 'Destaque removido.' : 'Destacado!')} active={i.featured}><Star className="h-4 w-4" /></IconBtn>
                {i.status !== 'published' ? (
                  <IconBtn label="Publicar" onClick={() => quick(i, { status: 'published' }, 'Publicado!')}><Check className="h-4 w-4" /></IconBtn>
                ) : (
                  <IconBtn label="Arquivar" onClick={() => quick(i, { status: 'archived' }, 'Arquivado.')}><Archive className="h-4 w-4" /></IconBtn>
                )}
                <IconBtn label="Duplicar" onClick={() => quick({ ...i, id: `${i.type}-${newId().slice(0, 8)}`, createdAt: new Date().toISOString() }, { title: `${i.title} (cópia)`, status: 'draft', featured: false }, 'Cópia criada como rascunho.')}><Copy className="h-4 w-4" /></IconBtn>
                {confirmId === i.id ? (
                  <span className="flex items-center gap-1 rounded-full bg-bubble-50 px-2 text-xs font-semibold text-bubble-700">
                    Excluir?
                    <button onClick={async () => { await deleteItem(i.id); setConfirmId(null); toast('Excluído.', 'info'); }} className="rounded-full px-2 py-1 hover:bg-bubble-100">Sim</button>
                    <button onClick={() => setConfirmId(null)} className="rounded-full px-2 py-1 hover:bg-bubble-100">Não</button>
                  </span>
                ) : (
                  <IconBtn label="Excluir" onClick={() => setConfirmId(i.id)} danger><Trash2 className="h-4 w-4" /></IconBtn>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {!list.length && <p className="rounded-2xl bg-white p-8 text-center text-ink-muted ring-1 ring-line">Nenhum conteúdo encontrado.</p>}
    </div>
  );
}

function IconBtn({ children, label, onClick, to, active, danger }: { children: ReactNode; label: string; onClick?: () => void; to?: string; active?: boolean; danger?: boolean }) {
  const cls = cx('grid h-9 w-9 place-items-center rounded-full ring-1 ring-line transition', active ? 'bg-sun-100 text-sun-700' : danger ? 'hover:bg-bubble-50 hover:text-bubble-700' : 'hover:bg-paper');
  return to ? <Link to={to} className={cls} aria-label={label} title={label}>{children}</Link> : <button onClick={onClick} className={cls} aria-label={label} title={label}>{children}</button>;
}

// ─────────────── Escolher tipo ───────────────

function TypePicker() {
  const groups = [...new Set(TYPES.map((t) => t.group))];
  return (
    <div className="space-y-8">
      <p className="text-ink-soft">Escolha o tipo de conteúdo. Cada tipo tem um formulário com os campos adequados.</p>
      {groups.map((g) => (
        <section key={g}>
          <h2 className="mb-3 font-display text-lg font-bold">{g}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TYPES.filter((t) => t.group === g).map((t) => {
              const Icon = TYPE_ICON[t.type];
              return (
                <Link key={t.type} to={`/admin/novo/${t.type}`} className="card flex items-center gap-3 p-4 transition hover:shadow-lift">
                  <span className={cx('grid h-10 w-10 place-items-center rounded-xl', t.color)}><Icon className="h-5 w-5" /></span>
                  <span className="font-semibold">{t.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ─────────────── Editor ───────────────

const blank = (type: ContentType): ContentItem => ({
  id: '', type, title: '', summary: '', body: '', area: 'geral', tags: [], status: 'draft', featured: false, demo: false, fields: {},
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
});

const slugify = (s: string) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

function Editor() {
  const { type: typeParam, id } = useParams();
  const { byId, saveItem, toast, allItems } = useStore();
  const nav = useNavigate();
  const existing = id ? byId(id) : undefined;
  const type = (existing?.type ?? typeParam) as ContentType;
  const def = TYPES.find((t) => t.type === type);
  const [item, setItem] = useState<ContentItem>(() => existing ?? blank(type));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!def || (id && !existing)) return <Notice tone="warn">Conteúdo não encontrado. <Link to="/admin/conteudos" className="font-bold underline">Voltar para a lista</Link></Notice>;

  const set = <K extends keyof ContentItem>(k: K, v: ContentItem[K]) => setItem((s) => ({ ...s, [k]: v }));
  const setField = (k: string, v: FieldValue) => setItem((s) => ({ ...s, fields: { ...s.fields, [k]: v } }));
  const has = (c: string) => def.common.includes(c as never);

  const validate = () => {
    const e: Record<string, string> = {};
    if (item.title.trim().length < 3) e.title = 'Título obrigatório (mínimo 3 caracteres).';
    if (item.type !== 'glossary' && item.summary.trim().length < 10) e.summary = 'Escreva uma descrição curta (mínimo 10 caracteres).';
    if (item.type === 'glossary' && !item.summary.trim()) e.summary = 'Escreva a definição.';
    const urlOk = (u?: string) => !u || /^https:\/\/[^\s]+\.[^\s]+/.test(u);
    if (!urlOk(item.url)) e.url = 'Use um link completo começando com https://';
    if (item.videoUrl && !embedUrl(item.videoUrl)) e.videoUrl = 'Cole um link do YouTube ou Vimeo.';
    if (item.cover && !item.cover.startsWith('data:') && !urlOk(item.cover)) e.cover = 'Use um link de imagem começando com https://';
    def.fields.forEach((f) => {
      const v = item.fields[f.key];
      if (f.required && (v === undefined || v === '' || (Array.isArray(v) && !v.length))) e[`f.${f.key}`] = `${f.label} é obrigatório.`;
    });
    if (item.type === 'path') {
      const missing = ((item.fields.items as string[]) ?? []).filter((x) => !byId(x));
      if (missing.length) e['f.items'] = `IDs não encontrados: ${missing.join(', ')}`;
    }
    if (!id) {
      const newIdVal = item.id || slugify(item.title);
      if (allItems.some((x) => x.id === newIdVal)) e.id = 'Já existe um conteúdo com este ID. Altere o ID.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (status?: Status) => {
    if (!validate()) { toast('Revise os campos destacados.', 'error'); return; }
    setSaving(true);
    try {
      const final = { ...item, id: item.id || slugify(item.title) || `${type}-${newId().slice(0, 8)}`, status: status ?? item.status, title: item.title.trim(), summary: item.summary.trim() };
      await saveItem(final);
      toast(final.status === 'published' ? 'Publicado!' : 'Salvo!');
      nav(`/admin/conteudos?tipo=${type}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Erro ao salvar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Escolha um arquivo de imagem.', 'error');
    setUploading(true);
    try { set('cover', await backend.uploadImage(file)); } catch (e) { toast(e instanceof Error ? e.message : 'Falha no envio.', 'error'); } finally { setUploading(false); }
  };

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-xs font-semibold text-bubble-700" role="alert">{errors[k]}</p> : null);
  const submit = (e: FormEvent) => { e.preventDefault(); save(); };

  return (
    <form onSubmit={submit} noValidate>
      <Link to="/admin/conteudos" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> Conteúdos</Link>
      <h2 className="mb-6 font-display text-2xl font-bold">{id ? 'Editar' : 'Novo'}: {def.label}</h2>
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <h3 className="font-display font-bold">Informações principais</h3>
            <label className="block"><span className="label">Título *</span><input className="input" value={item.title} onChange={(e) => set('title', e.target.value)} aria-invalid={!!errors.title} /><Err k="title" /></label>
            {!id && (
              <label className="block"><span className="label">ID (endereço da página)</span><input className="input font-mono" placeholder={slugify(item.title) || 'gerado-a-partir-do-titulo'} value={item.id} onChange={(e) => set('id', slugify(e.target.value))} /><span className="mt-1 block text-xs text-ink-muted">Opcional. Usado no link: /conteudo/{item.id || slugify(item.title) || '…'}</span><Err k="id" /></label>
            )}
            <label className="block"><span className="label">{item.type === 'glossary' ? 'Definição *' : 'Descrição curta *'}</span><textarea className="textarea" rows={2} maxLength={280} value={item.summary} onChange={(e) => set('summary', e.target.value)} aria-invalid={!!errors.summary} /><span className="mt-1 block text-right text-xs text-ink-muted">{item.summary.length}/280</span><Err k="summary" /></label>
            {item.type !== 'glossary' && (
              <label className="block"><span className="label">Texto completo</span><textarea className="textarea" rows={6} value={item.body ?? ''} onChange={(e) => set('body', e.target.value)} placeholder="Deixe uma linha em branco entre parágrafos." /></label>
            )}
          </section>

          {def.fields.length > 0 && (
            <section className="card space-y-4 p-5">
              <h3 className="font-display font-bold">Campos de {def.label.toLowerCase()}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {def.fields.map((f) => <FieldInput key={f.key} f={f} value={item.fields[f.key]} onChange={(v) => setField(f.key, v)} error={errors[`f.${f.key}`]} />)}
              </div>
            </section>
          )}

          {(has('url') || has('videoUrl')) && (
            <section className="card space-y-4 p-5">
              <h3 className="font-display font-bold">Links</h3>
              {has('url') && <label className="block"><span className="label">Link externo oficial</span><input className="input" type="url" placeholder="https://" value={item.url ?? ''} onChange={(e) => set('url', e.target.value.trim() || undefined)} /><span className="mt-1 block text-xs text-ink-muted">Abre em nova aba. Sem link, o botão mostra “link ainda não cadastrado”.</span><Err k="url" /></label>}
              {has('videoUrl') && (
                <label className="block"><span className="label">Vídeo (YouTube ou Vimeo)</span><input className="input" type="url" placeholder="https://www.youtube.com/watch?v=…" value={item.videoUrl ?? ''} onChange={(e) => set('videoUrl', e.target.value.trim() || undefined)} /><Err k="videoUrl" />
                  {embedUrl(item.videoUrl) && <iframe src={embedUrl(item.videoUrl)!} title="Pré-visualização do vídeo" className="mt-3 aspect-video w-full rounded-2xl" />}
                </label>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="card space-y-4 p-5 lg:sticky lg:top-20">
            <h3 className="font-display font-bold">Publicação</h3>
            <label className="block"><span className="label">Status</span>
              <select className="input" value={item.status} onChange={(e) => set('status', e.target.value as Status)}>{Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!!item.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 rounded" /> Destacar (Home e seções)</label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!!item.demo} onChange={(e) => set('demo', e.target.checked)} className="h-4 w-4 rounded" /> Marcar como “Conteúdo demonstrativo”</label>
            <div className="flex flex-col gap-2 pt-2">
              <button type="button" disabled={saving} onClick={() => save('published')} className={btn('primary')}>Salvar e publicar</button>
              <button type="button" disabled={saving} onClick={() => save('draft')} className={btn('secondary')}>Salvar como rascunho</button>
            </div>
          </section>

          <section className="card space-y-4 p-5">
            <h3 className="font-display font-bold">Organização</h3>
            <label className="block"><span className="label">Área STEM</span><select className="input" value={item.area} onChange={(e) => set('area', e.target.value as ContentItem['area'])}>{AREA_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select></label>
            {has('category') && def.categories && (
              <label className="block"><span className="label">Categoria</span><select className="input" value={item.category ?? ''} onChange={(e) => set('category', e.target.value || undefined)}><option value="">—</option>{def.categories.map((c) => <option key={c}>{c}</option>)}</select></label>
            )}
            {has('level') && <label className="block"><span className="label">Nível</span><select className="input" value={item.level ?? ''} onChange={(e) => set('level', (e.target.value || undefined) as ContentItem['level'])}><option value="">—</option>{LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}</select></label>}
            {has('duration') && <label className="block"><span className="label">Duração estimada</span><input className="input" placeholder="Ex.: 15 min, 2 h, 4 semanas" value={item.duration ?? ''} onChange={(e) => set('duration', e.target.value || undefined)} /></label>}
            <label className="block"><span className="label">Tags</span><input className="input" placeholder="separadas por vírgula" value={item.tags.join(', ')} onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} /></label>
          </section>

          {item.type !== 'glossary' && (
            <section className="card space-y-3 p-5">
              <h3 className="font-display font-bold">{item.type === 'story' ? 'Foto da pessoa' : 'Imagem de capa'}</h3>
              <div className="aspect-video overflow-hidden rounded-2xl"><Cover item={item} /></div>
              <input className="input" placeholder="https://… (link da imagem)" value={item.cover?.startsWith('data:') ? '(imagem enviada)' : item.cover ?? ''} onChange={(e) => set('cover', e.target.value.trim() || undefined)} />
              <Err k="cover" />
              <div className="flex gap-2">
                <label className={cx(btn('secondary', 'sm'), 'cursor-pointer')}><Upload className="h-4 w-4" /> {uploading ? 'Enviando…' : 'Enviar imagem'}<input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} /></label>
                {item.cover && <button type="button" onClick={() => set('cover', undefined)} className={btn('ghost', 'sm')}><X className="h-4 w-4" /> Remover</button>}
              </div>
              <p className="text-xs text-ink-muted">Sem imagem, uma ilustração automática com a cor da área é usada. Use apenas imagens com autorização de uso.</p>
            </section>
          )}
        </aside>
      </div>
    </form>
  );
}

function FieldInput({ f, value, onChange, error }: { f: FieldDef; value: FieldValue; onChange: (v: FieldValue) => void; error?: string }) {
  const wide = f.kind === 'list' || f.kind === 'textarea';
  const label = <span className="label">{f.label}{f.required && ' *'}</span>;
  const help = f.help && <span className="mt-1 block text-xs text-ink-muted">{f.help}</span>;
  const err = error && <p className="mt-1 text-xs font-semibold text-bubble-700" role="alert">{error}</p>;
  let input: ReactNode;
  switch (f.kind) {
    case 'boolean':
      return <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold"><input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded" /> {f.label}</label>;
    case 'select':
      input = <select className="input" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || undefined)}><option value="">—</option>{f.options!.map((o) => <option key={o}>{o}</option>)}</select>;
      break;
    case 'date':
      input = <input type="date" className="input" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || undefined)} />;
      break;
    case 'number':
      input = <input type="number" className="input" value={value === undefined || value === null ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} />;
      break;
    case 'list':
      input = <textarea className="textarea font-mono text-[13px]" rows={4} value={Array.isArray(value) ? value.join('\n') : (value as string) ?? ''} onChange={(e) => onChange(e.target.value.split('\n').map((x) => x.trimStart()).filter((x, i, arr) => x || i === arr.length - 1))} />;
      break;
    case 'textarea':
      input = <textarea className="textarea" rows={3} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />;
      break;
    default:
      input = <input className="input" type={f.kind === 'url' ? 'url' : 'text'} placeholder={f.placeholder} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
  return <label className={cx('block', wide && 'sm:col-span-2')}>{label}{input}{help}{err}</label>;
}

// ─────────────── Home ───────────────

function HomeManager() {
  const { allItems, saveItem, toast } = useStore();
  const sections: { title: string; types: ContentType[]; note: string }[] = [
    { title: 'Oportunidades para você', types: ['opportunity', 'program', 'job', 'competition', 'scholarship'], note: 'Até 4 itens destacados aparecem na Home.' },
    { title: 'Histórias que transformam', types: ['story'], note: 'Até 3 histórias destacadas.' },
    { title: 'Aprenda algo novo', types: ['video', 'tutorial'], note: 'Os 3 mais recentes (destacados primeiro).' },
    { title: 'Desafio do mês', types: ['challenge'], note: 'O desafio destacado aparece na Home e em /desafio.' },
    { title: 'Trilhas', types: ['path'], note: 'Destaques na central de aprendizado.' },
  ];
  return (
    <div className="space-y-8">
      <Notice>A Home é montada automaticamente a partir dos conteúdos <strong>publicados</strong> e <strong>destacados</strong>. Use a estrela para escolher o que aparece em cada seção.</Notice>
      {sections.map((s) => {
        const list = allItems.filter((i) => s.types.includes(i.type) && i.status === 'published');
        return (
          <section key={s.title}>
            <h2 className="font-display text-lg font-bold">{s.title}</h2>
            <p className="mb-3 text-sm text-ink-muted">{s.note}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {list.map((i) => (
                <li key={i.id} className={cx('flex items-center gap-3 rounded-2xl bg-white p-3 ring-1', i.featured ? 'ring-sun-400' : 'ring-line')}>
                  <button onClick={async () => { await saveItem({ ...i, featured: !i.featured }); toast(i.featured ? 'Removido da Home.' : 'Adicionado aos destaques!'); }} aria-pressed={i.featured} aria-label={i.featured ? 'Remover destaque' : 'Destacar'} className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-full', i.featured ? 'bg-sun-400 text-ink' : 'bg-paper text-ink-muted ring-1 ring-line')}><Star className="h-4 w-4" /></button>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{i.title}</span>
                  <Chip className={typeDef(i.type).color}>{typeDef(i.type).label}</Chip>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

// ─────────────── Moderação ───────────────

function Moderation() {
  const { toast } = useStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<CommunityPost['status']>('pending');
  const load = () => backend.listPosts(true).then(setPosts);
  useEffect(() => { load(); }, []);
  const list = posts.filter((p) => p.status === filter);
  const act = async (p: CommunityPost, status: CommunityPost['status']) => { await backend.moderatePost(p.id, status); toast(status === 'approved' ? 'Publicação aprovada.' : 'Publicação recusada.', 'info'); load(); };
  return (
    <div>
      <div className="mb-4 flex gap-1">
        {(['pending', 'approved', 'rejected'] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s} className={cx('rounded-full px-3.5 py-2 text-sm font-semibold', filter === s ? 'bg-ink text-white' : 'bg-white ring-1 ring-line')}>
            {{ pending: 'Pendentes', approved: 'Aprovadas', rejected: 'Recusadas' }[s]} ({posts.filter((p) => p.status === s).length})
          </button>
        ))}
      </div>
      <Notice>Antes de aprovar, verifique: sem dados pessoais (telefone, endereço, escola + nome completo), sem links externos, linguagem respeitosa. Publicações com 3 denúncias voltam automaticamente para “Pendentes”. Interesses em colaboração devem ser mediados pela equipe, preferencialmente com um professor ou responsável.</Notice>
      <ul className="mt-4 space-y-3">
        {list.map((p) => (
          <li key={p.id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted"><strong className="text-ink">{p.authorName}</strong> · {formatDate(p.createdAt)} · {p.kind}{p.reports > 0 && <Chip className="bg-bubble-50 text-bubble-700">{p.reports} denúncia(s)</Chip>}</div>
            <p className="mt-2 font-display text-lg font-bold">{p.title}</p>
            <p className="mt-1 whitespace-pre-line text-ink-soft">{p.text}</p>
            <div className="mt-4 flex gap-2">
              {p.status !== 'approved' && <button onClick={() => act(p, 'approved')} className={btn('dark', 'sm')}><Check className="h-4 w-4" /> Aprovar</button>}
              {p.status !== 'rejected' && <button onClick={() => act(p, 'rejected')} className={btn('danger', 'sm')}><X className="h-4 w-4" /> Recusar</button>}
            </div>
          </li>
        ))}
      </ul>
      {!list.length && <p className="mt-4 rounded-2xl bg-white p-8 text-center text-ink-muted ring-1 ring-line">Nada por aqui.</p>}
    </div>
  );
}
