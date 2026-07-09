# Architecture Notes

## Current Stack

- Frontend: React + TypeScript + Vite
- Routing: React Router
- Authentication: Supabase Auth
- Finance data: Supabase-backed service layer
- User preferences and notification read state: Supabase when configured, local storage fallback otherwise
- Testing: Vitest + Testing Library
- Linting: ESLint flat config
- Database target: Supabase / PostgreSQL
- Deployment target: Render static site from `render.yaml`

## Repository Structure

- `frontend/`: application source code
- `backend/`: reserved for optional future server-side code
- `database/`: Supabase migrations and illustrative seed data
- `docs/`: setup, architecture, testing, release, and deployment notes

## Frontend Structure

- `src/app/`: app composition, routing, layout, and navigation
- `src/features/`: feature-owned UI, hooks, services, selectors, and tests
- `src/shared/`: reusable i18n, formatting, date, Supabase, preference, and style utilities
- `src/test/`: shared test setup and render helpers

## Routes

- Public auth routes: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`
- Protected app routes: `/`, `/transactions`, `/categories`, `/budgets`, `/analytics`, `/notifications`, `/settings`
- Unknown public routes redirect to `/sign-in`; unknown protected routes redirect to `/`

## Current Product Scope

- Supabase email/password authentication, sign-up, sign-in, sign-out, and password reset
- Dashboard with month-aware budget and availability summaries
- Category and subcategory management, including icons
- Transaction CRUD, installment creation, and CSV export
- Budget defaults, monthly overrides, and budget reallocation prompts
- Set-asides that reserve future spending without immediately becoming transactions
- Monthly review data for planned income and carry-over handling
- Client-side analytics for monthly cashflow, savings rate, category trends, and comparisons
- Notifications for budget overruns, possible reallocations, due set-asides, and completed installments
- Settings for currency, locale, and financial month start day

## Database Scope

Current migrations cover:

- categories and subcategories
- transactions and installment metadata
- row-level security and `updated_at` triggers
- budgets and monthly budget overrides
- set-asides
- display preferences
- monthly reviews
- category and subcategory icons
- notification read state

## Design Direction

The UI foundation follows the "Architectural Ledger" direction from the design assets:

- editorial typography
- tonal surface layering instead of hard dividers
- strong spacing hierarchy
- gradient-driven primary actions

Keep new screens consistent with the existing shell and finance panel language.
