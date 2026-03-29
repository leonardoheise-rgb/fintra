# Fintra Setup

## 1. Install dependencies

From the repository root run:

```bash
npm ci
```

## 2. Create the frontend environment file

1. Copy `frontend/.env.example` to `frontend/.env`
2. Replace the placeholder Supabase values with your project settings

If you leave the placeholder Supabase values in place, Fintra uses a local preview auth mode so
you can still test sign-in, sign-up, redirects, and the protected shell before connecting a real
project.

## 3. Start the app

```bash
npm run dev
```

The Vite dev server will print the local URL in the terminal.

## 4. Run quality checks

```bash
npm run lint
npm run test:run
npm run build
```

For a fuller automated and manual QA workflow, see `docs/testing.md`.

## 5. Enable the local pre-commit hook

```bash
git config core.hooksPath .githooks
```

After that, every commit will run `npm run check`.

## Environment variables

The frontend currently expects:

- `VITE_APP_NAME`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_DEFAULT_CURRENCY`
- `VITE_DEFAULT_LOCALE`

## Authentication behavior

- Real Supabase auth is used when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured
- Local preview auth is used when those values are still placeholders
- Preview auth stores the session locally so Sprint 1 routes and guards remain testable

## Finance data behavior

- Preview mode stores categories, subcategories, and transactions in local storage per signed-in preview user
- Supabase mode expects the Sprint 2 migrations inside `database/migrations/` to be applied
- The app now includes protected routes for `/transactions` and `/categories`

## Deployment flow

### Frontend

- Deploy the `frontend` app on Vercel or Render static hosting
- Reuse the same environment variables from the local `.env` file

### Database and auth

- Create the Supabase project
- Enable email/password auth
- Apply future migrations from the `database` folder as they are added

### CI baseline

GitHub Actions runs install, lint, tests, and build for each push to `main` and `dev`, plus pull requests.
