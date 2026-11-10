import { useState } from 'react';
import { ChevronDown, Globe2, Landmark } from 'lucide-react';
import { VideoCard } from '../componentes/testimonials';
import { cx, EmptyState, FilterPills, Grid, ItemCard, ItemList, Notice, PageHero, SectionHeader, useSeo } from '../componentes/ui';
import { useStore } from '../scripts/store';
import type { ContentItem } from '../scripts/types';

// Textos gerais de orientação (sem dados de programas específicos). Revise periodicamente.
const BR_TOPICS: [string, string][] = [
  ['Cursos relacionados a STEM', 'Engenharias (mecânica, elétrica, mecatrônica, de computação, de controle e automação), Ciência da Computação, Sistemas de Informação, Física, Química, Matemática, Estatística, Biotecnologia e cursos técnicos e tecnólogos. Compare as grades curriculares para entender as diferenças.'],
  ['Universidades públicas e privadas', 'Instituições públicas (federais, estaduais e institutos federais) não cobram mensalidade. Privadas cobram, mas muitas têm bolsas e programas de financiamento. Em ambas, vale pesquisar auxílios de permanência como moradia, alimentação e transporte.'],
  ['Bolsas de estudo', 'Existem bolsas governamentais, bolsas das próprias instituições e de fundações privadas. Os critérios mais comuns envolvem renda familiar, desempenho e ter estudado em escola pública. Confira sempre os editais oficiais.'],
  ['Programas de iniciação científica', 'Na iniciação científica, estudantes participam de pesquisas orientadas por professores, muitas vezes com bolsa. Alguns programas aceitam estudantes do ensino médio (iniciação científica júnior).'],
  ['Como construir um bom currículo acadêmico', 'Participe de olimpíadas, feiras de ciências, projetos, monitorias, voluntariado e cursos. Registre tudo com datas, fotos e certificados: isso ajuda em seleções de bolsas e programas.'],
  ['Oportunidades para estudantes de baixa renda', 'Procure por isenção de taxas de inscrição, cotas e ações afirmativas, bolsas de permanência, restaurantes universitários e moradia estudantil. Cursinhos populares gratuitos também ajudam na preparação.'],
];
const EXT_TOPICS: [string, string][] = [
  ['Bolsas internacionais e bolsas integrais', 'Muitas universidades estrangeiras oferecem auxílio financeiro próprio, além de bolsas de governos e fundações. Algumas cobrem custos totais. Pesquise o auxílio financeiro de cada universidade junto com a candidatura.'],
  ['Programas de verão e summer schools', 'Programas curtos, geralmente nas férias do hemisfério norte, para estudantes do ensino médio ou graduação. Ótima forma de conhecer o ambiente internacional; alguns oferecem bolsa.'],
  ['Intercâmbio e oportunidades para ensino médio', 'Há intercâmbios de um semestre ou um ano, competições internacionais e programas de pesquisa para estudantes do ensino médio.'],
  ['Estados Unidos, Europa e outros países', 'Cada país tem seu sistema. Nos Estados Unidos, candidaturas costumam envolver essays, cartas e lista de atividades. Na Europa, muitos países têm universidades públicas com custos menores, e as exigências variam por país. Pesquise cedo.'],
  ['Programas de pesquisa para estudantes', 'Laboratórios e universidades oferecem estágios de pesquisa de algumas semanas. Procure por "research internship" ou "summer research program" na sua área de interesse.'],
];

function Accordion({ topics }: { topics: [string, string][] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line">
      {topics.map(([t, d], i) => (
        <div key={t}>
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold hover:bg-paper">
            {t}
            <ChevronDown className={cx('h-5 w-5 shrink-0 text-ink-muted transition', open === i && 'rotate-180')} />
          </button>
          {open === i && <p className="animate-fadeup px-5 pb-5 text-ink-soft">{d}</p>}
        </div>
      ))}
    </div>
  );
}

