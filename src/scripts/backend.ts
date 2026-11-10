import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SEED, SEED_POSTS } from '../dados/seed';
import type { CommunityPost, ContentItem, MentorPlan, Person, Profile, Role, UserData } from './types';

// Camada de dados. Duas implementações com a mesma interface:
//  • LocalBackend   — modo demonstração, tudo no localStorage do navegador.
//  • SupabaseBackend — produção (Postgres + Auth + RLS), ativado por VITE_SUPABASE_URL/ANON_KEY.
// As telas só conhecem a interface Backend, então trocar de modo não muda nenhuma página.

export type UserFlag = 'bookmarks' | 'completed' | 'challengesDone' | 'interests' | 'groups';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  ageRange: Profile['ageRange'];
  guardianConsent: boolean;
  city?: string;
  wantsMentor: boolean;
}

export interface Backend {
  mode: 'demo' | 'supabase';
  listContent(includeUnpublished: boolean): Promise<ContentItem[]>;
  saveContent(item: ContentItem): Promise<ContentItem>;
  deleteContent(id: string): Promise<void>;
  resetDemo?(): Promise<void>;
  uploadImage(file: File): Promise<string>;

  currentUser(): Promise<Profile | null>;
  signUp(input: SignUpInput): Promise<Profile>;
  signIn(email: string, password: string): Promise<Profile>;
  signOut(): Promise<void>;
  updateProfile(p: Profile): Promise<Profile>;
  deleteAccount(uid: string): Promise<void>;

  getUserData(uid: string): Promise<UserData>;
  setFlag(uid: string, flag: UserFlag, id: string, on: boolean): Promise<void>;

  listPosts(includeAll: boolean): Promise<CommunityPost[]>;
  createPost(p: Omit<CommunityPost, 'id' | 'status' | 'reports' | 'createdAt'>): Promise<CommunityPost>;
  moderatePost(id: string, status: CommunityPost['status']): Promise<void>;
  reportPost(id: string): Promise<void>;

  // ── Mentoria ──
  // Estudante: pede (ou dispensa) mentor, vê o próprio plano e marca metas.
  setWantsMentor(uid: string, want: boolean): Promise<Profile>;
  getPlan(studentId: string): Promise<MentorPlan | null>;
  toggleGoal(studentId: string, goalId: string, done: boolean): Promise<MentorPlan | null>;
  mentorName(mentorId: string): Promise<string | null>;
  // Mentor: só os próprios alunos. Equipe (admin): todo mundo.
  listPeople(): Promise<Person[]>;
  savePlan(plan: MentorPlan): Promise<MentorPlan>;
  // Só equipe (admin).
  assignMentor(studentId: string, mentorId: string | null): Promise<void>;
  setRole(uid: string, role: Role): Promise<void>;
}

export const emptyPlan = (studentId: string): MentorPlan => ({ studentId, goals: [], notes: [] });

export const EMPTY_USERDATA: UserData = { bookmarks: [], completed: [], challengesDone: [], interests: [], groups: [] };

export const newId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

// ─────────────────────────────── Local (demo) ───────────────────────────────

const K = {
  content: 'mm:content:v2',
  users: 'mm:users:v1',
  session: 'mm:session:v1',
  posts: 'mm:posts:v2',
  plans: 'mm:plans:v1',
  people: 'mm:people-seeded:v1',
  data: (uid: string) => `mm:userdata:v1:${uid}`,
};

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* armazenamento indisponível (aba anônima, cota): segue só em memória */
  }
};

async function hash(text: string) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 0;
    for (const c of text) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
    return `weak-${h}`;
  }
}

interface LocalUser extends Profile {
  salt: string;
  pass: string;
}

// Conta de administrador APENAS para o modo demonstração local.
// Em produção (Supabase), o papel de admin é definido no banco (ver supabase/schema.sql).
export const DEMO_ADMIN = { email: 'admin@megamorfose.demo', password: 'megamorfose' };

