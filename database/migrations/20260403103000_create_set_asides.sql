create table if not exists public.set_asides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid references public.subcategories(id) on delete restrict,
  date date not null,
  description text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists set_asides_user_id_idx on public.set_asides (user_id);
create index if not exists set_asides_category_id_idx on public.set_asides (category_id);
create index if not exists set_asides_subcategory_id_idx on public.set_asides (subcategory_id);
create index if not exists set_asides_date_idx on public.set_asides (date desc);

drop trigger if exists set_asides_set_updated_at on public.set_asides;
create trigger set_asides_set_updated_at
before update on public.set_asides
for each row
execute function public.set_updated_at();

alter table public.set_asides enable row level security;

drop policy if exists "set_asides_select_own" on public.set_asides;
create policy "set_asides_select_own"
on public.set_asides
for select
using (auth.uid() = user_id);

drop policy if exists "set_asides_insert_own" on public.set_asides;
create policy "set_asides_insert_own"
on public.set_asides
for insert
with check (auth.uid() = user_id);

drop policy if exists "set_asides_update_own" on public.set_asides;
create policy "set_asides_update_own"
on public.set_asides
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "set_asides_delete_own" on public.set_asides;
create policy "set_asides_delete_own"
on public.set_asides
for delete
using (auth.uid() = user_id);
