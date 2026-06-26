-- ── chronological start time for weekly sessions ────────────
-- Previously only 2 slots/day ('morning' | 'afternoon') were supported,
-- which silently collided when a timetable had more than 2 events in a
-- day (multiple rows shared the same day_of_week + time_slot, and the
-- unordered re-fetch could show a different row each time). Move to a
-- real start_time so up to 6 sessions/day sort deterministically.
alter table public.weekly_sessions
  add column if not exists start_time text; -- 'HH:MM', 24h

update public.weekly_sessions
  set start_time = case when time_slot = 'morning' then '09:00' else '14:00' end
  where start_time is null;
