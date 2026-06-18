# CourtSync UI/UX Design System

Source of truth: `../docs/superpowers/specs/2026-05-13-courtsync-mvp-v2-design.md`

This document defines the visual, interaction, and frontend scaffolding rules for CourtSync's first usable product slice. The goal is a quiet, high-trust operational tool for organizing paid casual volleyball sessions, not a marketing-heavy sports site.

## Design Principles

### Operational clarity

Every screen should make the current state obvious: session status, signup status, payment status, payout readiness, capacity, and team generation status. Users should not need to understand the backend state machine to know what to do next.

### Trust around money

Payment and refund language must be precise. The UI should only say "confirmed", "paid", or "refunded" after the backend status supports it.

### Fast session management

Organizers should be able to scan a session while standing in a gym: who paid, how many seats are confirmed, who brought guests, and whether teams are ready.

### Mobile-first utility

The app is responsive web, not a native app, but mobile is a primary surface. Core actions must be reachable with one hand.

### Boring by default, polished in details

Use shadcn/ui primitives, clear tables/lists, restrained density, and the default zinc color system. Avoid decorative sports theming, gradients, custom brand colors, and oversized marketing composition.

## Color System

### Strict rule

Use only the default shadcn/ui light/dark mode color tokens with the zinc neutral base. Do not introduce custom CourtSync brand colors, raw hex colors, Tailwind named colors for branding, or role-specific custom palettes.

Allowed token families:

- `background`
- `foreground`
- `card`
- `card-foreground`
- `popover`
- `popover-foreground`
- `primary`
- `primary-foreground`
- `secondary`
- `secondary-foreground`
- `muted`
- `muted-foreground`
- `accent`
- `accent-foreground`
- `destructive`
- `destructive-foreground`
- `border`
- `input`
- `ring`

### Neutral-first application

- App background: `bg-background`.
- Main text: `text-foreground`.
- Secondary text: `text-muted-foreground`.
- Panels and repeated items: `bg-card text-card-foreground`.
- Dividers: `border-border` or `Separator`.
- Form controls: shadcn defaults.
- Focus rings: default `ring`.
- Destructive actions: shadcn `destructive` only for cancellation, deletion, payment failure, or refund-risk UI.

### Status treatment without custom colors

Because the product must stay within the default shadcn/zinc palette, status meaning comes from a combination of Badge variant, icon, text, and placement rather than bespoke colors.

| Status | Treatment |
|---|---|
| `OPEN` | `Badge` default, label "Open" |
| `FULL` | `Badge` secondary, label "Full" |
| `DRAFT` | `Badge` outline, label "Draft" |
| `CANCELLED` | `Badge` destructive, label "Cancelled" |
| `COMPLETED` | `Badge` secondary, label "Completed" |
| `PENDING_PAYMENT` | `Badge` outline + spinner/dot, label "Pending payment" |
| `CONFIRMED` | `Badge` default, label "Confirmed" |
| `PAYMENT_FAILED` | `Badge` destructive, label "Payment failed" |
| Refund pending | `Badge` outline, label "Refund pending" |
| Refunded | `Badge` secondary, label "Refunded" |

## Typography

Use the project's default Next font setup unless changed later by implementation. Keep the typography system compact and product-oriented.

### Type scale

| Use | Size guidance | Weight |
|---|---:|---:|
| Page title | `text-2xl` to `text-3xl` | `font-semibold` |
| Section title | `text-lg` to `text-xl` | `font-semibold` |
| Card/panel title | `text-base` to `text-lg` | `font-medium` or `font-semibold` |
| Body | `text-sm` to `text-base` | regular |
| Table cell | `text-sm` | regular/medium |
| Labels and metadata | `text-xs` to `text-sm` | medium when needed |
| Badge text | component default | medium |

### Copy style

