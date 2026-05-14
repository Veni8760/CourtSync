# VolleyIQ — Working Status

_Last updated: 2026-05-13_

---

## What we did this session

- Scaffolded the monorepo root: `.gitignore`, `.editorconfig`, `README.md`, `tasks/` folder.
- Initial commit on `main` with root scaffold (design docs intentionally excluded from commit — they remain on disk, untracked).
- Scaffolded `frontend/` interactively via `pnpm create next-app@latest`: Next.js **16.2.6**, React **19.2.4**, TypeScript, Tailwind v4, ESLint, App Router, React Compiler enabled, `src/` directory, `@/*` import alias.
- Scaffolded `backend/` via Spring Initializer: Spring Boot **4.0.6**, Java **26** (Temurin, via SDKMAN), Gradle **9.4.1** Kotlin DSL, package `com.courtsync.backend`. 12 dependencies: Spring Web, Spring Data JPA, Spring Security, OAuth2 Resource Server, PostgreSQL Driver, Flyway, Validation, Actuator, Lombok, Testcontainers, SpringDoc OpenAPI, DevTools.
- Verified `./gradlew build` → `BUILD SUCCESSFUL` (51s, Testcontainers auto-wired, Docker required for tests).
- Installed SDKMAN by routing the installer through Homebrew's bash 5.x to work around macOS's stock bash 3.2.

---

## What's unfinished / open questions

- [ ] **Commit `frontend/`** with message: `chore(frontend): scaffold Next.js 16 with TS, Tailwind v4, ESLint, App Router, React Compiler, src/`
- [ ] **Commit `backend/`** with message: `chore(backend): scaffold Spring Boot 4 app via Spring Initializer (Java 26, Gradle KTS, 12 deps)`
- [ ] **Decide what to do with design docs** (`volleyiq_mvp_design_document.md` v1 + `docs/superpowers/specs/2026-05-13-volleyiq-mvp-v2-design.md` v2). Options: commit them now to a separate `docs` commit, gitignore them, or move them outside the repo. Currently untracked on disk.
- [ ] **README stack table is stale.** It still says Next.js 15 / Java 21 / Spring Boot 3 — actual installs are Next.js 16 / Java 26 / Spring Boot 4. Fix when convenient.

---

## What's next — Phase 1a: Wire backend to Supabase + first Flyway migration

**Scope:** Get the Spring Boot app talking to a real Supabase Postgres database, with the initial schema applied via a Flyway migration. No business logic yet — just plumbing + schema. **Done when** `./gradlew bootRun` boots clean, Flyway reports `V1` applied, and the tables are visible in Supabase Studio.

### Checklist

- [ ] **Create Supabase project** via dashboard (region: closest to Railway region — likely `us-east-1`). Capture:
  - Postgres host, port, database name, user, password
  - `service_role` key (server-side only)
  - `anon` key (frontend, for later)
  - Project URL
- [ ] **Set up env files at repo root:**
  - [ ] Create `backend/.env.example` with placeholder vars (`SUPABASE_DB_URL`, `SUPABASE_DB_USERNAME`, `SUPABASE_DB_PASSWORD`, `SUPABASE_JWT_SECRET`)
  - [ ] Create `backend/.env` (gitignored) with real values — verify `.gitignore` actually covers it before saving secrets
- [ ] **Configure `backend/src/main/resources/application.yml`:**
  - [ ] Datasource block pointing at Supabase (use env var interpolation, `${SUPABASE_DB_URL}` style)
  - [ ] Flyway block: `locations: classpath:db/migration`, `baseline-on-migrate: false`
  - [ ] JPA: `ddl-auto: validate` (Flyway owns schema, not Hibernate)
  - [ ] Disable Spring Security defaults for now (or stub a permit-all config) so `bootRun` doesn't immediately demand auth
- [ ] **Choose env-loading mechanism for local dev.** Options to discuss: (a) export vars in shell, (b) add `spring-dotenv` dependency, (c) IntelliJ run-config env vars. Pick one, document in README.
- [ ] **Write `backend/src/main/resources/db/migration/V1__initial_schema.sql`** from spec section 10. At minimum: `users`, `sessions`, `session_registrations`, `payments`, `outbox_events`. Include FKs, indexes, and a `pgcrypto` or `gen_random_uuid()` extension call if used.
- [ ] **Run `./gradlew bootRun`** — verify:
  - [ ] App boots without exception
  - [ ] Flyway logs `Migrating schema "public" to version 1`
  - [ ] `flyway_schema_history` table appears in Supabase Studio with one row
  - [ ] All declared tables exist
- [ ] **Sanity-check via Actuator:** hit `http://localhost:8080/actuator/health` → should return `{"status":"UP"}` including `db: UP`.
- [ ] **Commit:** `feat(backend): wire datasource + V1 initial schema via Flyway`

### Out of scope for Phase 1a (deferred to later phases)

- JWT validation against Supabase Auth (Phase 1b)
- Any controllers, services, or domain logic (Phase 1c+)
- Stripe Connect wiring (Phase 1d)
- Frontend → backend integration (Phase 1e)
- CI/CD (Phase 1f)

---

## Lessons learned this session

Captured in [`tasks/lessons.md`](./lessons.md) — append there, not here.
