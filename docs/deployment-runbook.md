# Deployment Runbook

Use this runbook for any Render-based MVP deploy of Fintra.

## Goal

Deploy the current frontend build to Render with the correct Supabase configuration and verify the main product promise end to end.

## Preconditions

Before you deploy, confirm all of these are true:

- The intended commit is already pushed to GitHub.
- `npm run release:check` passes locally.
- Supabase email/password auth is enabled.
- The required migrations in `database/migrations/` have been applied.
- The Render static site already exists or the repository contains a valid `render.yaml`.

## Required environment variables

Render must have these environment variables configured:

- `VITE_APP_NAME`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_DEFAULT_CURRENCY`
- `VITE_DEFAULT_LOCALE`

## Render configuration

For a manual static-site setup, use these values:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Publish Directory: `dist`
- Rewrite: `/*` -> `/index.html`

If you are using the Blueprint flow, keep `render.yaml` in sync with these same settings.

## Deployment procedure

### 1. Confirm the target commit

1. Open GitHub.
2. Open the `main` branch.
3. Copy the commit hash you intend to release.

### 2. Trigger the deploy in Render

1. Open the Render dashboard.
2. Open the `fintra-frontend` service.
3. Click `Manual Deploy`.
4. Choose `Deploy latest commit` or the intended branch state.

### 3. Watch the build

1. Open the deploy logs.
2. Confirm install, test, and build steps finish without red errors.
3. Confirm the deploy points at the expected commit.

### 4. Validate the deployed app

Run these checks on the live `onrender.com` URL:

1. Open the homepage while signed out.
2. Confirm the sign-in page loads.
3. Sign in with a real Supabase-backed user.
4. Open `/transactions` and create a transaction.
5. Open `/budgets` and create a default budget and override.
6. Open `/analytics` and switch to the categories tab.
7. Open `/settings` and save a currency or locale preference.
8. Refresh `/budgets`, `/analytics`, and `/settings` directly in the browser.

Expected result:

- No blank screen
- No `404` on refresh
- Data writes succeed
- Route protection still works
- Settings persist on the current device

## Failure handling

### The deploy succeeds but the app shows preview mode

Check Render environment variables first:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If either is missing or still using placeholder values, update them and redeploy.

### Deep links return `404`

The rewrite rule is missing or wrong. Reconfigure:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

### The app loads but data calls fail

Check these in order:

1. Supabase project URL is correct.
2. Supabase anon key is correct.
3. Auth is enabled.
4. The migrations were actually applied.
5. Row-level security policies are present.

### The build fails

Open the first red error line in the Render logs and classify it:

- dependency install problem
- build error
- missing environment variable
- wrong repository or branch

Do not retry blindly before identifying which class of failure happened.

## Rollback

If the newest deploy is broken:

1. Open the Render service.
2. Open the deploy history.
3. Find the last known good deploy.
4. Redeploy that known good version.
5. Re-run the live validation checks above.

## Release evidence

After a successful deploy, record:

- deployed commit hash
- deploy timestamp
- who deployed it
- whether manual smoke checks passed
- any known limitation accepted for that release
