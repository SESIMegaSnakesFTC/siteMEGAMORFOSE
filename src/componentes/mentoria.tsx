import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Hourglass, UserCheck } from 'lucide-react';
import { backend } from '../scripts/backend';
import { useStore } from '../scripts/store';
import type { MentorPlan } from '../scripts/types';
import { btn, cx } from './ui';

// Partes da mentoria usadas em várias páginas (linha da área, Minha Jornada, Início).

export function useMentorName(mentorId?: string | null) {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    if (!mentorId) return setName(null);
    let alive = true;
    backend.mentorName(mentorId).then((n) => alive && setName(n)).catch(() => alive && setName(null));
    return () => { alive = false; };
  }, [mentorId]);
  return name;
}

export function useMyPlan() {
  const { user } = useStore();
  const [plan, setPlan] = useState<MentorPlan | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { setPlan(null); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    backend.getPlan(user.id).then((p) => alive && setPlan(p)).catch(() => alive && setPlan(null)).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [user]);
  return { plan, setPlan, loading };
}

export const firstName = (name: string) => name.replace(/\s*\(.*\)\s*/, '').split(' ')[0];

export function formatMeeting(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// Botão "Quero um mentor": para quem escolheu explorar sozinho e mudou de ideia.
export function RequestMentorButton({ className, size }: { className?: string; size?: 'sm' | 'md' }) {
  const { user, setWantsMentor, toast } = useStore();
  const [busy, setBusy] = useState(false);
  if (!user) return <Link to="/cadastrar" className={cx(btn('primary', size), className)}><UserCheck className="h-4 w-4" /> Criar conta e pedir um mentor</Link>;
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await setWantsMentor(true);
          toast('Pedido enviado! A equipe vai escolher um mentor para você.');
        } catch {
          toast('Não foi possível enviar o pedido. Tente novamente.', 'error');
        } finally {
          setBusy(false);
        }
      }}
      className={cx(btn('primary', size), className)}
    >
      <UserCheck className="h-4 w-4" /> {busy ? 'Enviando…' : 'Quero um mentor'}
    </button>
  );
}

// Marco "Encontro com mentor" dentro das etapas da linha de aprendizagem.
export function MentorMoment({ text }: { text: string }) {
  const { user } = useStore();
  const mentor = useMentorName(user?.mentorId);
  const base = 'flex flex-col gap-3 rounded-2xl border-2 border-dashed border-tang-500/60 bg-tang-50 p-4 sm:flex-row sm:items-center';
  if (user?.mentorId)
    return (
      <div className={base}>
        <CalendarClock className="h-6 w-6 shrink-0 text-tang-600" />
        <p className="flex-1 text-sm text-ink"><b>Encontro com {mentor ? firstName(mentor) : 'seu mentor'}:</b> {text}</p>
        <Link to="/meu-plano" className={btn('secondary', 'sm')}>Ver meu plano</Link>
      </div>
    );
  if (user?.wantsMentor)
    return (
      <div className={base}>
        <Hourglass className="h-6 w-6 shrink-0 text-tang-600" />
        <p className="flex-1 text-sm text-ink"><b>Seu pedido de mentor está com a equipe.</b> Enquanto isso, siga a linha. Quando o mentor for definido, ele aparece aqui.</p>
      </div>
    );
  return (
    <div className={base}>
      <UserCheck className="h-6 w-6 shrink-0 text-tang-600" />
      <p className="flex-1 text-sm text-ink"><b>Quer alguém da equipe acompanhando você?</b> Um mentor faz encontros periódicos e ajuda a definir suas metas.</p>
      <RequestMentorButton size="sm" />
    </div>
  );
}

// Faixa curta da mentoria em Minha Jornada.
export function MentorStrip() {
  const { user } = useStore();
  const { plan } = useMyPlan();
  const mentor = useMentorName(user?.mentorId);
  if (!user || user.role !== 'student') return null;
  if (!user.wantsMentor)
    return (
      <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-white p-5 ring-1 ring-line sm:flex-row sm:items-center">
        <UserCheck className="h-6 w-6 shrink-0 text-grape-600" />
        <p className="flex-1 text-sm text-ink-soft"><b className="text-ink">Você está explorando sozinho.</b> Se quiser alguém da equipe acompanhando você, peça um mentor.</p>
        <RequestMentorButton size="sm" />
      </div>
    );
  return (
    <Link to="/meu-plano" className="mt-6 flex flex-col gap-3 rounded-3xl border-2 border-dashed border-tang-500/60 bg-tang-50 p-5 transition hover:shadow-card sm:flex-row sm:items-center">
      {user.mentorId ? <CalendarClock className="h-6 w-6 shrink-0 text-tang-600" /> : <Hourglass className="h-6 w-6 shrink-0 text-tang-600" />}
      <p className="flex-1 text-sm text-ink">
        {user.mentorId
          ? <><b>Seu próximo passo{mentor ? ` com ${firstName(mentor)}` : ''}:</b> {plan?.nextStep || 'veja seu plano'}{plan?.nextMeeting ? ` · encontro ${formatMeeting(plan.nextMeeting)}` : ''}</>
          : <><b>Pedido de mentor enviado.</b> A equipe vai escolher a pessoa certa para você.</>}
      </p>
      <span className={btn('secondary', 'sm')}>Abrir meu plano</span>
    </Link>
  );
}
