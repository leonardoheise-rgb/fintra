create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  subcategory_id uuid references public.subcategories(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists budgets_user_category_unique_idx
on public.budgets (user_id, category_id)
where subcategory_id is null;

create unique index if not exists budgets_user_subcategory_unique_idx
on public.budgets (user_id, subcategory_id)
where subcategory_id is not null;

create index if not exists budgets_user_id_idx on public.budgets (user_id);
create index if not exists budgets_category_id_idx on public.budgets (category_id);
create index if not exists budgets_subcategory_id_idx on public.budgets (subcategory_id);

drop trigger if exists budgets_set_updated_at on public.budgets;
create trigger budgets_set_updated_at
before update on public.budgets
for each row
execute function public.set_updated_at();

alter table public.budgets enable row level security;

drop policy if exists "budgets_select_own" on public.budgets;
create policy "budgets_select_own"
on public.budgets
for select
using (auth.uid() = user_id);

drop policy if exists "budgets_insert_own" on public.budgets;
create policy "budgets_insert_own"
on public.budgets
for insert
with check (auth.uid() = user_id);

drop policy if exists "budgets_update_own" on public.budgets;
create policy "budgets_update_own"
on public.budgets
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_delete_own"
on public.budgets
for delete
using (auth.uid() = user_id);