// Pessoas de demonstração para a mentoria (só no modo demonstração, só neste navegador).
// Senha de todas: megamorfose. Nomes marcados como "demo" para não serem confundidos com alunos reais.
export const DEMO_PEOPLE = {
  mentor: { email: 'mentora@megamorfose.demo', password: 'megamorfose' },
  student: { email: 'aluna@megamorfose.demo', password: 'megamorfose' },
};
async function seedDemoPeople(list: LocalUser[]) {
  const days = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
  const soon = (n: number, h: string) => `${new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10)}T${h}`;
  const mk = async (p: Partial<LocalUser> & { id: string; name: string; email: string }) => {
    if (list.some((u) => u.email === p.email)) return;
    const salt = newId();
    list.push({
      role: 'student', interests: [], publicProfile: false, goals: [], plannedProjects: [], createdAt: days(30), ageRange: '13a17',
      guardianConsent: true, wantsMentor: false, mentorId: null, lineProgress: {}, lastActiveAt: days(1), demo: true,
      ...p, salt, pass: await hash(salt + 'megamorfose'),
    } as LocalUser);
  };
  await mk({ id: 'demo-m1', name: 'Laura (mentora demo)', email: DEMO_PEOPLE.mentor.email, role: 'mentor', ageRange: '18mais', interests: ['eletronica', 'ia'] });
  await mk({ id: 'demo-m2', name: 'Bruno (mentor demo)', email: 'mentor2@megamorfose.demo', role: 'mentor', ageRange: '18mais', interests: ['mecanica'] });
  await mk({ id: 'demo-s1', name: 'Ana (aluna demo)', email: DEMO_PEOPLE.student.email, city: 'Boituva', interests: ['eletronica'], wantsMentor: true, mentorId: 'demo-m1', lineProgress: { eletronica: [0, 1] }, lastActiveAt: days(2) });
  await mk({ id: 'demo-s2', name: 'Davi (aluno demo)', email: 'aluno2@megamorfose.demo', city: 'Boituva', interests: ['ia'], wantsMentor: true, mentorId: 'demo-m1', lineProgress: { ia: [0] }, lastActiveAt: days(19) });
  await mk({ id: 'demo-s3', name: 'Lívia (aluna demo)', email: 'aluna3@megamorfose.demo', city: 'Tatuí', interests: ['mecanica'], wantsMentor: true, mentorId: null, lastActiveAt: days(1), createdAt: days(3) });
  await mk({ id: 'demo-s4', name: 'Enzo (aluno demo)', email: 'aluno4@megamorfose.demo', city: 'Boituva', interests: ['mecanica', 'eletronica'], wantsMentor: true, mentorId: null, lastActiveAt: days(0), createdAt: days(1), ageRange: '18mais' });
  await mk({ id: 'demo-s5', name: 'Marcos (aluno demo)', email: 'aluno5@megamorfose.demo', city: 'Iperó', interests: ['ia'], wantsMentor: true, mentorId: 'demo-m2', lineProgress: { mecanica: [0, 1, 2] }, lastActiveAt: days(4) });
  await mk({ id: 'demo-s6', name: 'Clara (aluna demo)', email: 'aluna6@megamorfose.demo', interests: ['ia'], wantsMentor: false, lastActiveAt: days(6), lineProgress: { ia: [0, 1] } });
  const plans: Record<string, MentorPlan> = {
    'demo-s1': {
      studentId: 'demo-s1', nextStep: 'Montar o circuito com sensor de luz (etapa Pratique)', nextStepLink: '/explorar/eletronica',
      nextMeeting: soon(3, '18:00'), meetingPlace: 'Online, no horário da equipe',
      goals: [{ id: 'g1', text: 'Terminar a trilha de primeiros passos', done: true }, { id: 'g2', text: 'Fazer o tutorial de sensor de luz', done: false }, { id: 'g3', text: 'Ler sobre a OBR', done: true }],
      notes: [{ id: 'n1', date: days(4).slice(0, 10), text: 'Primeiro encontro. Ana escolheu Eletrônica e quer participar de uma competição de robótica no ano que vem.', authorName: 'Laura (mentora demo)' }],
      updatedAt: days(4),
    },
    'demo-s2': { studentId: 'demo-s2', nextStep: 'Assistir aos vídeos da etapa Descubra de IA', nextStepLink: '/explorar/ia-visao-computacional', goals: [{ id: 'g1', text: 'Escolher um projeto de IA para começar', done: false }], notes: [{ id: 'n1', date: days(20).slice(0, 10), text: 'Davi está sem computador em casa; combinamos usar o laboratório da escola.', authorName: 'Laura (mentora demo)' }], updatedAt: days(20) },
    'demo-s5': { studentId: 'demo-s5', nextStep: 'Projeto do carrinho movido a elástico', nextStepLink: '/explorar/mecanica', nextMeeting: soon(6, '10:00'), meetingPlace: 'Escola, sala da robótica', goals: [{ id: 'g1', text: 'Trazer foto do carrinho', done: false }], notes: [], updatedAt: days(5) },
  };
  write(K.plans, { ...plans, ...read<Record<string, MentorPlan>>(K.plans, {}) });
  write(K.data('demo-s1'), { ...EMPTY_USERDATA, completed: ['v-el-1', 't-el-1', 'e-1'] });
  write(K.data('demo-s5'), { ...EMPTY_USERDATA, completed: ['p-me-1', 'v-me-1'] });
}

