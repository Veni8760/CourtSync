# CourtSync User Flows

Source of truth: `../docs/superpowers/specs/2026-05-13-courtsync-mvp-v2-design.md`

This document defines the first usable frontend slice for CourtSync: organizer self-serve onboarding, paid session creation, player signup with guests, payment-state handling, live signups, and team generation. Adjacent flows are included only where they affect these journeys, such as payment failure, checkout abandonment, and cancellation/refund entry points.

## Product Scope

### In scope for the first usable slice

- Public browsing of open drop-in sessions.
- Supabase Auth sign in / sign up entry points.
- Player profile basics needed for signup: display name, preferred role, secondary role, skill level.
- Self-serve organizer upgrade through `POST /api/me/become-organizer`.
- Stripe Connect onboarding gate before publishing paid sessions.
- Organizer session creation, including draft and publish states.
- Session detail page with Overview, Signups, Teams, Games, and Leaderboard tabs, with Games and Leaderboard allowed to be placeholder/read-only until the later ratings slice.
- Player signup form with guest list and one combined payment.
- Stripe Checkout redirect preparation and post-payment success return.
- PENDING_PAYMENT, CONFIRMED, PAYMENT_FAILED, CANCELLED_BY_PLAYER, and CANCELLED_BY_ORGANIZER signup states.
- Organizer signups list with live-update-ready interaction design.
- Organizer team generation and regeneration.
- Player visibility into their assigned team after generation.
- Hidden developer state simulator for mock-data UX testing before Supabase Realtime is live.

### Deferred or shallow in this slice

- Full game recording workflow.
- ELO update internals.
- Global leaderboard beyond a route and table shell.
- Admin support tooling.
- Approval workflow for organizers.
- Waitlist.
- Multi-currency.
- Session rescheduling.
- Native mobile app.

## Architecture Constraints The Frontend Must Respect

- All authenticated mutations go through the Spring Boot API with `Authorization: Bearer <jwt>`.
- All mutating requests should send `Idempotency-Key: <uuid>`.
- The frontend does not write directly to Supabase tables.
- Supabase in the browser is used for Auth and read-only Realtime subscriptions.
- Stripe owns payment collection through hosted Checkout.
- Stripe webhooks are the source of truth for payment success or failure.
- A signup is not confirmed until the backend receives Stripe confirmation and transitions it to `CONFIRMED`.
- Guests are not independent users. They are attached to the paying player's signup.
- Public users can browse open sessions, but signups, teams, games, and authenticated leaderboard detail require sign in.
- The backend concepts are authoritative even before backend implementation exists.

## Roles

### Visitor

Not authenticated. Can browse open sessions and view public session overview. Cannot view signups, teams, or start checkout without signing in.

### Player

Authenticated default role. Can create a player profile, sign up for sessions, add guests before payment, pay through Stripe Checkout, cancel their own confirmed signup before the refund cutoff, and view assigned teams.

### Guest

Non-authenticated participant attached to a player's signup. The paying player provides guest display name, preferred role, secondary role, and estimated skill level. Guests do not log in or pay independently.

### Organizer

Authenticated user with `users.role = ORGANIZER`. For now this is a self-serve instant upgrade. Organizers can create sessions, publish paid sessions only after Stripe Connect charges are enabled, view signups, generate teams, and later record games.

## Primary Route Map

| Route | Access | Main purpose |
|---|---|---|
| `/` | Public | Entry point with upcoming sessions and sign-in/create-session CTAs |
| `/login` | Public | Supabase sign in |
| `/signup` | Public | Supabase sign up |
| `/drop-ins` | Public | Browse open and full sessions |
| `/drop-ins/new` | Organizer | Create a session |
| `/drop-ins/[id]` | Public overview, authenticated tabs | Session detail workspace |
| `/drop-ins/[id]/signup` | Player | Player signup and guest entry |
| `/signups/[id]/success` | Player | Stripe Checkout success return and confirmation polling |
| `/me` | Authenticated | Account, player profile, organizer upgrade, Connect status |
| `/me/payouts` | Organizer | Redirect to Stripe Express dashboard |
| `/leaderboard` | Public shell | Global leaderboard, full realtime behavior later |
| `/players/[id]` | Public shell | Player profile and rating history, full behavior later |

