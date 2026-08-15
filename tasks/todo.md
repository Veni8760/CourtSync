# CourtSync — Resume Alignment (2026-08-14)

## Why this work happened

The project was finished to match the three CourtSync bullets on Daniel's
software-engineer resume, and nothing more. Everything outside those bullets was deleted.

**Resume bullets (the spec):**

> **CourtSync** | Next.js, Java, Spring Boot, gRPC, Apache Kafka, Redis, PostgreSQL, Elasticsearch
> - Built a volleyball drop-in app on Next.js with Spring Boot microservices over gRPC for court discovery, scheduling, and player flows.
> - Engineered an event-driven backend on Apache Kafka and Redis for real-time drop-ins, RSVPs, waitlists, and player alerts.
> - Powered sub-second geo-search for nearby drop-ins via Elasticsearch indexes layered over PostgreSQL.

## Gap analysis (state before this session)

| Resume claim | Before |
| --- | --- |
| Next.js + Spring Boot microservices over gRPC | Done |
| Kafka event-driven backend | Done |
| Real-time drop-ins, RSVPs | Done |
| **Waitlists** | **Not built** — one comment in `RsvpStatus.java` |
| **Player alerts** | **Not real** — Go service logged to stdout, nothing user-facing |
| Redis | Only a search cache; `dropin-service` carried a dead `redis-reactive` dep |
| Elasticsearch geo-search over Postgres | Done |
| Tech list says **Java**, no Go | `notification-service` was **Go** |

## Phase 0 — Bloat purge ✅

- [x] Deleted empty `services/messaging-service/` and `services/payment-service/`
- [x] Deleted 67 junk paths: `* 2.*` / `* 3.*` duplicates, stray `.DS_Store`
- [x] Dropped the unused `spring-boot-starter-data-redis-reactive` dep + its config from `dropin-service`
- [x] Trimmed `shared/event-contracts/events.md` — removed `payment-events` / `message-events`
- [x] Deleted `docs/superpowers/` and `courtsync_mvp_design_document.md` (abandoned design)
- [x] Rewrote `MASTER.md` (44KB → the system that exists), `README.md`, `CLAUDE.md`
- [x] Cleaned `.env.example` of dead service URLs and "Future: Stripe/Resend" blocks

## Phase 1 — Waitlists (dropin-service) ✅

- [x] `V3__add_waitlist.sql` — `waitlisted_at` + a CHECK enforcing "non-null iff WAITLISTED" + partial index
- [x] `DropIn.hasSpotsLeft()`; `RsvpStatus.WAITLISTED` is now load-bearing
- [x] `RsvpService.rsvp()` — a full drop-in enqueues instead of throwing `DropInFullException`
- [x] `RsvpService.cancelRsvp()` — promotes the queue head under the same row lock; leaving the
      waitlist frees no spot and promotes nobody
- [x] New events `RSVP_WAITLISTED` (carries position) / `RSVP_PROMOTED`
- [x] `RsvpResponse` + `MyRsvpStatusResponse` expose status + derived position; `GET /drop-ins/rsvps/waitlist`
- [x] 11 unit tests (was 4) — enqueue, promote, empty-queue, waitlist-withdrawal, position derivation

## Phase 2 — notification-service: Go → Java, real player alerts ✅

- [x] Deleted the Go service (191 lines)
- [x] New Spring Boot `notification-service` (REST 8086, schema `notifications`)
- [x] `alert/` aggregate — entity, repo, service, controller (`GET /alerts`, `/unread-count`, `/{id}/read`, `/read-all`)
- [x] `consumer/` — `dropin-events` listener in its own consumer group, fans events to per-user alerts
- [x] **Idempotency**: `UNIQUE (user_id, drop_in_id, event_key)` turns Kafka redelivery into a no-op
- [x] **Redis** caches the unread badge count, evicted on every write
- [x] Flyway `V1__create_alerts.sql`, Supabase-JWT `SecurityConfig`, `GlobalExceptionHandler`, Java `Dockerfile`
- [x] Compose + gateway route `/api/alerts/**` wired
- [x] 10 unit tests — every event→alert mapping, organizer excluded from cancellation fan-out, poison message skipped

## Phase 3 — Frontend ✅

- [x] `src/lib/alerts.ts` API client
- [x] Alert bell in the site header at every breakpoint — unread badge, popover feed, mark-read / mark-all-read
- [x] Waitlist UI on the drop-in detail page ("Join waitlist" / "You're #N on the waitlist" / "Leave waitlist")
- [x] "On the waitlist" section on `/my-drop-ins`
- [x] Bell rebuilt on shadcn primitives (`Button`, `Badge`, `Separator`, `ScrollArea`, `Empty`) per the new hard rule

## Phase 4 — Rules + docs ✅

- [x] **New hard rule: shadcn/ui components are mandatory** — written into `services/frontend/AGENTS.md`
      (full rule + escape hatch) and summarized in root `CLAUDE.md`
- [x] `shared/event-contracts/events.md` rewritten for the real topic set + consumer/idempotency notes
- [x] Fixed a real config bug: every `application.yaml` defaulted to `db.<ref>.supabase.co`, which is
      now **NXDOMAIN** (Supabase dropped direct IPv4). Defaults now point at the IPv4 session pooler
      that `.env` already used, so `./mvnw test` works outside compose.

## Phase 5 — Migrations applied, two real bugs found ✅

Supabase came back up mid-session, so everything below could finally be verified against
the real database. Adding a `contextLoads` test to notification-service (for parity with
every other service) immediately paid for itself by catching two genuine defects:

