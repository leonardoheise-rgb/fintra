# Testing Guide

This guide covers the current phase 0 testing flow for Fintra.

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

### Browser checks

1. Confirm the page loads without a blank screen or visible crash.
2. Confirm unauthenticated access to `/` sends you to the sign-in page.
3. Confirm the sign-in page renders a `Sign in` heading and form fields for email and password.
4. Confirm the sign-up page renders a `Create your account` heading and the confirmation field.
5. Confirm signing in takes you to the dashboard.
6. Confirm the left sidebar shows `Fintra` and the dashboard navigation item appears active.
7. Confirm the top header shows `Monthly command center`.
8. Confirm the top shell shows the current user email and a `Sign out` button.
9. Confirm the hero section shows `Wealth in motion`.
10. Confirm the hero section shows a primary button labeled `Configure monthly plan`.
11. Confirm the category cards render for Housing, Food and dining, Transport, Entertainment, and Shopping.
12. Confirm signing out returns you to the sign-in page.
13. Confirm the layout remains readable on a narrow browser width similar to a phone.
14. Confirm there are no obvious overlapping panels, clipped text, or horizontal scrollbars.

### Regression checks after UI edits

Run these every time the shared shell, layout, or formatting helpers change:

1. `npm run test:run`
2. `npm run lint`
3. `npm run build`

## When to add more tests

Add new unit tests when:

- a formatter or calculator gets new logic
- a shared component gains branching behavior
- a bug fix changes rendered output or validation rules

When auth and data flows are added, expand this guide with route protection, loading state, and form validation checks.