## Shared Screen States

### Auth states

- Signed out: public browsing only. Signup CTAs route to `/login?next=...`.
- Signed in, no player profile: prompt for display name, preferred role, secondary role, and skill level before first signup.
- Signed in player: can sign up and manage own signup.
- Signed in organizer without Connect: can become organizer and create draft sessions, but cannot publish paid open sessions.
- Signed in organizer with Connect charges enabled: can publish sessions and generate teams.

### Session lifecycle states

- `DRAFT`: organizer-only editing state. Not shown in public browse.
- `OPEN`: public and accepting paid signups.
- `FULL`: public, not accepting new signup attempts.
- `CANCELLED`: hidden from public browse; organizer/player detail may show historical cancelled state.
- `COMPLETED`: public historical state; no signup or team generation actions.

### Signup lifecycle states

- No signup: player can start signup if session has capacity and is open.
- `PENDING_PAYMENT`: signup and guests exist, but seat is not confirmed. UI should present checkout continuation or waiting state.
- `CONFIRMED`: paid and counted toward capacity.
- `PAYMENT_FAILED`: checkout failed, expired, or abandoned and cleaned up. Player can attempt a new signup if capacity remains.
- `CANCELLED_BY_PLAYER`: player cancelled before refund cutoff. Display refund status if available.
- `CANCELLED_BY_ORGANIZER`: session cancellation triggered refund path. Display informational state.

## Flow 1: Public Browsing To Signup Intent

### Goal

A visitor finds a session and understands that account sign-in is required before payment.

### Screen sequence

1. `/`
   - Show upcoming open sessions, simple value proposition, and primary actions: browse sessions, sign in, create session.
   - Do not require auth for viewing.

2. `/drop-ins`
   - Fetch `GET /api/drop-ins?status=OPEN`.
   - Display list/table of upcoming sessions with date, time, location, price, confirmed spots, max spots, and status.
   - Session rows route to `/drop-ins/[id]`.

3. `/drop-ins/[id]` Overview tab
   - Fetch `GET /api/drop-ins/{sessionId}`.
   - If signed in, also fetch user's own signup state if available through `GET /api/drop-ins/{sessionId}/signups` or a future purpose-built "my signup" response.
   - Show CTA:
     - Signed out: "Sign in to join".
     - Signed in player, no active signup: "Join session".
     - Signed in player, `PENDING_PAYMENT`: "Continue checkout".
     - Signed in player, `CONFIRMED`: "View my signup".
     - Full session: disabled "Session full".
     - Cancelled/completed: no signup action.

### Edge cases

- If user signs in from session detail, preserve `next=/drop-ins/{id}/signup`.
- If the session becomes full after the visitor opens the page, disable signup when the live spot count updates.
- If the user already has `PENDING_PAYMENT` or `CONFIRMED`, route them to the existing signup rather than creating a duplicate.

## Flow 2: Account, Player Profile, And Self-Serve Organizer Upgrade

### Goal

A user can become an organizer instantly for MVP, then continue into Stripe Connect onboarding.

### Screen sequence

1. `/me`
   - Authenticated account dashboard.
   - Show profile summary, player fields, role, and organizer status.
   - If role is `PLAYER`, show "Become organizer".

2. User clicks "Become organizer"
   - Send `POST /api/me/become-organizer`.
   - Include `Idempotency-Key`.
   - Optimistically disable the button while pending.
   - On success, update role to `ORGANIZER`.
   - Capture `become_organizer_clicked`.

