import type { ContentItem } from './types';
import { typeDef } from './contentTypes';

export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const PAGES = [
  { title: 'Explorar STEM', to: '/explorar', keywords: 'areas ia eletronica mecanica' },
  { title: 'AI & Visão Computacional', to: '/explorar/ia-visao-computacional', keywords: 'inteligencia artificial machine learning visao' },
  { title: 'Eletrônica', to: '/explorar/eletronica', keywords: 'circuitos arduino sensores' },
  { title: 'Mecânica', to: '/explorar/mecanica', keywords: 'engrenagens polias impressao 3d' },
  { title: 'Biblioteca de conteúdos', to: '/explorar?biblioteca=1', keywords: 'aprender cursos tutoriais videos trilhas biblioteca' },
  { title: 'Oportunidades', to: '/oportunidades', keywords: 'voluntariado programas vagas olimpiadas' },
  { title: 'Jovem Aprendiz e empregos', to: '/oportunidades/empregos', keywords: 'vagas estagio curriculo entrevista linkedin' },
  { title: 'Olimpíadas e competições', to: '/oportunidades/olimpiadas', keywords: 'matematica fisica robotica' },
  { title: 'Oportunidades na escola', to: '/oportunidades/escola', keywords: 'clube robotica feira de ciencias' },
  { title: 'Seu Futuro Acadêmico', to: '/futuro-academico', keywords: 'faculdade universidade enem sisu bolsas exterior intercambio' },
  { title: 'Inspiração', to: '/inspiracao', keywords: 'historias pessoas' },
  { title: 'Comunidade', to: '/comunidade', keywords: 'grupos clubes mural projetos' },
  { title: 'Minha Jornada', to: '/minha-jornada', keywords: 'perfil favoritos progresso conquistas' },
  { title: 'Por onde começar?', to: '/por-onde-comecar', keywords: 'quiz teste vocacional guia' },
  { title: 'Calendário STEM', to: '/calendario', keywords: 'eventos prazos datas' },
  { title: 'Mapa de oportunidades', to: '/mapa', keywords: 'local nacional internacional' },
  { title: 'Glossário STEM', to: '/glossario', keywords: 'termos significado' },
  { title: 'Central de recursos', to: '/recursos', keywords: 'modelos templates curriculo portfolio' },
  { title: 'Vitrine de projetos', to: '/vitrine', keywords: 'projetos estudantes galeria' },
  { title: 'Desafio do mês', to: '/desafio', keywords: 'desafio pratico' },
];

export function searchAll(items: ContentItem[], q: string) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return { pages: [], items: [] };
  const hay = (i: ContentItem) =>
    norm([i.title, i.summary, i.category, i.tags.join(' '), typeDef(i.type).label, ...Object.values(i.fields).flat().filter((v) => typeof v === 'string')].join(' '));
  const scored = items
    .map((i) => {
      const h = hay(i);
      if (!terms.every((t) => h.includes(t))) return null;
      const title = norm(i.title);
      return { i, score: terms.reduce((s, t) => s + (title.includes(t) ? 3 : 1), 0) };
    })
    .filter(Boolean) as { i: ContentItem; score: number }[];
  return {
    pages: PAGES.filter((p) => terms.every((t) => norm(`${p.title} ${p.keywords}`).includes(t))),
    items: scored.sort((a, b) => b.score - a.score).map((s) => s.i),
  };
}
