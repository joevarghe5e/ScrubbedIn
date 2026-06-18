-- ============================================================
-- Weekly Sessions — individual timetable slots
-- Separate from timetable_entries (which tracks rotations)
-- ============================================================

create table if not exists public.weekly_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  week_start    date not null,         -- Monday of the week
  day_of_week   int  not null,         -- 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri
  time_slot     text not null,         -- 'morning' | 'afternoon'
  session_name  text,
  session_type  text,                  -- 'Ward Round' | 'Theatre' | 'Clinic' | 'Lecture' | 'Other'
  specialty     text,
  location      text,
  notes         text,
  briefing_json jsonb,                 -- cached AI briefing
  created_at    timestamptz default now()
);

alter table public.weekly_sessions enable row level security;

create policy "sessions_select_own" on public.weekly_sessions for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.weekly_sessions for insert with check (auth.uid() = user_id);
create policy "sessions_update_own" on public.weekly_sessions for update using (auth.uid() = user_id);
create policy "sessions_delete_own" on public.weekly_sessions for delete using (auth.uid() = user_id);
