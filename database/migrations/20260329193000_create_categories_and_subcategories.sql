create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_user_id_name_key unique (user_id, name)
);

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint subcategories_user_id_category_id_name_key unique (user_id, category_id, name)
);

create index if not exists categories_user_id_idx on public.categories (user_id);
create index if not exists subcategories_user_id_idx on public.subcategories (user_id);
create index if not exists subcategories_category_id_idx on public.subcategories (category_id);
