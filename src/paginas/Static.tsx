import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { btn, Notice, PageHero, useSeo } from '../componentes/ui';
import { useStore } from '../scripts/store';

export function NotFound() {
  useSeo('Página não encontrada');
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-3xl bg-grape-50 text-grape-600"><Bot className="h-10 w-10" /></span>
      <h1 className="mt-6 font-display text-3xl font-bold">Ops! Essa página não existe</h1>
      <p className="mt-2 max-w-md text-ink-soft">Talvez o link tenha mudado ou o conteúdo foi removido. Mas tem muita coisa boa para descobrir.</p>
      <div className="mt-6 flex gap-3"><Link to="/" className={btn('primary')}>Ir para o início</Link><Link to="/explorar" className={btn('secondary')}>Explorar STEM</Link></div>
    </div>
  );
}

export function About() {
  useSeo('Sobre o MegaMorfose');
  const { mode } = useStore();
  return (
    <>
      <PageHero eyebrow="Sobre" title="Transformar curiosidade em possibilidade" text="O MegaMorfose é um projeto educacional criado por uma equipe de robótica de Boituva, São Paulo, que compete na FIRST Tech Challenge (FTC)." />
      <div className="container-x max-w-3xl space-y-10 py-12">
        <section className="prose-mm">
          <h2 className="mb-3 font-display text-2xl font-bold">Nossa missão</h2>
          <p>Aproximar jovens do universo STEM, apresentando possibilidades de aprendizado, desenvolvimento pessoal, formação acadêmica e oportunidades profissionais, especialmente para quem vive em cidades menores ou em realidades socioeconômicas menos favorecidas.</p>
          <p>Tudo começa com três workshops de 50 minutos (AI & Visão Computacional, Eletrônica e Mecânica). Esta plataforma é o próximo passo: um lugar para continuar aprendendo, descobrir oportunidades e construir seu próprio caminho.</p>
        </section>
        <section>
          <h2 className="mb-3 font-display text-2xl font-bold">Créditos da equipe</h2>
          <p className="text-ink-soft">Os nomes e funções dos integrantes da equipe serão adicionados aqui pela própria equipe MegaMorfose.</p>
        </section>
        <section id="contato" className="scroll-mt-24">
          <h2 className="mb-3 font-display text-2xl font-bold">Contato</h2>
          <p className="text-ink-soft">E-mail e redes sociais oficiais serão configurados pela equipe. Escolas, empresas e organizações interessadas em parcerias poderão falar conosco por esses canais.</p>
        </section>
        <section id="tecnico" className="scroll-mt-24">
          <h2 className="mb-3 font-display text-2xl font-bold">Sobre esta versão</h2>
          {mode === 'demo' ? (
            <Notice tone="warn">Esta é uma <strong>versão de demonstração</strong>. Os conteúdos marcados como “Conteúdo demonstrativo” são fictícios e as contas e o progresso ficam salvos apenas neste navegador. Com o banco de dados (Supabase) configurado, tudo passa a ser salvo com segurança na nuvem.</Notice>
          ) : (
            <Notice>Plataforma conectada ao banco de dados. Conteúdos marcados como demonstrativos ainda serão substituídos.</Notice>
          )}
        </section>
      </div>
    </>
  );
}

export function Privacy() {
  useSeo('Privacidade e segurança');
  const items: [string, string][] = [
    ['Quais dados coletamos', 'Nome, e-mail, faixa de idade, autorização do responsável (para menores), cidade (opcional), áreas de interesse e sua atividade na plataforma (favoritos, progresso, objetivos). Não coletamos documentos, telefone, endereço ou fotos.'],
    ['Para que usamos', 'Apenas para fazer a plataforma funcionar para você: salvar seu progresso, recomendar conteúdos e permitir a participação na comunidade. Não vendemos nem compartilhamos dados com terceiros para publicidade.'],
    ['Menores de idade', 'Estudantes menores de 18 anos precisam da autorização de um responsável. Para menores de 13 anos, a conta deve ser criada junto com o responsável. Seguimos a LGPD (Lei 13.709/2018), que exige cuidado especial com dados de crianças e adolescentes.'],
    ['Comunidade segura', 'Não existem mensagens privadas. Toda publicação passa por moderação, é possível denunciar conteúdos e dados de contato não podem ser publicados. Apenas o primeiro nome é exibido.'],
    ['Seus direitos', 'Você pode ver, corrigir, baixar e excluir seus dados a qualquer momento em “Minha Jornada → Editar perfil”.'],
    ['Segurança', 'Em produção, os dados ficam em banco de dados com regras de acesso por usuário (Row Level Security): cada estudante só acessa os próprios dados, e apenas administradores gerenciam conteúdos.'],
  ];
  return (
    <>
      <PageHero eyebrow="Privacidade" title="Seus dados, suas regras" text="Como o MegaMorfose protege estudantes, especialmente os menores de idade." gradient="from-leaf-500 to-eletric-500" />
      <div className="container-x max-w-3xl space-y-6 py-12">
        {items.map(([t, d]) => (
          <section key={t} className="card p-6"><h2 className="font-display text-lg font-bold">{t}</h2><p className="mt-2 text-ink-soft">{d}</p></section>
        ))}
        <Notice tone="warn">Este texto é um ponto de partida. Antes do lançamento oficial, recomenda-se revisão por um responsável jurídico ou pela escola/instituição parceira.</Notice>
      </div>
    </>
  );
}
