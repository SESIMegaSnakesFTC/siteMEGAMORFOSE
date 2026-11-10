import { useState } from 'react';
import { VideoCard } from '../componentes/testimonials';
import { EmptyState, FilterPills, Grid, PageHero, SkeletonGrid, useSeo } from '../componentes/ui';
import { AREA_OPTIONS } from '../scripts/areas';
import { useStore } from '../scripts/store';

export default function Inspiration() {
  useSeo('Inspiração', 'Vídeos de jovens e profissionais que começaram em realidades parecidas com a sua e construíram caminhos em STEM.');
  const { items, loading } = useStore();
  const [area, setArea] = useState('todas');
  const stories = items.filter((i) => i.type === 'story' && (area === 'todas' || i.area === area));
  return (
    <>
      <PageHero eyebrow="Inspiração" title="Pessoas que começaram de onde você está" text="Escola pública, cidade pequena, sem experiência. Assista a quem participou de olimpíadas, entrou na robótica, estudou fora ou começou a trabalhar com tecnologia." gradient="from-bubble-500 to-tang-500" />
      <div className="container-x py-10">
        <div className="mb-6">
          <FilterPills label="Área" value={area} onChange={setArea} options={[{ value: 'todas', label: 'Todos os vídeos' }, ...AREA_OPTIONS.map((a) => ({ value: a.value, label: a.value === 'geral' ? 'Olimpíadas, escola e faculdade' : a.label }))]} />
        </div>
        {loading ? <SkeletonGrid /> : stories.length ? <Grid>{stories.map((s) => <VideoCard key={s.id} item={s} />)}</Grid> : <EmptyState title="Nenhum vídeo aqui ainda" text="Novos depoimentos serão publicados pela equipe." />}
      </div>
    </>
  );
}
