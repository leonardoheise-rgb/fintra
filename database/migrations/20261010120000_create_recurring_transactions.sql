create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  type public.transaction_type not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid references public.subcategories(id) on delete restrict,
  start_date date not null,
  description text not null default '',
  cancelled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists recurring_transactions_user_id_idx
on public.recurring_transactions (user_id)
where cancelled_at is null;

alter table public.transactions
add column if not exists recurring_transaction_id uuid
references public.recurring_transactions(id) on delete set null;

create index if not exists transactions_recurring_transaction_id_idx
on public.transactions (recurring_transaction_id);

alter table public.recurring_transactions enable row level security;

drop policy if exists "Users manage their recurring transactions" on public.recurring_transactions;
create policy "Users manage their recurring transactions"
on public.recurring_transactions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
