# VolleyIQ Frontend Todo

_Last updated: 2026-06-13_

This is the canonical frontend handoff file. Keep it focused on the active frontend slice only; use root [`../tasks/todo.md`](../../tasks/todo.md) for broad project status.

## What we did this session

- Implemented the real public landing route split:
  - `/` now lives at `src/app/(marketing)/page.tsx`.
  - Signed-in `/` redirects to `/home`.
  - Signed-out `/` renders the marketing landing page.
  - Deleted the old conflicting `src/app/page.tsx`.
- Moved the signed-in dashboard experience to `src/app/(app)/home/page.tsx` and protected it:
  signed-out `/home` redirects to `/login`.
- Added `src/lib/auth.ts` with shared server auth helpers used by the marketing page and app
  header.
- Updated auth redirects:
  - login success → `/home`
  - signup success → `/home`
  - email confirmation default `next` → `/home`
  - sign-out still redirects to `/`
- Added marketing UI:
  - `src/components/layout/marketing-header.tsx`
  - `src/components/marketing/landing-page.tsx`
  - `src/components/marketing/landing-hero.tsx`
  - `src/components/marketing/landing-preview.tsx`
  - `src/components/marketing/landing-sections.tsx`
  - `src/components/marketing/types.ts`
- Built the landing page around existing mock data: upcoming sessions, open sessions, tracked
  players, and active communities.
- Browser checked:
  - signed-out `/` shows the marketing landing first, not the dashboard "Next sessions" content
  - CTA "Explore drop-ins" navigates to `/explore`
  - signed-out `/home` redirects to `/login`
  - desktop and mobile landing layouts have no visible horizontal overflow
  - mobile hero preview was compacted so the next section is visible in the first viewport

## Current verification status

- [x] `pnpm lint` passed after the main route split.
- [x] `pnpm build` passed after the main route split; Next listed both `/` and `/home` with no
      route conflict.
- [ ] Rerun `pnpm lint` after the final mobile/reduced-motion tweaks.
- [ ] Rerun `pnpm build` after the final mobile/reduced-motion tweaks.
- [ ] Finish reduced-motion QA; the interrupted check surfaced a transform value that needs
      confirmation/fix.
- [ ] Verify signed-in `/` redirects to `/home` with a real Supabase session.
- [ ] Verify signed-in `/home` shows the dashboard with a real Supabase session.
- [ ] Verify sign-out lands on `/` with a real Supabase session.

## Previous frontend setup session

- Created the frontend-local workflow structure under `frontend/tasks/`.
- Folded the active rules from `frontend/FRONTEND_WORKFLOW.md` into [`tasks/workflow.md`](./workflow.md).
- Created [`tasks/lessons.md`](./lessons.md) for durable frontend corrections and gotchas.
- Updated [`README.md`](../README.md) to point future frontend sessions at the workflow and design docs.
- Moved frontend design docs into `frontend/docs/`.
- Removed the duplicate `frontend/FRONTEND_WORKFLOW.md` file.

## What's unfinished / open questions

- [ ] Finish reduced-motion QA for the landing page.
- [ ] Rerun `pnpm lint` after the final landing page tweaks.
- [ ] Rerun `pnpm build` after the final landing page tweaks.
- [ ] Verify signed-in `/` redirects to `/home` with a real Supabase session.
- [ ] Verify signed-in `/home` shows the existing dashboard with a real Supabase session.
- [ ] Verify sign-out lands back on `/`.
- [ ] Confirm whether the app will keep both `app/` and `src/app/`; the scaffold currently has both paths in the frontend tree.
- [ ] Run shadcn initialization or inspect current shadcn state before the first UI implementation slice.
- [ ] Decide the exact mock-data folder shape once route skeletons are in place.

## What's next - Finish Real Landing Page + Clean App Routing

**Scope:** Finish verification and any small fixes for the active landing/routing split.

**Done when:** `pnpm lint` and `pnpm build` pass after the final tweaks, reduced-motion rendering
has no transform-based entrance state, signed-out `/` and `/home` behave correctly, and signed-in
`/`, `/home`, and sign-out are verified with a real Supabase session.

### Checklist

- [ ] Fix or confirm reduced-motion hero/preview final positions.
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Browser check signed-out `/`
- [ ] Browser check signed-out `/home` redirects to `/login`
- [ ] Browser check desktop landing viewport
- [ ] Browser check mobile landing viewport
- [ ] Browser check signed-in `/` redirects to `/home`
- [ ] Browser check signed-in `/home` renders the dashboard
- [ ] Browser check sign-out redirects to `/`

## Historical - Frontend Slice 1: App Foundation

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
