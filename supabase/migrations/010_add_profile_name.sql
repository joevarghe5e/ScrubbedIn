-- ── add first/last name to profiles ─────────────────────────
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name  text;