3. Organizer status panel appears
   - Fetch `GET /api/stripe/connect/status`.
   - If no Stripe account or incomplete onboarding, show "Set up payouts".
   - If charges are not enabled, explain that paid sessions can be saved as drafts but not published.
   - If `charges_enabled = true` and `details_submitted = true`, show "Ready to publish paid sessions".

### Later approval note

There is no approval process in this MVP flow. Keep the copy neutral so an approval step can be added later without rewriting the whole account page:

- Use "Organizer tools" instead of "Verified organizer".
- Use "Set up payouts" instead of "Apply for organizer access".

## Flow 3: Stripe Connect Onboarding

### Goal

An organizer completes Stripe-hosted onboarding so they can publish paid sessions.

### Screen sequence

1. `/me` organizer status panel
   - User clicks "Set up payouts".

2. Frontend calls backend
   - `POST /api/stripe/connect/onboard`.
   - Include JWT and `Idempotency-Key`.
   - Backend returns Stripe Account Link URL.

3. Redirect to Stripe
   - Browser leaves CourtSync for hosted onboarding.
   - Capture `connect_onboarding_started`.

4. Return URL
   - Route back to `/me?connect=return` or `/drop-ins/new?connect=return`.
   - Immediately call `GET /api/stripe/connect/status`.
   - Show one of:
     - Ready: "Payouts ready. You can publish paid sessions."
     - Pending review/details: "Stripe needs more information. Continue setup."
     - Refresh required: "Onboarding link expired. Start again."

### Error states

- Backend cannot create account link: show alert with retry.
- Stripe returns but account still incomplete: do not let organizer publish open paid sessions.
- Account updates may also arrive later through Stripe webhook; status should be refetchable.

## Flow 4: Organizer Creates A Session

### Goal

An organizer creates a paid drop-in session that can be published once Connect is ready.

### Screen sequence

1. `/drop-ins/new`
   - Guard: must be authenticated.
   - If role is `PLAYER`, show self-serve organizer upgrade prompt.
   - If role is `ORGANIZER`, show session form.
   - Fetch Connect status in parallel.

2. Session form fields
   - Title.
   - Description.
   - Location.
   - Date.
   - Start time.
   - End time.
   - Price in CAD.
   - Max players.
   - Players per team.
   - Number of courts.
   - Optional notes for players.

3. Publish control
   - If Connect charges are enabled: primary action "Publish session".
   - If Connect is incomplete: primary action "Save draft"; publish action disabled with inline explanation.
   - Validation mirrors backend rules:
     - Required title, date, start time.
     - Date must be today or future.
     - Price cents must be >= 0.
     - Max players and players per team must be > 0.
     - Number of courts must be > 0 when provided.

4. Submit
   - Send `POST /api/drop-ins`.
   - Include `Idempotency-Key`.
   - Requested status:
     - `OPEN` when publishing.
     - `DRAFT` when saving before Connect is ready.
   - On success, route to `/drop-ins/{sessionId}`.

### Session detail after creation

- Organizer lands on `/drop-ins/[id]`.
- Overview tab shows publish status, capacity, pricing, and organizer controls.
- Signups tab starts empty with an empty state.
- Teams tab is locked until at least two confirmed signups exist.

## Flow 5: Organizer Edits Or Cancels A Session

### Goal

Provide the minimum adjacent controls needed because cancellation affects signup and refund states.

### Edit

- Route: `/drop-ins/[id]`, organizer action opens edit dialog or sheet.
- Endpoint: `PATCH /api/drop-ins/{sessionId}`.
- Include `Idempotency-Key`.
- For MVP, avoid rescheduling semantics that affect refund cutoff. If date/time changes are allowed later, the UI must explain that existing signup refund snapshots are not recomputed.

### Cancel

- Route: `/drop-ins/[id]`, organizer action "Cancel session".
- Endpoint: `POST /api/drop-ins/{sessionId}/cancel`.
- Confirm with destructive dialog.
- Explain that confirmed players will enter organizer-cancelled/refund flow.
- After success:
  - Session status becomes `CANCELLED`.
  - Public signup CTA disappears.
  - Existing confirmed signups show `CANCELLED_BY_ORGANIZER`.
  - Refund status may be pending until Stripe webhook confirms.

