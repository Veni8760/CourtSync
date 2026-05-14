# VolleyIQ

A paid drop-in volleyball scheduler: organizers list sessions, players pay to confirm a seat, balanced teams are generated, games are recorded, and ELO ratings update.

This is a learning project for production-grade backend engineering — modular monolith, outbox-pattern domain events, Stripe Connect, observability, CI/CD. Not a race to ship.

## Stack

| Layer | Choice | Deploys to |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui | Vercel |
| Backend | Java 21 + Spring Boot 3 + Gradle (Kotlin DSL) + Spring Modulith | Railway |
| Database | Supabase Postgres (schema owned by Flyway) | Supabase |
| Auth | Supabase Auth → JWT → Spring `oauth2-resource-server` | — |
| Payments | Stripe Connect Express (destination charges, 8% platform fee) | — |
| Email | Resend + React Email | — |
| Analytics | PostHog | — |
| Errors | Sentry | — |
| DNS | Cloudflare | — |
| Uptime | Uptime Robot + Better Stack | — |

## Canonical design doc

The source of truth for architecture and decisions:

**[`docs/superpowers/specs/2026-05-13-volleyiq-mvp-v2-design.md`](docs/superpowers/specs/2026-05-13-volleyiq-mvp-v2-design.md)**

The original brainstorming doc (`volleyiq_mvp_design_document.md`) is kept for historical reference.

## Repo layout

```
frontend/   Next.js app
backend/    Spring Boot app
docs/       Design docs and specs
tasks/      Per-iteration todo + lessons learned
```

## Getting started

> Filled in after `frontend/` and `backend/` are scaffolded.

## License

Private during MVP. Licensing decision deferred.
