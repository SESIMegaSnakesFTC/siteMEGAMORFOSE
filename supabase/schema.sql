-- ═══════════════════════════════════════════════════════════════════════════
-- MegaMorfose — esquema do banco (Supabase / PostgreSQL)
-- Rode este arquivo inteiro no SQL Editor do Supabase (projeto novo).
-- Segurança: todas as tabelas usam Row Level Security (RLS).
--   • Visitantes leem apenas conteúdo publicado.
--   • Estudantes leem/escrevem apenas os próprios dados.
--   • Administradores (profiles.role = 'admin') = equipe: conteúdo, moderação e hub da equipe.
--   • Mentores (profiles.role = 'mentor') veem e editam só o plano dos alunos ligados a eles.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Tipos ────────────────────────────────────────────────────────────────
create type content_status as enum ('draft', 'published', 'archived');
create type user_role as enum ('student', 'mentor', 'admin');
create type post_status as enum ('pending', 'approved', 'rejected');

-- ─── Perfis (1:1 com auth.users) ──────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  role user_role not null default 'student',
  city text,
  age_range text check (age_range in ('menor13', '13a17', '18mais')),
  guardian_consent boolean not null default false,
  interests text[] not null default '{}',
  bio text check (char_length(bio) <= 300),
  public_profile boolean not null default false,
  goals jsonb not null default '[]',
  planned_projects jsonb not null default '[]',
  created_at timestamptz not null default now(),
  -- Mentoria: o estudante escolhe se quer mentor; só a equipe define quem é o mentor.
  wants_mentor boolean not null default false,
  mentor_id uuid references public.profiles (id) on delete set null,
  line_progress jsonb not null default '{}',
  last_active_at timestamptz
);
create index profiles_mentor_idx on public.profiles (mentor_id);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Cria o perfil automaticamente no cadastro (dados vêm de options.data no signUp).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, age_range, guardian_consent, city, wants_mentor, last_active_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'Estudante'),
    new.raw_user_meta_data ->> 'age_range',
    coalesce((new.raw_user_meta_data ->> 'guardian_consent')::boolean, false),
    new.raw_user_meta_data ->> 'city',
    coalesce((new.raw_user_meta_data ->> 'wants_mentor')::boolean, false),
    now()
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impede que um estudante promova a si mesmo (admin/mentor) ou escolha o próprio mentor.
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() nulo = SQL Editor/service role (equipe técnica), permitido.
  if auth.uid() is not null and not public.is_admin() then
    if new.role <> old.role then new.role := old.role; end if;
    -- mentor_id só muda pela equipe, ou por set_wants_mentor (quando o aluno dispensa o mentor).
    if new.mentor_id is distinct from old.mentor_id and coalesce(current_setting('mm.allow_mentor_change', true), '') <> 'on' then
      new.mentor_id := old.mentor_id;
    end if;
  end if;
  return new;
end $$;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

alter table public.profiles enable row level security;
create policy "perfil: dono lê" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "perfil: dono edita" on public.profiles for update using (id = auth.uid() or public.is_admin());
-- O mentor lê o perfil (nome, idade, cidade, interesses, progresso) só dos alunos ligados a ele.
create policy "perfil: mentor lê seus alunos" on public.profiles for select using (mentor_id = auth.uid());

-- Quando alguém deixa de ser mentor, os alunos dele voltam para a fila.
create or replace function public.release_students() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.role in ('mentor', 'admin') and new.role = 'student' then
    perform set_config('mm.allow_mentor_change', 'on', true);
    update public.profiles set mentor_id = null where mentor_id = new.id;
  end if;
  return new;
end $$;
create trigger profiles_release_students after update of role on public.profiles
  for each row execute function public.release_students();

create or replace function public.is_mentor_of(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles s join public.profiles m on m.id = s.mentor_id
    where s.id = student and m.id = auth.uid() and m.role in ('mentor', 'admin')
  );
$$;

-- ─── Conteúdo (todas as entidades editoriais) ─────────────────────────────
-- Um registro por conteúdo; `type` identifica a entidade (video, course, tutorial,
-- path, opportunity, program, job, competition, scholarship, university, story,
-- event, showcase, school_guide, resource, glossary, challenge, guide, tool,
-- material, practice). Campos específicos de cada tipo ficam em `fields` (jsonb),
-- descritos em src/scripts/contentTypes.ts. Novos tipos não exigem migração.
create table public.content_items (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,63}$'),
  type text not null,
  title text not null check (char_length(title) between 3 and 200),
  summary text not null default '',
  body text,
  cover text,
  area text not null default 'geral' check (area in ('ia', 'eletronica', 'mecanica', 'geral')),
  category text,
  tags text[] not null default '{}',
  level text check (level in ('iniciante', 'intermediario', 'avancado')),
  duration text,
  url text check (url is null or url ~ '^https://'),
  video_url text,
  status content_status not null default 'draft',
  featured boolean not null default false,
  demo boolean not null default false,
  fields jsonb not null default '{}',
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index content_items_type_status on public.content_items (type, status);
create index content_items_area on public.content_items (area);
create index content_items_fields on public.content_items using gin (fields);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger content_items_touch before update on public.content_items
  for each row execute function public.touch_updated_at();

