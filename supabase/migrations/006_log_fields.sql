alter table public.clinical_logs
  add column if not exists case_type  text,
  add column if not exists role       text,
  add column if not exists supervisor text,
  add column if not exists status     text default 'draft';
