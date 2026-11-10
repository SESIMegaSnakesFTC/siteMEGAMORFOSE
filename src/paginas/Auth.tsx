import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Compass, Eye, EyeOff, Info, UserCheck } from 'lucide-react';
import { Logo } from '../componentes/art';
import { btn, useSeo } from '../componentes/ui';
import { DEMO_ADMIN, DEMO_PEOPLE } from '../scripts/backend';
import { useStore } from '../scripts/store';
import type { Profile } from '../scripts/types';

// Para onde cada pessoa vai depois de entrar.
export const homeFor = (p: Profile) =>
  p.role === 'admin' ? '/equipe' : p.role === 'mentor' ? '/mentor' : p.wantsMentor ? '/meu-plano' : '/minha-jornada';

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

function Shell({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-grape-100 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-eletric-100 blur-3xl" />
      <div className="container-x relative flex justify-center py-12">
        <div className="w-full max-w-md animate-fadeup rounded-4xl bg-white p-6 shadow-lift ring-1 ring-line sm:p-8">
          <Logo />
          <h1 className="mt-6 font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{text}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Password({ value, onChange, id, autoComplete }: { value: string; onChange: (v: string) => void; id: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative block">
      <input id={id} type={show ? 'text' : 'password'} className="input pr-11" value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-muted hover:bg-paper" aria-label={show ? 'Esconder senha' : 'Mostrar senha'}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </span>
  );
}

export function Login() {
  useSeo('Entrar');
  const { signIn, mode, toast } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailOk(email)) return setError('Digite um e-mail válido.');
    if (!password) return setError('Digite sua senha.');
    setBusy(true);
    try {
      const p = await signIn(email, password);
      toast('Que bom te ver por aqui!');
      nav(params.get('next') || homeFor(p), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Entrar" text="Continue sua jornada de onde parou.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><label htmlFor="email" className="label">E-mail</label><input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
        <div><label htmlFor="pw" className="label">Senha</label><Password id="pw" value={password} onChange={setPassword} autoComplete="current-password" /></div>
        {error && <p role="alert" className="rounded-xl bg-bubble-50 p-3 text-sm font-semibold text-bubble-700">{error}</p>}
        <button disabled={busy} className={`${btn('primary', 'lg')} w-full`}>{busy ? 'Entrando…' : 'Entrar'}</button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-soft">Ainda não tem conta? <Link to="/cadastrar" className="font-bold text-grape-700">Crie grátis</Link></p>
      {mode === 'demo' && (
        <div className="mt-6 rounded-2xl bg-sun-50 p-4 text-xs text-sun-700 ring-1 ring-sun-100">
          <p className="flex items-center gap-1 font-bold"><Info className="h-3.5 w-3.5" /> Modo demonstração</p>
          <p className="mt-1">Contas de teste (toque para preencher). A senha de todas é <b>megamorfose</b>.</p>
          <div className="mt-2 grid gap-1.5">
            {[
              ['Equipe (hub da equipe e painel)', DEMO_ADMIN.email],
              ['Mentora (hub do mentor)', DEMO_PEOPLE.mentor.email],
              ['Aluna com mentora', DEMO_PEOPLE.student.email],
            ].map(([label, mail]) => (
              <button key={mail} type="button" onClick={() => { setEmail(mail); setPassword('megamorfose'); }} className="flex flex-wrap items-center justify-between gap-1 rounded-lg bg-white px-2 py-1.5 text-left ring-1 ring-sun-100">
                <span className="font-semibold">{label}</span><span className="font-mono">{mail}</span>
              </button>
            ))}
          </div>
          <p className="mt-2">Essas contas existem só neste navegador. Em produção, a equipe define mentores no hub da equipe.</p>
        </div>
      )}
    </Shell>
  );
}