export default function Academic() {
  useSeo('Seu Futuro Acadêmico', 'Universidades no Brasil, ENEM, SISU, bolsas e oportunidades de estudar no exterior.');
  const { items } = useStore();
  const [tab, setTab] = useState<'brasil' | 'exterior'>('brasil');
  const guides = (cat: string) => items.filter((i) => i.type === 'guide' && i.category === cat);
  const unis = (foreign: boolean) => items.filter((i) => i.type === 'university' && (i.category === 'Estrangeira') === foreign);
  const schol = (intl: boolean) => items.filter((i) => i.type === 'scholarship' && (i.fields.scope === 'Internacional') === intl);
  const abroad = items.filter((i) => i.type === 'story' && i.fields.abroad === true);
  const ic = items.filter((i) => i.type === 'program' && i.category === 'Iniciação científica');

  const Block = ({ title, text, list }: { title: string; text?: string; list: ContentItem[] }) => (
    <section className="mt-12">
      <SectionHeader title={title} text={text} />
      <ItemList items={list} />
    </section>
  );

  return (
    <>
      <PageHero eyebrow="Seu Futuro Acadêmico" title="A universidade também é para você" text="Mesmo que ninguém da sua família tenha feito faculdade, mesmo que estudar fora pareça um sonho distante: existem caminhos, e a gente mostra por onde começar." gradient="from-eletric-500 to-leaf-500" />
      <div className="container-x py-10">
        <FilterPills label="Escolha" value={tab} onChange={setTab} options={[{ value: 'brasil', label: '🇧🇷 Universidades no Brasil' }, { value: 'exterior', label: '🌎 Estudar no exterior' }]} />
        <div className="mt-6"><Notice tone="warn">Requisitos, prazos e condições de universidades, bolsas e programas mudam com frequência. Sempre confirme nas páginas oficiais.</Notice></div>

        {tab === 'brasil' ? (
          <>
            <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-eletric-500 text-white"><Landmark className="h-6 w-6" /></span>
                <h2 className="mt-4 font-display text-3xl font-bold">Universidades no Brasil</h2>
                <p className="mt-2 text-ink-soft">Entenda as opções, as formas de ingresso e os apoios que existem para você estudar.</p>
                <div className="mt-6 grid gap-3">{guides('Universidade').map((g) => <ItemCard key={g.id} item={g} compact />)}</div>
              </div>
              <Accordion topics={BR_TOPICS} />
            </section>
            <Block title="Universidades" text="Exemplos de instituições e seus cursos STEM." list={unis(false)} />
            <Block title="Bolsas de estudo no Brasil" list={schol(false)} />
            <Block title="Iniciação científica" list={ic} />
          </>
        ) : (
          <>
            <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-leaf-500 text-white"><Globe2 className="h-6 w-6" /></span>
                <h2 className="mt-4 font-display text-3xl font-bold">Estudar no exterior</h2>
                <p className="mt-2 text-ink-soft">Bolsas, universidades, intercâmbios, programas de verão e como preparar uma candidatura internacional do zero.</p>
              </div>
              <Accordion topics={EXT_TOPICS} />
            </section>
            <section className="mt-12">
              <SectionHeader title="Prepare sua candidatura" text="Inglês, cartas de recomendação, essays e documentos." />
              <Grid>{guides('Exterior').map((g) => <ItemCard key={g.id} item={g} compact />)}</Grid>
            </section>
            <Block title="Bolsas e programas internacionais" list={schol(true)} />
            <Block title="Universidades estrangeiras" list={unis(true)} />
          </>
        )}

        <section id="chegaram-la" className="mt-16 scroll-mt-24 rounded-4xl bg-ink p-6 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-sun-400">Estudantes que chegaram lá</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Brasileiros que foram estudar fora</h2>
          <p className="mt-2 max-w-2xl text-white/70">Vídeos de jovens que vieram de contextos parecidos com o seu contando os desafios, as dicas e o que fariam diferente.</p>
          <div className="mt-6">
            {abroad.length ? <Grid>{abroad.map((s) => <VideoCard key={s.id} item={s} />)}</Grid> : <EmptyState title="Em breve" text="Novas histórias serão publicadas pela equipe." />}
          </div>
        </section>
      </div>
    </>
  );
}