- Use short direct labels: "Join session", "Continue checkout", "Generate teams".
- Avoid hype language.
- Use exact states: "Payment pending", "Confirming payment", "Refund pending".
- Do not say "spot reserved" while a signup is `PENDING_PAYMENT`.
- Use "payouts" for Stripe Connect user-facing language.
- Use "team assignment" for generated teams.

## Spacing And Layout

### Shell

- Desktop uses a top navigation/header with a constrained content area.
- Mobile uses a bottom tab bar.
- Page sections are full-width layout bands or normal document flow, not nested card stacks.
- Use cards for repeated session rows, stat summaries, dialogs, and compact panels only.
- Do not put cards inside cards.

### Density

- Session browsing should support quick scanning: prefer rows/list cards over large feature cards.
- Organizer pages should be denser than public pages.
- Tables should remain readable on mobile through grouped row cards or horizontal scroll only when the data is genuinely tabular.

### Radius and borders

- Keep border radius at the shadcn default or `rounded-md`.
- Avoid oversized pill shapes except for Badge components.
- Use borders and separators over heavy shadows.

## Component Rules

### shadcn/ui defaults

Use existing shadcn/ui primitives before custom markup:

- Navigation: `Tabs`, `Breadcrumb`, `DropdownMenu`, `Sheet`, `Drawer`.
- Actions: `Button`.
- Forms: `Field`, `FieldGroup`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `ToggleGroup`.
- Data display: `Table`, `Badge`, `Avatar`, `Card`, `Separator`, `ScrollArea`.
- Feedback: `Alert`, `Skeleton`, `Spinner`, `Progress`, `sonner`.
- Overlays: `Dialog`, `AlertDialog`, `Sheet`, `Drawer`, `Popover`, `Tooltip`.
- Empty states: `Empty`.

### Forms

- Use `FieldGroup` and `Field`.
- Do not use raw `div` stacks for form fields.
- Use `Select` for role and skill choices.
- Use `Switch` for "Keep guests together".
- Use `Input` with cents-safe conversion for price display, never floating money values in app state.
- Validation text appears under the relevant field.
- Form submit buttons must show pending state and stay disabled during submission.

### Tables

- Use `Table` for desktop signups, teams, and leaderboard surfaces.
- On mobile, use compact grouped list rows when a full table would cause cramped columns.
- Keep columns stable and predictable.
- Do not replace team tables with decorative cards.

### Icons

- Use the project's configured icon library once shadcn is initialized.
- Prefer simple utility icons:
  - Calendar for date.
  - Map pin for location.
  - Users for capacity.
  - Credit card for payment.
  - Shield/check for confirmed.
  - Alert triangle for out-of-position or failure.
  - Refresh for regenerate.
  - Settings or Sliders for developer controls.
- Icons inside buttons should use the shadcn icon convention, with no manual icon sizing in button children.

## Navigation

### Desktop

Top-level nav:

- Sessions
- Leaderboard
- Create session
- Account

Signed-out desktop nav:

- Sessions
- Leaderboard
- Sign in

Organizer-specific actions should appear contextually, not as a separate admin universe.

### Mobile Bottom Tab Bar

Mobile web uses a persistent bottom tab bar for authenticated users.

Tabs:

| Tab | Player destination | Organizer destination |
|---|---|---|
| Sessions | `/drop-ins` | `/drop-ins` |
| Mine | active signup/session list | organizer session list |
| Create | organizer upgrade prompt or `/drop-ins/new` after upgrade | `/drop-ins/new` |
| Leaderboard | `/leaderboard` | `/leaderboard` |
| Account | `/me` | `/me` |

Rules:

- Fixed to bottom with safe-area padding.
- Icons plus short labels.
- Active tab uses `text-foreground`; inactive uses `text-muted-foreground`.
- Keep it outside page cards.
- Do not duplicate the tab bar inside modals or checkout preparation screens.
- On unauthenticated mobile routes, show a simpler top header and sign-in CTA instead of a disabled bottom bar.