alter table public.content_items enable row level security;
create policy "conteúdo: todos leem publicados" on public.content_items for select using (status = 'published' or public.is_admin());
create policy "conteúdo: admin insere" on public.content_items for insert with check (public.is_admin());
create policy "conteúdo: admin edita" on public.content_items for update using (public.is_admin());
create policy "conteúdo: admin exclui" on public.content_items for delete using (public.is_admin());

-- ─── Dados do estudante ───────────────────────────────────────────────────
create table public.bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  content_id text not null references public.content_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, content_id)
);
create table public.progress (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  content_id text not null references public.content_items (id) on delete cascade,
  kind text not null default 'content' check (kind in ('content', 'challenge')),
  completed_at timestamptz not null default now(),
  primary key (user_id, content_id, kind)
);
-- Conquistas são calculadas a partir de progress/bookmarks/goals (src/scripts/gamification.ts).
-- Esta tabela registra badges emitidos oficialmente (ex.: certificados de workshop).
create table public.achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  certificate_url text,
  primary key (user_id, badge_id)
);

alter table public.bookmarks enable row level security;
alter table public.progress enable row level security;
alter table public.achievements enable row level security;
create policy "favoritos: dono" on public.bookmarks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "progresso: dono" on public.progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "progresso: mentor e equipe leem" on public.progress for select using (public.is_admin() or public.is_mentor_of(user_id));
create policy "conquistas: dono lê" on public.achievements for select using (user_id = auth.uid() or public.is_admin());
create policy "conquistas: admin emite" on public.achievements for all using (public.is_admin()) with check (public.is_admin());

