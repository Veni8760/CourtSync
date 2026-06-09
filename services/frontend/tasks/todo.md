# VolleyIQ Frontend Todo

_Last updated: 2026-05-14_

This is the canonical frontend handoff file. Keep it focused on the active frontend slice only; use root [`../tasks/todo.md`](../../tasks/todo.md) for broad project status.

## What we did this session

- Created the frontend-local workflow structure under `frontend/tasks/`.
- Folded the active rules from `frontend/FRONTEND_WORKFLOW.md` into [`tasks/workflow.md`](./workflow.md).
- Created [`tasks/lessons.md`](./lessons.md) for durable frontend corrections and gotchas.
- Updated [`README.md`](../README.md) to point future frontend sessions at the workflow and design docs.
- Moved frontend design docs into `frontend/docs/`.
- Removed the duplicate `frontend/FRONTEND_WORKFLOW.md` file.

## What's unfinished / open questions

- [ ] Confirm whether the app will keep both `app/` and `src/app/`; the scaffold currently has both paths in the frontend tree.
- [ ] Run shadcn initialization or inspect current shadcn state before the first UI implementation slice.
- [ ] Decide the exact mock-data folder shape once route skeletons are in place.

## What's next - Frontend Slice 1: App Foundation

**Scope:** Establish the frontend foundation for VolleyIQ's MVP shell: shadcn setup, zinc theme, app navigation, route skeletons, and a clear mock-data direction. No backend integration yet.

**Done when:** The app has a coherent shadcn/zinc shell, the primary routes from `docs/user-flows.md` exist as skeleton pages, mock-data placement is decided, and lint/build or a recorded blocker confirms the scaffold is usable.

### Checklist

- [ ] Start by reading:
  - [ ] [`tasks/workflow.md`](./workflow.md)
  - [ ] [`docs/user-flows.md`](../docs/user-flows.md), especially Product Scope, Route Map, and Shared Screen States
  - [ ] [`docs/ui-ux-design-system.md`](../docs/ui-ux-design-system.md), especially Shell, Navigation, Component Rules, and Color System
  - [ ] Relevant local Next.js docs in `node_modules/next/dist/docs/` for layouts, pages, navigation, and server/client components
- [ ] Inspect package and project state:
  - [ ] `package.json`
  - [ ] `components.json` if present
  - [ ] Existing `app/` and `src/app/` files
- [ ] Initialize or verify shadcn/ui:
  - [ ] Confirm package runner is `pnpm`
  - [ ] Use zinc/default semantic tokens
  - [ ] Add only the primitives needed for the shell and skeleton pages
- [ ] Establish the app shell:
  - [ ] Desktop top navigation: Sessions, Leaderboard, Create session, Account
  - [ ] Signed-out top navigation: Sessions, Leaderboard, Sign in
  - [ ] Mobile bottom tab shape for authenticated states
  - [ ] Keep shell styling within shadcn/zinc defaults
- [ ] Create primary route skeletons:
  - [ ] `/`
  - [ ] `/login`
  - [ ] `/signup`
  - [ ] `/drop-ins`
  - [ ] `/drop-ins/new`
  - [ ] `/drop-ins/[id]`
  - [ ] `/drop-ins/[id]/signup`
  - [ ] `/signups/[id]/success`
  - [ ] `/me`
  - [ ] `/me/payouts`
  - [ ] `/leaderboard`
  - [ ] `/players/[id]`
- [ ] Decide mock-data direction:
  - [ ] Define where typed mock data and mock hooks will live
  - [ ] Keep future Spring Boot API shapes visible
  - [ ] Avoid direct Supabase table writes
- [ ] Verify:
  - [ ] `pnpm lint`
  - [ ] `pnpm build` if route/layout/server-client boundaries changed
  - [ ] Browser check for desktop shell
  - [ ] Mobile viewport check for navigation

### Out of scope

- Real Supabase Auth wiring.
- Spring Boot API client integration.
- Stripe Checkout or Connect calls.
- Full forms beyond route placeholders.
- Supabase Realtime.