### Session Detail Navigation

Session detail uses internal tabs:

- Overview
- Signups
- Teams
- Games
- Leaderboard

Rules:

- Keep the route as `/drop-ins/[id]` initially and manage tab state in query params, such as `?tab=teams`, or route segments if implementation later prefers.
- Overview is public.
- Signups, Teams, Games, and session Leaderboard require auth.
- Locked tabs show a sign-in prompt, not a blank error page.

## Page Patterns

### Home

Home is a product entry screen with real app content visible:

- Upcoming sessions.
- Primary CTA: browse sessions.
- Secondary CTA: create session or become organizer when signed in.

Avoid a large decorative hero. The first viewport should reveal actual sessions or the empty state.

### Sessions Index

Primary pattern: list/table hybrid.

Required fields:

- Title.
- Date and time.
- Location.
- Price.
- Capacity.
- Status.
- Organizer name if available.

Filters:

- Date range.
- Status: Open, Full, Completed.
- Location search later.

### Session Detail

Header:

- Session title.
- Date/time.
- Location.
- Price.
- Capacity.
- Status badge.
- Primary CTA based on current user and state.

Overview:

- Session description.
- Capacity progress.
- Refund cutoff policy.
- Organizer panel if current user owns the session.

Signups tab:

- Summary metrics.
- List/table of player signup groups.
- Hidden dev simulator trigger when dev mode is active.

Teams tab:

- Empty/generate state.
- Team tables after generation.
- Regeneration confirmation if teams already exist.

Games and Leaderboard tabs:

- Shells can exist early but should be visibly "Not recorded yet" rather than fake-complete.

### Signup Form

The signup form should feel like checkout preparation:

- Session summary remains visible.
- Player fields first.
- Guest builder second.
- Cost summary sticky on desktop, inline on mobile.
- Submit action: "Continue to payment".
- After submit, replace form with checkout preparation state rather than leaving editable fields active.

### Account

Sections:

- Profile.
- Player preferences.
- Organizer tools.
- Payout setup.
- Developer tools switch, hidden unless enabled by environment/query.

Do not overcomplicate this screen. It is a utility settings surface.

## Volleyball Role And Skill Vocabulary

### Role options

Use exactly these values from the architecture spec:

- `SETTER`
- `ATTACKER`
- `DEFENDER`
- `ALL_ROUNDER`
- `BEGINNER`
- `UNKNOWN`

User-facing labels:

| Value | Label |
|---|---|
| `SETTER` | Setter |
| `ATTACKER` | Attacker |
| `DEFENDER` | Defender |
| `ALL_ROUNDER` | All-rounder |
| `BEGINNER` | Beginner |
| `UNKNOWN` | Unknown |

### Skill options

Use exactly these values:

- `BEGINNER`
- `INTERMEDIATE`
- `ADVANCED`
- `UNKNOWN`

## Role Badges

### Constraint

Role badges must be visually distinct while staying inside default shadcn/zinc tokens. Do not add custom role colors.

### Treatment

| Role | Badge variant | Icon/dot treatment | Notes |
|---|---|---|---|
| Setter | `default` | Small leading dot | Most prominent role badge |
| Attacker | `secondary` | Small leading dot | Medium emphasis |
| Defender | `outline` | Small leading dot | Crisp border emphasis |
| All-rounder | `secondary` | Rotate/loop icon if available | Flexible role |
| Beginner | `outline` | Muted dot | Avoid negative tone |
| Unknown | `outline` | No icon or question mark icon | Lowest emphasis |

This satisfies color/state coding through default component variants and semantic tone. If true hue-based volleyball role colors are desired later, that should be a deliberate design-system change, not a hidden one-off.

## Out-Of-Position Treatment

### Definition

A team member is out of position when:

- `assigned_role` differs from `preferred_role`, and
- `preferred_role` is not `ALL_ROUNDER`, `BEGINNER`, or `UNKNOWN`.

