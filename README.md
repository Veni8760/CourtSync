# CourtSync

CourtSync is a volleyball drop-in platform built as a learning project for production-grade microservices.

The current architecture is a Next.js frontend, Spring Boot Java services, a Go notification worker, Kafka, Redis, and hosted Supabase Postgres.

## Stack

| Layer | Choice | Deploys to |
|---|---|---|
| Frontend | Next.js + TypeScript + Tailwind | Docker Compose |
| Backend | Java 21 + Spring Boot 3.5 + Maven | Docker Compose |
| Notification worker | Go | Docker Compose |
| Database | Hosted Supabase Postgres, one schema per DB-backed service | Supabase |
| Messaging | Kafka in KRaft mode | Docker Compose |
| Cache/locks | Redis | Docker Compose |

## Canonical design doc

The source of truth for architecture and decisions:

**[`MASTER.md`](MASTER.md)**

Older CourtSync/Spring Modulith docs are historical and should not drive new implementation.

## Repo layout

```
services/frontend/              Next.js app
services/*-service/             Backend services
shared/event-contracts/         Kafka event notes
infra/postgres/init.sql         Optional local Postgres schema bootstrap
tasks/                          Working status and next steps
scripts/                        Local development helpers
```

## Getting started

Create a local `.env` from `.env.example` and set `SUPABASE_DB_PASSWORD`.

Run the currently working court slice:

```bash
docker compose up --build kafka court-service api-gateway frontend
```

Open:

```text
http://localhost:3000/courts
```

## Database Helper

Use the Supabase psql helper to inspect the hosted Postgres database during development:

```bash
scripts/supabase-psql.sh
scripts/supabase-psql.sh courts
```

Useful psql commands once connected:

```sql
\dn
\dt courts.*
\d courts.courts
select * from courts.courts;
\q
```

## License

Private during MVP. Licensing decision deferred.
