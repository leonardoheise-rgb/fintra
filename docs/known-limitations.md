# Known Limitations

These are the current MVP limitations accepted for Sprint 6.

## Data and sync

- Display preferences are saved per signed-in user in the browser on the current device and are not yet synchronized through Supabase.
- Preview mode data is stored locally and should be treated as demo-only behavior.
- The app assumes the required Supabase migrations have already been applied and does not provision missing tables automatically.

## Product scope

- There is no import flow for bank statements or CSV files yet.
- There are no recurring transaction rules yet.
- There is no password reset or account profile management UI yet.
- There is no dedicated admin or support tooling.

## Reporting and analytics

- Analytics are computed client-side from the loaded workspace data.
- There is no export flow for analytics or reports yet.
- There are no long-running background jobs or materialized summaries yet.

## Testing and release process

- The project currently relies on Vitest-based smoke coverage rather than a browser automation tool such as Playwright.
- Manual responsive and accessibility validation is still required before release.
