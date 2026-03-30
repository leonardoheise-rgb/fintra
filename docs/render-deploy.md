# Render Deployment

This project includes a `render.yaml` Blueprint so Render can create the frontend with the correct settings.

## What this Blueprint does

- Creates a Render `Static Site`
- Uses `frontend/` as the app root
- Runs `npm run build`
- Publishes `frontend/dist` by using the `dist` folder inside the `frontend` root directory
- Adds the React Router rewrite from `/*` to `/index.html`
- Prompts you for the real Supabase URL and anon key during the first Blueprint setup

## Before you start

Make sure these two things are true:

1. Your code is pushed to GitHub.
2. Your local `frontend/.env` already has the real values for:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Exact Render steps

1. Go to the Render dashboard.
2. Click `New`.
3. Click `Blueprint`.
4. Connect your GitHub account if Render asks.
5. Select this repository.
6. Wait for Render to detect the `render.yaml` file.
7. When Render shows the service preview, confirm it includes a static site named `fintra-frontend`.
8. In the environment variable step, fill in:
   - `VITE_SUPABASE_URL`: copy the exact value from `frontend/.env`
   - `VITE_SUPABASE_ANON_KEY`: copy the exact value from `frontend/.env`
9. Click `Apply` or `Create Blueprint`.
10. Wait for the deploy to finish.
11. Open the generated `onrender.com` URL.

## What should work after deploy

- The sign-in page loads
- Refreshing pages like `/budgets` or `/analytics` does not show a `404`
- Signing in uses the real Supabase project instead of preview mode

## If something goes wrong

### The site builds but shows preview mode

One of the Render environment variables is missing or wrong. Open the static site in Render and:

1. Go to `Environment`.
2. Check `VITE_SUPABASE_URL`.
3. Check `VITE_SUPABASE_ANON_KEY`.
4. Save.
5. Trigger `Manual Deploy`.

### Refreshing a page shows `404`

The rewrite rule is missing. Open the static site in Render and:

1. Go to `Redirects/Rewrites`.
2. Add a rule:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
3. Save changes.

### Build fails

Open the deploy logs and check the first red error line. The most likely causes are:

- the repository was not fully pushed
- the wrong branch was selected
- the frontend dependencies failed to install

## Manual fallback

If you do not want to use the Blueprint flow, create a `Static Site` manually with these exact values:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Publish Directory: `dist`
- Rewrite: `/*` -> `/index.html`

Add these environment variables manually:

- `VITE_APP_NAME=Fintra`
- `VITE_SUPABASE_URL=<copy from frontend/.env>`
- `VITE_SUPABASE_ANON_KEY=<copy from frontend/.env>`
- `VITE_DEFAULT_CURRENCY=BRL`
- `VITE_DEFAULT_LOCALE=en-US`