## Flow 6: Player Signup With Guests

### Goal

A signed-in player signs up, adds guests, and starts Stripe Checkout.

### Screen sequence

1. `/drop-ins/[id]/signup`
   - Guard: must be authenticated.
   - If no player profile exists, inline collect display name, preferred role, secondary role, and skill level.
   - Fetch `GET /api/drop-ins/{sessionId}` for session summary.
   - Fetch any current active signup state if available.

2. Signup form
   - Player display name.
   - Preferred role: Setter, Attacker, Defender, All-rounder, Beginner, Unknown.
   - Secondary role: same options, optional.
   - Skill level: Beginner, Intermediate, Advanced, Unknown.
   - Guest list:
     - Display name.
     - Preferred role.
     - Secondary role.
     - Estimated skill level.
   - Keep guests together toggle, default on.
   - Cost summary:
     - Player seat + guest seats.
     - Unit price.
     - Total due in CAD.
     - Refund eligible until timestamp.

3. Submit signup
   - Endpoint: `POST /api/drop-ins/{sessionId}/signups`.
   - Include JWT and `Idempotency-Key`.
   - Payload includes player fields, guest array, `keep_guests_together`, notes.
   - Backend creates `PENDING_PAYMENT` signup and guest rows, emits `signup.created.v1`.

4. Preparing checkout state
   - UI moves to "Preparing secure checkout".
   - Poll `GET /api/signups/{signupId}` until `checkout_url` is present.
   - Once ready, redirect to `checkout_url`.
   - Capture `signup_form_submitted` on submit and `checkout_redirected` before leaving app.

5. Stripe Checkout
   - Stripe handles payment.
   - Success URL: `/signups/{signupId}/success`.
   - Cancel URL: `/drop-ins/{sessionId}`.

### Important UX rule

Do not imply the seat is held while `PENDING_PAYMENT`. Use copy like:

"Your signup has started. Your spot is confirmed only after payment succeeds."

### Guest editing before payment

The API includes:

- `POST /api/signups/{signupId}/guests`
- `DELETE /api/guests/{guestId}`

For the first slice, the main happy path adds guests in the initial signup form. If the player returns to a pending signup before checkout, allow guest edits only while status is `PENDING_PAYMENT`.

## Flow 7: Checkout Success And Confirmation Polling

### Goal

After Stripe returns to CourtSync, the user sees a trustworthy status while the webhook confirms the signup.

### Screen sequence

1. `/signups/[id]/success`
   - Authenticated route.
   - Fetch `GET /api/signups/{signupId}`.
   - If status is `CONFIRMED`, show receipt-style confirmation.
   - If status is still `PENDING_PAYMENT`, show "Confirming payment" and poll every few seconds.
   - If status becomes `PAYMENT_FAILED`, show failed state and link back to session.

2. Confirmed state
   - Show session title, date/time, location, paid seats, guests, total paid, refund deadline.
   - Primary action: "View session".
   - Secondary action: "Add to calendar" can be a later enhancement.

3. Session detail after confirmation
   - Overview CTA changes to "You're confirmed".
   - Signups tab count updates when realtime/mock event arrives.
   - Player can see team tab once teams are generated.

### Webhook timing

The UI must tolerate a short delay between Stripe redirect and webhook processing. The success page should never claim payment confirmation until signup status is actually `CONFIRMED`.

## Flow 8: Checkout Cancel, Expiry, Or Payment Failure

### Goal

Handle non-happy payment states without creating duplicate signups or confusing seat status.

### Stripe cancel URL return

1. User returns to `/drop-ins/{sessionId}` from Checkout cancel URL.
2. Fetch current user's active signup state.
3. If status is `PENDING_PAYMENT` and `checkout_url` still exists:
   - Show banner: "Payment not completed."
   - Actions: "Continue checkout" and "Cancel pending signup" if the backend supports deletion/cancellation for pending signups.
