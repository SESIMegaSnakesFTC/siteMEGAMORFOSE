import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { AreaTriptych } from '../componentes/cards';
import { btn, PageHero, useSeo } from '../componentes/ui';
import { Library, Trails } from './Learn';

// "Áreas": junta o que antes era Explorar STEM e Aprender.
// 1) escolha uma área (cada uma é uma linha de 6 etapas) · 2) trilhas curtas · 3) biblioteca, fechada até a pessoa abrir.
export default function Explore() {
  useSeo('Áreas', 'As três áreas dos workshops MegaMorfose (IA & Visão Computacional, Eletrônica e Mecânica), trilhas e a biblioteca de conteúdos.');
  return (
    <>
      <PageHero eyebrow="Áreas" title="Escolha uma área e siga a linha" text="Cada área é uma linha de aprendizagem com 6 etapas, do primeiro contato até planejar seu futuro. Não sabe qual escolher? Faça o teste rápido.">
        <Link to="/por-onde-comecar" className={btn('primary')}><Sparkles className="h-4 w-4" /> Descobrir minha área</Link>
      </PageHero>
      <section className="section">
        <div className="container-x">
          <AreaTriptych />
        </div>
      </section>
      <Trails />
      <Library />
    </>
  );
}
