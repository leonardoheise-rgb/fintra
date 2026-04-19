create table if not exists public.monthly_reviews (
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null,
  planned_income_amount numeric not null default 0,
  planned_income_description text not null default '',
  carry_over_amount numeric not null default 0,
  reviewed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint monthly_reviews_pkey primary key (user_id, month),
  constraint monthly_reviews_month_check check (month ~ '^\d{4}-(0[1-9]|1[0-2])$')
);

create index if not exists monthly_reviews_updated_at_idx
  on public.monthly_reviews (updated_at desc);

drop trigger if exists monthly_reviews_set_updated_at on public.monthly_reviews;
create trigger monthly_reviews_set_updated_at
before update on public.monthly_reviews
for each row
execute function public.set_updated_at();

alter table public.monthly_reviews enable row level security;

drop policy if exists "monthly_reviews_select_own" on public.monthly_reviews;
create policy "monthly_reviews_select_own"
on public.monthly_reviews
for select
using (auth.uid() = user_id);

drop policy if exists "monthly_reviews_insert_own" on public.monthly_reviews;
create policy "monthly_reviews_insert_own"
on public.monthly_reviews
for insert
with check (auth.uid() = user_id);

drop policy if exists "monthly_reviews_update_own" on public.monthly_reviews;
create policy "monthly_reviews_update_own"
on public.monthly_reviews
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "monthly_reviews_delete_own" on public.monthly_reviews;
create policy "monthly_reviews_delete_own"
on public.monthly_reviews
for delete
using (auth.uid() = user_id);
