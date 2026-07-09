# Database Workspace

This folder holds database assets for Supabase-backed development.

Current contents:

- `migrations/`: versioned PostgreSQL migrations
- `seeds/`: illustrative local/development seed data

Current migrations cover:

- categories
- subcategories
- transactions
- transaction installment metadata
- budgets and monthly budget overrides
- set-asides
- display preferences
- monthly reviews
- category and subcategory icons
- notification read state
- shared `updated_at` triggers
- row-level security policies for user-owned data

Apply migrations in timestamp order. Do not edit historical migrations for normal
schema changes; add a new migration instead.
