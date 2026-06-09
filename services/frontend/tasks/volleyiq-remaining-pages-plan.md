# VolleyIQ Remaining Pages Sequential Build Plan

## Summary

Build the remaining VolleyIQ pages in sequential slices. Execute only Step 1 first, verify it, then stop for explicit user approval before starting Step 2.

## Step 1 - Discovery Feed

Add the Discovery Feed at `/explore`.

- Add `getIndependentDropInSessions()` to `src/lib/mock-data.ts`.
- Add `src/components/communities/community-card.tsx`.
- Add `src/app/(app)/explore/page.tsx`.
- Use `getCommunities()` for the Communities tab.
- Use `SessionCard` for independent pickup games where `communityId === null`.
- Use shadcn `Card`, `Badge`, `Tabs`, and `buttonVariants`.
- Keep styling within shadcn semantic tokens and the existing zinc palette.
- Link community cards to `/communities/[slug]`.
- Link the floating `Host a Pickup` action to `/drop-ins/new`.

Verification:

- Run `pnpm lint`.
- Run `pnpm build`.
- Confirm `/explore` compiles or prerenders successfully.
- Do not run Playwright CLI.

## Step 2 - Session Detail Route

Build `/drop-ins/[id]` with mock player signups, generated teams, games, preferred roles, assigned roles, and out-of-position flags.

## Step 3 - Signup And Success Flow

Build `/drop-ins/[id]/signup` and `/drop-ins/[id]/success` with mock checkout totals. No real Stripe or Supabase logic.

## Step 4 - Player Profile

Build `/players/[id]` with mock role preferences, ELO history, activity days, and match ledger.

## Step 5 - Global Leaderboard

Build `/leaderboard` with role and skill-level filtering over mock player leaderboard data.

## Frontend UI Best-Practice Pass

Execute these one at a time with verification after each step.

## UI Step 1 - Home Hero And Shared Navbar

Replace the starter root page with a VolleyIQ home page and add a shared top navigation shell.

Status: Complete.

- Add a reusable `SiteHeader` with brand, primary navigation, and host CTA.
- Add `src/app/(app)/layout.tsx` so app routes share the navbar.
- Replace `src/app/page.tsx` with a product-first home page that links into `/explore`, `/leaderboard`, and `/drop-ins/new`.
- Use existing mock data for live-looking session, community, and leaderboard previews.
- Keep styling on shadcn semantic tokens and existing components.
- Avoid raw color classes and placeholder Next.js starter content.

Verification:

- Run `pnpm lint`.
- Run `pnpm build`.
- Confirm `/` and the app routes compile successfully.
- Do not run Playwright CLI.

## UI Step 2 - Host Flow Placeholder

Add a lightweight `/drop-ins/new` placeholder route so existing Host a Pickup CTAs do not land on a missing route.

Status: Complete.

- Explain that the host flow is not wired to persistence yet.
- Link back to `/explore`.
- Keep it server-rendered and mock-only.

## UI Step 3 - Route Loading And Not-Found States

Add route-level loading and not-found states for dynamic app routes.

Status: Complete.

- Add lightweight `loading.tsx` files where dynamic navigation benefits from immediate feedback.
- Add user-facing not-found screens for missing sessions, communities, and players.
- Use `Empty`, `Card`, `Badge`, and semantic tokens.

## UI Step 4 - App Header Consistency Pass

Clean up duplicated page-level back links and align app page headers.

Status: Complete.

- Replace redundant `Explore` back links where the shared navbar covers navigation.
- Keep detail pages scannable with consistent title, status, and metric regions.
- Preserve existing route behavior.

## UI Step 5 - Responsive And Accessibility Polish

Audit the built pages for responsive layout and interaction basics without Playwright.

- Check long text truncation, horizontal table overflow, button labels, aria labels, and empty states.
- Fix obvious semantic or keyboard-access issues discovered during code inspection.
- Investigate and resolve the observed community-route React warning if it reproduces during manual testing.
