alter table public.categories
add column if not exists icon text;

alter table public.subcategories
add column if not exists icon text;
