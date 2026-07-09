alter table public.display_preferences
  add column if not exists date_format text not null default 'YYYY-MM-dd';

alter table public.display_preferences
  drop constraint if exists display_preferences_date_format_check;

alter table public.display_preferences
  add constraint display_preferences_date_format_check
    check (date_format in ('YYYY-MM-dd', 'dd-MM-YYYY'));