Secondary role can soften the warning:

- If `assigned_role` equals `secondary_role`, use "Secondary role" treatment instead of "Out of position".

### Visual rules

In team tables, each member row includes:

- Assigned role badge.
- Preferred role text or badge.
- Optional secondary role.
- Out-of-position indicator when applicable.

Treatments:

| Case | UI treatment |
|---|---|
| Assigned equals preferred | Assigned role badge only, no warning |
| Assigned equals secondary | Small `Badge variant="outline"` label "Secondary role" |
| Assigned differs from preferred and secondary | `Badge variant="destructive"` label "Out of position" plus tooltip |
| Preferred all-rounder | No warning |
| Preferred unknown | No warning |

Tooltip copy:

"Assigned for team balance. Preferred role: Setter."

Tone:

- Do not use blame language.
- Do not hide these indicators from players.
- Organizer view can aggregate count by team.

## Team Generation UI

### Empty state

When no teams exist:

- Title: "No teams generated yet".
- Body: "Generate teams from confirmed paid signups."
- Button: "Generate teams".
- Disabled reason if fewer than two confirmed signups.

### Generated teams layout

Desktop:

- One team section per team.
- Header row: Team name, average rating, player count, role balance summary.
- Table columns:
  - Player.
  - Type: Player or Guest.
  - Assigned role.
  - Preferred role.
  - Rating.
  - Notes/indicator.

Mobile:

- Team sections stacked vertically.
- Each member row becomes a compact list item with the same data.
- Assigned role and warning badges remain visible without horizontal scrolling.

### Team balance summary

Use neutral text summaries:

- "2 setters, 1 attacker, 1 defender".
- "Avg rating 1214".
- "1 out of position".

Do not show algorithm internals unless a developer tool is enabled.

### Regeneration

- Button: "Regenerate teams".
- Use `AlertDialog`.
- Copy: "This replaces the current teams for this session."
- Continue action calls `POST /api/drop-ins/{sessionId}/generate-teams`.

## Signup And Payment UI

### Payment status language

| Backend status | User-facing title | Primary action |
|---|---|---|
| No signup | "Join this session" | Start signup |
| `PENDING_PAYMENT` without checkout URL | "Preparing secure checkout" | Wait/retry |
| `PENDING_PAYMENT` with checkout URL | "Payment not complete" | Continue checkout |
| `CONFIRMED` | "You're confirmed" | View session |
| `PAYMENT_FAILED` | "Payment did not go through" | Start again |
| `CANCELLED_BY_PLAYER` | "Signup cancelled" | View session |
| `CANCELLED_BY_ORGANIZER` | "Session cancelled" | View refund status |

### Checkout preparation

Use a focused interstitial:

- Spinner.
- Session summary.
- Total amount.
- Text: "Your spot is confirmed after payment succeeds."
- Secondary action: "Back to session" only when safe.

### Success page

Success page starts in a verifying state:

- Poll `GET /api/signups/{signupId}`.
- Show confirmation only after `CONFIRMED`.
- If still pending after a reasonable delay, show "Still confirming" with manual refresh.

## Realtime And Mock Data Scaffolding

### Initial implementation goal

Build the components against hook contracts that consume hardcoded mock arrays first. Later, replace internal hook implementation with Supabase Realtime merging while preserving component props and state shape.

### File organization

Recommended structure:

```text
src/
  lib/
    mock-data/
      sessions.ts
      signups.ts
      teams.ts
      users.ts
  hooks/
    use-dev-mode.ts
    use-live-signups.ts
    use-live-teams.ts
    use-live-session-capacity.ts
  components/
    dev/
      dev-state-panel.tsx
      dev-mode-gate.tsx
```

### Mock data arrays

Define typed arrays for:

- `mockUsers`
- `mockPlayers`
- `mockSessions`
- `mockSignups`
- `mockGuests`
- `mockTeams`
- `mockTeamMembers`

