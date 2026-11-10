import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Circle, Hourglass, MapPin, NotebookPen, Plus, Search,
  Trash2, UserCheck, UserMinus, UserPlus, Users,
} from 'lucide-react';
import { firstName, formatMeeting, RequestMentorButton, useMentorName, useMyPlan } from '../componentes/mentoria';
import { Avatar, btn, cx, EmptyState, ErrorState, FilterPills, Notice, PageHero, ProgressBar, SectionHeader, useSeo } from '../componentes/ui';
import { AREAS, areaById } from '../scripts/areas';
import { backend, emptyPlan, newId } from '../scripts/backend';
import { useStore } from '../scripts/store';
import type { AreaId, MentorPlan, Person, Profile } from '../scripts/types';
import { STAGES } from './AreaPage';

// Mentoria em três telas:
//  • /meu-plano          estudante: próximo passo, encontro, metas e registros
//  • /mentor             hub do mentor: os alunos dele, quem precisa de atenção, agenda
//  • /mentor/aluno/:id   plano de um aluno (mentor dele ou equipe editam)
//  • /equipe             hub da equipe: fila de pedidos, mentores, distribuição de alunos
// Não existe chat: tudo o que é combinado fica no plano, visível para o aluno, o mentor e a equipe.

const DAY = 86_400_000;
const daysSince = (iso?: string) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / DAY) : 999);
const ago = (iso?: string) => {
  const d = daysSince(iso);
  return d >= 999 ? 'nunca' : d === 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} dias`;
};
const AGE: Record<string, string> = { menor13: 'menos de 13', '13a17': '13 a 17 anos', '18mais': '18+' };
const isMentorRole = (p: Profile) => p.role === 'mentor' || p.role === 'admin';
const lineTotal = (p: Profile) => Object.values(p.lineProgress ?? {}).reduce((n, a) => n + a.length, 0);
const linePct = (p: Profile) => {
  const areas = Object.values(p.lineProgress ?? {}).filter((a) => a.length);
  if (!areas.length) return 0;
  return Math.round((Math.max(...areas.map((a) => a.length)) / STAGES.length) * 100);
};
const today = () => new Date().toISOString().slice(0, 10);

export type Alert = { key: string; text: string };
export function alertsFor(person: Person): Alert[] {
  const a: Alert[] = [];
  const p = person.profile;
  if (daysSince(p.lastActiveAt) >= 14) a.push({ key: 'inativo', text: `Sem acessar ${ago(p.lastActiveAt)}` });
  if (!person.plan) a.push({ key: 'sem-plano', text: 'Plano ainda não montado' });
  else if (!person.plan.nextMeeting || new Date(person.plan.nextMeeting).getTime() < Date.now()) a.push({ key: 'sem-encontro', text: 'Sem próximo encontro marcado' });
  return a;
}

const LINK_OPTIONS = [
  { value: '', label: 'Sem link' },
  ...AREAS.map((a) => ({ value: `/explorar/${a.slug}`, label: `Linha de ${a.short}` })),
  { value: '/oportunidades', label: 'Oportunidades' },
  { value: '/oportunidades/olimpiadas', label: 'Olimpíadas e competições' },
  { value: '/futuro-academico', label: 'Futuro acadêmico' },
  { value: '/explorar?biblioteca=1', label: 'Biblioteca de conteúdos' },
];

function usePeople() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setError(null);
    try {
      setPeople(await backend.listPeople());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar.');
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { people, error, reload: load };
}

function Stat({ n, label, tone = 'bg-white' }: { n: number | string; label: string; tone?: string }) {
  return (
    <div className={cx('rounded-3xl p-4 ring-1 ring-line', tone)}>
      <p className="font-display text-3xl font-bold tabular-nums text-ink">{n}</p>
      <p className="text-sm font-semibold text-ink-soft">{label}</p>
    </div>
  );
}

function AreaChips({ ids }: { ids: AreaId[] }) {
  if (!ids.length) return <span className="text-xs text-ink-muted">Sem áreas escolhidas</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {ids.map((id) => { const a = areaById(id); return <span key={id} className={cx('rounded-full px-2 py-0.5 text-[11px] font-bold', a.soft, a.text)}>{a.short}</span>; })}
    </span>
  );
}

function LineProgress({ profile }: { profile: Profile }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {AREAS.map((a) => {
        const done = profile.lineProgress?.[a.id] ?? [];
        return (
          <div key={a.id} className="rounded-2xl bg-paper p-3 ring-1 ring-line">
            <p className={cx('text-xs font-bold', a.text)}>{a.short}</p>
            <p className="mb-2 text-sm font-semibold text-ink">{done.length} de {STAGES.length} etapas</p>
            <ProgressBar pct={(done.length / STAGES.length) * 100} label={`Progresso em ${a.short}`} />
            <p className="mt-2 text-xs text-ink-muted">{done.length ? `Última: ${STAGES[Math.max(...done)]?.title}` : 'Ainda não começou'}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────── Estudante ───────────────────────────────

export function MyPlan() {
  useSeo('Meu plano', 'Seu próximo passo, seus encontros com o mentor e suas metas.');
  const { user, setWantsMentor, toast } = useStore();
  const { plan, setPlan, loading } = useMyPlan();
  const mentor = useMentorName(user?.mentorId);
  const [confirmStop, setConfirmStop] = useState(false);
  if (!user) return null;

  const stop = async () => {
    await setWantsMentor(false);
    setConfirmStop(false);
    toast('Tudo certo. Você continua usando a plataforma sozinho e pode pedir um mentor quando quiser.', 'info');
  };

  if (!user.wantsMentor)
    return (
      <>
        <PageHero eyebrow="Meu plano" title="Você está explorando no seu ritmo" text="Siga as linhas de aprendizagem das áreas quando quiser. Se preferir ter alguém da equipe acompanhando você, peça um mentor." />
        <div className="container-x grid gap-6 py-10 md:grid-cols-2">
          <div className="card space-y-3 p-6">
            <UserCheck className="h-8 w-8 text-grape-600" />
            <h2 className="font-display text-2xl font-bold">Como funciona a mentoria</h2>
            <ul className="space-y-2 text-ink-soft">
              <li>• A equipe escolhe um mentor para você, de acordo com as áreas que você gosta.</li>
              <li>• Vocês se encontram de tempos em tempos, online ou na escola.</li>
              <li>• O mentor combina com você o próximo passo e metas curtas, que aparecem aqui.</li>
              <li>• Não tem chat privado: tudo fica no seu plano, visível para você, o mentor e a equipe.</li>
            </ul>
            <RequestMentorButton />
          </div>
          <div className="card space-y-3 p-6">
            <h2 className="font-display text-xl font-bold">Continuar sozinho</h2>
            <p className="text-ink-soft">Escolha uma área e siga a linha de 6 etapas. Seu progresso fica salvo na sua conta.</p>
            <div className="flex flex-wrap gap-2">{AREAS.map((a) => <Link key={a.id} to={`/explorar/${a.slug}`} className={btn('secondary', 'sm')}>{a.short}</Link>)}</div>
          </div>
        </div>
      </>
    );

  if (!user.mentorId)
    return (
      <>
        <PageHero eyebrow="Meu plano" title="Seu pedido de mentor foi enviado" text="A equipe MegaMorfose vai escolher a pessoa certa para acompanhar você. Quando isso acontecer, seu plano aparece aqui." />
        <div className="container-x grid gap-6 py-10 md:grid-cols-[1.2fr_1fr]">
          <div className="card space-y-4 p-6">
            <Hourglass className="h-8 w-8 text-tang-600" />
            <h2 className="font-display text-2xl font-bold">Enquanto isso</h2>
            <ol className="space-y-2 text-ink-soft">
              <li>1. Escolha as áreas de que você gosta no seu perfil. Isso ajuda a equipe a escolher o mentor.</li>
              <li>2. Comece a etapa "Descubra" de uma área.</li>
              <li>3. Anote dúvidas para levar ao primeiro encontro.</li>
            </ol>
            <div className="flex flex-wrap gap-2">
              <Link to="/minha-jornada/perfil" className={btn('primary', 'sm')}>Escolher minhas áreas</Link>
              <Link to="/explorar" className={btn('secondary', 'sm')}>Ver as áreas</Link>
            </div>
          </div>
          <StopMentoring confirm={confirmStop} setConfirm={setConfirmStop} onStop={stop} label="Cancelar o pedido" />
        </div>
      </>
    );

  const p = plan ?? emptyPlan(user.id);
  const toggle = async (goalId: string, done: boolean) => {
    setPlan({ ...p, goals: p.goals.map((g) => (g.id === goalId ? { ...g, done } : g)) });
    try {
      const next = await backend.toggleGoal(user.id, goalId, done);
      if (next) setPlan(next);
    } catch {
      toast('Não foi possível salvar. Tente novamente.', 'error');
    }
  };
  const doneGoals = p.goals.filter((g) => g.done).length;
  const mentorFirst = mentor ? firstName(mentor) : 'seu mentor';

  return (
    <>
      <PageHero eyebrow="Meu plano" title={`Oi, ${firstName(user.name)}! Este é o seu plano`} text={`Combinado com ${mentor ?? 'seu mentor'}. Ele atualiza o plano a cada encontro.`} />
      <div className="container-x space-y-8 py-10">
        {loading ? <p className="text-ink-muted">Carregando seu plano…</p> : !plan && (
          <Notice>{mentorFirst} ainda vai montar seu plano no primeiro encontro. Enquanto isso, siga a linha de uma área.</Notice>
        )}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-4xl bg-gradient-to-br from-grape-600 to-eletric-600 p-6 text-white shadow-lift sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-white/80">Seu próximo passo</p>
            <h2 className="mt-2 font-display text-2xl font-bold leading-snug sm:text-3xl">{p.nextStep || 'Escolha uma área e comece a etapa Descubra'}</h2>
            <Link to={p.nextStepLink || '/explorar'} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink">Começar agora <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="rounded-4xl border-2 border-dashed border-tang-500/60 bg-tang-50 p-6">
            <CalendarClock className="h-7 w-7 text-tang-600" />
            <p className="mt-3 text-xs font-bold uppercase tracking-[.14em] text-tang-700">Próximo encontro com {mentorFirst}</p>
            {p.nextMeeting && new Date(p.nextMeeting).getTime() > Date.now() - DAY ? (
              <>
                <p className="mt-1 font-display text-2xl font-bold capitalize text-ink">{formatMeeting(p.nextMeeting)}</p>
                {p.meetingPlace && <p className="mt-1 flex items-center gap-1 text-sm text-ink-soft"><MapPin className="h-4 w-4" /> {p.meetingPlace}</p>}
              </>
            ) : <p className="mt-1 text-ink-soft">Ainda sem data. {mentorFirst} vai marcar.</p>}
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Metas combinadas</h2><span className="text-sm font-semibold text-ink-muted">{doneGoals} de {p.goals.length}</span></div>
            {p.goals.length ? (
              <ul className="space-y-2">
                {p.goals.map((g) => (
                  <li key={g.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-paper p-3 ring-1 ring-line">
                      <input type="checkbox" checked={g.done} onChange={(e) => toggle(g.id, e.target.checked)} className="h-5 w-5 rounded text-leaf-600" />
                      <span className={cx('text-sm font-semibold', g.done ? 'text-ink-muted line-through' : 'text-ink')}>{g.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-ink-muted">As metas aparecem aqui depois do encontro.</p>}
          </div>
          <div className="card p-6">
            <h2 className="mb-3 font-display text-xl font-bold">O que foi combinado nos encontros</h2>
            {p.notes.length ? (
              <ol className="space-y-3">
                {[...p.notes].sort((a, b) => b.date.localeCompare(a.date)).map((n) => (
                  <li key={n.id} className="rounded-2xl bg-paper p-3 ring-1 ring-line">
                    <p className="text-xs font-bold text-ink-muted">{new Date(`${n.date}T12:00`).toLocaleDateString('pt-BR')} · {n.authorName}</p>
                    <p className="mt-1 text-sm text-ink">{n.text}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="text-sm text-ink-muted">Nenhum registro ainda.</p>}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Seu progresso nas linhas</h2>
          <LineProgress profile={user} />
        </section>

        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <Notice><span>Seu plano é visto só por você, por {mentorFirst} e pela equipe MegaMorfose. Não existe chat privado. Se algo te deixar desconfortável, fale com a equipe ou com seu responsável.</span></Notice>
          <StopMentoring confirm={confirmStop} setConfirm={setConfirmStop} onStop={stop} label="Parar a mentoria" />
        </div>
      </div>
    </>
  );
}

function StopMentoring({ confirm, setConfirm, onStop, label }: { confirm: boolean; setConfirm: (v: boolean) => void; onStop: () => void; label: string }) {
  return (
    <div className="card space-y-3 p-5 text-sm">
      <p className="text-ink-soft">Prefere seguir sozinho por enquanto? Você pode pedir um mentor de novo quando quiser.</p>
      {confirm ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Tem certeza?</span>
          <button onClick={onStop} className={btn('dark', 'sm')}>Sim, {label.toLowerCase()}</button>
          <button onClick={() => setConfirm(false)} className={btn('ghost', 'sm')}>Voltar</button>
        </div>
      ) : <button onClick={() => setConfirm(true)} className={btn('secondary', 'sm')}>{label}</button>}
    </div>
  );
}

// ─────────────────────────────── Hub do mentor ───────────────────────────────

function PersonCard({ person, mentorName, children }: { person: Person; mentorName?: string; children?: ReactNode }) {
  const p = person.profile;
  const alerts = alertsFor(person);
  return (
    <div className="card flex h-full flex-col gap-3 p-5">
      <div className="flex items-start gap-3">
        <Avatar name={p.name} className="h-11 w-11 text-sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{p.name}</p>
          <p className="text-xs text-ink-muted">{[AGE[p.ageRange ?? ''], p.city].filter(Boolean).join(' · ') || 'Sem dados'}</p>
        </div>
      </div>
      <AreaChips ids={p.interests} />
      <div>
        <div className="mb-1 flex justify-between text-xs font-semibold text-ink-muted"><span>Linha mais avançada</span><span>{linePct(p)}%</span></div>
        <ProgressBar pct={linePct(p)} label={`Progresso de ${p.name}`} />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div><dt className="text-ink-muted">Último acesso</dt><dd className="font-semibold text-ink">{ago(p.lastActiveAt)}</dd></div>
        <div><dt className="text-ink-muted">Próximo encontro</dt><dd className={cx('font-semibold text-ink', person.plan?.nextMeeting && 'capitalize')}>{person.plan?.nextMeeting ? formatMeeting(person.plan.nextMeeting) : 'não marcado'}</dd></div>
        {mentorName !== undefined && <div className="col-span-2"><dt className="text-ink-muted">Mentor</dt><dd className="font-semibold text-ink">{mentorName || 'nenhum'}</dd></div>}
      </dl>
      {alerts.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {alerts.map((a) => <li key={a.key} className="inline-flex items-center gap-1 rounded-full bg-sun-50 px-2 py-0.5 text-[11px] font-bold text-sun-700 ring-1 ring-sun-100"><AlertTriangle className="h-3 w-3" /> {a.text}</li>)}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap gap-2 pt-1">{children ?? <Link to={`/mentor/aluno/${p.id}`} className={btn('primary', 'sm')}>Abrir plano</Link>}</div>
    </div>
  );
}

export function MentorHub() {
  useSeo('Hub do mentor');
  const { user } = useStore();
  const { people, error, reload } = usePeople();
  const mine = useMemo(() => (people ?? []).filter((x) => x.profile.mentorId === user?.id), [people, user]);
  const [f, setF] = useState<'todos' | 'atencao'>('todos');
  if (!user) return null;
  const withAlerts = mine.filter((x) => alertsFor(x).length);
  const list = (f === 'atencao' ? withAlerts : mine).sort((a, b) => alertsFor(b).length - alertsFor(a).length);
  const week = mine
    .filter((x) => x.plan?.nextMeeting && new Date(x.plan.nextMeeting).getTime() > Date.now() - DAY && new Date(x.plan.nextMeeting).getTime() < Date.now() + 7 * DAY)
    .sort((a, b) => (a.plan!.nextMeeting! < b.plan!.nextMeeting! ? -1 : 1));

  return (
    <>
      <PageHero eyebrow="Hub do mentor" title={`Seus alunos, ${firstName(user.name)}`} text="Veja quem precisa de atenção, marque encontros e combine o próximo passo de cada aluno." gradient="from-tang-500 to-grape-500" />
      <div className="container-x space-y-10 py-10">
        {error ? <ErrorState text={error} onRetry={reload} /> : !people ? <p className="text-ink-muted">Carregando…</p> : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Stat n={mine.length} label="Alunos com você" />
              <Stat n={withAlerts.length} label="Precisam de atenção" tone="bg-sun-50" />
              <Stat n={week.length} label="Encontros nos próximos 7 dias" tone="bg-tang-50" />
            </div>
            {week.length > 0 && (
              <section>
                <SectionHeader title="Agenda da semana" />
                <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-white ring-1 ring-line">
                  {week.map((x) => (
                    <li key={x.profile.id}>
                      <Link to={`/mentor/aluno/${x.profile.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-paper">
                        <CalendarClock className="h-5 w-5 text-tang-600" />
                        <span className="font-semibold capitalize">{formatMeeting(x.plan!.nextMeeting)}</span>
                        <span className="text-ink-soft">{x.profile.name}</span>
                        <span className="ml-auto text-xs text-ink-muted">{x.plan!.meetingPlace}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <SectionHeader title="Seus alunos" text="Os alunos são distribuídos pela equipe no hub da equipe." />
              <div className="mb-4"><FilterPills label="Mostrar" value={f} onChange={setF} options={[{ value: 'todos', label: `Todos (${mine.length})` }, { value: 'atencao', label: `Precisam de atenção (${withAlerts.length})` }]} /></div>
              {list.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((x) => <PersonCard key={x.profile.id} person={x} />)}</div>
              ) : <EmptyState title={mine.length ? 'Ninguém precisa de atenção agora' : 'Você ainda não tem alunos'} text={mine.length ? 'Todos os seus alunos estão em dia.' : 'Quando a equipe ligar um aluno a você, ele aparece aqui.'} />}
            </section>
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────── Plano de um aluno (mentor/equipe) ───────────────────────────────