const strip = ({ salt: _s, pass: _p, ...profile }: LocalUser): Profile => profile;
const tick = () => new Promise((r) => setTimeout(r, 120));

class LocalBackend implements Backend {
  mode = 'demo' as const;

  private content(): ContentItem[] {
    return read<ContentItem[] | null>(K.content, null) ?? SEED;
  }
  private async users(): Promise<LocalUser[]> {
    const list = read<LocalUser[]>(K.users, []);
    if (!read<boolean>(K.people, false)) {
      await seedDemoPeople(list);
      write(K.people, true);
      write(K.users, list);
    }
    if (!list.some((u) => u.email === DEMO_ADMIN.email)) {
      const salt = newId();
      list.push({
        id: 'demo-admin', name: 'Equipe MegaMorfose', email: DEMO_ADMIN.email, role: 'admin', interests: [],
        publicProfile: false, goals: [], plannedProjects: [], createdAt: new Date().toISOString(), ageRange: '18mais',
        salt, pass: await hash(salt + DEMO_ADMIN.password),
      });
      write(K.users, list);
    }
    return list;
  }

  async listContent(all: boolean) {
    await tick();
    const items = this.content();
    return all ? items : items.filter((i) => i.status === 'published');
  }
  async saveContent(item: ContentItem) {
    const items = this.content();
    const next = { ...item, updatedAt: new Date().toISOString() };
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) items[idx] = next;
    else items.unshift(next);
    write(K.content, items);
    return next;
  }
  async deleteContent(id: string) {
    write(K.content, this.content().filter((i) => i.id !== id));
  }
  async uploadImage(file: File) {
    // Demo: a imagem vira data URL salva junto do conteúdo (limite para não estourar o localStorage).
    if (file.size > 400_000) throw new Error('No modo demonstração, use imagens de até 400 KB ou cole um link.');
    return new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
      r.readAsDataURL(file);
    });
  }
  async resetDemo() {
    localStorage.removeItem(K.content);
    localStorage.removeItem(K.posts);
  }

  async currentUser() {
    const id = read<string | null>(K.session, null);
    if (!id) return null;
    const users = await this.users();
    const u = users.find((x) => x.id === id);
    if (!u) return null;
    u.lastActiveAt = new Date().toISOString();
    write(K.users, users);
    return strip(u);
  }
  async signUp(input: SignUpInput) {
    const users = await this.users();
    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.email === email)) throw new Error('Já existe uma conta com este e-mail.');
    const salt = newId();
    const user: LocalUser = {
      id: newId(), name: input.name.trim(), email, role: 'student', city: input.city?.trim(), ageRange: input.ageRange,
      guardianConsent: input.guardianConsent, interests: [], publicProfile: false, goals: [], plannedProjects: [],
      createdAt: new Date().toISOString(), salt, pass: await hash(salt + input.password),
      wantsMentor: input.wantsMentor, mentorId: null, lineProgress: {}, lastActiveAt: new Date().toISOString(),
    };
    write(K.users, [...users, user]);
    write(K.session, user.id);
    return strip(user);
  }
  async signIn(email: string, password: string) {
    await tick();
    const u = (await this.users()).find((x) => x.email === email.trim().toLowerCase());
    if (!u || u.pass !== (await hash(u.salt + password))) throw new Error('E-mail ou senha incorretos.');
    write(K.session, u.id);
    return strip(u);
  }
  async signOut() {
    localStorage.removeItem(K.session);
  }
  async updateProfile(p: Profile) {
    const users = await this.users();
    const idx = users.findIndex((u) => u.id === p.id);
    if (idx < 0) throw new Error('Usuário não encontrado.');
    // papel e mentor só mudam pela equipe (assignMentor/setRole), nunca pelo próprio perfil
    users[idx] = { ...users[idx], ...p, role: users[idx].role, email: users[idx].email, mentorId: users[idx].mentorId };
    write(K.users, users);
    return strip(users[idx]);
  }
  async deleteAccount(uid: string) {
    write(K.users, (await this.users()).filter((u) => u.id !== uid));
    localStorage.removeItem(K.data(uid));
    localStorage.removeItem(K.session);
  }

  async getUserData(uid: string) {
    return { ...EMPTY_USERDATA, ...read<Partial<UserData>>(K.data(uid), {}) };
  }
  async setFlag(uid: string, flag: UserFlag, id: string, on: boolean) {
    const d = await this.getUserData(uid);
    const set = new Set(d[flag]);
    if (on) set.add(id);
    else set.delete(id);
    write(K.data(uid), { ...d, [flag]: [...set] });
  }

  private posts(): CommunityPost[] {
    return read<CommunityPost[] | null>(K.posts, null) ?? (SEED_POSTS as unknown as CommunityPost[]);
  }
  async listPosts(all: boolean) {
    const me = read<string | null>(K.session, null);
    return this.posts().filter((p) => all || p.status === 'approved' || p.authorId === me);
  }
  async createPost(p: Omit<CommunityPost, 'id' | 'status' | 'reports' | 'createdAt'>) {
    const post: CommunityPost = { ...p, id: newId(), status: 'pending', reports: 0, createdAt: new Date().toISOString() };
    write(K.posts, [post, ...this.posts()]);
    return post;
  }
  async moderatePost(id: string, status: CommunityPost['status']) {
    write(K.posts, this.posts().map((p) => (p.id === id ? { ...p, status } : p)));
  }
  async reportPost(id: string) {
    // 3 denúncias retiram a publicação do ar até nova moderação.
    write(K.posts, this.posts().map((p) => (p.id === id ? { ...p, reports: p.reports + 1, status: p.reports + 1 >= 3 ? 'pending' : p.status } : p)));
  }
  // ── Mentoria (demo) ──
  private plans(): Record<string, MentorPlan> {
    return read<Record<string, MentorPlan>>(K.plans, {});
  }
  private async me(): Promise<LocalUser | undefined> {
    const id = read<string | null>(K.session, null);
    return (await this.users()).find((u) => u.id === id);
  }
  // Mesma regra do banco: equipe vê tudo; mentor vê só os próprios alunos; estudante só a si.
  private async canSee(studentId: string) {
    const me = await this.me();
    if (!me) return false;
    if (me.role === 'admin' || me.id === studentId) return true;
    const st = (await this.users()).find((u) => u.id === studentId);
    return me.role === 'mentor' && st?.mentorId === me.id;
  }
  async setWantsMentor(uid: string, want: boolean) {
    const users = await this.users();
    const u = users.find((x) => x.id === uid);
    if (!u) throw new Error('Usuário não encontrado.');
    u.wantsMentor = want;
    if (!want) u.mentorId = null;
    write(K.users, users);
    return strip(u);
  }
  async getPlan(studentId: string) {
    if (!(await this.canSee(studentId))) return null;
    return this.plans()[studentId] ?? null;
  }
  async toggleGoal(studentId: string, goalId: string, done: boolean) {
    const me = await this.me();
    if (!me || (me.id !== studentId && !(await this.canSee(studentId)))) throw new Error('Sem permissão.');
    const all = this.plans();
    const plan = all[studentId];
    if (!plan) return null;
    plan.goals = plan.goals.map((g) => (g.id === goalId ? { ...g, done } : g));
    write(K.plans, all);
    return plan;
  }
  async mentorName(mentorId: string) {
    const m = (await this.users()).find((u) => u.id === mentorId);
    return m ? m.name : null;
  }
  async listPeople() {
    const me = await this.me();
    if (!me || (me.role !== 'admin' && me.role !== 'mentor')) return [];
    const plans = this.plans();
    const users = (await this.users()).filter((u) => me.role === 'admin' || u.mentorId === me.id);
    return Promise.all(users.map(async (u) => {
      const d = await this.getUserData(u.id);
      return { profile: strip(u), completed: d.completed.length + d.challengesDone.length, plan: plans[u.id] ?? null };
    }));
  }
  async savePlan(plan: MentorPlan) {
    const me = await this.me();
    const st = (await this.users()).find((u) => u.id === plan.studentId);
    if (!me || !st || !(me.role === 'admin' || (me.role === 'mentor' && st.mentorId === me.id))) throw new Error('Só o mentor deste aluno ou a equipe podem editar o plano.');
    const all = this.plans();
    all[plan.studentId] = { ...plan, updatedAt: new Date().toISOString() };
    write(K.plans, all);
    return all[plan.studentId];
  }
  private async adminOnly() {
    const me = await this.me();
    if (me?.role !== 'admin') throw new Error('Só a equipe pode fazer isso.');
  }
  async assignMentor(studentId: string, mentorId: string | null) {
    await this.adminOnly();
    const users = await this.users();
    const st = users.find((u) => u.id === studentId);
    if (!st) throw new Error('Estudante não encontrado.');
    if (mentorId && !users.some((u) => u.id === mentorId && (u.role === 'mentor' || u.role === 'admin'))) throw new Error('Mentor inválido.');
    st.mentorId = mentorId;
    if (mentorId) st.wantsMentor = true;
    write(K.users, users);
  }
  async setRole(uid: string, role: Role) {
    await this.adminOnly();
    const users = await this.users();
    const u = users.find((x) => x.id === uid);
    if (!u) throw new Error('Usuário não encontrado.');
    if (u.id === 'demo-admin') throw new Error('A conta da equipe de demonstração não pode mudar de papel.');
    u.role = role;
    if (role !== 'mentor' && role !== 'admin') users.forEach((s) => { if (s.mentorId === uid) s.mentorId = null; });
    write(K.users, users);
  }
}