- **`flyway-core` never autoconfigured.** Boot 4's autoconfig is modular, so the bare
  artifact sits on the classpath and does nothing — the `notifications` schema was never
  created and Hibernate failed with `missing table [alerts]`. Fixed by depending on
  **`spring-boot-starter-flyway`** (what dropin-service already used). Exactly the same
  trap as `spring-kafka` vs `spring-boot-starter-kafka`, now documented in the pom.
- **The context test dialled a real broker.** A `@KafkaListener` container connects as the
  context starts (unlike a producer's `KafkaTemplate`, which is lazy), and
  `KAFKA_BOOTSTRAP_SERVERS` is the compose hostname. The test now sets
  `spring.kafka.listener.auto-startup=false` — it exists to check schema/entity agreement,
  not broker connectivity.

## Verification

| Check | Result |
| --- | --- |
| `api-gateway` tests | ✅ 1/1 |
| `user-service` tests | ✅ 5/5 |
| `court-service` tests | ✅ 3/3 (incl. `contextLoads`) |
| `dropin-service` tests | ✅ 24/24 (11 RSVP/waitlist, 10 drop-in, 2 security, `contextLoads`) |
| `search-service` tests | ✅ 6/6 |
| `notification-service` tests | ✅ 11/11 (incl. `contextLoads`) |
| `frontend` `pnpm lint` + `pnpm build` | ✅ clean |
| `docker compose config` | ✅ valid, 11 services |

**Migrations applied to hosted Supabase**, confirmed by querying `information_schema`:

- `dropins` @ **v3** — `drop_in_players.waitlisted_at` present
- `notifications` @ **v1** — `alerts` present with all 8 columns (`is_read`, `event_key`, …)
- Hibernate `ddl-auto: validate` passes in both services, so every entity matches its
  real table. That is the mapping proof, not just "the migration ran".

## Note on connecting

The direct endpoint `db.<ref>.supabase.co` resolves **IPv6-only**, so it is unreachable
from Docker on macOS — and it went fully NXDOMAIN while the project was paused. Always use
the IPv4 session pooler (`aws-1-us-west-2.pooler.supabase.com:5432`) with the
project-qualified user `postgres.<ref>`. The four `application.yaml` defaults were pointed
at the pooler this session so `./mvnw test` works outside compose.

Diagnostic worth remembering: `FATAL: (ENOTFOUND) tenant/user postgres.<ref> not found`
from the pooler means the **project is paused**, not that credentials are wrong.

## Phase 6 — Live end-to-end verification ✅

Full stack up (`docker compose up -d --build`, all 11 containers healthy), exercised through
the **API gateway** with two real Supabase-authenticated users. Every step below is an
observed result, not an expectation.

| Step | Result |
| --- | --- |
| Create court, then drop-in (`maxPlayers: 1`) | ✅ — drop-in creation proves the **gRPC** hop: dropin-service validated the court via `CourtService.GetCourt` |
| A RSVPs | `CONFIRMED`, position 0 |
| B RSVPs into a full session | `WAITLISTED`, **position 1** — no 409 |
| Drop-in state | `FULL`, 1/1, 0 left — waitlisting consumed no capacity |
| **A cancels → B auto-promoted** | B: `CONFIRMED`, position 0; drop-in **still** `FULL` 1/1 — the freed spot went straight to the queue head |
| B's `/rsvps/me` and `/rsvps/waitlist` | moved from waitlist → joined |
| Alert feeds | A: "you're in". B: "you're #1 on the waitlist" → "a spot opened up and it's yours" |
| Organizer cancels the drop-in | B gets `DROP_IN_CANCELLED`; **A (the organizer) correctly does not** |
| Unread badge + Redis | keys `unread-alert-count::<uuid>` present; `read-all` → badge 0 |
| **Idempotency under real redelivery** | consumer group offsets reset to 0, whole topic replayed → B still had exactly 3 alerts; DB showed **7 rows / 7 distinct event keys** |

All test data (2 users, 1 court, 1 drop-in, RSVPs, alerts, the Elasticsearch doc) was deleted
afterwards. Pre-existing data untouched.

## ⚠️ Incident: bounced Supabase emails (caused by this session)

Creating test accounts with invented Gmail addresses sent confirmation emails that hard-bounced,
and Supabase warned that the project's **email sending could be restricted**. Fixed:

- Deleted every test account created here.
- **"Confirm email" is now OFF** for this project (Dashboard → Authentication → Sign In /
  Providers → Email). Signup returns a session immediately and sends no mail, so authenticated
  testing is now bounce-free.
- Hard rule added to `CLAUDE.md`: never sign up an address that isn't a real inbox.

**Still outstanding:** `phase6.test@gmail.com` (created 2026-07-02, never confirmed, never
signed in) is a leftover fake address from an earlier session and the remaining bounce source.
Delete when convenient:
`delete from auth.users where email = 'phase6.test@gmail.com';`

## What's next (one finishable chunk)

The backend flow is proven through the API. What hasn't been eyeballed is the **UI** for it —
the alert bell and the waitlist states render, but no one has looked at them. Sign in at
`localhost:3001`, and with a second browser profile walk the same sequence, checking:
the bell badge and dropdown, "Join waitlist" vs "RSVP" on a full drop-in, "You're #N on the
waitlist", the "On the waitlist" section on `/my-drop-ins`, and mobile (<768px) layout.

After that: commit. Nothing from this session is committed yet.
