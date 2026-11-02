-- =====================================================================
-- AI tools: initial schema.
-- Run in the Supabase SQL editor, or with `supabase db push`.
-- All tables have Row Level Security ON and NO policies, so the public
-- (anon) key can read/write nothing. Only the service-role key, which
-- lives in Netlify functions, can access them.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- jobs: one row per purchase.
-- status lifecycle:
--   awaiting_payment -> paid -> generating -> done
--                                          \-> failed (auto-refunded)
--   awaiting_payment -> abandoned (checkout expired / never paid)
-- After 30 days the personal columns are wiped (see retention function),
-- leaving an anonymised row for stats.
-- ---------------------------------------------------------------------
create table if not exists public.jobs (
  id                    uuid primary key default gen_random_uuid(),
  tool                  text not null,
  inputs                jsonb,                  -- form inputs (wiped after 30 days)
  status                text not null default 'awaiting_payment',
  stripe_session_id     text unique,
  stripe_payment_intent text,
  amount_pence          integer not null default 0,
  email                 text,                   -- from Stripe Checkout (wiped after 30 days)
  result                jsonb,                  -- parsed AI output, shown inline (wiped after 30 days)
  output_paths          text[] not null default '{}',
  regenerations_used    integer not null default 0,
  regen_note            text,
  regen_failed          boolean not null default false,
  attempts              integer not null default 0,
  trigger_count         integer not null default 0,
  last_error            text,
  cost_tokens_in        integer not null default 0,
  cost_tokens_out       integer not null default 0,
  created_at            timestamptz not null default now(),
  paid_at               timestamptz,
  generation_started_at timestamptz,
  completed_at          timestamptz,
  refunded_at           timestamptz,
  purged_at             timestamptz,
  constraint jobs_status_check check (status in
    ('awaiting_payment','paid','generating','done','failed','abandoned'))
);
create index if not exists jobs_created_at_idx on public.jobs (created_at);
create index if not exists jobs_status_idx on public.jobs (status);

-- ---------------------------------------------------------------------
-- credits: credit packs (used by the listing writer, Phase 3).
-- ---------------------------------------------------------------------
create table if not exists public.credits (
  token      text primary key,               -- random 32 chars, sent in the magic link
  tool       text not null,
  remaining  integer not null check (remaining >= 0),
  email      text,
  job_id     uuid references public.jobs(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- daily_spend: AI token usage per UTC day, for the budget kill switch.
-- ---------------------------------------------------------------------
create table if not exists public.daily_spend (
  date         date primary key,
  tokens_in    bigint not null default 0,
  tokens_out   bigint not null default 0,
  est_cost_gbp numeric(10,4) not null default 0
);

-- ---------------------------------------------------------------------
-- rate_limits: fixed-window counters keyed by hashed IP + action.
-- (IPs are SHA-256 hashed before they reach the database.)
-- ---------------------------------------------------------------------
create table if not exists public.rate_limits (
  key          text not null,
  window_start timestamptz not null,
  count        integer not null default 0,
  primary key (key, window_start)
);

alter table public.jobs        enable row level security;
alter table public.credits     enable row level security;
alter table public.daily_spend enable row level security;
alter table public.rate_limits enable row level security;

-- ---------------------------------------------------------------------
-- Atomic helpers (called with the service-role key via supabase.rpc).
-- ---------------------------------------------------------------------

-- Add AI usage to today's row. Returns the new total cost for today.
create or replace function public.add_daily_spend(p_tokens_in bigint, p_tokens_out bigint, p_cost_gbp numeric)
returns numeric language sql as $$
  insert into public.daily_spend as d (date, tokens_in, tokens_out, est_cost_gbp)
  values ((now() at time zone 'utc')::date, p_tokens_in, p_tokens_out, p_cost_gbp)
  on conflict (date) do update set
    tokens_in    = d.tokens_in + excluded.tokens_in,
    tokens_out   = d.tokens_out + excluded.tokens_out,
    est_cost_gbp = d.est_cost_gbp + excluded.est_cost_gbp
  returning est_cost_gbp;
$$;

-- Count one hit for p_key in the current fixed window.
-- Returns TRUE if the request is allowed, FALSE if over the limit.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns boolean language plpgsql as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count integer;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set count = r.count + 1
  returning count into v_count;
  return v_count <= p_max;
end;
$$;

-- Aggregate stats per tool since a timestamp (no personal data).
create or replace function public.stats_for_window(p_since timestamptz)
returns table (
  tool text, created bigint, paid bigint, done bigint, failed bigint,
  refunded bigint, revenue_pence bigint, refunded_pence bigint
) language sql stable as $$
  select tool,
    count(*),
    count(*) filter (where paid_at is not null),
    count(*) filter (where status = 'done'),
    count(*) filter (where status = 'failed'),
    count(*) filter (where refunded_at is not null),
    coalesce(sum(amount_pence) filter (where paid_at is not null), 0),
    coalesce(sum(amount_pence) filter (where refunded_at is not null), 0)
  from public.jobs
  where created_at >= p_since
  group by tool;
$$;

-- Only the service role may call these.
revoke all on function public.add_daily_spend(bigint, bigint, numeric) from public, anon, authenticated;
revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.stats_for_window(timestamptz) from public, anon, authenticated;
grant execute on function public.add_daily_spend(bigint, bigint, numeric) to service_role;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.stats_for_window(timestamptz) to service_role;

-- ---------------------------------------------------------------------
-- Private storage bucket for generated files.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('outputs', 'outputs', false)
on conflict (id) do nothing;