export function StudentPlan() {
  const { id = '' } = useParams();
  const { user, isAdmin, toast } = useStore();
  const { people, error, reload } = usePeople();
  const person = people?.find((x) => x.profile.id === id);
  const [plan, setPlan] = useState<MentorPlan | null>(null);
  const [goal, setGoal] = useState('');
  const [note, setNote] = useState({ date: today(), text: '' });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useSeo(person ? `Plano de ${person.profile.name}` : 'Plano do aluno');

  useEffect(() => { if (person) setPlan(person.plan ?? emptyPlan(person.profile.id)); }, [person]);
  if (!user) return null;
  if (error) return <div className="container-x py-10"><ErrorState text={error} onRetry={reload} /></div>;
  if (!people || (person && !plan)) return <p className="container-x py-16 text-ink-muted">Carregando…</p>;
  if (!person || !plan)
    return <div className="container-x py-16"><EmptyState title="Aluno não encontrado" text="Ele pode ter sido ligado a outro mentor pela equipe." action={<Link to="/mentor" className={btn('secondary', 'sm')}>Voltar ao hub</Link>} /></div>;

  const canEdit = isAdmin || person.profile.mentorId === user.id;
  const up = (patch: Partial<MentorPlan>) => { setPlan({ ...plan, ...patch }); setDirty(true); };
  const save = async (next = plan) => {
    setSaving(true);
    try {
      const saved = await backend.savePlan(next);
      setPlan(saved);
      setDirty(false);
      toast('Plano salvo. O aluno já consegue ver.');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não foi possível salvar.', 'error');
    } finally {
      setSaving(false);
    }
  };
  const addNote = () => {
    if (!note.text.trim()) return;
    const next = { ...plan, notes: [...plan.notes, { id: newId(), date: note.date || today(), text: note.text.trim(), authorName: user.name }] };
    setNote({ date: today(), text: '' });
    save(next);
  };
  const p = person.profile;

  return (
    <div className="container-x space-y-8 py-8">
      <Link to={isAdmin && p.mentorId !== user.id ? '/equipe' : '/mentor'} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
      <header className="flex flex-wrap items-center gap-4">
        <Avatar name={p.name} className="h-14 w-14 text-lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold">{p.name}</h1>
          <p className="text-sm text-ink-soft">{[AGE[p.ageRange ?? ''], p.city, `último acesso ${ago(p.lastActiveAt)}`, `${person.completed} conteúdos concluídos`].filter(Boolean).join(' · ')}</p>
        </div>
        <AreaChips ids={p.interests} />
      </header>
      {!canEdit && <Notice tone="warn">Só o mentor deste aluno ou a equipe podem editar o plano.</Notice>}

      <section>
        <h2 className="mb-3 font-display text-xl font-bold">Progresso nas linhas</h2>
        <LineProgress profile={p} />
      </section>

      <fieldset disabled={!canEdit} className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">Próximo passo e encontro</h2>
          <div><label className="label" htmlFor="ns">Próximo passo</label><input id="ns" className="input" value={plan.nextStep ?? ''} onChange={(e) => up({ nextStep: e.target.value })} placeholder="Ex.: Fazer o tutorial do sensor de luz" /></div>
          <div><label className="label" htmlFor="nl">Levar para</label>
            <select id="nl" className="input" value={plan.nextStepLink ?? ''} onChange={(e) => up({ nextStepLink: e.target.value })}>{LINK_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="nm">Próximo encontro</label><input id="nm" type="datetime-local" className="input" value={plan.nextMeeting ?? ''} onChange={(e) => up({ nextMeeting: e.target.value })} /></div>
            <div><label className="label" htmlFor="mp">Onde</label><input id="mp" className="input" value={plan.meetingPlace ?? ''} onChange={(e) => up({ meetingPlace: e.target.value })} placeholder="Online, escola…" /></div>
          </div>
          <button onClick={() => save()} disabled={saving || !dirty} className={btn('primary')}>{saving ? 'Salvando…' : dirty ? 'Salvar plano' : 'Plano salvo'}</button>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">Metas</h2>
          <ul className="space-y-2">
            {plan.goals.map((g) => (
              <li key={g.id} className="flex items-center gap-2 rounded-2xl bg-paper p-2.5 ring-1 ring-line">
                <button type="button" onClick={() => up({ goals: plan.goals.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)) })} aria-label={g.done ? 'Marcar como não feita' : 'Marcar como feita'}>
                  {g.done ? <CheckCircle2 className="h-5 w-5 text-leaf-600" /> : <Circle className="h-5 w-5 text-ink-muted" />}
                </button>
                <span className={cx('flex-1 text-sm', g.done && 'text-ink-muted line-through')}>{g.text}</span>
                <button type="button" onClick={() => up({ goals: plan.goals.filter((x) => x.id !== g.id) })} aria-label="Remover meta" className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-white"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
            {!plan.goals.length && <li className="text-sm text-ink-muted">Nenhuma meta ainda. Metas curtas, de 1 a 2 semanas, funcionam melhor.</li>}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); if (!goal.trim()) return; up({ goals: [...plan.goals, { id: newId(), text: goal.trim(), done: false }] }); setGoal(''); }} className="flex gap-2">
            <label htmlFor="ng" className="sr-only">Nova meta</label>
            <input id="ng" className="input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Nova meta" />
            <button className={btn('secondary')} aria-label="Adicionar meta"><Plus className="h-4 w-4" /></button>
          </form>
          {dirty && <p className="text-xs font-semibold text-tang-700">Há mudanças não salvas. Use "Salvar plano".</p>}
        </div>
      </fieldset>

      <section className="card space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><NotebookPen className="h-5 w-5 text-grape-600" /> Registro dos encontros</h2>
        <p className="text-sm text-ink-soft">O aluno e a equipe veem estes registros. Escreva o que foi combinado, em uma ou duas frases.</p>
        {canEdit && (
          <div className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
            <label htmlFor="nd" className="sr-only">Data do encontro</label>
            <input id="nd" type="date" className="input" value={note.date} onChange={(e) => setNote({ ...note, date: e.target.value })} />
            <label htmlFor="nt" className="sr-only">O que foi combinado</label>
            <input id="nt" className="input" value={note.text} onChange={(e) => setNote({ ...note, text: e.target.value })} placeholder="Ex.: Combinamos que ele vai testar o circuito em casa" maxLength={400} />
            <button onClick={addNote} disabled={!note.text.trim() || saving} className={btn('primary')}>Registrar</button>
          </div>
        )}
        <ol className="space-y-2">
          {[...plan.notes].sort((a, b) => b.date.localeCompare(a.date)).map((n) => (
            <li key={n.id} className="rounded-2xl bg-paper p-3 ring-1 ring-line">
              <p className="text-xs font-bold text-ink-muted">{new Date(`${n.date}T12:00`).toLocaleDateString('pt-BR')} · {n.authorName}</p>
              <p className="mt-1 text-sm">{n.text}</p>
            </li>
          ))}
          {!plan.notes.length && <li className="text-sm text-ink-muted">Nenhum encontro registrado.</li>}
        </ol>
      </section>
    </div>
  );
}

