# CourtSync Frontend Workflow

This workflow keeps frontend implementation state local to `frontend/`. Root `tasks/` remains for broad project status and backend/project-wide handoffs.

## Source Documents

Read these before making product or UI decisions:

1. [`tasks/todo.md`](./todo.md)
2. [`docs/user-flows.md`](../docs/user-flows.md)
3. [`docs/ui-ux-design-system.md`](../docs/ui-ux-design-system.md)
4. [`../docs/superpowers/specs/2026-05-13-courtsync-mvp-v2-design.md`](../../docs/superpowers/specs/2026-05-13-courtsync-mvp-v2-design.md)

Before writing Next.js route, layout, server component, metadata, action, form, navigation, or route handler code, read the relevant local Next.js 16 guide in `node_modules/next/dist/docs/`. The repo's `AGENTS.md` warns that this Next version may differ from older conventions.

## Session Loop

### 1. Start

- Read [`tasks/todo.md`](./todo.md).
- Check `git status --short`.
- Confirm the current frontend slice and exact next checklist item.
- Re-read only the relevant sections of [`docs/user-flows.md`](../docs/user-flows.md) and [`docs/ui-ux-design-system.md`](../docs/ui-ux-design-system.md).
- If shadcn/ui work is involved, inspect installed components and use shadcn primitives, docs, and examples before writing custom UI.
- If Next.js App Router behavior is involved, inspect the relevant local docs under `node_modules/next/dist/docs/`.

### 2. Plan

For non-trivial frontend work, write a short implementation plan before editing:

- Goal.
- Files likely touched.
- Verification command or browser check.
- Explicit out-of-scope items.

Keep the plan to one vertical slice that can be built, checked, and handed off in one session.

### 3. Build

- Use the existing frontend stack: Next.js 16, React 19, TypeScript, Tailwind v4, and shadcn/ui.
- Use shadcn primitives before custom components.
- Use default shadcn zinc semantic tokens before custom styling.
- Use mock data and mock hooks until backend endpoints exist.
- Do not write frontend mutations directly to Supabase tables. Future writes go through Spring Boot.
- Keep route names, state names, and API shapes aligned with the MVP v2 architecture spec.
- Do not add custom brand colors.
- Keep developer simulation controls hidden behind dev mode.

### 4. Verify

Use the strongest practical verification for the slice:

- `pnpm lint` for TypeScript and ESLint issues.
- `pnpm build` when route structure, framework config, shared components, or server/client boundaries changed.
- Local browser check for visible UI work.
- Mobile viewport check for bottom navigation and responsive tables.

When a check cannot be run, record why in [`tasks/todo.md`](./todo.md).

### 5. Close

Before ending a frontend session, update [`tasks/todo.md`](./todo.md):

- What changed this session.
- What's unfinished or still uncertain.
- The next exact frontend slice, with checklist and done-when criteria.
- Verification results or blockers.

Update [`tasks/lessons.md`](./lessons.md) only when there is a reusable correction, workflow mistake, shadcn/Next gotcha, or durable UI lesson. Do not use it as a daily progress log.

## Slice Order

The preferred frontend build order is:

1. App foundation: shadcn/ui setup, theme tokens, shell, navigation, route skeletons.
2. Mock data model: typed mock sessions, users, signups, guests, teams.
3. Public browsing: home, sessions index, session overview.
4. Account flow: player profile, self-serve organizer upgrade, mocked Connect states.
5. Organizer session creation: form, draft/open gating, mocked submit.
6. Player signup: player fields, guest builder, cost summary, checkout preparation state.
7. Payment states: success polling shell, pending, confirmed, failed, abandoned.
8. Signups tab: live/mock signups table, capacity summary, dev simulations.
9. Teams tab: generate/regenerate mock teams, role badges, out-of-position indicators.
10. Polish pass: mobile bottom tabs, accessibility, empty/loading/error states.
11. Backend integration: replace mock fetches/actions with API clients when backend endpoints exist.
12. Supabase Realtime: replace internal mock event dispatch with read-only subscriptions.

## Definition Of Done

A frontend slice is done when:

- The user-facing path works with mock data or real data, depending on the phase.
- Loading, empty, error, and disabled states are handled for that path.
- Mobile layout has been checked.
- Relevant developer simulation controls exist when the slice depends on backend state changes.
- Verification was run or a clear blocker was recorded.
- [`tasks/todo.md`](./todo.md) has been updated for the next session.

## Decision Rules

- If a backend feature is not implemented yet, build the UI against typed mock data and preserve the future API shape.
- If a product state is unclear, prefer the MVP v2 architecture spec over assumptions.
- If a UI styling decision is unclear, prefer shadcn defaults and zinc semantic tokens.
- If a workflow is too large, cut it down to one route or one state-machine transition.
- If a change touches navigation, forms, or payment wording, update the docs when the implementation clarifies the decision.
