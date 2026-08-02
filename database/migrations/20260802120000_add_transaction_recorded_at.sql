alter table public.transactions
add column if not exists recorded_at timestamptz(0);

update public.transactions
set recorded_at = date_trunc('second', created_at)
where recorded_at is null;

alter table public.transactions
alter column recorded_at set default date_trunc('second', now()),
alter column recorded_at set not null;

comment on column public.transactions.recorded_at is
  'Whole-second timestamp used to preserve the order in which transactions were recorded.';

create index if not exists transactions_recorded_order_idx
on public.transactions (user_id, date desc, recorded_at desc, id desc);
