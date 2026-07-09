# Migrations

Versioned SQL migrations for the Supabase/PostgreSQL schema live here.

Apply files in timestamp order. The current schema includes finance categories,
subcategories, transactions, installments, budgets, monthly overrides, set-asides,
display preferences, monthly reviews, notification read state, row-level security
policies, indexes, and shared `updated_at` triggers.

For new schema changes, add a new timestamped migration instead of rewriting older
files unless an explicit cleanup is requested.
