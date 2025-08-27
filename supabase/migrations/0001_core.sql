-- Core schema for CSLedger (Supabase/PostgreSQL)

-- BOARDS
create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);
create index if not exists idx_boards_user on boards(user_id);

-- ENTRIES
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references boards(id) on delete cascade,
  skin_name text not null,
  date_acquired date not null,
  price_buy numeric(12,2) not null,
  price_sell numeric(12,2),
  profit numeric(12,2),
  status text not null default 'en_attente',
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);
create index if not exists idx_entries_board on entries(board_id);
create index if not exists idx_entries_skin_date on entries(skin_name, date_acquired);
create index if not exists idx_entries_created on entries(created_at);

-- SUBSCRIPTIONS
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free',
  start_date date default now(),
  end_date date,
  provider_customer_id text
);
create index if not exists idx_subs_user on subscriptions(user_id);

-- RLS Policies
alter table boards enable row level security;
drop policy if exists boards_owner on boards;
create policy boards_owner on boards for all
  using (user_id = auth.uid());

alter table entries enable row level security;
drop policy if exists entries_board_owner on entries;
create policy entries_board_owner on entries for all
  using (exists (select 1 from boards b where b.id = board_id and b.user_id = auth.uid()));

alter table subscriptions enable row level security;
drop policy if exists subs_owner on subscriptions;
create policy subs_owner on subscriptions for all
  using (user_id = auth.uid());

-- Materialized views
create materialized view if not exists mv_stats_daily as
select
  b.user_id,
  e.board_id,
  e.date_acquired::date as day,
  sum(e.price_buy) as invested,
  sum(coalesce(e.profit,0)) as profit
from entries e
join boards b on b.id = e.board_id
group by 1,2,3;
create index if not exists idx_mv_daily on mv_stats_daily(user_id, board_id, day);


