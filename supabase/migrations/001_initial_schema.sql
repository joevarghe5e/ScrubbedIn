-- ============================================================
-- ScrubbedIn — Initial Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  training_stage      text,
  curriculum          text,
  specialty_interests text[] default '{}',
  onboarding_complete boolean default false,
  created_at          timestamptz default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── competencies ────────────────────────────────────────────
create table if not exists public.competencies (
  id          uuid primary key default gen_random_uuid(),
  curriculum  text not null,
  code        text,
  name        text not null,
  category    text,
  description text
);

-- ── clinical_logs ────────────────────────────────────────────
create table if not exists public.clinical_logs (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  specialty             text,
  presentation          text,
  procedures_observed   text[] default '{}',
  procedures_performed  text[] default '{}',
  learning_points       text,
  encounter_date        date,
  created_at            timestamptz default now()
);

-- ── clinical_log_competencies (junction) ─────────────────────
create table if not exists public.clinical_log_competencies (
  log_id          uuid references public.clinical_logs(id) on delete cascade,
  competency_id   uuid references public.competencies(id) on delete cascade,
  primary key (log_id, competency_id)
);

-- ── reflections ──────────────────────────────────────────────
create table if not exists public.reflections (
  id              uuid primary key default gen_random_uuid(),
  log_id          uuid not null references public.clinical_logs(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  framework       text,
  raw_ai_output   text,
  final_text      text,
  approved_at     timestamptz,
  created_at      timestamptz default now()
);

-- ── user_competency_progress ─────────────────────────────────
create table if not exists public.user_competency_progress (
  user_id         uuid references public.profiles(id) on delete cascade,
  competency_id   uuid references public.competencies(id) on delete cascade,
  status          text not null,
  updated_at      timestamptz default now(),
  primary key (user_id, competency_id)
);

-- ── timetable_entries ────────────────────────────────────────
create table if not exists public.timetable_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  specialty   text,
  start_date  date,
  end_date    date,
  notes       text
);

-- ── specialty_requirements (reference data) ──────────────────
create table if not exists public.specialty_requirements (
  id                  uuid primary key default gen_random_uuid(),
  specialty           text not null,
  requirement_type    text,
  requirement_name    text,
  minimum_count       int
);

-- ── exam_syllabi (reference data) ────────────────────────────
create table if not exists public.exam_syllabi (
  id          uuid primary key default gen_random_uuid(),
  exam        text not null,
  topic       text not null,
  subtopic    text,
  tags        text[] default '{}'
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.clinical_logs enable row level security;
alter table public.clinical_log_competencies enable row level security;
alter table public.reflections enable row level security;
alter table public.user_competency_progress enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.competencies enable row level security;
alter table public.specialty_requirements enable row level security;
alter table public.exam_syllabi enable row level security;

-- profiles: users own their row
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- clinical_logs: user owns their logs
create policy "logs_select_own" on public.clinical_logs for select using (auth.uid() = user_id);
create policy "logs_insert_own" on public.clinical_logs for insert with check (auth.uid() = user_id);
create policy "logs_update_own" on public.clinical_logs for update using (auth.uid() = user_id);
create policy "logs_delete_own" on public.clinical_logs for delete using (auth.uid() = user_id);

-- clinical_log_competencies: via log ownership
create policy "log_comp_select" on public.clinical_log_competencies for select
  using (exists (select 1 from public.clinical_logs where id = log_id and user_id = auth.uid()));
create policy "log_comp_insert" on public.clinical_log_competencies for insert
  with check (exists (select 1 from public.clinical_logs where id = log_id and user_id = auth.uid()));
create policy "log_comp_delete" on public.clinical_log_competencies for delete
  using (exists (select 1 from public.clinical_logs where id = log_id and user_id = auth.uid()));

-- reflections
create policy "reflections_select_own" on public.reflections for select using (auth.uid() = user_id);
create policy "reflections_insert_own" on public.reflections for insert with check (auth.uid() = user_id);
create policy "reflections_update_own" on public.reflections for update using (auth.uid() = user_id);
create policy "reflections_delete_own" on public.reflections for delete using (auth.uid() = user_id);

-- user_competency_progress
create policy "progress_select_own" on public.user_competency_progress for select using (auth.uid() = user_id);
create policy "progress_upsert_own" on public.user_competency_progress for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.user_competency_progress for update using (auth.uid() = user_id);

-- timetable_entries
create policy "timetable_select_own" on public.timetable_entries for select using (auth.uid() = user_id);
create policy "timetable_insert_own" on public.timetable_entries for insert with check (auth.uid() = user_id);
create policy "timetable_update_own" on public.timetable_entries for update using (auth.uid() = user_id);
create policy "timetable_delete_own" on public.timetable_entries for delete using (auth.uid() = user_id);

-- reference tables: public read, no write from client
create policy "competencies_public_read" on public.competencies for select using (true);
create policy "specialty_req_public_read" on public.specialty_requirements for select using (true);
create policy "exam_syllabi_public_read" on public.exam_syllabi for select using (true);