-- ─── Comunidade (moderada, sem mensagens privadas) ────────────────────────
create table public.communities (
  id text primary key,
  name text not null,
  area text not null default 'geral',
  kind text not null check (kind in ('estudo', 'clube', 'comunidade')),
  description text,
  created_at timestamptz not null default now()
);
create table public.group_members (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  group_id text not null,
  joined_at timestamptz not null default now(),
  primary key (user_id, group_id)
);
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  author_name text not null check (char_length(author_name) <= 40), -- só o primeiro nome
  kind text not null check (kind in ('projeto', 'colaboracao', 'evento', 'novidade')),
  area text not null default 'geral',
  title text not null check (char_length(title) between 5 and 90),
  text text not null check (char_length(text) between 10 and 800),
  status post_status not null default 'pending',
  reports int not null default 0,
  created_at timestamptz not null default now()
);
-- Interesse em colaborar: visível só para quem registrou e para admins (que fazem a ponte).
create table public.collab_interests (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.communities enable row level security;
alter table public.group_members enable row level security;
alter table public.community_posts enable row level security;
alter table public.collab_interests enable row level security;
create policy "grupos: todos leem" on public.communities for select using (true);
create policy "grupos: admin gerencia" on public.communities for all using (public.is_admin()) with check (public.is_admin());
create policy "membros: dono" on public.group_members for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "membros: admin lê" on public.group_members for select using (public.is_admin());
create policy "posts: leitura" on public.community_posts for select using (status = 'approved' or author_id = auth.uid() or public.is_admin());
-- Estudante só cria como 'pending' e em nome próprio.
create policy "posts: estudante cria" on public.community_posts for insert
  with check (author_id = auth.uid() and status = 'pending' and reports = 0);
create policy "posts: admin modera" on public.community_posts for update using (public.is_admin());
create policy "posts: autor ou admin exclui" on public.community_posts for delete using (author_id = auth.uid() or public.is_admin());
create policy "interesse: dono" on public.collab_interests for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "interesse: admin lê" on public.collab_interests for select using (public.is_admin());

-- Denúncia: incrementa o contador; com 3 denúncias volta para moderação.
create table public.post_reports (
  user_id uuid not null references auth.users (id) on delete cascade,
  post_id uuid not null references public.community_posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
alter table public.post_reports enable row level security;
create policy "denúncias: admin lê" on public.post_reports for select using (public.is_admin());

create or replace function public.report_post(post_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Entre na sua conta para denunciar.'; end if;
  insert into public.post_reports (user_id, post_id) values (auth.uid(), report_post.post_id) on conflict do nothing;
  if found then
    update public.community_posts
      set reports = reports + 1, status = case when reports + 1 >= 3 then 'pending'::post_status else status end
      where id = report_post.post_id;
  end if;
end $$;

-- ─── Mentoria ─────────────────────────────────────────────────────────────
-- Plano de cada estudante com mentor. Não é chat: são combinados e registros dos encontros,
-- visíveis para o estudante, o mentor dele e a equipe.
create table public.mentor_plans (
  student_id uuid primary key references public.profiles (id) on delete cascade,
  next_step text check (char_length(next_step) <= 200),
  next_step_link text check (next_step_link is null or next_step_link like '/%'),
  next_meeting timestamp,
  meeting_place text check (char_length(meeting_place) <= 120),
  goals jsonb not null default '[]',
  notes jsonb not null default '[]',
  updated_by uuid default auth.uid(),
  updated_at timestamptz not null default now()
);
alter table public.mentor_plans enable row level security;
create policy "plano: aluno, mentor e equipe leem" on public.mentor_plans for select
  using (student_id = auth.uid() or public.is_admin() or public.is_mentor_of(student_id));
create policy "plano: mentor e equipe criam" on public.mentor_plans for insert
  with check (public.is_admin() or public.is_mentor_of(student_id));
create policy "plano: mentor e equipe editam" on public.mentor_plans for update
  using (public.is_admin() or public.is_mentor_of(student_id));
create policy "plano: equipe exclui" on public.mentor_plans for delete using (public.is_admin());

create or replace function public.touch_plan() returns trigger language plpgsql as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end $$;
create trigger mentor_plans_touch before update on public.mentor_plans for each row execute function public.touch_plan();

-- Estudante pede (ou dispensa) mentor. Dispensar desliga o mentor atual.
create or replace function public.set_wants_mentor(want boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Entre na sua conta.'; end if;
  perform set_config('mm.allow_mentor_change', 'on', true);
  update public.profiles
    set wants_mentor = want, mentor_id = case when want then mentor_id else null end
    where id = auth.uid();
end $$;

-- Equipe liga (ou desliga) um aluno a um mentor.
create or replace function public.assign_mentor(student uuid, mentor uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Só a equipe pode distribuir alunos.'; end if;
  if mentor is not null and not exists (select 1 from public.profiles where id = mentor and role in ('mentor', 'admin')) then
    raise exception 'Mentor inválido.';
  end if;
  update public.profiles
    set mentor_id = mentor, wants_mentor = case when mentor is not null then true else wants_mentor end
    where id = student;
end $$;

-- Estudante marca as próprias metas como feitas (sem poder mudar o resto do plano).
create or replace function public.toggle_plan_goal(student uuid, goal_id text, is_done boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or (auth.uid() <> student and not public.is_admin() and not public.is_mentor_of(student)) then
    raise exception 'Sem permissão.';
  end if;
  update public.mentor_plans set goals = coalesce((
    select jsonb_agg(case when g ->> 'id' = goal_id then jsonb_set(g, '{done}', to_jsonb(is_done)) else g end)
    from jsonb_array_elements(goals) g), '[]'::jsonb)
  where student_id = student;
end $$;

-- Nome do mentor (só o nome) para o aluno dele, outros mentores e a equipe.
create or replace function public.mentor_name(mentor uuid) returns text
language sql stable security definer set search_path = public as $$
  select p.name from public.profiles p
  where p.id = mentor and p.role in ('mentor', 'admin')
    and (public.is_admin()
      or exists (select 1 from public.profiles me where me.id = auth.uid() and (me.mentor_id = mentor or me.role in ('mentor', 'admin'))));
$$;

-- Hub: equipe recebe todo mundo (com e-mail); mentor recebe só os próprios alunos (sem e-mail).
create or replace function public.list_people() returns table (
  id uuid, name text, role user_role, city text, age_range text, guardian_consent boolean, interests text[], bio text,
  public_profile boolean, goals jsonb, planned_projects jsonb, created_at timestamptz, wants_mentor boolean, mentor_id uuid,
  line_progress jsonb, last_active_at timestamptz, email text
)
language sql stable security definer set search_path = public, auth as $$
  select p.id, p.name, p.role, p.city, p.age_range, p.guardian_consent, p.interests, p.bio, p.public_profile, p.goals,
    p.planned_projects, p.created_at, p.wants_mentor, p.mentor_id, p.line_progress, p.last_active_at,
    case when public.is_admin() then u.email::text else null end
  from public.profiles p join auth.users u on u.id = p.id
  where public.is_admin()
    or (p.mentor_id = auth.uid() and exists (select 1 from public.profiles m where m.id = auth.uid() and m.role in ('mentor', 'admin')));
$$;
revoke execute on function public.list_people() from anon;

-- LGPD: o próprio usuário exclui a conta (cascata apaga perfil e atividade).
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  delete from auth.users where id = auth.uid();
end $$;

-- ─── Armazenamento de imagens ─────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
create policy "media: todos leem" on storage.objects for select using (bucket_id = 'media');
create policy "media: admin envia" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
create policy "media: admin remove" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ─── Depois de criar sua conta no site, torne-se administrador: ───────────
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'SEU-EMAIL');
