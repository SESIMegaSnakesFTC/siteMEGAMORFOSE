import type { AreaId, Level } from './types';

export interface AreaMeta {
  id: AreaId;
  slug: string;
  name: string;
  short: string;
  tagline: string;
  intro: string;
  everyday: string[];
  learn: string[];
  topics: string[];
  color: 'grape' | 'tang' | 'eletric' | 'leaf';
  gradient: string;
  soft: string;
  text: string;
  ring: string;
  solid: string;
}

export const AREAS: AreaMeta[] = [
  {
    id: 'ia',
    slug: 'ia-visao-computacional',
    name: 'AI & Visão Computacional',
    short: 'AI & Visão',
    tagline: 'Ensine máquinas a enxergar e aprender.',
    intro:
      'Inteligência Artificial é a área que cria sistemas capazes de reconhecer padrões, tomar decisões e aprender com exemplos. A Visão Computacional é a parte da IA que permite que computadores "vejam": identifiquem rostos, objetos, placas, cores e movimentos em imagens e vídeos.',
    everyday: ['Desbloqueio do celular pelo rosto', 'Filtros de redes sociais', 'Carros que leem placas de trânsito', 'Robôs que encontram objetos na FTC'],
    learn: [
      'O que é IA e como ela aprende com exemplos',
      'A diferença entre IA, Machine Learning e Visão Computacional',
      'Como um computador reconhece imagens e objetos',
      'Onde a IA aparece na medicina, na indústria e na robótica',
      'Como treinar seu primeiro modelo sem saber programar',
    ],
    topics: [
      'Introdução à Inteligência Artificial',
      'O que é Machine Learning?',
      'O que é Visão Computacional?',
      'Reconhecimento de imagens e objetos',
      'Aplicações da IA no cotidiano',
      'IA na medicina',
      'IA na indústria',
      'IA na robótica',
      'Projetos práticos para iniciantes',
      'Ferramentas para experimentar IA',
    ],
    color: 'grape',
    gradient: 'from-grape-500 via-[#9B6BFF] to-bubble-500',
    soft: 'bg-grape-50',
    text: 'text-grape-700',
    ring: 'ring-grape-100',
    solid: 'bg-grape-500',
  },
  {
    id: 'eletronica',
    slug: 'eletronica',
    name: 'Eletrônica',
    short: 'Eletrônica',
    tagline: 'Dê energia e inteligência às suas ideias.',
    intro:
      'A eletrônica estuda como controlar a eletricidade para fazer coisas acontecerem: acender um LED, ler um sensor, girar um motor ou enviar uma mensagem. Ela está dentro de quase tudo o que você usa, do controle remoto ao robô de competição.',
    everyday: ['Carregador do celular', 'Sensor de presença que acende a luz', 'Controle do videogame', 'Motores e sensores de um robô'],
    learn: [
      'O que são tensão, corrente e resistência (sem complicação)',
      'Como montar seu primeiro circuito com segurança',
      'Para que servem resistores, LEDs, capacitores e transistores',
      'Como sensores e atuadores conversam com um microcontrolador',
      'Como simular circuitos de graça, sem comprar nada',
    ],
    topics: [
      'Introdução à eletrônica',
      'Como funcionam os circuitos',
      'Tensão, corrente e resistência',
      'Resistores, LEDs, capacitores e outros componentes',
      'Sensores e atuadores',
      'Arduino e microcontroladores',
      'Eletrônica aplicada à robótica',
      'Eletrônica no cotidiano',
      'Projetos práticos para iniciantes',
      'Simuladores de circuitos',
    ],
    color: 'tang',
    gradient: 'from-tang-500 via-[#FF9A3D] to-sun-400',
    soft: 'bg-tang-50',
    text: 'text-tang-700',
    ring: 'ring-tang-100',
    solid: 'bg-tang-500',
  },
  {
    id: 'mecanica',
    slug: 'mecanica',
    name: 'Mecânica',
    short: 'Mecânica',
    tagline: 'Entenda como as coisas se movem.',
    intro:
      'A mecânica explica como forças, movimentos e estruturas funcionam. Engrenagens, polias, alavancas e eixos transformam energia em movimento útil, e é com eles que se constrói desde uma bicicleta até o braço de um robô.',
    everyday: ['Marchas da bicicleta', 'Abridor de garrafa (alavanca!)', 'Elevadores e guindastes', 'Braços e garras de robôs'],
    learn: [
      'Como força, movimento e energia se relacionam',
      'Como engrenagens trocam força por velocidade',
      'Polias, alavancas e sistemas de transmissão',
      'Como projetar estruturas firmes e leves',
      'Primeiros passos em modelagem e impressão 3D',
    ],
    topics: [
      'Introdução à mecânica',
      'Força, movimento e energia',
      'Engrenagens',
      'Polias e alavancas',
      'Sistemas de transmissão',
      'Estruturas e mecanismos',
      'Cinemática básica',
      'Mecânica aplicada à robótica',
      'Impressão 3D e modelagem',
      'Softwares e simuladores',
    ],
    color: 'eletric',
    gradient: 'from-eletric-500 via-[#3F8CFF] to-leaf-500',
    soft: 'bg-eletric-50',
    text: 'text-eletric-700',
    ring: 'ring-eletric-100',
    solid: 'bg-eletric-500',
  },
];

export const GENERAL_AREA = {
  id: 'geral' as AreaId,
  name: 'Geral',
  short: 'Geral',
  gradient: 'from-leaf-500 via-[#2CC48A] to-eletric-500',
  soft: 'bg-leaf-50',
  text: 'text-leaf-700',
  solid: 'bg-leaf-500',
};

export const areaById = (id: AreaId) => AREAS.find((a) => a.id === id) ?? GENERAL_AREA;
export const areaBySlug = (slug?: string) => AREAS.find((a) => a.slug === slug);

export const AREA_OPTIONS: { value: AreaId; label: string }[] = [
  { value: 'ia', label: 'AI & Visão Computacional' },
  { value: 'eletronica', label: 'Eletrônica' },
  { value: 'mecanica', label: 'Mecânica' },
  { value: 'geral', label: 'Geral / STEM' },
];

export const LEVELS: { value: Level; label: string }[] = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
];
export const levelLabel = (l?: Level) => LEVELS.find((x) => x.value === l)?.label ?? '';
