import { Link } from 'react-router-dom';
import { ArrowRight, Compass, GraduationCap, MapPin, Rocket, Sparkles } from 'lucide-react';
import { AreaArt, HeroArt } from '../componentes/art';
import { cx, useSeo } from '../componentes/ui';
import { AREAS } from '../scripts/areas';
import { homeFor } from './Auth';
import { useStore } from '../scripts/store';

// Home propositalmente enxuta: uma mensagem, o caminho em 3 passos e as portas de entrada.
// Conteúdos, oportunidades e depoimentos ficam dentro de cada caminho, onde fazem sentido.

const STEPS = [
  { n: 1, title: 'Escolha uma área', text: 'AI & Visão, Eletrônica ou Mecânica.' },
  { n: 2, title: 'Siga a linha de aprendizagem', text: 'Um passo de cada vez, do zero.' },
  { n: 3, title: 'Descubra oportunidades', text: 'Projetos, olimpíadas, bolsas e mais.' },
];

export default function Home() {
  useSeo('', 'MegaMorfose guia jovens por conhecimentos, projetos e oportunidades nas áreas STEM, um passo de cada vez.');
  const { user } = useStore();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-grape-100 blur-3xl" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-eletric-100 blur-3xl" />
        </div>
        <div className="container-x grid items-center gap-8 pb-8 pt-10 sm:pt-14 lg:grid-cols-[1.15fr_1fr]">
          <div className="animate-fadeup">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-grape-700 shadow-card ring-1 ring-line">
              <MapPin className="h-3.5 w-3.5" /> Feito por uma equipe de robótica de Boituva/SP
            </p>
            <h1 className="mt-5 font-display text-[2.4rem] font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Seu futuro pode começar com uma{' '}
              <span className="bg-gradient-to-r from-grape-500 via-eletric-500 to-leaf-500 bg-clip-text text-transparent">descoberta.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Você não precisa saber nada antes. A gente mostra o caminho, um passo de cada vez.
            </p>
            <ol className="mt-7 grid gap-2 sm:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n} className="flex items-start gap-3 rounded-2xl bg-white/80 p-3 ring-1 ring-line sm:flex-col sm:gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-white">{s.n}</span>
                  <span><strong className="block text-sm text-ink">{s.title}</strong><span className="text-xs text-ink-muted">{s.text}</span></span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mx-auto hidden w-full max-w-md lg:block"><HeroArt /></div>
        </div>
      </section>

      <section className="pb-16 pt-6" aria-labelledby="comece">
        <div className="container-x">
          <h2 id="comece" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Por onde você quer começar?</h2>
          <p className="mt-1 text-ink-soft">Cada área é uma linha de aprendizagem com vídeos, prática e oportunidades no final.</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {AREAS.map((a, i) => (
              <Link
                key={a.id}
                to={`/explorar/${a.slug}`}
                className={cx('group relative flex min-h-[220px] flex-col overflow-hidden rounded-4xl bg-gradient-to-br p-6 text-white shadow-lift transition duration-300 hover:-translate-y-1.5 sm:min-h-[300px]', a.gradient)}
              >
                <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(white_1.2px,transparent_1.2px)] [background-size:18px_18px]" />
                <AreaArt area={a.id} className="absolute -bottom-4 -right-4 w-40 transition duration-500 group-hover:scale-110 sm:w-52" />
                <span className="relative text-xs font-bold uppercase tracking-wider text-white/80">Área {i + 1}</span>
                <h3 className="relative mt-2 max-w-[13ch] font-display text-2xl font-bold leading-tight sm:text-3xl">{a.name}</h3>
                <p className="relative mt-2 max-w-[24ch] text-white/90">{a.tagline}</p>
                <span className="relative mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink transition group-hover:gap-3">
                  Começar <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { to: '/por-onde-comecar', icon: Sparkles, title: 'Não sei qual escolher', text: '5 perguntas rápidas indicam a área certa para você.', tone: 'bg-sun-50 ring-sun-100 text-sun-700' },
              { to: '/oportunidades', icon: Rocket, title: 'Quero uma oportunidade', text: 'Projetos, programas, vagas e olimpíadas, explicados.', tone: 'bg-leaf-50 ring-leaf-100 text-leaf-700' },
              { to: '/futuro-academico', icon: GraduationCap, title: 'Quero pensar na faculdade', text: 'Universidades, bolsas e como estudar fora.', tone: 'bg-eletric-50 ring-eletric-100 text-eletric-700' },
            ].map(({ to, icon: Icon, title, text, tone }) => (
              <Link key={to} to={to} className={cx('group flex items-center gap-4 rounded-3xl p-4 ring-1 transition hover:shadow-card', tone)}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><strong className="block text-ink">{title}</strong><span className="text-sm text-ink-soft">{text}</span></span>
                <ArrowRight className="h-5 w-5 shrink-0 text-ink transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>

          {user ? (
            <Link to={homeFor(user)} className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-grape-700"><Compass className="h-4 w-4" /> {user.role === 'admin' ? 'Abrir o hub da equipe' : user.role === 'mentor' ? 'Abrir o hub do mentor' : user.wantsMentor ? 'Ver meu plano' : 'Continuar minha jornada'}</Link>
          ) : (
            <p className="mt-8 text-center text-sm text-ink-muted">Quer salvar seu progresso? <Link to="/cadastrar" className="font-semibold text-grape-700">Crie sua conta grátis</Link></p>
          )}
        </div>
      </section>
    </>
  );
}
