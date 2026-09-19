-- ===========================================================================
-- HPL Pure Mathematics — database schema
-- Run this in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to re-run: every statement is idempotent.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES  (one row per signed-up user, mirroring auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        text not null default 'student' check (role in ('student', 'teacher')),
  created_at  timestamptz not null default now()
);

-- Create a profile automatically whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current user a teacher?
-- SECURITY DEFINER avoids infinite recursion when used inside RLS policies.
create or replace function public.is_teacher()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'teacher'
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. TOPICS  (Cambridge 9709 syllabus areas)
-- ---------------------------------------------------------------------------
create table if not exists public.topics (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text,
  paper       text,           -- e.g. 'P1', 'P3'
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. QUESTIONS
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id             uuid primary key default gen_random_uuid(),
  topic_id       uuid not null references public.topics (id) on delete cascade,
  prompt         text not null,
  answer         text not null,
  working        text,                       -- worked solution, shown after an attempt
  difficulty     smallint not null default 1 check (difficulty between 1 and 5),
  created_at     timestamptz not null default now()
);

create index if not exists questions_topic_id_idx on public.questions (topic_id);

-- ---------------------------------------------------------------------------
-- 4. ATTEMPTS  (a student's answer to a question)
-- ---------------------------------------------------------------------------
create table if not exists public.attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  question_id   uuid not null references public.questions (id) on delete cascade,
  given_answer  text,
  is_correct    boolean not null default false,
  attempted_at  timestamptz not null default now()
);

create index if not exists attempts_user_id_idx on public.attempts (user_id);
create index if not exists attempts_question_id_idx on public.attempts (question_id);

-- ===========================================================================
-- ROW LEVEL SECURITY
-- Without these, the publishable key would let anyone read every row.
-- ===========================================================================
alter table public.profiles  enable row level security;
alter table public.topics    enable row level security;
alter table public.questions enable row level security;
alter table public.attempts  enable row level security;

-- --- profiles ---------------------------------------------------------------
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using ((select auth.uid()) = id or public.is_teacher());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- --- topics & questions: readable by anyone, writable only by teachers -------
drop policy if exists "Anyone reads topics" on public.topics;
create policy "Anyone reads topics" on public.topics
  for select using (true);

drop policy if exists "Teachers manage topics" on public.topics;
create policy "Teachers manage topics" on public.topics
  for all using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists "Anyone reads questions" on public.questions;
create policy "Anyone reads questions" on public.questions
  for select using (true);

drop policy if exists "Teachers manage questions" on public.questions;
create policy "Teachers manage questions" on public.questions
  for all using (public.is_teacher()) with check (public.is_teacher());

-- --- attempts: a student sees only their own; teachers see the class ---------
drop policy if exists "Students read own attempts" on public.attempts;
create policy "Students read own attempts" on public.attempts
  for select using ((select auth.uid()) = user_id or public.is_teacher());

drop policy if exists "Students record own attempts" on public.attempts;
create policy "Students record own attempts" on public.attempts
  for insert with check ((select auth.uid()) = user_id);

-- ===========================================================================
-- SEED DATA — a few 9709 Pure 1 topics so the connection test has something
-- ===========================================================================
insert into public.topics (slug, title, description, paper, sort_order) values
  ('quadratics',            'Quadratics',              'Completing the square, discriminant, quadratic inequalities.', 'P1', 1),
  ('functions',             'Functions',               'Domain and range, composite and inverse functions.',          'P1', 2),
  ('coordinate-geometry',   'Coordinate Geometry',     'Straight lines, circles, and their intersections.',           'P1', 3),
  ('circular-measure',      'Circular Measure',        'Radians, arc length, and sector area.',                       'P1', 4),
  ('trigonometry',          'Trigonometry',            'Graphs, identities, and solving trigonometric equations.',    'P1', 5),
  ('series',                'Series',                  'Binomial expansion, arithmetic and geometric progressions.',  'P1', 6),
  ('differentiation',       'Differentiation',         'Rates of change, tangents, normals, and stationary points.',  'P1', 7),
  ('integration',           'Integration',             'Definite and indefinite integrals, area and volume.',         'P1', 8)
on conflict (slug) do nothing;
