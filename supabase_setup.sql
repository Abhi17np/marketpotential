-- ================================================================
--  Infopace — Supabase Database Setup
--  Run this entire file in: Supabase → SQL Editor → Run
-- ================================================================

-- 1. Create the submissions table
create table if not exists public.submissions (
  id            uuid        default gen_random_uuid() primary key,
  name          text        not null,
  email         text        not null,
  phone         text,
  organization  text,
  role          text,
  website       text,
  linkedin      text,
  team_size     text,
  sector        text,
  geography     text,
  problem       text,
  stage         text,
  answers       jsonb,
  overall_score integer,
  grade         text,
  dimensions    jsonb,
  analysis_json jsonb,
  created_at    timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.submissions enable row level security;

-- 3. Policy: anyone can INSERT (submit assessment)
create policy "Allow public inserts"
  on public.submissions
  for insert
  with check (true);

-- 4. Policy: anyone can SELECT (view results in-app)
--    Tighten this later if you add auth
create policy "Allow public reads"
  on public.submissions
  for select
  using (true);

-- 5. Optional: index on email for fast lookups
create index if not exists submissions_email_idx
  on public.submissions (email);

-- 6. Optional: index on created_at for dashboard sorting
create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);

-- ================================================================
--  DONE. You should see the `submissions` table in Table Editor.
-- ================================================================
