# Sprint 6 Release Checklist

Use this checklist before any MVP demo or production release.

## Product readiness

- `npm run lint` passes from the repository root
- `npm run test:run` passes from the repository root
- `npm run build` passes from the repository root
- The smoke suite in `frontend/src/app/App.smoke.test.tsx` passes
- No blocker defects remain in auth, transactions, budgets, dashboard, or analytics

## Environment readiness

- Render frontend is connected to the correct GitHub repository and branch
- Render environment variables are set:
  - `VITE_APP_NAME`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_DEFAULT_CURRENCY`
  - `VITE_DEFAULT_LOCALE`
- Render rewrite rule is active for `/*` to `/index.html`
- Supabase email/password auth is enabled
- Supabase migrations have been applied in order from `database/migrations`

## Manual smoke checks

### Auth

1. Open the deployed URL while signed out.
2. Confirm the sign-in page loads without a blank screen.
3. Sign in with a real user.
4. Confirm the protected shell loads and the top bar shows the signed-in email.
5. Sign out and confirm the app returns to the sign-in page.

### Transactions

1. Open `/transactions`.
2. Create a transaction.
3. Edit the same transaction.
4. Delete the same transaction.
5. Refresh the page and confirm the deleted transaction does not return.

### Budgets

1. Open `/budgets`.
2. Create a default budget.
3. Create a monthly override.
4. Confirm the override appears in the override registry.
5. Confirm the dashboard reflects the effective budget.

### Analytics

1. Open `/analytics`.
2. Confirm the overview tab renders.
3. Switch to the categories tab.
4. Change the range preset to `Custom range`.
5. Confirm the page stays stable and values update.

## Responsive and accessibility checks

- Validate Dashboard, Transactions, Budgets, Analytics, and Settings at desktop width
- Validate the same screens at a narrow mobile-like width
- Confirm there are no obvious overlaps, clipped text, or horizontal scrollbars
- Confirm every primary form control has a visible label
- Confirm keyboard navigation can reach primary actions and navigation links

## Deployment sign-off

- Render build logs show a successful deploy on the intended commit
- Supabase data reads and writes succeed from the deployed frontend
- Deep links such as `/budgets`, `/analytics`, and `/settings` survive browser refresh
- The deployment procedure in `docs/deployment-runbook.md` has been followed
- Known limitations have been reviewed in `docs/known-limitations.md`
- Post-MVP backlog has been reviewed in `docs/post-mvp-backlog.md`

## Release decision

- Release approved
- Release blocked pending follow-up items
