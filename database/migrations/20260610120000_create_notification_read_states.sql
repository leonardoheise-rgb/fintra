create table if not exists public.notification_read_states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  read_ids text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists notification_read_states_updated_at_idx
  on public.notification_read_states (updated_at desc);

drop trigger if exists notification_read_states_set_updated_at on public.notification_read_states;
create trigger notification_read_states_set_updated_at
before update on public.notification_read_states
for each row
execute function public.set_updated_at();

alter table public.notification_read_states enable row level security;

drop policy if exists "notification_read_states_select_own" on public.notification_read_states;
create policy "notification_read_states_select_own"
on public.notification_read_states
for select
using (auth.uid() = user_id);

drop policy if exists "notification_read_states_insert_own" on public.notification_read_states;
create policy "notification_read_states_insert_own"
on public.notification_read_states
for insert
with check (auth.uid() = user_id);

drop policy if exists "notification_read_states_update_own" on public.notification_read_states;
create policy "notification_read_states_update_own"
on public.notification_read_states
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "notification_read_states_delete_own" on public.notification_read_states;
create policy "notification_read_states_delete_own"
on public.notification_read_states
for delete
using (auth.uid() = user_id);
