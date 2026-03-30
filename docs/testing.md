# Testing Guide

This guide covers the current Sprint 6 testing flow for Fintra.

## Automated checks

Run these commands from the repository root.

### Install dependencies

```bash
npm ci
```

### Run unit tests once

```bash
npm run test:run
```

### Run the smoke suite

```bash
npm run test:smoke
```

### Run tests in watch mode

```bash
npm run test
```

### Run linting

```bash
npm run lint
```

### Run the production build

```bash
npm run build
```

### Run the full release check

```bash
npm run release:check
```

## Current unit test coverage

The current suite validates:

- app bootstrapping and key dashboard shell content
- release-smoke flows for auth, transaction CRUD, budgets, and analytics
- live dashboard snapshot calculations, including monthly overrides
- analytics range, comparison, and category trend calculations
- default budget route rendering and CRUD behavior
- monthly budget override rendering and CRUD behavior
- analytics route rendering and tab switching behavior
- category and transaction route rendering
- category, transaction, budget, and budget override preview persistence rules
- budget summary calculation behavior
- currency formatting behavior
- month label formatting behavior
- percentage formatting behavior

## Manual QA checklist

Use this checklist after `npm run dev`.

### Setup

1. Copy `frontend/.env.example` to `frontend/.env` if the file does not exist yet.
2. Run `npm run dev`.
3. Open the local URL printed by Vite in your terminal.

If Supabase is not configured yet, the app will use preview auth and still allow you to test the
full route-guard flow locally.

If Supabase is configured, make sure the budget migration has also been applied:

- `database/migrations/20260329193000_create_categories_and_subcategories.sql`
- `database/migrations/20260329194000_create_transactions.sql`
- `database/migrations/20260329195000_enable_finance_rls.sql`
- `database/migrations/20260329201000_create_budgets.sql`
- `database/migrations/20260330091000_create_budget_overrides.sql`

### Browser checks

1. Confirm the page loads without a blank screen or visible crash.
2. Confirm unauthenticated access to `/` sends you to the sign-in page.
3. Confirm the sign-in page renders a `Sign in` heading and form fields for email and password.
4. Confirm the sign-up page renders a `Create your account` heading and the confirmation field.
5. Confirm signing in takes you to the dashboard.
6. Confirm the left sidebar shows enabled links for Dashboard, Transactions, Categories, Budgets, and Analytics.
7. Confirm the top shell shows the current user email and a `Sign out` button.
8. Confirm the dashboard still loads from the protected root route.
9. Open `/categories` and confirm preview categories such as Housing and Food and dining are visible.
10. Create a new category and confirm it appears immediately in the list.
11. Open `/transactions` and confirm preview transactions such as Monthly salary are visible.
12. Create a new transaction and confirm it appears immediately in the ledger.
13. Edit a transaction and confirm the updated description or amount is rendered.
14. Delete a transaction and confirm it disappears from the ledger.
15. Open `/budgets` and confirm preview budgets such as Housing are visible.
16. Create a default budget and confirm it appears immediately in the list.
17. On `/budgets`, create a monthly override for the current month and confirm it appears in the override list.
18. Confirm the matching default budget shows an override status for that selected month.
19. Return to `/` and confirm the dashboard shows live budget cards instead of placeholder-only content.
20. Change the selected month on the dashboard and confirm the page stays stable even if the numbers change.
21. Confirm a month with an override changes the effective budget totals compared with a month without one.
22. Open `/analytics` and confirm the overview tab shows historical cards plus the income versus expenses chart.
23. Switch to the Categories tab and confirm category trend cards render with non-zero historical values.
24. Change the analytics range preset and confirm the totals and charts update without crashing.
25. Switch analytics to `Custom range`, choose a start and end month, and confirm the range normalizes correctly.
26. Confirm signing out returns you to the sign-in page.
27. Confirm the layout remains readable on a narrow browser width similar to a phone.
28. Confirm there are no obvious overlapping panels, clipped text, or horizontal scrollbars.

### Regression checks after UI edits

Run these every time the shared shell, layout, or formatting helpers change:

1. `npm run test:run`
2. `npm run lint`
3. `npm run build`

### Release regression checks

Run these before a Render demo, a release candidate, or a production deploy:

1. `npm run test:smoke`
2. `npm run release:check`

## When to add more tests

Add new unit tests when:

- a formatter or calculator gets new logic
- a shared component gains branching behavior
- finance service validation or persistence rules change
- dashboard month aggregation, override resolution, or budget calculations change
- analytics range, comparison, or category trend logic changes
- a bug fix changes rendered output or validation rules

When auth and data flows are added, expand this guide with route protection, loading state, and form validation checks.

## CI behavior

GitHub Actions now runs:

- `npm run lint`
- `npm run test:run`
- `npm run test:smoke`
- `npm run build`