// ─────────────────────────────── Hub da equipe ───────────────────────────────

type Status = 'todos' | 'mentor' | 'aguardando' | 'sozinho';
const statusOf = (p: Profile): Exclude<Status, 'todos'> => (p.mentorId ? 'mentor' : p.wantsMentor ? 'aguardando' : 'sozinho');
const STATUS_LABEL = { mentor: 'Com mentor', aguardando: 'Aguardando mentor', sozinho: 'Explorando sozinho' };
const STATUS_TONE = { mentor: 'bg-leaf-50 text-leaf-700', aguardando: 'bg-tang-50 text-tang-700', sozinho: 'bg-paper text-ink-soft' };

export function TeamHub() {
  useSeo('Hub da equipe');
  const { user, toast } = useStore();
  const { people, error, reload } = usePeople();
  const [status, setStatus] = useState<Status>('todos');
  const [q, setQ] = useState('');
  const [promote, setPromote] = useState('');
  const [confirmDemote, setConfirmDemote] = useState<string | null>(null);
  const [pick, setPick] = useState<Record<string, string>>({});

  const all = people ?? [];
  const mentors = all.filter((x) => isMentorRole(x.profile));
  const students = all.filter((x) => x.profile.role === 'student');
  const load = (mid: string) => all.filter((x) => x.profile.mentorId === mid).length;
  const nameOf = (mid?: string | null) => (mid ? all.find((x) => x.profile.id === mid)?.profile.name ?? '' : '');
  const waiting = students.filter((x) => statusOf(x.profile) === 'aguardando').sort((a, b) => a.profile.createdAt.localeCompare(b.profile.createdAt));

  // Sugestão: mentor com área em comum e menos alunos.
  const suggest = (p: Profile) => {
    const ranked = [...mentors].sort((a, b) => {
      const sa = a.profile.interests.filter((i) => p.interests.includes(i)).length;
      const sb = b.profile.interests.filter((i) => p.interests.includes(i)).length;
      return sb - sa || load(a.profile.id) - load(b.profile.id);
    });
    return ranked[0]?.profile.id ?? '';
  };

  const act = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      toast(ok);
      await reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não foi possível salvar.', 'error');
    }
  };
  const assign = (sid: string, mid: string | null) => act(() => backend.assignMentor(sid, mid), mid ? `Aluno ligado a ${firstName(nameOf(mid))}.` : 'Mentor removido do aluno.');

  const filtered = students.filter((x) => (status === 'todos' || statusOf(x.profile) === status) && (!q || x.profile.name.toLowerCase().includes(q.toLowerCase())));
  const candidates = all.filter((x) => x.profile.role === 'student');
  const MentorSelect = ({ sid, value, onChange, id }: { sid: string; value: string; onChange: (v: string) => void; id: string }) => (
    <>
      <label htmlFor={id} className="sr-only">Mentor de {nameOf(sid)}</label>
      <select id={id} className="input h-9 min-w-0 text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Sem mentor</option>
        {mentors.map((m) => <option key={m.profile.id} value={m.profile.id}>{m.profile.name} · {load(m.profile.id)} aluno(s){m.profile.role === 'admin' ? ' · equipe' : ''}</option>)}
      </select>
    </>
  );

  if (!user) return null;
  return (
    <>
      <PageHero eyebrow="Hub da equipe" title="Mentoria MegaMorfose" text="Distribua os alunos entre os mentores, acompanhe quem está aguardando e veja como cada mentor está." gradient="from-leaf-500 to-grape-500" />
      <div className="container-x space-y-12 py-10">
        {error ? <ErrorState text={error} onRetry={reload} /> : !people ? <p className="text-ink-muted">Carregando…</p> : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Stat n={students.length} label="Estudantes" />
              <Stat n={students.filter((x) => x.profile.mentorId).length} label="Com mentor" tone="bg-leaf-50" />
              <Stat n={waiting.length} label="Aguardando mentor" tone="bg-tang-50" />
              <Stat n={students.filter((x) => statusOf(x.profile) === 'sozinho').length} label="Explorando sozinhos" />
              <Stat n={mentors.length} label="Mentores" tone="bg-grape-50" />
            </div>

            <section>
              <SectionHeader eyebrow="Fila" title="Aguardando mentor" text="Em ordem de chegada. A sugestão leva em conta as áreas em comum e quantos alunos cada mentor já tem." />
              {waiting.length ? (
                <ul className="divide-y divide-line overflow-hidden rounded-3xl bg-white ring-1 ring-line">
                  {waiting.map((x) => {
                    const p = x.profile;
                    const v = pick[p.id] ?? suggest(p);
                    return (
                      <li key={p.id} className="grid gap-3 p-4 md:grid-cols-[1.3fr_1fr_auto] md:items-center">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={p.name} className="h-10 w-10 text-sm" />
                          <div className="min-w-0"><p className="truncate font-bold">{p.name}</p><p className="text-xs text-ink-muted">{[AGE[p.ageRange ?? ''], p.city, `pediu ${ago(p.createdAt)}`].filter(Boolean).join(' · ')}</p></div>
                          <AreaChips ids={p.interests} />
                        </div>
                        <MentorSelect id={`w-${p.id}`} sid={p.id} value={v} onChange={(val) => setPick({ ...pick, [p.id]: val })} />
                        <button disabled={!v} onClick={() => assign(p.id, v)} className={btn('primary', 'sm')}><UserCheck className="h-4 w-4" /> Definir mentor</button>
                      </li>
                    );
                  })}
                </ul>
              ) : <EmptyState title="Ninguém aguardando" text="Todos os pedidos de mentor já foram atendidos." />}
            </section>

            <section>
              <SectionHeader eyebrow="Mentores" title="Alunos por mentor" />
              {mentors.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {mentors.map((m) => {
                    const theirs = all.filter((x) => x.profile.mentorId === m.profile.id);
                    const atn = theirs.filter((x) => alertsFor(x).length).length;
                    return (
                      <div key={m.profile.id} className="card space-y-4 p-5">
                        <div className="flex items-start gap-3">
                          <Avatar name={m.profile.name} className="h-11 w-11 text-sm" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold">{m.profile.name} {m.profile.role === 'admin' && <span className="ml-1 rounded-full bg-grape-50 px-2 py-0.5 text-[11px] font-bold text-grape-700">equipe</span>}</p>
                            <AreaChips ids={m.profile.interests} />
                          </div>
                          <div className="text-right"><p className="font-display text-2xl font-bold tabular-nums">{theirs.length}</p><p className="text-xs text-ink-muted">aluno(s)</p></div>
                        </div>
                        {atn > 0 && <p className="inline-flex items-center gap-1 rounded-full bg-sun-50 px-2 py-0.5 text-xs font-bold text-sun-700"><AlertTriangle className="h-3 w-3" /> {atn} precisam de atenção</p>}
                        <ul className="space-y-2">
                          {theirs.map((x) => (
                            <li key={x.profile.id} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-2xl bg-paper p-2.5 ring-1 ring-line sm:grid-cols-[1fr_180px_auto]">
                              <Link to={`/mentor/aluno/${x.profile.id}`} className="min-w-0 truncate text-sm font-semibold hover:text-grape-700">{x.profile.name}<span className="block text-xs font-normal text-ink-muted">{ago(x.profile.lastActiveAt)} · {linePct(x.profile)}%</span></Link>
                              <div className="col-span-2 sm:col-span-1"><MentorSelect id={`m-${x.profile.id}`} sid={x.profile.id} value={m.profile.id} onChange={(val) => assign(x.profile.id, val || null)} /></div>
                            </li>
                          ))}
                          {!theirs.length && <li className="text-sm text-ink-muted">Nenhum aluno ainda.</li>}
                        </ul>
                        {m.profile.role === 'mentor' && (
                          confirmDemote === m.profile.id ? (
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="font-semibold">{theirs.length ? `Os ${theirs.length} aluno(s) voltam para a fila.` : 'Remover o papel de mentor?'}</span>
                              <button onClick={() => { setConfirmDemote(null); act(() => backend.setRole(m.profile.id, 'student'), 'Papel de mentor removido.'); }} className={btn('dark', 'sm')}>Confirmar</button>
                              <button onClick={() => setConfirmDemote(null)} className={btn('ghost', 'sm')}>Voltar</button>
                            </div>
                          ) : <button onClick={() => setConfirmDemote(m.profile.id)} className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"><UserMinus className="h-4 w-4" /> Remover papel de mentor</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : <EmptyState title="Nenhum mentor ainda" text="Adicione alguém da equipe como mentor logo abaixo." />}

              <div className="mt-6 card flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label htmlFor="promote" className="label">Adicionar mentor</label>
                  <select id="promote" className="input" value={promote} onChange={(e) => setPromote(e.target.value)}>
                    <option value="">Escolha uma pessoa com conta no site…</option>
                    {candidates.map((x) => <option key={x.profile.id} value={x.profile.id}>{x.profile.name}{x.profile.email ? ` · ${x.profile.email}` : ''}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-ink-muted">A pessoa precisa criar uma conta antes. Mentores veem nome, idade, cidade e progresso só dos alunos ligados a eles.</p>
                </div>
                <button disabled={!promote} onClick={() => { const id = promote; setPromote(''); act(() => backend.setRole(id, 'mentor'), 'Mentor adicionado.'); }} className={btn('primary')}><UserPlus className="h-4 w-4" /> Tornar mentor</button>
              </div>
            </section>

            <section>
              <SectionHeader eyebrow="Todos" title="Estudantes" />
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <FilterPills label="Situação" value={status} onChange={setStatus} options={[
                  { value: 'todos', label: `Todos (${students.length})` }, { value: 'mentor', label: 'Com mentor' }, { value: 'aguardando', label: 'Aguardando' }, { value: 'sozinho', label: 'Sozinhos' },
                ]} />
                <label className="relative block lg:w-72">
                  <span className="sr-only">Buscar estudante</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                  <input className="input h-10 pl-9" placeholder="Buscar pelo nome" value={q} onChange={(e) => setQ(e.target.value)} />
                </label>
              </div>
              <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-line">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-ink-muted"><tr><th className="px-4 py-3">Estudante</th><th className="px-4 py-3">Situação</th><th className="px-4 py-3">Mentor</th><th className="px-4 py-3">Último acesso</th><th className="px-4 py-3">Linha</th><th className="px-4 py-3"></th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((x) => {
                      const p = x.profile; const st = statusOf(p);
                      return (
                        <tr key={p.id}>
                          <td className="px-4 py-3"><p className="font-semibold">{p.name}</p><p className="text-xs text-ink-muted">{[AGE[p.ageRange ?? ''], p.city].filter(Boolean).join(' · ')}</p></td>
                          <td className="px-4 py-3"><span className={cx('rounded-full px-2 py-0.5 text-xs font-bold', STATUS_TONE[st])}>{STATUS_LABEL[st]}</span></td>
                          <td className="w-56 px-4 py-3"><MentorSelect id={`t-${p.id}`} sid={p.id} value={p.mentorId ?? ''} onChange={(val) => assign(p.id, val || null)} /></td>
                          <td className="px-4 py-3 tabular-nums">{ago(p.lastActiveAt)}</td>
                          <td className="px-4 py-3 tabular-nums">{lineTotal(p)} etapa(s)</td>
                          <td className="px-4 py-3 text-right">{p.mentorId && <Link to={`/mentor/aluno/${p.id}`} className="font-semibold text-grape-700">Plano</Link>}</td>
                        </tr>
                      );
                    })}
                    {!filtered.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-muted">Nenhum estudante encontrado.</td></tr>}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 flex items-center gap-1 text-xs text-ink-muted"><Users className="h-3.5 w-3.5" /> Escolher um mentor para um aluno que estava explorando sozinho também ativa a mentoria para ele.</p>
            </section>
          </>
        )}
      </div>
    </>
  );
}
