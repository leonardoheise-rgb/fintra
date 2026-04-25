# AGENTS.md

Always speak in English, and ask the user to speak in English when they use another language.

## Core Expectations

- Add unit tests.
- Keep abstractions cohesive.
- Use good and meaningful class, method, function, and variable names.
- Document non-obvious decisions.
- Refactor as you go.
- Reuse existing functions before adding new ones.
- Break large functions into smaller ones.
- Follow SOLID, KISS, YAGNI, clean code, and DRY.
- Only use absolute positioning when necessary.
- Prefer responsive layouts built with flexbox and grid.
- Keep file sizes small and move helper functions and helper components into their own files when a file starts carrying multiple responsibilities.
- Commit after each clear milestone.
- When you need the user to do something manually, give very easy step-by-step instructions.

## Commit And Push Safety

- Before every commit, run the narrowest relevant automated checks for the files you changed.
- Before every push requested by the user, run the highest-signal local validation you can for the affected area.
- For frontend behavior changes, always prefer running the affected Vitest files first, then run `npm run build --workspace frontend` if shared types, routing, layout, or cross-feature UI changed.
- If a change can affect app-wide user flows, also run the smoke suite or the narrowest smoke coverage available before pushing.
- Never push immediately after coding without first checking test results and fixing failing checks that are caused by your changes.
- If a push or CI run fails, inspect the failing test or build log, fix the issue, rerun the relevant checks locally, and only then retry the push.
- After a failed push or CI run, summarize the root cause in the next response so future work can avoid the same mistake.
- When a test is brittle because the UI changed, update the test to match the current intended behavior instead of working around the failure by skipping coverage.

## Context Map

Load the narrowest relevant guide first so the first round stays focused and low-noise.

- `frontend/AGENTS.md`
  Frontend architecture, feature boundaries, testing expectations, and the main docs to open before changing UI behavior.
- `frontend/src/features/finance/AGENTS.md`
  Finance-domain rules for transactions, budgets, installments, set-asides, month boundaries, CSV export, and related regressions.
- `database/AGENTS.md`
  Migration and seed guidance for schema changes and backend-facing finance behavior.

## Helpful Project Docs

- `docs/architecture.md`
  High-level product and technical structure.
- `docs/testing.md`
  Testing commands and expectations.
- `docs/release-checklist.md`
  Release-readiness checks.
- `docs/setup.md`
  Local setup and environment notes.