// ─────────────────────────────── Supabase ───────────────────────────────

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const toItem = (r: Row): ContentItem => ({
  id: r.id, type: r.type, title: r.title, summary: r.summary ?? '', body: r.body ?? undefined, cover: r.cover ?? undefined,
  area: r.area, category: r.category ?? undefined, tags: r.tags ?? [], level: r.level ?? undefined, duration: r.duration ?? undefined,
  url: r.url ?? undefined, videoUrl: r.video_url ?? undefined, status: r.status, featured: r.featured, demo: r.demo,
  fields: r.fields ?? {}, createdAt: r.created_at, updatedAt: r.updated_at,
});
const fromItem = (i: ContentItem): Row => ({
  id: i.id, type: i.type, title: i.title, summary: i.summary, body: i.body ?? null, cover: i.cover ?? null, area: i.area,
  category: i.category ?? null, tags: i.tags, level: i.level ?? null, duration: i.duration ?? null, url: i.url ?? null,
  video_url: i.videoUrl ?? null, status: i.status, featured: !!i.featured, demo: !!i.demo, fields: i.fields,
});
const toProfile = (r: Row, email: string): Profile => ({
  id: r.id, name: r.name, email, role: r.role, city: r.city ?? undefined, ageRange: r.age_range ?? undefined,
  guardianConsent: r.guardian_consent, interests: r.interests ?? [], bio: r.bio ?? undefined, publicProfile: r.public_profile,
  goals: r.goals ?? [], plannedProjects: r.planned_projects ?? [], createdAt: r.created_at,
  wantsMentor: !!r.wants_mentor, mentorId: r.mentor_id ?? null, lineProgress: r.line_progress ?? {}, lastActiveAt: r.last_active_at ?? undefined,
});
const toPlan = (r: Row): MentorPlan => ({
  studentId: r.student_id, nextStep: r.next_step ?? undefined, nextStepLink: r.next_step_link ?? undefined,
  nextMeeting: r.next_meeting ? String(r.next_meeting).slice(0, 16) : undefined, meetingPlace: r.meeting_place ?? undefined,
  goals: r.goals ?? [], notes: r.notes ?? [], updatedAt: r.updated_at,
});

