# Fintra Setup

## 1. Install dependencies

From the repository root run:

```bash
npm ci
```

## 2. Create the frontend environment file

1. Copy `frontend/.env.example` to `frontend/.env`
2. Replace the placeholder Supabase values with your project settings

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
