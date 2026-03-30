# Testing Guide

This guide covers the current phase 3 testing flow for Fintra.

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

## Current unit test coverage

The current suite validates:

- app bootstrapping and key dashboard shell content
- live dashboard snapshot calculations
- default budget route rendering and CRUD behavior
- category and transaction route rendering
- category, transaction, and budget preview persistence rules
- budget summary calculation behavior
- currency formatting behavior
- month label formatting behavior

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

### Browser checks

1. Confirm the page loads without a blank screen or visible crash.
2. Confirm unauthenticated access to `/` sends you to the sign-in page.
3. Confirm the sign-in page renders a `Sign in` heading and form fields for email and password.
4. Confirm the sign-up page renders a `Create your account` heading and the confirmation field.
5. Confirm signing in takes you to the dashboard.
6. Confirm the left sidebar shows enabled links for Dashboard, Transactions, Categories, and Budgets.
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
17. Return to `/` and confirm the dashboard shows live budget cards instead of placeholder-only content.
18. Change the selected month on the dashboard and confirm the page stays stable even if the numbers change.
19. Confirm signing out returns you to the sign-in page.
20. Confirm the layout remains readable on a narrow browser width similar to a phone.
21. Confirm there are no obvious overlapping panels, clipped text, or horizontal scrollbars.

### Regression checks after UI edits

Run these every time the shared shell, layout, or formatting helpers change:

1. `npm run test:run`
2. `npm run lint`
3. `npm run build`

## When to add more tests

Add new unit tests when:

- a formatter or calculator gets new logic
- a shared component gains branching behavior
- finance service validation or persistence rules change
- dashboard month aggregation or budget calculations change
- a bug fix changes rendered output or validation rules

When auth and data flows are added, expand this guide with route protection, loading state, and form validation checks.
