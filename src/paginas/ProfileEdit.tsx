import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { AreaArt } from '../componentes/art';
import { btn, cx, Notice, useSeo } from '../componentes/ui';
import { AREAS } from '../scripts/areas';
import { useStore } from '../scripts/store';
import type { AreaId } from '../scripts/types';

export default function ProfileEdit() {
  useSeo('Editar perfil');
  const { user, data, saveProfile, deleteAccount, toast } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const isNew = params.get('novo') === '1';
  const [f, setF] = useState({ name: user!.name, city: user!.city ?? '', bio: user!.bio ?? '', interests: user!.interests, publicProfile: user!.publicProfile });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleArea = (a: AreaId) => setF((s) => ({ ...s, interests: s.interests.includes(a) ? s.interests.filter((x) => x !== a) : [...s.interests, a] }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 2) return setError('Digite seu nome.');
    setBusy(true);
    try {
      await saveProfile({ ...user!, name: f.name.trim(), city: f.city.trim() || undefined, bio: f.bio.trim() || undefined, interests: f.interests, publicProfile: f.publicProfile });
      toast('Perfil atualizado!');
      nav('/minha-jornada');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setBusy(false);
    }
  };

  // LGPD: o titular pode obter uma cópia dos seus dados.
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ perfil: user, atividade: data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'meus-dados-megamorfose.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="container-x max-w-3xl py-10">
      {!isNew && <Link to="/minha-jornada" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> Minha Jornada</Link>}
      <h1 className="font-display text-3xl font-bold">{isNew ? 'Vamos personalizar sua jornada' : 'Editar perfil'}</h1>
      <p className="mt-1 text-ink-soft">{isNew ? 'Escolha as áreas que mais te interessam. Você pode mudar quando quiser.' : 'Suas informações e preferências.'}</p>

      <form onSubmit={submit} className="mt-8 space-y-8" noValidate>
        <fieldset>
          <legend className="label">Áreas de interesse</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {AREAS.map((a) => {
              const on = f.interests.includes(a.id);
              return (
                <button type="button" key={a.id} onClick={() => toggleArea(a.id)} aria-pressed={on} className={cx('relative overflow-hidden rounded-3xl p-4 text-left transition', on ? cx('bg-gradient-to-br text-white shadow-lift', a.gradient) : 'bg-white ring-1 ring-line hover:ring-ink/20')}>
                  <AreaArt area={a.id} className={cx('absolute -bottom-2 -right-2 w-20', !on && 'opacity-40 [filter:invert(.6)]')} />
                  <span className="relative block font-display font-bold">{a.name}</span>
                  <span className={cx('relative mt-6 inline-block rounded-full px-2 py-0.5 text-xs font-bold', on ? 'bg-white/25' : 'bg-paper text-ink-muted')}>{on ? '✓ Selecionada' : 'Selecionar'}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="label">Nome</span><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label><span className="label">Cidade <span className="font-normal text-ink-muted">(privado)</span></span><input className="input" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></label>
        </div>
        <label className="block"><span className="label">Sobre você <span className="font-normal text-ink-muted">(opcional)</span></span><textarea className="textarea" rows={3} maxLength={300} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="O que você gosta de aprender? Que projeto sonha em fazer?" /></label>
        <div className="card p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={f.publicProfile} onChange={(e) => setF({ ...f, publicProfile: e.target.checked })} className="mt-1 h-4 w-4 rounded" />
            <span><strong className="block">Perfil público na comunidade</strong><span className="text-sm text-ink-soft">Mostra apenas seu primeiro nome, áreas de interesse, badges e projetos concluídos. E-mail, cidade e idade nunca são exibidos. Desativado por padrão.</span></span>
          </label>
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-bubble-700">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button disabled={busy} className={btn('primary', 'lg')}>{busy ? 'Salvando…' : isNew ? 'Começar minha jornada' : 'Salvar alterações'}</button>
          {isNew && <Link to="/minha-jornada" className={btn('ghost', 'lg')}>Pular por agora</Link>}
        </div>
      </form>

      {!isNew && (
        <section className="mt-14 space-y-4 border-t border-line pt-8">
          <h2 className="font-display text-xl font-bold">Seus dados (LGPD)</h2>
          <Notice>Você pode baixar uma cópia de todos os seus dados ou excluir sua conta a qualquer momento.</Notice>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportData} className={btn('secondary')}><Download className="h-4 w-4" /> Baixar meus dados</button>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className={btn('danger')}><Trash2 className="h-4 w-4" /> Excluir minha conta</button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-bubble-50 p-3 text-sm">
                <span className="font-semibold text-bubble-700">Tem certeza? Isso apaga seu perfil e progresso.</span>
                <button onClick={async () => { try { await deleteAccount(); toast('Conta excluída.', 'info'); nav('/'); } catch (err) { toast(err instanceof Error ? err.message : 'Erro ao excluir.', 'error'); } }} className={btn('danger', 'sm')}>Sim, excluir</button>
                <button onClick={() => setConfirmDelete(false)} className={btn('ghost', 'sm')}>Cancelar</button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