Mock records should mirror backend field names where practical:

- `session_id`
- `user_id`
- `preferred_role`
- `secondary_role`
- `skill_level`
- `total_seats`
- `refund_eligible_until`
- `checkout_url`
- `assigned_role`
- `rating_at_assignment`

### Hook contracts

`useLiveSignups(sessionId, initialSignups)`

Returns:

- `signups`
- `summary`
- `isMock`
- `devActions` only when dev mode is enabled

Actions:

- `simulateNewSignup()`
- `simulateCheckoutReady(signupId)`
- `simulatePaymentConfirmed(signupId)`
- `simulatePaymentFailed(signupId)`
- `simulatePlayerCancellation(signupId)`
- `simulateOrganizerCancellation()`
- `simulateGuestAdded(signupId)`
- `reset()`

`useLiveTeams(sessionId, initialTeams)`

Returns:

- `teams`
- `members`
- `isMock`
- `devActions` only when dev mode is enabled

Actions:

- `simulateTeamsGenerated()`
- `simulateRegenerateTeams()`
- `simulateOutOfPositionAssignments()`
- `reset()`

`useLiveSessionCapacity(sessionId, initialSummary)`

Returns:

- `confirmedSeats`
- `pendingSeats`
- `maxPlayers`
- `status`
- `spotsRemaining`

### Future Supabase replacement

Later, hook internals subscribe to:

- `drop_in_signups` changes filtered by `session_id`.
- `drop_in_guests` changes by visible signup IDs.
- `session_teams` and `session_team_members`.

The component-level API should not change when switching from mock arrays to Supabase Realtime.

## Hidden Developer Controls

### Visibility

Developer controls are hidden by default.

They may be enabled only when:

- `NEXT_PUBLIC_ENABLE_DEVTOOLS=true`, and
- the user toggles dev mode through one of:
  - `?dev=1` query parameter,
  - hidden switch on `/me`,
  - localStorage flag set by prior use.

Persist:

```text
localStorage.courtsync.devMode = "true"
```

Disable:

```text
localStorage.courtsync.devMode = "false"
```

### Surface

When dev mode is enabled:

- Desktop: small icon button in the lower-right corner opens a `Sheet`.
- Mobile: small icon button above the bottom tab bar opens a `Drawer`.
- The trigger must not overlap primary CTAs.
- The panel is visually marked as developer-only.

### Controls by screen

Session detail Signups tab:

- Simulate New Signup.
- Simulate Payment Confirmed.
- Simulate Payment Failed.
- Simulate Player Cancellation.
- Simulate Organizer Cancellation.
- Reset Signups.

Signup flow:

- Simulate Checkout URL Ready.
- Simulate Stripe Success Return.
- Simulate Payment Failed.
- Reset Signup.

Teams tab:

- Simulate Teams Generated.
- Simulate Out-of-position Role Mix.
- Simulate Regeneration.
- Reset Teams.

Account:

- Switch persona: Visitor, Player, Organizer without Connect, Organizer with Connect.
- Toggle Connect status: incomplete, details submitted, charges enabled.

### Production guard

If `NEXT_PUBLIC_ENABLE_DEVTOOLS` is not true, no dev controls render, regardless of localStorage.

## Accessibility

- All dialogs/sheets/drawers must have titles.
- Form fields must have labels and validation messages.
- Disabled actions need visible reasons.
- Tables need meaningful headers.
- Role badges must include text, not color alone.
- Out-of-position indicators must include text and tooltip/help text.
- Loading states must be announced through visible text, not only a spinner.
- Bottom tab bar links need text labels.
- Use focus management in dialogs and checkout preparation flows.

## Responsive Rules

### Mobile

- Bottom tab bar active for authenticated app screens.
- Keep primary session CTA above or near the fold.
- Cost summary in signup form appears before final submit and can be sticky at bottom only if it does not conflict with bottom tabs.
- Team tables transform into grouped list rows.
- Avoid horizontal overflow.

