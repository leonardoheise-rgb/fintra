create table if not exists public.display_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  currency text not null,
  locale text not null,
  month_start_day integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint display_preferences_month_start_day_check
    check (month_start_day between 1 and 31)
);

create index if not exists display_preferences_updated_at_idx
  on public.display_preferences (updated_at desc);

drop trigger if exists display_preferences_set_updated_at on public.display_preferences;
create trigger display_preferences_set_updated_at
before update on public.display_preferences
for each row
execute function public.set_updated_at();

alter table public.display_preferences enable row level security;

drop policy if exists "display_preferences_select_own" on public.display_preferences;
create policy "display_preferences_select_own"
on public.display_preferences
for select
using (auth.uid() = user_id);

drop policy if exists "display_preferences_insert_own" on public.display_preferences;
create policy "display_preferences_insert_own"
on public.display_preferences
for insert
with check (auth.uid() = user_id);

drop policy if exists "display_preferences_update_own" on public.display_preferences;
create policy "display_preferences_update_own"
on public.display_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "display_preferences_delete_own" on public.display_preferences;
create policy "display_preferences_delete_own"
on public.display_preferences
for delete
using (auth.uid() = user_id);
