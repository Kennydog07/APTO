-- =====================================================================
-- Phase 3: credit packs (listing writer).
-- Run after 0001_init.sql.
-- =====================================================================

-- 'purchase' = something the customer paid for (counts in revenue/conversion stats).
-- 'usage'    = one listing generated from a credit pack (counted separately).
alter table public.jobs add column if not exists kind text not null default 'purchase';
alter table public.jobs drop constraint if exists jobs_kind_check;
alter table public.jobs add constraint jobs_kind_check check (kind in ('purchase', 'usage'));

-- One credit row per pack purchase (makes fulfilment idempotent).
create unique index if not exists credits_job_id_key on public.credits (job_id);

-- Atomically spend one credit. Returns credits left after spending, or -1 if none/invalid.
create or replace function public.use_credit(p_token text)
returns integer language sql as $$
  with spent as (
    update public.credits set remaining = remaining - 1
    where token = p_token and remaining > 0
    returning remaining
  )
  select coalesce((select remaining from spent), -1);
$$;

-- Give a credit back (generation failed) or add a top-up. Returns the new balance or -1.
create or replace function public.add_credits(p_token text, p_amount integer)
returns integer language sql as $$
  with upd as (
    update public.credits set remaining = remaining + p_amount
    where token = p_token
    returning remaining
  )
  select coalesce((select remaining from upd), -1);
$$;

-- Stats: purchases only for revenue/conversion, plus a count of usage jobs.
drop function if exists public.stats_for_window(timestamptz);
create or replace function public.stats_for_window(p_since timestamptz)
returns table (
  tool text, created bigint, paid bigint, done bigint, failed bigint,
  refunded bigint, revenue_pence bigint, refunded_pence bigint, usage_done bigint
) language sql stable as $$
  select tool,
    count(*) filter (where kind = 'purchase'),
    count(*) filter (where kind = 'purchase' and paid_at is not null),
    count(*) filter (where kind = 'purchase' and status = 'done'),
    count(*) filter (where status = 'failed'),
    count(*) filter (where refunded_at is not null),
    coalesce(sum(amount_pence) filter (where kind = 'purchase' and paid_at is not null), 0),
    coalesce(sum(amount_pence) filter (where refunded_at is not null), 0),
    count(*) filter (where kind = 'usage' and status = 'done')
  from public.jobs
  where created_at >= p_since
  group by tool;
$$;

revoke all on function public.use_credit(text) from public, anon, authenticated;
revoke all on function public.add_credits(text, integer) from public, anon, authenticated;
revoke all on function public.stats_for_window(timestamptz) from public, anon, authenticated;
grant execute on function public.use_credit(text) to service_role;
grant execute on function public.add_credits(text, integer) to service_role;
grant execute on function public.stats_for_window(timestamptz) to service_role;