4. Capture `checkout_abandoned`.

### Expired checkout

- Backend eventually receives `checkout.session.expired` or cleanup marks `PAYMENT_FAILED`.
- UI shows a recoverable failed state:
  - "Payment window expired."
  - "Start signup again" if capacity remains.

### Payment failure

- Status: `PAYMENT_FAILED`.
- UI may show a retry route that creates a new signup if capacity remains.
- Do not reuse a failed signup for a new payment unless the backend explicitly supports that later.

## Flow 9: Player Cancels Confirmed Signup

### Goal

Expose refund-eligible cancellation because it directly follows the payment lifecycle.

### Screen sequence

1. Player opens their confirmed signup from `/drop-ins/[id]` or `/signups/[id]/success`.
2. UI checks `refund_eligible_until`.
3. If before cutoff:
   - Show "Cancel signup" action.
   - Confirm with refund explanation.
   - Send `DELETE /api/signups/{signupId}` with `Idempotency-Key`.
   - Signup becomes `CANCELLED_BY_PLAYER`.
   - Refund row becomes pending; final refund success arrives later through Stripe webhook.
4. If after cutoff:
   - Hide destructive action or show disabled action with "Refund window closed".

### Copy rule

Before Stripe confirms the refund, say "Refund requested" or "Refund pending", not "Refunded".

## Flow 10: Organizer Signups List

### Goal

Organizer can monitor who has paid, who brought guests, capacity, and role mix.

### Screen sequence

1. `/drop-ins/[id]` Signups tab
   - Requires authentication.
   - Fetch `GET /api/drop-ins/{sessionId}/signups`.
   - Subscribe later through `useLiveSignups(sessionId, initialSignups)`.

2. Summary rail
   - Confirmed seats vs max players.
   - Pending payment count.
   - Guests count.
   - Role distribution.
   - Capacity state: open, almost full, full.

3. Table/list
   - Columns:
     - Participant group: paying player and guests.
     - Signup status.
     - Preferred/secondary roles.
     - Skill level.
     - Seats.
     - Created time.
     - Refund cutoff.
   - Guest rows are visually nested under the paying player on desktop and grouped in an expandable row on mobile.

4. Live update behavior
   - New pending signup appears with `PENDING_PAYMENT`.
   - Payment confirmed updates row to `CONFIRMED` and increments confirmed seats.
   - Payment failed moves row into a collapsed "Failed/expired" section or removes it from the active view depending on product decision.
   - Cancelled signup is visible in history but excluded from active capacity.

### Empty state

If no signups exist:

"No signups yet. Share this session link."

## Flow 11: Organizer Generates Teams

### Goal

Organizer generates balanced teams from confirmed players and guests.

### Preconditions

- User is the organizer.
- Session status is `OPEN` or `FULL`.
- At least two confirmed signups exist.
- Confirmed player pool includes signups and guests.

### Screen sequence

1. `/drop-ins/[id]` Teams tab
   - Fetch `GET /api/drop-ins/{sessionId}/teams`.
   - If no teams yet, show generation panel.
   - If signups count is insufficient, show disabled state with explanation.

2. Generate
   - User clicks "Generate teams".
   - Capture `team_generated_clicked`.
   - Send `POST /api/drop-ins/{sessionId}/generate-teams` with `Idempotency-Key`.
   - Backend:
     - Gets confirmed signups and guests.
     - Builds unified pool.
     - Sorts by rating.
     - Computes teams from players per team.
     - Applies greedy snake-draft with role-distribution soft constraint.
     - Saves teams and members in one transaction.
     - Emits `teams.generated.v1`.

3. Results view
   - Render team sections as list-based tables, not cards.
   - Show team number/name, average rating, player count, role balance summary.
   - Each member row shows display name, Player/Guest marker, assigned role, preferred role, skill/rating, and out-of-position indicator if applicable.

