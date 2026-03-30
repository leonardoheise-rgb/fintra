create table if not exists public.budget_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  subcategory_id uuid references public.subcategories(id) on delete cascade,
  month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists budget_overrides_user_month_category_unique_idx
on public.budget_overrides (user_id, month, category_id)
where subcategory_id is null;

create unique index if not exists budget_overrides_user_month_subcategory_unique_idx
on public.budget_overrides (user_id, month, subcategory_id)
where subcategory_id is not null;

create index if not exists budget_overrides_user_id_idx on public.budget_overrides (user_id);
create index if not exists budget_overrides_category_id_idx on public.budget_overrides (category_id);
create index if not exists budget_overrides_subcategory_id_idx on public.budget_overrides (subcategory_id);
create index if not exists budget_overrides_month_idx on public.budget_overrides (month);

drop trigger if exists budget_overrides_set_updated_at on public.budget_overrides;
create trigger budget_overrides_set_updated_at
before update on public.budget_overrides
for each row
execute function public.set_updated_at();

alter table public.budget_overrides enable row level security;

drop policy if exists "budget_overrides_select_own" on public.budget_overrides;
create policy "budget_overrides_select_own"
on public.budget_overrides
for select
using (auth.uid() = user_id);

drop policy if exists "budget_overrides_insert_own" on public.budget_overrides;
create policy "budget_overrides_insert_own"
on public.budget_overrides
for insert
with check (auth.uid() = user_id);

drop policy if exists "budget_overrides_update_own" on public.budget_overrides;
create policy "budget_overrides_update_own"
on public.budget_overrides
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "budget_overrides_delete_own" on public.budget_overrides;
create policy "budget_overrides_delete_own"
on public.budget_overrides
for delete
using (auth.uid() = user_id);