### Tablet

- Two-column layouts allowed for signup summary and form.
- Session detail header can show metrics in a compact row.

### Desktop

- Use max-width constrained content.
- Organizer session detail can use split layout: main content plus right-side status/action panel.
- Tables should use available width with stable columns.

## Analytics Hooks

Frontend tracks intent and UX behavior:

| Event | Trigger |
|---|---|
| `page_view` | Route change |
| `signup_form_opened` | Player opens signup route |
| `signup_form_submitted` | Signup submit succeeds locally |
| `checkout_redirected` | Browser is sent to Stripe Checkout |
| `checkout_abandoned` | User returns through cancel path or pending signup remains |
| `team_generated_clicked` | Organizer clicks generate/regenerate |
| `become_organizer_clicked` | User clicks self-serve upgrade |
| `connect_onboarding_started` | User starts Stripe Connect onboarding |

Do not track backend truth events from the frontend. Payment confirmed, refund completed, teams generated, and rating changed are backend analytics events.

## Error Handling UX

### API error shape

Backend errors are expected to follow:

```json
{
  "message": "Refund window closed",
  "status": 422,
  "code": "REFUND_WINDOW_CLOSED",
  "timestamp": "2026-05-13T12:00:00Z",
  "requestId": "abc-123",
  "details": {}
}
```

### UI mapping

| HTTP/status type | UI pattern |
|---|---|
| `400` validation | Inline field errors when possible |
| `401` unauthenticated | Redirect to `/login?next=...` |
| `403` forbidden | Alert with role/ownership explanation |
| `404` not found | Not-found page or empty state |
| `409` conflict | Alert with recovery action, such as view existing signup |
| `422` invalid state | Alert explaining the state rule |
| `5xx` | Toast plus retry action |

## Empty States

Use shadcn `Empty` where available.

Required empty states:

- No sessions: "No open sessions yet."
- No signups: "No signups yet. Share this session link."
- No teams: "No teams generated yet."
- No games: "No games recorded yet."
- No leaderboard rows: "Ratings appear after games are recorded."
- No player history: "Rating history appears after recorded games."

Keep empty states short and action-oriented.

## Loading States

- Sessions index: skeleton rows.
- Session detail: skeleton header and tab content.
- Signup submit: button pending state and checkout preparation screen.
- Teams generation: disable generate button and show progress text.
- Realtime/mock updates: row-level updates should be subtle, not disruptive.

## Content Rules For Core States

### Payouts

Use:

- "Set up payouts"
- "Payouts ready"
- "Stripe needs more information"

Avoid:

- "Bank verified" unless Stripe status confirms it.
- "Approved organizer" because approval is deferred.

### Payment

Use:

- "Continue to payment"
- "Preparing secure checkout"
- "Confirming payment"
- "Payment confirmed"

Avoid:

- "Spot held" while pending.
- "Paid" before `CONFIRMED`.

### Teams

Use:

- "Generate teams"
- "Regenerate teams"
- "Assigned role"
- "Preferred role"
- "Out of position"

Avoid:

- "Bad fit", "wrong role", or language that blames a player.

## Implementation Readiness Checklist

- No custom brand colors or raw hex values.
- Uses shadcn/zinc semantic tokens.
- Mobile bottom tab bar pattern is defined.
- Session detail has Overview, Signups, Teams, Games, Leaderboard tabs.
- Signup state language matches backend state machine.
- Stripe Checkout success page polls before claiming confirmation.
- Role and skill values match database constraints.
- Team UI is list/table based.
- Out-of-position indicators are explicit and accessible.
- Developer state simulator is hidden by default and gated.
- Mock hooks mirror future realtime hooks.
- All mutating frontend actions are designed around Spring Boot API endpoints and idempotency keys.