const FLAG_TABLE: Record<UserFlag, { table: string; col: string; extra?: Row }> = {
  bookmarks: { table: 'bookmarks', col: 'content_id' },
  completed: { table: 'progress', col: 'content_id', extra: { kind: 'content' } },
  challengesDone: { table: 'progress', col: 'content_id', extra: { kind: 'challenge' } },
  interests: { table: 'collab_interests', col: 'post_id' },
  groups: { table: 'group_members', col: 'group_id' },
};

class SupabaseBackend implements Backend {
  mode = 'supabase' as const;
  constructor(private sb: SupabaseClient) {}

  private ok<T>(res: { data: T; error: { message: string } | null }) {
    if (res.error) throw new Error(res.error.message);
    return res.data;
  }

  async listContent(all: boolean) {
    let q = this.sb.from('content_items').select('*').order('created_at', { ascending: false });
    if (!all) q = q.eq('status', 'published');
    return (this.ok(await q) as Row[]).map(toItem);
  }
  async saveContent(item: ContentItem) {
    return toItem(this.ok(await this.sb.from('content_items').upsert(fromItem(item)).select().single()) as Row);
  }
  async deleteContent(id: string) {
    this.ok(await this.sb.from('content_items').delete().eq('id', id));
  }

  async uploadImage(file: File) {
    const path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    this.ok(await this.sb.storage.from('media').upload(path, file, { upsert: false }));
    return this.sb.storage.from('media').getPublicUrl(path).data.publicUrl;
  }