4. Regenerate
   - If teams already exist, button changes to "Regenerate teams".
   - Must show confirmation: "This replaces the current teams."
   - Endpoint is the same. Backend deletes existing teams and members, then generates a new run.

### Player view

- Authenticated players can open the Teams tab after generation.
- Their own team row should be highlighted using semantic surface treatment, not custom brand color.
- If their guests are on the same team, show them grouped nearby where possible.
- If guest grouping was split by the algorithm, show a small notice on the organizer view.

## Flow 12: Team Assignment Visibility

### Goal

Players understand their team assignment and role without needing organizer explanation.

### Screen sequence

1. Player opens `/drop-ins/[id]` Teams tab.
2. If no teams exist:
   - Show "Teams have not been generated yet."
3. If teams exist:
   - Show "Your team" section first for the current player.
   - Then show all teams.
4. If assigned role differs from preferred role:
   - Show "Out of position" indicator.
   - Show preferred role alongside assigned role.
   - Avoid shame-oriented language. Treat it as a balancing outcome.

## Flow 13: Mobile Navigation Through Core Tasks

### Goal

Mobile web supports repeated field use at a gym without hiding the core session actions.

### Bottom tabs

For authenticated users, mobile uses a bottom tab bar:

- Sessions: `/drop-ins`
- My Signup or My Sessions: context-sensitive link to current active signup/session list.
- Create: `/drop-ins/new` for organizers, organizer upgrade prompt for players.
- Leaderboard: `/leaderboard`
- Account: `/me`

On session detail, the bottom tab bar remains global. The session-specific tabs are inside the page as segmented tabs or a horizontal scrollable tab list.

## Flow 14: Developer State Simulation

### Goal

Before backend implementation and Supabase Realtime are live, the frontend can exercise the same UX state transitions with hardcoded mock arrays.

### Hidden access

- Developer controls are hidden by default.
- They can be enabled by:
  - `?dev=1` query parameter, persisted to `localStorage.courtsync.devMode = "true"`, or
  - a hidden "Developer tools" switch in `/me` visible only when `NEXT_PUBLIC_ENABLE_DEVTOOLS=true`.
- When enabled, a small dev trigger appears in relevant authenticated screens.
- The trigger opens a Sheet on desktop and Drawer on mobile.

### Required simulation actions

- Simulate new pending signup.
- Simulate checkout URL ready.
- Simulate payment confirmed.
- Simulate payment failed.
- Simulate signup cancelled by player.
- Simulate session cancelled by organizer.
- Simulate new guest added.
- Simulate teams generated.
- Simulate team regeneration.
- Reset mock data.

### Hook contract

The mock hooks should have the same mental model as future realtime hooks:

- `useLiveSignups(sessionId, initialSignups)` returns current signups and dev actions when dev mode is enabled.
- `useLiveTeams(sessionId, initialTeams)` returns current teams and regeneration simulation.
- `useCurrentUserMode()` can switch seeded auth personas only in dev mode: visitor, player, organizer without Connect, organizer with Connect.
- Production code path later swaps mock event dispatch for Supabase Realtime payload handling without changing consuming components.

## Flow Acceptance Checklist

- Public visitor can browse open sessions without auth.
- Player cannot start signup until authenticated.
- Player can create a signup with guests in one flow.
- Player sees `PENDING_PAYMENT` as unconfirmed.
- Player is redirected only when `checkout_url` exists.
- Success page polls until backend status is `CONFIRMED`.
- Payment failure and checkout abandonment do not show confirmed language.
- Player can see their confirmed signup and refund cutoff.
- Organizer upgrade is instant and self-serve.
- Organizer cannot publish paid open sessions until Connect charges are enabled.
- Organizer can create a session and view empty signups/teams states.
- Organizer can monitor confirmed signups and guests.
- Organizer can generate and regenerate teams.
- Team UI exposes assigned roles, preferred roles, and out-of-position indicators.
- Hidden dev mode can simulate every core state without live backend subscriptions.
