# CourtSync — Working Status

_Last updated: 2026-06-18_

Source of truth for the whole build: **`MASTER.md`** at repo root. This file is just the
per-session handoff (done / unfinished / next).

CourtSync pivoted from the old Spring-Modulith monolith design to a **polyglot
microservices** skeleton (Java Spring Boot services + one Go notification worker, Kafka,
Redis, hosted Supabase Postgres, Next.js frontend, all orchestrated locally via Docker
Compose). The old `courtsync_mvp_design_document.md` and the previous CLAUDE.md content are
historical.

---

## The big plan (from MASTER.md §27 build order)

Grouped into phases. We do them in order; each phase should leave the repo runnable.

### Phase 0 — Foundation & infra
- [x] Rewrite root `CLAUDE.md` → point at MASTER.md, correct microservices/Maven/hosted-Supabase stack
- [x] Convert `notification-service` from Java scaffold → **Go** module (`cmd/` + `internal/`) with `GET /health` (compiles)
- [x] Add `GET /health` → `{"service","status":"UP"}` to all 7 Java services (gateway uses reactive Mono)
- [x] spring-kafka already present on all Java service poms — no change needed
- [x] `application.yaml` per service: distinct ports + datasource (JPA services) via `${VAR:default}`
- [x] Dockerfile for every backend service (multi-stage) + frontend (Next standalone) + Go (distroless)
- [x] `docker-compose.yml`: hosted Supabase Postgres, local Kafka (KRaft), Redis, 8 services, frontend; infra healthchecks + depends_on
- [x] `.env.example` (MASTER §14) + hosted Supabase per-service schemas
- [x] `shared/event-contracts/events.md`
- [x] `docker compose config` validates (COMPOSE_OK)
- [x] **Verified before hosted-DB reroute: local-stack `docker compose up` booted; all 8 `/health` (8080–8087) returned UP, frontend 200 (2026-06-09)**
- [x] Hosted Supabase routing configured and committed (`7a366b6`): DB-backed services now use `SUPABASE_JDBC_BASE_URL`, `SUPABASE_DB_USER`, and `SUPABASE_DB_PASSWORD`
- [x] Added `scripts/supabase-psql.sh` helper for development DB inspection via `psql`
- [x] Supabase MCP verified schemas `users`, `courts`, `dropins`, `messages`, `payments`; `courts.courts` exists with 5 seed courts

### Phase 1 — Court service (vertical, MASTER step 7)  ← DONE
Backend (court-service, port 8082) — schema via **Flyway** (chosen 2026-06-09):
- [x] Add Flyway deps to pom (flyway-core + flyway-database-postgresql)
- [x] `application.yaml`: ddl-auto update → **validate** (Flyway owns schema)
- [x] `V1__create_courts_table.sql` migration (`surface` + `net_height` refinement over MASTER §8.3)
- [x] `Surface` enum (INDOOR/GRASS/BEACH) + `NetHeight` enum (MENS/WOMENS/COED)
- [x] `Court` entity (@Entity → courts table)
- [x] `CourtRepository` (Spring Data JPA)
- [x] DTOs: `CreateCourtRequest` (validated) + `CourtResponse`
- [x] `CourtService` (business logic) + `CourtNotFoundException` (404)
- [x] `CourtController`: POST /courts, GET /courts, GET /courts/{id}
- [x] Compiles locally (mvnw compile EXIT 0)
- [x] Verify (USER): rebuild court-service, curl create + list + get
- [x] API Gateway route `/api/courts/**` (StripPrefix=1 → court-service `/courts`)
- [x] Frontend: courts list page (`/courts`) + create court form (`/courts/create`)
- [x] Verified: api-gateway tests, frontend lint, frontend production build (2026-06-09)

### Phase 2 — Drop-in service + RSVP + Kafka (MASTER steps 8–12)  ← DONE (in PR #2)
Decisions (2026-06-10): RSVP concurrency = **pessimistic row lock** (SELECT FOR UPDATE on
drop_in) + `UNIQUE(drop_in_id,user_id)`; build the **whole vertical slice** this session.

