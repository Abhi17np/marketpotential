-- ================================================================
--  Infopace — Supabase Database Setup (No Auth version)
--  Run this entire file in: Supabase → SQL Editor → Run
-- ================================================================

-- 1. Drop old table if re-running (comment out if you want to keep data)
-- drop table if exists public.submissions;

-- 2. Create submissions table
--    Stores BOTH the onboarding form data AND the final assessment result
create table if not exists public.submissions (
  id              uuid        default gen_random_uuid() primary key,

  -- ── Onboarding: Step 1 (Personal Info) ──────────────────────
  name            text        not null,
  email           text        not null,
  phone           text,
  phone_full      text,           -- e.g. +919876543210
  country_code    text,           -- e.g. +91
  organization    text,
  role            text,
  website         text,
  linkedin        text,
  team_size       text,

  -- ── Onboarding: Step 2 (Venture Context) ────────────────────
  product_name    text,
  business_type   text,
  sector          text,
  geography       text,
  problem         text,
  stage           text,

  -- ── Assessment answers (JSON from dashboard) ────────────────
  answers         jsonb,

  -- ── Final result from AI analysis ───────────────────────────
  overall_score   integer,
  grade           text,
  verdict         text,
  tam_crore       numeric,
  sam_crore       numeric,
  som_crore       numeric,
  growth_rate     numeric,
  dimensions      jsonb,      -- {d1,d2,d3,d4,d5,d6} scores
  key_insights    jsonb,      -- array of insight strings
  top_risks       jsonb,      -- array of risk strings
  quick_wins      jsonb,      -- array of quick win strings
  analysis_json   jsonb,      -- full raw analysis object

  -- ── Screenshot URL (stored in Supabase Storage) ─────────────
  screenshot_url  text,       -- public URL of captured dashboard image

  -- ── Status tracking ─────────────────────────────────────────
  status          text        default 'onboarding_complete',
  -- 'onboarding_complete' = form filled, assessment not yet done
  -- 'assessment_complete' = dashboard generated with result

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- 3. Enable Row Level Security
alter table public.submissions enable row level security;

-- 4. Allow public inserts (no auth required)
create policy "Allow public inserts"
  on public.submissions
  for insert
  with check (true);

-- 5. Allow public reads
create policy "Allow public reads"
  on public.submissions
  for select
  using (true);

-- 6. Allow public updates (needed to update result after assessment)
create policy "Allow public updates"
  on public.submissions
  for update
  using (true)
  with check (true);

-- 7. Useful indexes
create index if not exists submissions_email_idx
  on public.submissions (email);

create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);

create index if not exists submissions_status_idx
  on public.submissions (status);

-- 8. Auto-update updated_at on row change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.submissions;
create trigger set_updated_at
  before update on public.submissions
  for each row execute function public.handle_updated_at();

-- ================================================================
--  DONE. You should see the `submissions` table in Table Editor.
-- ================================================================