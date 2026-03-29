# Database Workspace

This folder holds database assets for Supabase-backed development.

Planned contents:

- `migrations/`: versioned PostgreSQL migrations
- `seeds/`: development seed data and fixtures
- `policies/`: row-level security policy references when they become large enough to deserve their own module

Sprint 2 now includes the first real migrations for:

- categories
- subcategories
- transactions
- updated_at triggers
- row-level security policies
