import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Flag, HandHeart, Lock, MessageSquareOff, Plus, ShieldCheck, Users, Eye } from 'lucide-react';
import { backend } from '../scripts/backend';
import { SEED_GROUPS } from '../dados/seed';
import { AREA_OPTIONS, areaById } from '../scripts/areas';
import { useStore } from '../scripts/store';
import type { AreaId, CommunityPost, PostKind } from '../scripts/types';
import { Avatar, btn, Chip, cx, EmptyState, FilterPills, formatDate, ItemList, PageHero, SectionHeader, useSeo, DemoTag } from '../componentes/ui';

const KINDS: { value: PostKind; label: string; emoji: string }[] = [
  { value: 'projeto', label: 'Projeto', emoji: '🛠️' },
  { value: 'colaboracao', label: 'Procuro parceiros', emoji: '🤝' },
  { value: 'evento', label: 'Evento / encontro', emoji: '📅' },
  { value: 'novidade', label: 'Novidade', emoji: '📣' },
];

export default function Community() {
  useSeo('Comunidade', 'Grupos de estudo, clubes escolares, comunidades por área, mural de projetos e colaboração segura.');
  const { user, data, toggle, toast, items } = useStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<'todos' | PostKind>('todos');
  const [composing, setComposing] = useState(false);

  const load = () => backend.listPosts(false).then(setPosts).finally(() => setLoading(false));
  useEffect(() => { load(); }, [user]);

  const visible = posts.filter((p) => kind === 'todos' || p.kind === kind);
  const events = items.filter((i) => i.type === 'event' && String(i.fields.date) >= new Date().toISOString().slice(0, 10)).sort((a, b) => String(a.fields.date).localeCompare(String(b.fields.date))).slice(0, 3);

  return (
    <>
      <PageHero eyebrow="Comunidade" title="Aprender junto é mais divertido" text="Encontre grupos de estudo, clubes escolares e pessoas com os mesmos interesses para criar projetos juntos, com segurança." gradient="from-bubble-500 to-grape-500" />
      <div className="container-x py-10">
        <section aria-labelledby="seguranca" className="mb-12 grid gap-3 rounded-4xl bg-leaf-50 p-6 ring-1 ring-leaf-100 sm:grid-cols-2 lg:grid-cols-4">
          <h2 id="seguranca" className="sr-only">Como protegemos você</h2>
          {[
            [ShieldCheck, 'Tudo é moderado', 'Publicações só aparecem depois de revisadas pela equipe.'],
            [MessageSquareOff, 'Sem mensagens privadas', 'Não existe chat privado. A colaboração é mediada pela equipe.'],
            [Lock, 'Seus dados protegidos', 'Mostramos só seu primeiro nome. E-mail e cidade nunca aparecem.'],
            [Flag, 'Denuncie', 'Viu algo errado? Use o botão de denúncia: retiramos do ar para análise.'],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <div key={t as string} className="flex gap-3">
                <I className="mt-0.5 h-5 w-5 shrink-0 text-leaf-700" />
                <p className="text-sm"><strong className="block text-leaf-700">{t as string}</strong><span className="text-leaf-700/80">{d as string}</span></p>
              </div>
            );
          })}
        </section>

        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <section aria-labelledby="mural">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="mural" className="font-display text-2xl font-bold">Mural da comunidade</h2>
              {user ? (
                <button onClick={() => setComposing((c) => !c)} className={btn('primary', 'sm')}><Plus className="h-4 w-4" /> Publicar</button>
              ) : (
                <Link to="/entrar?next=/comunidade" className={btn('secondary', 'sm')}>Entre para publicar</Link>
              )}
            </div>
            {composing && user && <Composer onDone={(p) => { setComposing(false); setPosts((list) => [p, ...list]); toast('Enviado! Sua publicação aparece depois da moderação.'); }} />}
            <div className="mb-4"><FilterPills label="Tipo de publicação" value={kind} onChange={setKind} options={[{ value: 'todos', label: 'Tudo' }, ...KINDS.map((k) => ({ value: k.value, label: `${k.emoji} ${k.label}` }))]} /></div>
            {loading ? (
              <div className="space-y-3" aria-hidden>{[1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-3xl bg-white ring-1 ring-line" />)}</div>
            ) : visible.length ? (
              <ul className="space-y-3">
                {visible.map((p) => {
                  const k = KINDS.find((x) => x.value === p.kind)!;
                  const area = areaById(p.area);
                  const interested = data.interests.includes(p.id);
                  return (
                    <li key={p.id} className="card p-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.authorName} className="h-10 w-10 text-sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">{p.authorName}</p>
                          <p className="text-xs text-ink-muted">{formatDate(p.createdAt)}</p>
                        </div>
                        {p.status === 'pending' && <Chip className="bg-sun-100 text-sun-700"><Eye className="mr-0.5 h-3 w-3" /> Aguardando moderação</Chip>}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Chip>{k.emoji} {k.label}</Chip>
                        {p.area !== 'geral' && <Chip className={cx(area.soft, area.text)}>{area.short}</Chip>}
                        {p.authorId === 'seed' && <DemoTag />}
                      </div>
                      <h3 className="mt-2 font-display text-lg font-bold">{p.title}</h3>
                      <p className="mt-1 whitespace-pre-line text-ink-soft">{p.text}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {p.kind === 'colaboracao' && p.authorId !== user?.id && (
                          <button
                            onClick={async () => { if (await toggle('interests', p.id)) toast(interested ? 'Interesse removido.' : 'Interesse registrado! A equipe MegaMorfose vai fazer a ponte com segurança.'); }}
                            aria-pressed={interested}
                            className={btn(interested ? 'secondary' : 'dark', 'sm')}
                          >
                            <HandHeart className="h-4 w-4" /> {interested ? 'Interesse registrado' : 'Tenho interesse'}
                          </button>
                        )}
                        {p.status === 'approved' && (
                          <button
                            onClick={async () => { await backend.reportPost(p.id); toast('Denúncia enviada. Obrigado por cuidar da comunidade.', 'info'); load(); }}
                            className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-bubble-50 hover:text-bubble-700"
                          >
                            <Flag className="h-3.5 w-3.5" /> Denunciar
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState title="Nenhuma publicação aqui ainda" text="Seja a primeira pessoa a compartilhar um projeto!" />
            )}
          </section>

          <aside className="space-y-8">
            <section>
              <h2 className="mb-3 font-display text-xl font-bold">Grupos e comunidades</h2>
              <ul className="space-y-2">
                {SEED_GROUPS.map((g) => {
                  const following = data.groups.includes(g.id);
                  const area = areaById(g.area as AreaId);
                  return (
                    <li key={g.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line">
                      <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white', area.solid)}><Users className="h-5 w-5" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{g.name}</p>
                        <p className="truncate text-xs text-ink-muted">{{ estudo: 'Grupo de estudos', clube: 'Clube escolar', comunidade: 'Comunidade por área' }[g.kind]} · {g.description}</p>
                      </div>
                      <button onClick={async () => { if (await toggle('groups', g.id)) toast(following ? 'Você deixou de seguir.' : `Agora você segue ${g.name}.`); }} aria-pressed={following} className={btn(following ? 'secondary' : 'dark', 'sm')}>
                        {following ? 'Seguindo' : 'Seguir'}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-xs text-ink-muted">Grupos demonstrativos. Clubes reais serão cadastrados pela equipe após verificação com a escola.</p>
            </section>
            <section>
              <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Próximos eventos</h2><Link to="/calendario" className="text-sm font-semibold text-grape-700">Calendário</Link></div>
              <ItemList items={events} cols={2} />
            </section>
            <Link to="/vitrine" className="block rounded-3xl bg-gradient-to-br from-tang-500 to-bubble-500 p-6 text-white shadow-card">
              <p className="font-display text-xl font-bold">Vitrine de projetos</p>
              <p className="mt-1 text-sm text-white/90">Veja o que outros estudantes estão construindo.</p>
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}

function Composer({ onDone }: { onDone: (p: CommunityPost) => void }) {
  const { user } = useStore();
  const [form, setForm] = useState({ kind: 'projeto' as PostKind, area: 'geral' as AreaId, title: '', text: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.title.trim().length < 5) return setError('Dê um título com pelo menos 5 caracteres.');
    if (form.text.trim().length < 10) return setError('Conte um pouco mais (pelo menos 10 caracteres).');
    // Bloqueio simples de dados de contato: a comunicação é sempre mediada pela equipe.
    if (/(\d[\s.-]?){8,}|@\w|https?:\/\/|wa\.me|whats/i.test(`${form.title} ${form.text}`))
      return setError('Por segurança, não publique telefone, e-mail, @ de redes sociais ou links. A equipe faz a ponte entre interessados.');
    setSending(true);
    try {
      onDone(await backend.createPost({ ...form, title: form.title.trim(), text: form.text.trim(), authorId: user!.id, authorName: user!.name.split(' ')[0] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível publicar.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mb-5 animate-fadeup space-y-3 p-5" noValidate>
      <SectionHeader title="Nova publicação" text="Sua publicação será revisada pela equipe antes de aparecer." className="mb-2" />
      <div className="grid gap-3 sm:grid-cols-2">
        <label><span className="label">Tipo</span><select className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as PostKind })}>{KINDS.map((k) => <option key={k.value} value={k.value}>{k.emoji} {k.label}</option>)}</select></label>
        <label><span className="label">Área</span><select className="input" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value as AreaId })}>{AREA_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select></label>
      </div>
      <label className="block"><span className="label">Título</span><input className="input" maxLength={90} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
      <label className="block"><span className="label">Texto</span><textarea className="textarea" rows={4} maxLength={800} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></label>
      {error && <p role="alert" className="text-sm font-semibold text-bubble-700">{error}</p>}
      <div className="flex justify-end"><button disabled={sending} className={btn('primary', 'sm')}>{sending ? 'Enviando…' : 'Enviar para moderação'}</button></div>
    </form>
  );
}