  async currentUser() {
    const { data } = await this.sb.auth.getUser();
    if (!data.user) return null;
    const row = this.ok(await this.sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle()) as Row | null;
    if (row) void this.sb.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('id', data.user.id);
    return row ? toProfile(row, data.user.email ?? '') : null;
  }
  async signUp(input: SignUpInput) {
    const { data, error } = await this.sb.auth.signUp({
      email: input.email.trim(), password: input.password,
      options: { data: { name: input.name.trim(), age_range: input.ageRange, guardian_consent: input.guardianConsent, city: input.city ?? null, wants_mentor: input.wantsMentor } },
    });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Conta criada! Confirme seu e-mail para entrar.');
    const p = await this.currentUser();
    if (!p) throw new Error('Perfil não encontrado. Verifique o gatilho handle_new_user no banco.');
    return p;
  }
  async signIn(email: string, password: string) {
    const { error } = await this.sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error('E-mail ou senha incorretos.');
    const p = await this.currentUser();
    if (!p) throw new Error('Perfil não encontrado.');
    return p;
  }
  async signOut() {
    await this.sb.auth.signOut();
  }
  async updateProfile(p: Profile) {
    // role não é enviado: só pode ser alterado no banco por um administrador.
    const row = this.ok(await this.sb.from('profiles').update({
      name: p.name, city: p.city ?? null, interests: p.interests, bio: p.bio ?? null, public_profile: p.publicProfile,
      goals: p.goals, planned_projects: p.plannedProjects, line_progress: p.lineProgress ?? {},
    }).eq('id', p.id).select().single()) as Row;
    return toProfile(row, p.email);
  }
  async deleteAccount() {
    // Remoção definitiva exige função no servidor (service_role). Ver supabase/schema.sql → delete_my_account.
    this.ok(await this.sb.rpc('delete_my_account'));
    await this.sb.auth.signOut();
  }

  async getUserData(uid: string): Promise<UserData> {
    const [bm, pr, ci, gm] = await Promise.all([
      this.sb.from('bookmarks').select('content_id').eq('user_id', uid),
      this.sb.from('progress').select('content_id, kind').eq('user_id', uid),
      this.sb.from('collab_interests').select('post_id').eq('user_id', uid),
      this.sb.from('group_members').select('group_id').eq('user_id', uid),
    ]);
    const progress = (this.ok(pr) as Row[]) ?? [];
    return {
      bookmarks: (this.ok(bm) as Row[]).map((r) => r.content_id),
      completed: progress.filter((r) => r.kind === 'content').map((r) => r.content_id),
      challengesDone: progress.filter((r) => r.kind === 'challenge').map((r) => r.content_id),
      interests: (this.ok(ci) as Row[]).map((r) => r.post_id),
      groups: (this.ok(gm) as Row[]).map((r) => r.group_id),
    };
  }
  async setFlag(uid: string, flag: UserFlag, id: string, on: boolean) {
    const t = FLAG_TABLE[flag];
    if (on) this.ok(await this.sb.from(t.table).upsert({ user_id: uid, [t.col]: id, ...t.extra }));
    else {
      let q = this.sb.from(t.table).delete().eq('user_id', uid).eq(t.col, id);
      if (t.extra?.kind) q = q.eq('kind', t.extra.kind);
      this.ok(await q);
    }
  }