Code organization (done 2026-06-10): adopted **feature-by-aggregate + layered** package
structure as the standard for ALL Java services (documented in CLAUDE.md "Java package
structure"). dropin-service split into `dropin/` + `rsvp/` siblings with one-way acyclic deps
(`rsvp → dropin`, never reverse); court-service retrofitted to match. Verified no cycle via
grep; both compile. Key enabling decision: `drop_ins.confirmed_players` denormalized counter
(maintained under the row lock) so `dropin/` never queries `rsvp/` to count players.

Backend (dropin-service, port 8083) — DONE, compiles clean:
- [x] `V1__create_dropins.sql`: drop_ins (+ confirmed_players counter) + drop_in_players (CHECKs, UNIQUE, FK)
- [x] Enums: `DropInStatus` (dropin/domain), `RsvpStatus` + `PaymentStatus` (rsvp/domain)
- [x] Entities: `DropIn` (rich domain: reserveSpot/releaseSpot), `DropInPlayer` (@ManyToOne LAZY)
- [x] Repos: `DropInRepository` (`@Lock(PESSIMISTIC_WRITE) findByIdForUpdate`), `DropInPlayerRepository`
- [x] DTOs: CreateDropInRequest, DropInResponse (reads counter), CreateRsvpRequest, RsvpResponse
- [x] Exceptions: DropInNotFound (404), DropInFull (409, dropin/), DuplicateRsvp (409, rsvp/)
- [x] `event/`: DropinEventPublisher (KafkaTemplate<String,String> + ObjectMapper, key=dropInId) + DropinEvents
- [x] `DropInService`: create/list/get + lockForUpdate seam; `RsvpService`: rsvp/cancel (dirty-checking)
- [x] Controllers: DropInController (POST/GET/GET), RsvpController (POST/DELETE rsvp)
- [x] Compiles (`./mvnw compile` EXIT 0)

Lombok & logging conventions (done 2026-06-10): adopted `@RequiredArgsConstructor` for all
constructor injection, `@Slf4j` for SLF4J logging (parameterized, business-event-only), entities
stay `@Getter/@Setter` (never `@Data`). Documented in CLAUDE.md. Applied across court + dropin
+ search; all compile.

Kafka consumers:
- [x] Go notification-service consumes `RSVP_CREATED`/`RSVP_CANCELLED` and logs it (already wired)
- [x] search-service `@KafkaListener` on `dropin-events` (JsonNode switch on eventType; consumer
      deserializers + auto-offset-reset=earliest); compiles

Gateway:
- [x] api-gateway route `/api/drop-ins,/api/drop-ins/**` → dropin-service (StripPrefix=1);
      `DROPIN_SERVICE_URL` already wired in docker-compose

gRPC + Protobuf (service-to-service) — DONE 2026-06-10, both compile clean:
Decision: solve cross-service typing with **Protobuf** + use **gRPC** for synchronous
service-to-service calls now (REST stays at the browser edge; Kafka stays for async events).
First real seam introduced (there were zero sync calls before — services were all Kafka-decoupled):
**dropin-service validates the court exists via gRPC before creating a drop-in** (was an unvalidated
bare `court_id`). court owns court data → court = gRPC server, dropin = client. Strategy recorded
in CLAUDE.md "Inter-service communication & contracts".
- [x] `shared/proto/court.proto` — single contract (`CourtService.GetCourt`), both services gen stubs from it
- [x] Both poms: Spring gRPC BOM (`spring-grpc-dependencies:1.0.3`) + starter +
      `protobuf-maven-plugin` (sourceDirectories → `../../shared/proto`); pinned protoc 4.28.2 / grpc-java 1.69.0
- [x] court-service: `CourtGrpcService` (extends generated base, reuses `CourtService.findById`,
      maps `CourtNotFoundException`→`Status.NOT_FOUND`); gRPC server on `COURT_GRPC_PORT:9090`
- [x] dropin-service: `CourtGrpcClientConfig` (channel+stub bean) + `CourtClient.courtExists` +
      new `CourtNotFoundException` (400); call wired into `DropInService.create`; named channel in yaml
- [x] docker-compose: court publishes 9090; dropin gets `COURT_GRPC_ADDRESS=static://court-service:9090`
- [x] Verified: both `./mvnw compile` BUILD SUCCESS, stubs generated in both, `docker compose config` OK
- [x] **Runtime round-trip verified live (2026-06-10):** bogus court_id → 400, real court → 201 + court logs `gRPC GetCourt served`. Required the Boot 4 migration below to even boot.
- [ ] (Deferred, separate phase) migrate Kafka event payloads to Protobuf (touches Go + search + TS)

Spring Boot 3.5 → 4.0 migration (DONE 2026-06-10, committed `55a3aad`) — forced because
spring-grpc 1.0.x only runs on Boot 4.0.x (runtime `NoClassDefFoundError`, not a build error):
- [x] All 7 Java service poms → `spring-boot-starter-parent` 4.0.2; api-gateway `spring-cloud` 2025.1.1 (SCG 5.0)
- [x] Kafka: raw `spring-kafka` → `spring-boot-starter-kafka` (Boot 4 modular autoconfig)
- [x] Jackson: dropin publisher + search consumer → Jackson 3 (`tools.jackson.*`, unchecked exceptions)
- [x] Hibernate 7: `DropIn`/`DropInPlayer` created_at/updated_at marked `nullable=false` (strict validation)
- [x] Docker: court/dropin build context → repo root so Dockerfile can COPY `shared/proto`
- [x] Supabase from Docker: switched to IPv4 **Session Pooler** (`aws-1-us-west-2.pooler.supabase.com:5432`, user `postgres.<ref>`)

Frontend (DONE 2026-06-11, built via subagent-driven-development, all shadcn registry components):
- [x] `lib/dropins.ts` data layer (list/get/create/rsvp/cancel) + `getCourt` in `lib/courts.ts`
- [x] `lib/dev-identity.ts` — stable per-browser dev UUID (`useSyncExternalStore`), stands in for auth
- [x] `/drop-ins` list, `/drop-ins/create` (server action + Zod), `/drop-ins/[id]` detail + RSVP/cancel (server actions, revalidatePath), loading + not-found
- [x] Deleted abandoned CourtSync mock cruft (signup-form, session-card, signup/success routes)
- [x] Verified: `pnpm lint` + `pnpm build` green; live route smoke tests pass
- [x] Final holistic review: fixed site-header Host link `/drop-ins/new`→`/drop-ins/create`, cancel-RSVP 404 copy, loading copy
- [x] Runtime boot against hosted Supabase verified (full stack up; see below)

### Phase 3 — Polish skeleton
- [x] **user-service vertical (DONE 2026-06-12, branch `feature/user-service-vertical`):**
  `V1__create_users_table.sql` (timestamptz + skill_level CHECK per hardened DBML),
  `com.courtsync.users.user/*` feature package mirroring court-service, duplicate-email →
  409 (existsByEmail pre-check + DB UNIQUE backstop), gateway `/api/users/**` route,
  HealthController → `common/`. Verified live through gateway: 201/200/409/404/400.
- [x] **fix(flyway): Boot 4 needs `spring-boot-starter-flyway`** — raw flyway-core silently
  stopped running migrations after the 3.5→4.0 migration; swapped in all 5 DB-backed poms;
  court+dropin rebuilt and re-validated their existing schema history clean.
- [x] **GlobalExceptionHandler (DONE 2026-06-12, branch `feature/global-exception-handler`):**
  RFC 9457 ProblemDetail (`application/problem+json`) across court+dropin+user via
  `common/GlobalExceptionHandler extends ResponseEntityExceptionHandler`. Generic
  `@ResponseStatus`-reading handler (new exceptions need zero handler changes), validation
  400s carry `errors:{field→msg}`, 500s never leak internals. Frontend `getErrorMessage`
  reads `detail`. Convention documented in CLAUDE.md. Curl-verified every error path incl.
  gRPC-translated court-not-found and duplicate RSVP; happy paths unchanged.
- [x] **Story B cleanup (2026-06-18):** deleted the empty `messaging-service`,
  `payment-service`, `search-service` skeletons (bloat — never implemented). Stripped them from
  `docker-compose.yml`, `.env.example`, `infra/postgres/init.sql`, and the DropinEvents comment.
  `docker compose config` validates. They live in the MASTER.md vision; re-add when a real flow
  needs them. (Note: the earlier `feeb09a "clean up"` commit nuked the *whole* backend and was
  reverted — this is the surgical version.)
- [ ] remaining cross-cutting polish

### Later (NOT in skeleton): auth, Redis locking, WebSocket chat, Resend email, Stripe, Elasticsearch, k8s, Rust analytics.

---

## What we did this session (2026-06-18)
- **Story B cleanup (merged, PR #4):** deleted the empty `messaging`/`payment`/`search`
  service skeletons (bloat) + their refs in `docker-compose.yml`, `.env.example`,
  `infra/postgres/init.sql`, DropinEvents comment. Skeleton is now gateway · user · court ·
  dropin (Java) + notification (Go) + frontend. (The earlier `feeb09a` "clean up" had nuked
  the *whole* backend and was reverted — this was the surgical redo.)
- **Per-service Supabase JWT auth (merged, PRs #4/#5/#6):** all three Java services
  (user/court/dropin) are now OAuth2 resource servers validating the Supabase JWT.
  Each has `spring-boot-starter-oauth2-resource-server`, a `config/SecurityConfig.java`
  (stateless, `/health`+actuator public, `anyRequest().authenticated()`, `jwt()`),
  `issuer-uri` in yaml, and a `*ControllerSecurityTests` (401 anon / 200 with jwt).
  Decision: per-service validation, NOT centralized at the gateway. See `project_auth_state` memory.
- **Identity from JWT (dropin-service):** `common/JwtPrincipal.userId(jwt)` reads `sub`;
  RSVP + drop-in create take the user from the token, not the body. Deleted `CreateRsvpRequest`,
  removed `organizerUserId` from `CreateDropInRequest`, cancel is now `DELETE /drop-ins/{id}/rsvp`.
- **Frontend token wiring (merged, PR #6):** `lib/auth.ts` gained `requireUser()` +
  `getAccessToken()`; `lib/{courts,dropins}.ts` attach `Authorization: Bearer <token>`;
  protected pages/actions call `requireUser()` → redirect `/login`. Deleted the dev-identity
  UUID stand-in (`lib/dev-identity.ts`, `dev-player-badge.tsx`). Moved shared form constants to
  client-safe `lib/form-options.ts` to fix a `next/headers`-in-client-bundle build error.
- **Stack verified live:** `docker compose up -d --build` healthy; all `/health` UP;
  gateway returns **401** for unauthenticated `/api/courts`, `/api/drop-ins`, `/api/users/me`.
- **Signup UX (UNCOMMITTED — see below):** added a dedicated `/signup/check-email` page
  (shadcn `Empty`) and changed `signup` action to `redirect()` there when email confirmation
  is required, instead of leaving the user on the filled form. `pnpm build` + live render pass.

## What's unfinished / open questions
- [ ] **Signup-UX change is uncommitted** on the working tree (no branch): new
  `app/(auth)/signup/check-email/page.tsx` + edited `signup/actions.ts`. Pending Daniel's
  visual test, then commit→push→merge (no self-attribution). Dead `state.message` slot in
  `signup-form.tsx` can be pruned then too.
- [ ] **Live end-to-end test not done by Daniel yet:** sign in (confirm email OR disable
  confirmation in Supabase dashboard → Auth → Email → "Confirm email" off), then
  court → drop-in → RSVP → watch Kafka (`docker compose logs -f notification-service`).
- [ ] Supabase **Auth → URL Configuration** must allow `http://localhost:3000` for the
  email confirmation link to return to localhost.
- [ ] api-gateway has no auth of its own (passes through, forwards the bearer header) — fine
  for now since each service validates; revisit if we want edge auth.
- Redis is wired into dropin-service but **unused** right now (future locking; RSVP uses
  Postgres row locks). Benign "Spring Data Redis could not identify store" log noise.
- `courts.courts` has RLS disabled — fine for backend-only JDBC; revisit before any client-side Supabase access.
- `SUPABASE_DB_PASSWORD` must be set in local `.env`.

## What's next (one finishable chunk)
**Land the signup-UX change, then do a real signed-in end-to-end pass.** Scope: commit +
push + merge the check-email page (prune the dead `state.message`), then exercise the live
auth vertical as a signed-in user. **Done when** the change is on `main` AND Daniel has, while
signed in, created a court, created a drop-in, RSVP'd, and seen `RSVP_CREATED` in the
notification-service logs.
- [ ] Decide email-confirm vs. disable-confirmation for dev testing
- [ ] Commit + merge signup-UX (no self-attribution); prune dead `state.message` in signup-form
- [ ] Signed-in smoke: court create → drop-in create → RSVP → notification-service logs the event

Out of scope (parked):
- `PUT /users/{id}` (MASTER lists it; small follow-up to the user vertical)
- MASTER.md §8.6/§10.3 row-lock booking language contradicts the decided ReserveSlot/ReleaseSlot gRPC design — reconcile in a MASTER edit
- Migrate Kafka event payloads JSON → Protobuf (touches Go + frontend TS)
- Edge auth at the gateway (currently per-service only)
- Later: Redis locking, WebSocket chat, Resend email, Stripe, Elasticsearch, k8s, Rust analytics
