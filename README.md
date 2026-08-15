# CourtSync

A volleyball drop-in platform: find a session near you, claim a spot, join the waitlist
when it's full, and get alerted the moment one opens up.

Built as a learning project for production-grade microservices — six Spring Boot services
behind a gateway, talking over gRPC and Kafka, with Elasticsearch geo-search and Redis
caching in front of Postgres.

## What it does

- **Court discovery + scheduling** — create courts, host drop-ins at them. dropin-service
  validates the court over **gRPC** before it will persist a session.
- **RSVPs and waitlists** — a full drop-in puts you in a FIFO queue instead of turning you
  away. When a confirmed player cancels, the longest-waiting player is promoted
  automatically, inside the same row lock that freed the spot.
- **Player alerts** — every RSVP, waitlist placement, promotion, and cancellation becomes a
  Kafka event, which notification-service turns into a per-user alert feed with a live
  unread badge.
- **Geo-search** — nearby drop-ins on a map, served sub-second from an Elasticsearch index
  projected off the same event stream, with a Redis cache on the hot query.

## Stack

| Layer         | Choice                                                        |
| ------------- | ------------------------------------------------------------- |
| Frontend      | Next.js + TypeScript + Tailwind + shadcn/ui                    |
| Services      | Java 21 + Spring Boot 4.0.x + Maven (six services)             |
| Sync RPC      | gRPC (dropin → court), contract in `shared/proto/`             |
| Async         | Apache Kafka (KRaft, no Zookeeper)                             |
| Database      | Hosted Supabase Postgres, one schema per service, Flyway       |
| Search        | Elasticsearch                                                  |
| Cache         | Redis                                                          |
| Orchestration | Docker Compose                                                 |

## Services

| Service              | Port        | Role                                        |
| -------------------- | ----------- | ------------------------------------------- |
| api-gateway          | 8080        | Spring Cloud Gateway; routing only          |
| user-service         | 8081        | profiles                                    |
| court-service        | 8082 + 9090 | courts; **gRPC server**                     |
| dropin-service       | 8083        | drop-ins, RSVPs, waitlist; Kafka producer   |
| notification-service | 8086        | player alerts; Kafka consumer               |
| search-service       | 8087        | Elasticsearch read model; Kafka consumer    |
| frontend             | 3000        | Next.js app                                 |

## Design doc

**[`MASTER.md`](MASTER.md)** — scope, architecture, data model, the concurrency design
behind the RSVP/waitlist path, and what's deliberately deferred.
[`shared/event-contracts/events.md`](shared/event-contracts/events.md) is the Kafka wire
contract.

## Repo layout

```
services/frontend/          Next.js app
services/*-service/         Backend services (one Maven project each)
shared/proto/               gRPC contracts
shared/event-contracts/     Kafka event shapes
infra/postgres/init.sql     Optional local Postgres bootstrap
scripts/                    Local development helpers
tasks/                      Working status and next steps
```

## Getting started

```bash
cp .env.example .env       # then set SUPABASE_DB_PASSWORD
docker compose up --build
```

Open http://localhost:3000 (set `FRONTEND_PORT` in `.env` if 3000 is taken).

Infra only, to run a service from your IDE against it:

```bash
docker compose up kafka redis elasticsearch
```

## Database helper

```bash
scripts/supabase-psql.sh           # connect
scripts/supabase-psql.sh dropins   # connect with a schema on the search path
```

```sql
\dn                        -- list schemas (users, courts, dropins, notifications)
\dt dropins.*
\d dropins.drop_in_players
```

## License

Private during MVP. Licensing decision deferred.