  async listPosts() {
    // As políticas RLS já limitam: aprovadas para todos, próprias para o autor, todas para admin.
    const rows = this.ok(await this.sb.from('community_posts').select('*').order('created_at', { ascending: false })) as Row[];
    return rows.map((r) => ({
      id: r.id, authorId: r.author_id, authorName: r.author_name, kind: r.kind, area: r.area, title: r.title, text: r.text,
      status: r.status, reports: r.reports, createdAt: r.created_at,
    }));
  }
  async createPost(p: Omit<CommunityPost, 'id' | 'status' | 'reports' | 'createdAt'>) {
    const r = this.ok(await this.sb.from('community_posts').insert({
      author_id: p.authorId, author_name: p.authorName, kind: p.kind, area: p.area, title: p.title, text: p.text,
    }).select().single()) as Row;
    return { ...p, id: r.id, status: r.status, reports: 0, createdAt: r.created_at };
  }
  async moderatePost(id: string, status: CommunityPost['status']) {
    this.ok(await this.sb.from('community_posts').update({ status }).eq('id', id));
  }
  async reportPost(id: string) {
    this.ok(await this.sb.rpc('report_post', { post_id: id }));
  }
  // ── Mentoria ── (regras de acesso garantidas pelas políticas RLS e funções em supabase/schema.sql)
  async setWantsMentor(uid: string, want: boolean) {
    this.ok(await this.sb.rpc('set_wants_mentor', { want }));
    const p = await this.currentUser();
    if (!p || p.id !== uid) throw new Error('Perfil não encontrado.');
    return p;
  }
  async getPlan(studentId: string) {
    const r = this.ok(await this.sb.from('mentor_plans').select('*').eq('student_id', studentId).maybeSingle()) as Row | null;
    return r ? toPlan(r) : null;
  }
  async toggleGoal(studentId: string, goalId: string, done: boolean) {
    this.ok(await this.sb.rpc('toggle_plan_goal', { student: studentId, goal_id: goalId, is_done: done }));
    return this.getPlan(studentId);
  }
  async mentorName(mentorId: string) {
    const r = this.ok(await this.sb.rpc('mentor_name', { mentor: mentorId })) as string | null;
    return r ?? null;
  }
  async listPeople() {
    // RLS: equipe recebe todos os perfis; mentor recebe só os alunos ligados a ele.
    const [pr, pl, pg] = await Promise.all([
      this.sb.rpc('list_people'),
      this.sb.from('mentor_plans').select('*'),
      this.sb.from('progress').select('user_id'),
    ]);
    const plans = new Map((this.ok(pl) as Row[]).map((r) => [r.student_id, toPlan(r)]));
    const counts = new Map<string, number>();
    for (const r of (this.ok(pg) as Row[])) counts.set(r.user_id, (counts.get(r.user_id) ?? 0) + 1);
    return (this.ok(pr) as Row[]).map((r) => ({ profile: toProfile(r, r.email ?? ''), completed: counts.get(r.id) ?? 0, plan: plans.get(r.id) ?? null }));
  }
  async savePlan(plan: MentorPlan) {
    const r = this.ok(await this.sb.from('mentor_plans').upsert({
      student_id: plan.studentId, next_step: plan.nextStep ?? null, next_step_link: plan.nextStepLink ?? null,
      next_meeting: plan.nextMeeting || null, meeting_place: plan.meetingPlace ?? null, goals: plan.goals, notes: plan.notes,
    }).select().single()) as Row;
    return toPlan(r);
  }
  async assignMentor(studentId: string, mentorId: string | null) {
    this.ok(await this.sb.rpc('assign_mentor', { student: studentId, mentor: mentorId }));
  }
  async setRole(uid: string, role: Role) {
    this.ok(await this.sb.from('profiles').update({ role }).eq('id', uid));
  }
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const backend: Backend = url && key ? new SupabaseBackend(createClient(url, key)) : new LocalBackend();
