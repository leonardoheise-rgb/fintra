# Architecture Notes

## Current stack

- Frontend: React + TypeScript + Vite
- Routing: React Router
- Authentication: Supabase Auth with a local preview fallback during setup
- Data layer: service-based finance workspace with preview local storage and Supabase implementations
- Testing: Vitest + Testing Library
- Linting: ESLint (flat config)
- Database target: Supabase / PostgreSQL

## Repository structure

- `frontend/`: application source code
- `backend/`: reserved for optional server-side logic
- `database/`: migrations, seeds, and future SQL assets
- `docs/`: setup, architecture, and delivery notes

## Frontend structure

- `src/app/`: app composition, routing, layout, and navigation
- `src/features/`: feature-level UI modules such as `auth`, `dashboard`, and `finance`
- `src/shared/`: reusable utilities and global styles

## Current finance scope

Sprint 2 adds:

- category and subcategory management
- transaction CRUD flows
- preview persistence scoped to the authenticated user
- Supabase-ready finance repositories
- SQL migrations for core tables and row-level security

## Design direction

The UI foundation follows the "Architectural Ledger" direction from `DESIGN.md`:

- editorial typography
- tonal surface layering instead of hard dividers
- strong spacing hierarchy
- gradient-driven primary actions

This gives us a reusable shell for future auth, transactions, budgets, and analytics work.
