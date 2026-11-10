import type { ContentItem, Profile, UserData } from './types';
import { fieldList } from './contentTypes';

// Gamificação leve e individual: pontos, níveis e badges servem para o estudante
// enxergar a própria evolução. Não há ranking entre estudantes, de propósito.

export const POINTS = { content: 10, path: 50, goal: 5, project: 20 };

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
}

export function pathProgress(path: ContentItem, completed: string[]) {
  const items = fieldList(path, 'items');
  const done = items.filter((id) => completed.includes(id)).length;
  return { done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
}

export function computeStats(profile: Profile | null, data: UserData, items: ContentItem[]) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const paths = items.filter((i) => i.type === 'path');
  const pathsDone = paths.filter((p) => pathProgress(p, data.completed).pct === 100);
  const challenges = data.challengesDone.map((id) => byId.get(id)).filter(Boolean) as ContentItem[];
  const challengePts = challenges.reduce((s, c) => s + (Number(c.fields.points) || 30), 0);
  const goalsDone = profile?.goals.filter((g) => g.done).length ?? 0;
  const projectsDone = profile?.plannedProjects.filter((p) => p.stage === 'concluido').length ?? 0;
  const points =
    data.completed.length * POINTS.content + pathsDone.length * POINTS.path + challengePts + goalsDone * POINTS.goal + projectsDone * POINTS.project;

  const areasTouched = new Set(data.completed.map((id) => byId.get(id)?.area).filter((a) => a && a !== 'geral'));

  const badges: Badge[] = [
    { id: 'first', emoji: '🌱', name: 'Primeiro passo', description: 'Conclua seu primeiro conteúdo.', earned: data.completed.length >= 1 },
    { id: 'curious', emoji: '🔍', name: 'Curiosidade ativada', description: 'Conclua 5 conteúdos.', earned: data.completed.length >= 5 },
    { id: 'explorer', emoji: '🧭', name: 'Explorador(a) STEM', description: 'Conclua conteúdos das três áreas.', earned: areasTouched.size >= 3 },
    { id: 'trail', emoji: '🥾', name: 'Trilha completa', description: 'Termine uma trilha de aprendizagem.', earned: pathsDone.length >= 1 },
    { id: 'saver', emoji: '📌', name: 'Colecionador(a)', description: 'Salve 5 itens nos favoritos.', earned: data.bookmarks.length >= 5 },
    { id: 'maker', emoji: '🛠️', name: 'Mão na massa', description: 'Complete um desafio do mês.', earned: challenges.length >= 1 },
    { id: 'dreamer', emoji: '🎯', name: 'Sonhos com plano', description: 'Crie 3 objetivos pessoais.', earned: (profile?.goals.length ?? 0) >= 3 },
    { id: 'builder', emoji: '🚀', name: 'Construtor(a)', description: 'Conclua um projeto pessoal.', earned: projectsDone >= 1 },
  ];

  const LEVELS = [
    { min: 0, name: 'Curioso(a)' },
    { min: 50, name: 'Explorador(a)' },
    { min: 150, name: 'Inventor(a)' },
    { min: 300, name: 'Inovador(a)' },
    { min: 600, name: 'Transformador(a)' },
  ];
  const levelIdx = LEVELS.reduce((acc, l, i) => (points >= l.min ? i : acc), 0);
  const next = LEVELS[levelIdx + 1];
  const levelPct = next ? Math.round(((points - LEVELS[levelIdx].min) / (next.min - LEVELS[levelIdx].min)) * 100) : 100;

  return { points, badges, level: LEVELS[levelIdx].name, nextLevel: next, levelPct, pathsDone, areasTouched };
}