export function Register() {
  useSeo('Criar conta');
  const { signUp, toast } = useStore();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', city: '', ageRange: '' as Profile['ageRange'] | '', guardian: false, terms: false, mentor: '' as '' | 'sim' | 'nao' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const minor = f.ageRange === 'menor13' || f.ageRange === '13a17';

  const validate = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 2) e.name = 'Digite seu nome.';
    if (!emailOk(f.email)) e.email = 'Digite um e-mail válido.';
    if (f.password.length < 8) e.password = 'A senha precisa ter pelo menos 8 caracteres.';
    if (f.confirm !== f.password) e.confirm = 'As senhas não são iguais.';
    if (!f.ageRange) e.ageRange = 'Selecione sua faixa de idade.';
    if (minor && !f.guardian) e.guardian = 'Para menores de 18 anos, é necessária a autorização de um responsável.';
    if (!f.mentor) e.mentor = 'Escolha como você quer usar a plataforma.';
    if (!f.terms) e.terms = 'Você precisa aceitar a política de privacidade.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await signUp({ name: f.name, email: f.email, password: f.password, ageRange: f.ageRange as Profile['ageRange'], guardianConsent: f.guardian, city: f.city, wantsMentor: f.mentor === 'sim' });
      toast(f.mentor === 'sim' ? 'Conta criada! A equipe vai escolher um mentor para você.' : 'Conta criada! Bem-vindo(a) ao MegaMorfose 🎉');
      nav('/minha-jornada/perfil?novo=1', { replace: true });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Não foi possível criar a conta.' });
    } finally {
      setBusy(false);
    }
  };

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-xs font-semibold text-bubble-700" role="alert">{errors[k]}</p> : null);

  return (
    <Shell title="Crie sua conta grátis" text="Salve conteúdos, acompanhe seu progresso e monte sua jornada STEM.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><label htmlFor="name" className="label">Nome</label><input id="name" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="given-name" aria-invalid={!!errors.name} /><Err k="name" /></div>
        <div><label htmlFor="email" className="label">E-mail</label><input id="email" type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" aria-invalid={!!errors.email} /><Err k="email" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="pw" className="label">Senha</label><Password id="pw" value={f.password} onChange={(v) => setF({ ...f, password: v })} autoComplete="new-password" /><Err k="password" /></div>
          <div><label htmlFor="pw2" className="label">Confirmar senha</label><Password id="pw2" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} autoComplete="new-password" /><Err k="confirm" /></div>
        </div>
        <fieldset>
          <legend className="label">Sua idade</legend>
          <div className="grid grid-cols-3 gap-2">
            {[['menor13', 'Menos de 13'], ['13a17', '13 a 17'], ['18mais', '18 ou mais']].map(([v, l]) => (
              <label key={v} className={`cursor-pointer rounded-xl px-2 py-2.5 text-center text-sm font-semibold ring-1 transition ${f.ageRange === v ? 'bg-grape-50 text-grape-700 ring-grape-500' : 'ring-line hover:ring-ink/20'}`}>
                <input type="radio" name="age" value={v} checked={f.ageRange === v} onChange={() => setF({ ...f, ageRange: v as Profile['ageRange'] })} className="sr-only" />{l}
              </label>
            ))}
          </div>
          <Err k="ageRange" />
        </fieldset>
        {minor && (
          <div className="rounded-2xl bg-eletric-50 p-4 text-sm text-eletric-700 ring-1 ring-eletric-100">
            {f.ageRange === 'menor13' && <p className="mb-2 font-semibold">Para menores de 13 anos, a conta deve ser criada junto com o responsável.</p>}
            <label className="flex gap-2"><input type="checkbox" checked={f.guardian} onChange={(e) => setF({ ...f, guardian: e.target.checked })} className="mt-0.5 h-4 w-4 rounded" /> Meu pai, mãe ou responsável legal sabe e autoriza que eu use o MegaMorfose.</label>
            <Err k="guardian" />
          </div>
        )}
        <fieldset>
          <legend className="label">Como você quer usar a plataforma?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ['sim', UserCheck, 'Quero um mentor', 'Alguém da equipe MegaMorfose acompanha você com encontros periódicos e metas.'],
              ['nao', Compass, 'Vou explorar sozinho', 'Você segue as linhas de aprendizagem no seu ritmo. Pode pedir um mentor depois.'],
            ] as const).map(([v, Icon, t, d]) => (
              <label key={v} className={`flex cursor-pointer flex-col gap-1 rounded-2xl p-3 text-sm ring-1 transition ${f.mentor === v ? 'bg-grape-50 ring-2 ring-grape-500' : 'ring-line hover:ring-ink/20'}`}>
                <input type="radio" name="mentor" value={v} checked={f.mentor === v} onChange={() => setF({ ...f, mentor: v })} className="sr-only" />
                <span className="flex items-center gap-2 font-bold text-ink"><Icon className="h-4 w-4 text-grape-600" /> {t}</span>
                <span className="text-xs text-ink-soft">{d}</span>
              </label>
            ))}
          </div>
          <Err k="mentor" />
        </fieldset>
        <div><label htmlFor="city" className="label">Cidade <span className="font-normal text-ink-muted">(opcional, nunca aparece publicamente)</span></label><input id="city" className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} autoComplete="address-level2" /></div>
        <label className="flex gap-2 text-sm text-ink-soft"><input type="checkbox" checked={f.terms} onChange={(e) => setF({ ...f, terms: e.target.checked })} className="mt-0.5 h-4 w-4 rounded" /> <span>Li e aceito a <Link to="/privacidade" target="_blank" className="font-semibold text-grape-700 underline">política de privacidade</Link>.</span></label>
        <Err k="terms" />
        {errors.form && <p role="alert" className="rounded-xl bg-bubble-50 p-3 text-sm font-semibold text-bubble-700">{errors.form}</p>}
        <button disabled={busy} className={`${btn('primary', 'lg')} w-full`}>{busy ? 'Criando…' : 'Criar minha conta'}</button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-soft">Já tem conta? <Link to="/entrar" className="font-bold text-grape-700">Entrar</Link></p>
    </Shell>
  );
}
