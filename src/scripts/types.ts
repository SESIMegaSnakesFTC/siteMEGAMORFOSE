// Modelo de conteúdo único e extensível. Todo conteúdo gerenciável (vídeos, cursos,
// oportunidades, histórias...) é um ContentItem com campos comuns + `fields` específicos
// do tipo, descritos no registro de tipos (src/scripts/contentTypes.ts). Assim, um novo tipo
// de conteúdo é adicionado sem mudar o banco nem as telas do painel administrativo.

export type AreaId = 'ia' | 'eletronica' | 'mecanica' | 'geral';
export type Level = 'iniciante' | 'intermediario' | 'avancado';
export type Status = 'draft' | 'published' | 'archived';

export type ContentType =
  | 'video'
  | 'tutorial'
  | 'course'
  | 'tool'
  | 'guide'
  | 'material'
  | 'practice'
  | 'opportunity'
  | 'program'
  | 'job'
  | 'competition'
  | 'scholarship'
  | 'university'
  | 'story'
  | 'event'
  | 'showcase'
  | 'school_guide'
  | 'resource'
  | 'glossary'
  | 'challenge'
  | 'path';

export type FieldValue = string | number | boolean | string[] | null | undefined;

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  summary: string;
  body?: string;
  cover?: string; // URL de imagem; vazio = capa ilustrada gerada
  area: AreaId;
  category?: string;
  tags: string[];
  level?: Level;
  duration?: string;
  url?: string; // link externo oficial
  videoUrl?: string; // YouTube/Vimeo
  status: Status;
  featured?: boolean;
  demo?: boolean; // "Conteúdo demonstrativo"
  fields: Record<string, FieldValue>;
  createdAt: string;
  updatedAt: string;
}

// student = estudante · mentor = membro da equipe que acompanha alunos · admin = equipe (hub da equipe e painel)
export type Role = 'student' | 'mentor' | 'admin';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
  city?: string;
  ageRange?: 'menor13' | '13a17' | '18mais';
  guardianConsent?: boolean;
  interests: AreaId[];
  bio?: string;
  publicProfile: boolean;
  goals: Goal[];
  plannedProjects: PlannedProject[];
  createdAt: string;
  // Mentoria: o estudante escolhe no cadastro (ou depois) se quer um mentor.
  // Só a equipe (admin) define quem é o mentor (mentorId).
  wantsMentor?: boolean;
  mentorId?: string | null;
  lineProgress?: Record<string, number[]>; // etapas concluídas por área (0 a 5)
  lastActiveAt?: string;
  demo?: boolean;
}

export interface PlanGoal {
  id: string;
  text: string;
  done: boolean;
}

export interface MentorNote {
  id: string;
  date: string; // AAAA-MM-DD
  text: string;
  authorName: string;
}

// Plano de mentoria de um estudante. Visível para o estudante, o mentor dele e a equipe.
// Não é um chat: são combinados e registros de encontros, sempre visíveis à equipe.
export interface MentorPlan {
  studentId: string;
  nextStep?: string;
  nextStepLink?: string; // caminho interno, ex.: /explorar/eletronica
  nextMeeting?: string; // AAAA-MM-DDTHH:MM
  meetingPlace?: string;
  goals: PlanGoal[];
  notes: MentorNote[];
  updatedAt?: string;
}

export interface Person {
  profile: Profile;
  completed: number; // conteúdos concluídos
  plan: MentorPlan | null;
}

export interface Goal {
  id: string;
  text: string;
  done: boolean;
}

export interface PlannedProject {
  id: string;
  title: string;
  area: AreaId;
  stage: 'ideia' | 'fazendo' | 'concluido';
}

export interface UserData {
  bookmarks: string[];
  completed: string[]; // ids de conteúdos concluídos
  challengesDone: string[];
  interests: string[]; // ids de publicações de colaboração com interesse
  groups: string[]; // grupos/comunidades que o estudante segue
}

export type PostKind = 'projeto' | 'colaboracao' | 'evento' | 'novidade';
export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string; // apenas primeiro nome
  kind: PostKind;
  area: AreaId;
  title: string;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  reports: number;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  area: AreaId;
  kind: 'estudo' | 'clube' | 'comunidade';
  description: string;
  demo?: boolean;
}
