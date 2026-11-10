import type { ContentItem, ContentType } from './types';

// Registro de tipos de conteúdo. O painel administrativo gera formulários a partir
// daqui, e as páginas de detalhe exibem os campos específicos com os rótulos abaixo.
// Para criar um novo tipo: adicione-o em ContentType (types.ts) e descreva-o aqui.

export type FieldKind = 'text' | 'textarea' | 'select' | 'date' | 'url' | 'list' | 'number' | 'boolean';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
}

export type Common = 'level' | 'duration' | 'url' | 'videoUrl' | 'category';

export interface TypeDef {
  type: ContentType;
  label: string;
  plural: string;
  group: 'Aprender' | 'Oportunidades' | 'Futuro acadêmico' | 'Inspiração' | 'Comunidade' | 'Extras';
  color: string; // classes do selo
  common: Common[];
  categories?: string[];
  fields: FieldDef[];
  cta: string; // texto do botão de ação
}

const STATUS_OPP = ['Inscrições abertas', 'Inscrições encerradas', 'Fluxo contínuo'];
const MODALITY = ['Presencial', 'Online', 'Híbrido'];

export const TYPES: TypeDef[] = [
  {
    type: 'video', label: 'Vídeo', plural: 'Vídeos', group: 'Aprender', color: 'bg-bubble-50 text-bubble-700',
    common: ['level', 'duration', 'videoUrl', 'category'], cta: 'Assistir',
    categories: ['Vídeos da equipe MegaMorfose', 'Vídeo explicativo', 'Entrevista', 'Mini documentário'],
    fields: [{ key: 'producer', label: 'Produzido por', kind: 'text', placeholder: 'Equipe MegaMorfose' }],
  },
  {
    type: 'tutorial', label: 'Tutorial', plural: 'Tutoriais', group: 'Aprender', color: 'bg-tang-50 text-tang-700',
    common: ['level', 'duration', 'videoUrl', 'url', 'category'], cta: 'Seguir tutorial',
    categories: ['Passo a passo', 'Tutoriais da equipe', 'Montagem', 'Programação'],
    fields: [
      { key: 'materials', label: 'Materiais necessários', kind: 'list', help: 'Um item por linha' },
      { key: 'steps', label: 'Passos', kind: 'list', help: 'Um passo por linha' },
    ],
  },
  {
    type: 'course', label: 'Curso', plural: 'Cursos', group: 'Aprender', color: 'bg-eletric-50 text-eletric-700',
    common: ['level', 'duration', 'url', 'category'], cta: 'Acessar curso',
    categories: ['Cursos gratuitos', 'Plataforma de aprendizado', 'Curso com certificado'],
    fields: [
      { key: 'provider', label: 'Plataforma / instituição', kind: 'text' },
      { key: 'free', label: 'Gratuito', kind: 'boolean' },
      { key: 'certificate', label: 'Oferece certificado', kind: 'boolean' },
      { key: 'language', label: 'Idioma', kind: 'select', options: ['Português', 'Inglês', 'Espanhol', 'Legendas em português'] },
      { key: 'howTo', label: 'Como se inscrever', kind: 'list', help: 'Passos para acessar, um por linha' },
    ],
  },
  {
    type: 'tool', label: 'Ferramenta', plural: 'Ferramentas digitais', group: 'Aprender', color: 'bg-leaf-50 text-leaf-700',
    common: ['level', 'url', 'category'], cta: 'Abrir ferramenta',
    categories: ['Simulador', 'Ferramenta online', 'Software para instalar', 'Aplicativo'],
    fields: [
      { key: 'free', label: 'Gratuita', kind: 'boolean' },
      { key: 'platform', label: 'Funciona em', kind: 'text', placeholder: 'Navegador, Windows, celular...' },
    ],
  },
  {
    type: 'guide', label: 'Guia', plural: 'Guias para iniciantes', group: 'Aprender', color: 'bg-sun-50 text-sun-700',
    common: ['level', 'duration', 'category'], cta: 'Ler guia',
    categories: ['Guia para iniciantes', 'Carreira', 'Universidade', 'Exterior', 'Olimpíadas', 'Participação'],
    fields: [{ key: 'checklist', label: 'Checklist', kind: 'list', help: 'Um item por linha' }],
  },
  {
    type: 'material', label: 'Material de estudo', plural: 'Materiais de estudo', group: 'Aprender', color: 'bg-grape-50 text-grape-700',
    common: ['level', 'url', 'category'], cta: 'Abrir material',
    categories: ['Apostila', 'Resumo', 'Lista de exercícios', 'Slides de workshop'],
    fields: [{ key: 'format', label: 'Formato', kind: 'select', options: ['PDF', 'Slides', 'Página web', 'Planilha', 'Documento'] }],
  },
  {
    type: 'practice', label: 'Projeto prático', plural: 'Projetos práticos', group: 'Aprender', color: 'bg-tang-50 text-tang-700',
    common: ['level', 'duration', 'url', 'videoUrl', 'category'], cta: 'Ver projeto',
    categories: ['Projeto para iniciantes', 'Projeto em grupo', 'Projeto com sucata'],
    fields: [
      { key: 'materials', label: 'Materiais', kind: 'list' },
      { key: 'steps', label: 'Etapas', kind: 'list' },
      { key: 'skills', label: 'Habilidades desenvolvidas', kind: 'list' },
    ],
  },
  {
    type: 'path', label: 'Trilha', plural: 'Trilhas de aprendizagem', group: 'Aprender', color: 'bg-grape-50 text-grape-700',
    common: ['level', 'duration'], cta: 'Começar trilha',
    fields: [{ key: 'items', label: 'Conteúdos da trilha (IDs, em ordem)', kind: 'list', required: true, help: 'Um ID de conteúdo por linha. Copie o ID na lista do painel.' }],
  },
  {
    type: 'opportunity', label: 'Projeto / voluntariado', plural: 'Projetos e voluntariado', group: 'Oportunidades', color: 'bg-leaf-50 text-leaf-700',
    common: ['url', 'category'], cta: 'Quero participar',
    categories: ['Projeto científico', 'Projeto de tecnologia', 'Projeto social', 'Iniciativa de inovação', 'Voluntariado', 'Comunidade aberta'],
    fields: [
      { key: 'org', label: 'Organização responsável', kind: 'text', required: true },
      { key: 'requirements', label: 'Requisitos', kind: 'list' },
      { key: 'ageRange', label: 'Faixa etária', kind: 'text', placeholder: 'Ex.: 14 a 18 anos' },
      { key: 'modality', label: 'Modalidade', kind: 'select', options: MODALITY },
      { key: 'location', label: 'Localização', kind: 'text' },
      { key: 'scope', label: 'Alcance', kind: 'select', options: ['Local', 'Estadual', 'Nacional', 'Internacional'] },
      { key: 'deadline', label: 'Prazo de inscrição', kind: 'date' },
      { key: 'oppStatus', label: 'Status', kind: 'select', options: STATUS_OPP },
      { key: 'beginnerFriendly', label: 'Aceita iniciantes', kind: 'boolean' },
    ],
  },
  {
    type: 'program', label: 'Programa educacional', plural: 'Programas educacionais', group: 'Oportunidades', color: 'bg-eletric-50 text-eletric-700',
    common: ['url', 'category', 'duration'], cta: 'Ver programa',
    categories: ['Formação gratuita', 'Bootcamp', 'Curso de programação', 'Iniciação científica', 'Tecnologia para jovens', 'Mentoria', 'Workshop', 'Comunidade de aprendizado', 'Programa de empresa', 'Programa de universidade'],
    fields: [
      { key: 'org', label: 'Organização', kind: 'text', required: true },
      { key: 'requirements', label: 'Requisitos', kind: 'list' },
      { key: 'ageRange', label: 'Público / faixa etária', kind: 'text' },
      { key: 'modality', label: 'Modalidade', kind: 'select', options: MODALITY },
      { key: 'location', label: 'Localização', kind: 'text' },
      { key: 'scope', label: 'Alcance', kind: 'select', options: ['Local', 'Estadual', 'Nacional', 'Internacional'] },
      { key: 'deadline', label: 'Prazo de inscrição', kind: 'date' },
      { key: 'oppStatus', label: 'Status', kind: 'select', options: STATUS_OPP },
      { key: 'free', label: 'Gratuito', kind: 'boolean' },
    ],
  },
  {
    type: 'job', label: 'Vaga', plural: 'Jovem Aprendiz e empregos', group: 'Oportunidades', color: 'bg-tang-50 text-tang-700',
    common: ['url', 'category'], cta: 'Candidatar-se',
    categories: ['Jovem Aprendiz', 'Estágio', 'Vaga para iniciantes'],
    fields: [
      { key: 'company', label: 'Empresa', kind: 'text', required: true },
      { key: 'field', label: 'Área profissional', kind: 'select', options: ['Tecnologia', 'Engenharia', 'Automação e robótica', 'Administração', 'Outra'] },
      { key: 'modality', label: 'Modalidade', kind: 'select', options: ['Presencial', 'Híbrido', 'Remoto'] },
      { key: 'location', label: 'Localização', kind: 'text' },
      { key: 'scope', label: 'Alcance', kind: 'select', options: ['Local', 'Estadual', 'Nacional', 'Internacional'] },
      { key: 'requirements', label: 'Requisitos', kind: 'list' },
      { key: 'deadline', label: 'Prazo', kind: 'date' },
      { key: 'oppStatus', label: 'Status', kind: 'select', options: STATUS_OPP },
    ],
  },
  {
    type: 'competition', label: 'Olimpíada / competição', plural: 'Olimpíadas e competições', group: 'Oportunidades', color: 'bg-sun-50 text-sun-700',
    common: ['url', 'category'], cta: 'Site oficial',
    categories: ['Matemática', 'Física', 'Química', 'Informática', 'Robótica', 'Astronomia', 'Engenharia', 'Ciências em geral'],
    fields: [
      { key: 'audience', label: 'Público-alvo', kind: 'text' },
      { key: 'schooling', label: 'Faixa etária ou escolaridade', kind: 'text' },
      { key: 'modality', label: 'Modalidade', kind: 'select', options: MODALITY },
      { key: 'calendar', label: 'Calendário', kind: 'textarea' },
      { key: 'deadline', label: 'Prazo de inscrição', kind: 'date' },
      { key: 'scope', label: 'Alcance', kind: 'select', options: ['Local', 'Estadual', 'Nacional', 'Internacional'] },
      { key: 'howToStudy', label: 'Como começar a estudar', kind: 'list' },
      { key: 'oppStatus', label: 'Status', kind: 'select', options: STATUS_OPP },
    ],
  },
  {
    type: 'school_guide', label: 'Guia para a escola', plural: 'Oportunidades na escola', group: 'Oportunidades', color: 'bg-bubble-50 text-bubble-700',
    common: ['duration', 'category'], cta: 'Ler guia',
    categories: ['Clubes', 'Eventos', 'Organização', 'Parcerias'],
    fields: [
      { key: 'steps', label: 'Passo a passo', kind: 'list' },
      { key: 'checklist', label: 'Checklist', kind: 'list' },
    ],
  },
  {
    type: 'scholarship', label: 'Bolsa', plural: 'Bolsas de estudo', group: 'Futuro acadêmico', color: 'bg-leaf-50 text-leaf-700',
    common: ['url', 'category'], cta: 'Ver bolsa',
    categories: ['Bolsa no Brasil', 'Bolsa internacional', 'Programa de verão', 'Intercâmbio', 'Pesquisa para estudantes', 'Ensino médio'],
    fields: [
      { key: 'org', label: 'Instituição', kind: 'text' },
      { key: 'country', label: 'País', kind: 'text' },
      { key: 'coverage', label: 'Cobertura', kind: 'select', options: ['Integral', 'Parcial', 'Isenção de taxas', 'Auxílio'] },
      { key: 'requirements', label: 'Requisitos', kind: 'list' },
      { key: 'deadline', label: 'Prazo', kind: 'date' },
      { key: 'scope', label: 'Alcance', kind: 'select', options: ['Nacional', 'Internacional'] },
      { key: 'oppStatus', label: 'Status', kind: 'select', options: STATUS_OPP },
    ],
  },
  {
    type: 'university', label: 'Universidade', plural: 'Universidades', group: 'Futuro acadêmico', color: 'bg-eletric-50 text-eletric-700',
    common: ['url', 'category'], cta: 'Site da universidade',
    categories: ['Pública', 'Privada', 'Estrangeira'],
    fields: [
      { key: 'country', label: 'País', kind: 'text' },
      { key: 'city', label: 'Cidade', kind: 'text' },
      { key: 'courses', label: 'Cursos STEM', kind: 'list' },
      { key: 'admission', label: 'Forma de ingresso', kind: 'text', placeholder: 'ENEM/SISU, vestibular próprio, candidatura...' },
    ],
  },
  {
    type: 'story', label: 'Depoimento em vídeo', plural: 'Depoimentos em vídeo', group: 'Inspiração', color: 'bg-bubble-50 text-bubble-700',
    common: ['videoUrl', 'category', 'duration'], cta: 'Assistir depoimento',
    categories: ['Tecnologia', 'Engenharia', 'Ciência', 'Robótica', 'Universidade', 'Carreira', 'Empreendedorismo'],
    fields: [
      { key: 'person', label: 'Nome da pessoa', kind: 'text', required: true },
      { key: 'role', label: 'Quem é hoje', kind: 'text', placeholder: 'Ex.: Estudante de Engenharia Mecânica' },
      { key: 'context', label: 'O que viveu (aparece no card)', kind: 'text', placeholder: 'Ex.: Participou da Olimpíada de Matemática' },
      { key: 'stage', label: 'Em que etapa da linha de aprendizagem aparece', kind: 'select', options: ['descobrir', 'praticar', 'participar', 'futuro'], help: 'Define onde o vídeo aparece dentro da página da área.' },
      { key: 'relatedTo', label: 'Conteúdos relacionados (IDs)', kind: 'list', help: 'IDs das oportunidades, olimpíadas, bolsas ou guias de que a pessoa fala. O vídeo aparece dentro dessas páginas.' },
      { key: 'institution', label: 'Universidade ou programa', kind: 'text' },
      { key: 'country', label: 'País', kind: 'text' },
      { key: 'origin', label: 'De onde veio', kind: 'text', placeholder: 'Ex.: escola pública no interior de SP' },
      { key: 'tips', label: 'Dicas que a pessoa dá no vídeo', kind: 'list' },
      { key: 'abroad', label: 'Estudou fora (aparece em "Estudantes que chegaram lá")', kind: 'boolean' },
    ],
  },
  {
    type: 'event', label: 'Evento', plural: 'Eventos e prazos', group: 'Comunidade', color: 'bg-grape-50 text-grape-700',
    common: ['url', 'category'], cta: 'Ver evento',
    categories: ['Olimpíada', 'Inscrição de programa', 'Workshop', 'Evento', 'Feira científica', 'Competição', 'Prazo importante'],
    fields: [
      { key: 'date', label: 'Data', kind: 'date', required: true },
      { key: 'endDate', label: 'Data final', kind: 'date' },
      { key: 'location', label: 'Local', kind: 'text' },
      { key: 'modality', label: 'Modalidade', kind: 'select', options: MODALITY },
      { key: 'scope', label: 'Alcance', kind: 'select', options: ['Local', 'Estadual', 'Nacional', 'Internacional'] },
    ],
  },
  {
    type: 'showcase', label: 'Projeto de estudante', plural: 'Vitrine de projetos', group: 'Comunidade', color: 'bg-tang-50 text-tang-700',
    common: ['videoUrl', 'url', 'category'], cta: 'Ver projeto',
    categories: ['Robótica', 'Programação', 'Eletrônica', 'Inteligência Artificial', 'Mecânica', 'Ciências'],
    fields: [
      { key: 'team', label: 'Equipe / autores (primeiro nome)', kind: 'text' },
      { key: 'school', label: 'Escola / clube', kind: 'text' },
      { key: 'learned', label: 'O que aprenderam', kind: 'list' },
    ],
  },
  {
    type: 'resource', label: 'Recurso', plural: 'Central de recursos', group: 'Extras', color: 'bg-leaf-50 text-leaf-700',
    common: ['url', 'category'], cta: 'Baixar / abrir',
    categories: ['Modelo de currículo', 'Modelo de portfólio', 'Guia de estudos', 'Template para clubes', 'Planilha de organização', 'Material para projetos', 'Modelo de apresentação', 'Checklist'],
    fields: [{ key: 'format', label: 'Formato', kind: 'select', options: ['PDF', 'Documento', 'Slides', 'Planilha', 'Página web'] }],
  },
  {
    type: 'glossary', label: 'Termo do glossário', plural: 'Glossário STEM', group: 'Extras', color: 'bg-sun-50 text-sun-700',
    common: [], cta: 'Ver termo',
    fields: [{ key: 'example', label: 'Exemplo do dia a dia', kind: 'textarea' }],
  },
  {
    type: 'challenge', label: 'Desafio do mês', plural: 'Desafios do mês', group: 'Extras', color: 'bg-bubble-50 text-bubble-700',
    common: ['level', 'duration'], cta: 'Aceitar desafio',
    fields: [
      { key: 'month', label: 'Mês de referência', kind: 'text', placeholder: '2026-11' },
      { key: 'materials', label: 'Materiais', kind: 'list' },
      { key: 'steps', label: 'Missão', kind: 'list' },
      { key: 'points', label: 'Pontos', kind: 'number' },
    ],
  },
];

export const typeDef = (t: ContentType) => TYPES.find((d) => d.type === t)!;

export const LEARNING_TYPES: ContentType[] = ['course', 'tutorial', 'video', 'guide', 'tool', 'material', 'practice'];
export const OPPORTUNITY_TYPES: ContentType[] = ['opportunity', 'program', 'job', 'competition', 'scholarship'];

export const fieldStr = (item: ContentItem, key: string) => {
  const v = item.fields[key];
  return typeof v === 'string' ? v : v == null ? '' : String(v);
};
export const fieldList = (item: ContentItem, key: string): string[] => {
  const v = item.fields[key];
  return Array.isArray(v) ? v : typeof v === 'string' && v ? v.split('\n').filter(Boolean) : [];
};
