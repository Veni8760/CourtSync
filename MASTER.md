# CourtSync MASTER.md

## 1. Project Name

CourtSync

## 2. Project Summary

CourtSync is a full-stack volleyball drop-in platform where users can discover courts, create volleyball drop-in sessions, RSVP to games, chat in real time, and eventually pay for sessions, receive notifications, and search for nearby games.

This project is mainly for learning and demonstrating:

* Full-stack development
* Microservices architecture
* Java Spring Boot
* Go microservices
* Optional Rust microservices later
* Next.js frontend development
* PostgreSQL
* Kafka event-driven communication
* Redis caching and locking
* WebSocket real-time messaging
* Docker and Docker Compose
* Kubernetes
* Elasticsearch geo-search later
* Stripe payments later
* Resend email notifications later

The first goal is **not** to build the entire finished product.

The first goal is to build a clean **microservices skeleton** with one working end-to-end flow:

```text
Create court
Create drop-in
View drop-ins
RSVP to drop-in
Publish RSVP_CREATED event to Kafka
Consume that event in Notification Service and Search Service
```

Future features should be added only after the skeleton works.

---

# 3. Core Architecture

```text
Next.js Frontend
    |
    | REST
    v
API Gateway / Backend-for-Frontend
    |
    | REST first
    | gRPC optional later
    v
Backend Microservices
    |
    | Async events
    v
Kafka
```

Main services:

```text
api-gateway
user-service
court-service
dropin-service
messaging-service
payment-service
notification-service
search-service
analytics-service later
```

Infrastructure:

```text
PostgreSQL
Kafka
Redis
Docker
Docker Compose
Kubernetes later
Elasticsearch later
```

---

# 4. Important Design Rule

Build the project using vertical slices.

Do not build the whole backend first and then the whole frontend.

Use this pattern:

```text
Backend skeleton
→ frontend skeleton
→ one full feature end-to-end
→ repeat
```

Example:

```text
Feature: RSVP to drop-in

Database table
→ Spring Boot endpoint
→ API Gateway route
→ Next.js button
→ Kafka event
→ Consumer logs the event
```

---

# 5. Tech Stack

## Frontend

Use:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
TanStack Query
```

## Main Backend Services

Use Java Spring Boot for the core business services:

```text
Java
Spring Boot
Spring Web
Spring Data JPA
Spring Kafka
PostgreSQL
Redis
WebSockets
```

Core Java services:

```text
api-gateway
user-service
court-service j
dropin-service
messaging-service
payment-service
search-service
```

## Go Service

Use Go for:

```text
notification-service
```

Reason:

The Notification Service is a good service to experiment with Go because it mostly consumes Kafka events and sends notifications later.

For the first skeleton, it should:

```text
Expose GET /health
Connect to Kafka
Consume RSVP_CREATED events
Log consumed events
```

Later it can send emails through Resend.

## Optional Rust Service Later

Use Rust later for:

```text
analytics-service
```

Reason:

Analytics is a good optional Rust service because it can consume Kafka events and calculate metrics without affecting the core app.

Do not build the Rust service in the first milestone.

---

# 6. Repository Structure

Create this structure:

```text
courtsync/
  MASTER.md
  README.md
  docker-compose.yml
  .gitignore
  .env.example

  frontend/
    package.json
    next.config.ts
    tsconfig.json
    app/
      page.tsx
      drop-ins/
        page.tsx
        create/
          page.tsx
        [id]/
          page.tsx
      courts/
        page.tsx
        create/
          page.tsx
      profile/
        page.tsx
    components/
      Navbar.tsx
      PageContainer.tsx
      CourtCard.tsx
      DropInCard.tsx
      CourtForm.tsx
      DropInForm.tsx
      RSVPButton.tsx
      LoadingState.tsx
      ErrorState.tsx
    lib/
      api.ts
    types/
      court.ts
      dropin.ts
      user.ts

  services/
    api-gateway/
      pom.xml
      Dockerfile
      src/main/java/com/courtsync/apigateway/
      src/main/resources/application.yml

    user-service/
      pom.xml
      Dockerfile
      src/main/java/com/courtsync/users/
      src/main/resources/application.yml

    court-service/
      pom.xml
      Dockerfile
      src/main/java/com/courtsync/courts/
      src/main/resources/application.yml

    dropin-service/
      pom.xml
      Dockerfile
      src/main/java/com/courtsync/dropins/
      src/main/resources/application.yml

    messaging-service/
      pom.xml
      Dockerfile
      src/main/java/com/courtsync/messaging/
      src/main/resources/application.yml

    payment-service/
      pom.xml
      Dockerfile
      src/main/java/com/courtsync/payments/
      src/main/resources/application.yml

    search-service/
      pom.xml
      Dockerfile
      src/main/java/com/courtsync/search/
      src/main/resources/application.yml

    notification-service/
      go.mod
      go.sum
      Dockerfile
      cmd/
        notification-service/
          main.go
      internal/
        kafka/
        handlers/
        config/
        health/

  shared/
    event-contracts/
      README.md
      events.md

  infra/
    k8s/
      README.md
```

---

# 7. Service Ownership

Each microservice should own its own data.

A service should not directly query another service’s database.

Correct:

```text
Drop-In Service calls Court Service API to check court information.
```

Incorrect:

```text
Drop-In Service directly queries Court Service tables.
```

For local development, it is okay to use one PostgreSQL container with multiple databases or schemas.

Suggested local databases:

```text
courtsync_users
courtsync_courts
courtsync_dropins
courtsync_messages
courtsync_payments
```

---

# 8. Services

## 8.1 API Gateway

Language:

```text
Java Spring Boot
```

Purpose:

The API Gateway is the only backend service the frontend should call directly.

Responsibilities:

```text
Receive requests from the frontend
Route requests to backend services
Hide internal service URLs
Provide one clean API surface
Expose a health endpoint
Later handle authentication and rate limiting
```

Initial routes:

```text
/api/users/**
/api/courts/**
/api/drop-ins/**
/api/messages/**
/api/payments/**
/api/search/**
```

Initial endpoint:

```text
GET /health
```

The API Gateway should forward requests using REST first.

Do not use Kafka for normal request/response APIs.

---

## 8.2 User Service

Language:

```text
Java Spring Boot
```

Purpose:

Manages users and player profile information.

Initial responsibilities:

```text
Create user
Get user by id
Update user profile
Expose health endpoint
Publish USER_CREATED event later
```

Future responsibilities:

```text
Authentication
JWT sessions
Role-based access control
Favourite courts
Skill level
Player stats
```

Initial endpoints:

```text
GET /health
POST /users
GET /users/{id}
PUT /users/{id}
```

Initial table:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  skill_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Example skill levels:

```text
BEGINNER
INTERMEDIATE
ADVANCED
COMPETITIVE
```

---

## 8.3 Court Service

Language:

```text
Java Spring Boot
```

Purpose:

Manages volleyball courts.

Initial responsibilities:

```text
Create court
View all courts
View court by id
Store court location
Expose health endpoint
Publish COURT_CREATED event later
```

Future responsibilities:

```text
Court schedules
Court availability
Indoor/outdoor filters
Beach volleyball filters
Court photos
Court reviews
Geo-search support
```

Initial endpoints:

```text
GET /health
POST /courts
GET /courts
GET /courts/{id}
```

Initial table:

```sql
CREATE TABLE courts (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  province VARCHAR(100),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  court_type VARCHAR(50),
  indoor BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Court types:

```text
INDOOR
OUTDOOR
BEACH
GYM
COMMUNITY_CENTRE
```

---

## 8.4 Drop-In Service

Language:

```text
Java Spring Boot
```

Purpose:

The core service for volleyball drop-in sessions and RSVPs.

Initial responsibilities:

```text
Create drop-in
View all drop-ins
View drop-in by id
RSVP to drop-in
Cancel RSVP
Prevent duplicate RSVP
Prevent RSVP when full
Publish RSVP_CREATED event to Kafka
Publish RSVP_CANCELLED event to Kafka
Expose health endpoint
```

Future responsibilities:

```text
Waitlists
Organizer dashboard
Drop-in cancellation
Recurring drop-ins
Skill-level matching
Payment-required RSVPs
```

Initial endpoints:

```text
GET /health
POST /drop-ins
GET /drop-ins
GET /drop-ins/{id}
POST /drop-ins/{id}/rsvp
DELETE /drop-ins/{id}/rsvp/{userId}
```

Initial tables:

```sql
CREATE TABLE drop_ins (
  id UUID PRIMARY KEY,
  court_id UUID NOT NULL,
  organizer_user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  max_players INTEGER NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0,
  skill_level VARCHAR(50),
  status VARCHAR(50) DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```sql
CREATE TABLE drop_in_players (
  id UUID PRIMARY KEY,
  drop_in_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rsvp_status VARCHAR(50) DEFAULT 'CONFIRMED',
  payment_status VARCHAR(50) DEFAULT 'NOT_REQUIRED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(drop_in_id, user_id)
);
```

Drop-in statuses:

```text
OPEN
FULL
CANCELLED
COMPLETED
```

RSVP statuses:

```text
CONFIRMED
CANCELLED
WAITLISTED
```

Payment statuses:

```text
NOT_REQUIRED
PENDING
PAID
FAILED
REFUNDED
```

---

## 8.5 Messaging Service

Language:

```text
Java Spring Boot
```

Purpose:

Handles real-time drop-in group chat.

For the first skeleton, only create a placeholder service.

Initial responsibilities:

```text
Expose health endpoint
Prepare basic WebSocket configuration
Prepare message database schema
Prepare MESSAGE_SENT event contract
```

Do not fully implement live chat until the core RSVP flow works.

Future responsibilities:

```text
Drop-in group chat
WebSocket real-time messaging
Message history
Online user tracking with Redis
Offline notification events
Read receipts
Typing indicators
```

Initial endpoints:

```text
GET /health
GET /drop-ins/{dropInId}/messages
```

Future WebSocket paths:

```text
/ws/messages
/topic/drop-ins/{dropInId}/messages
/app/drop-ins/{dropInId}/messages
```

Initial tables:

```sql
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY,
  drop_in_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chat_room_id UUID NOT NULL,
  sender_user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Future access rule:

```text
A user can access a drop-in chat only if:
- they created the drop-in
- they RSVP’d to the drop-in
- they are an admin
```

---

## 8.6 Payment Service

Language:

```text
Java Spring Boot
```

Purpose:

Handles payment workflows later.

For the first skeleton, only create a placeholder service.

Initial responsibilities:

```text
Expose health endpoint
Prepare payment table
Prepare Kafka event contracts
Do not implement Stripe yet
```

Future responsibilities:

```text
Create Stripe checkout sessions
Handle Stripe webhooks
Track payment status
Publish PAYMENT_SUCCEEDED and PAYMENT_FAILED events
Handle refunds
Trigger payment receipt notifications
```

Initial endpoint:

```text
GET /health
```

Future endpoints:

```text
POST /payments/checkout
POST /payments/webhook
GET /payments/{id}
```

Initial table:

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  drop_in_id UUID NOT NULL,
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'CAD',
  status VARCHAR(50) DEFAULT 'PENDING',
  stripe_checkout_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8.7 Notification Service

Language:

```text
Go
```

Purpose:

Consumes events and sends notifications later.

This service should be built in Go to experiment with a second backend language.

Initial responsibilities:

```text
Expose GET /health
Connect to Kafka
Consume RSVP_CREATED events
Consume RSVP_CANCELLED events
Log consumed events
```

Future responsibilities:

```text
Send RSVP confirmation emails
Send payment receipt emails
Send drop-in cancellation emails
Send offline chat message notifications
Send game reminders
```

Initial endpoint:

```text
GET /health
```

Future integration:

```text
Resend email API
```

First milestone behavior:

```text
When Drop-In Service publishes RSVP_CREATED:
Notification Service consumes the event and logs it.
```

Do not send real emails in the first milestone.

---

## 8.8 Search Service

Language:

```text
Java Spring Boot
```

Purpose:

Handles search and indexing later.

For the first skeleton, it should only consume events and log them.

Initial responsibilities:

```text
Expose health endpoint
Connect to Kafka
Consume RSVP_CREATED events
Consume DROP_IN_CREATED events later
Log consumed events
```

Future responsibilities:

```text
Index courts into Elasticsearch
Index drop-ins into Elasticsearch
Search nearby drop-ins
Filter by skill level
Filter by date
Filter by price
Filter by court type
```

Initial endpoint:

```text
GET /health
```

Future endpoints:

```text
GET /search/drop-ins
GET /search/courts
```

Do not add Elasticsearch in the first milestone unless the basic skeleton is already working.

---

## 8.9 Analytics Service Later

Language:

```text
Rust
```

Purpose:

Optional future service for learning Rust.

Do not build this in the first milestone.

Future responsibilities:

```text
Consume Kafka events
Track popular courts
Track RSVP counts
Track cancellations
Track active users
Generate basic analytics summaries
```

Possible events to consume:

```text
USER_CREATED
DROP_IN_CREATED
RSVP_CREATED
RSVP_CANCELLED
PAYMENT_SUCCEEDED
MESSAGE_SENT
```

---

# 9. Kafka Design

Use Kafka for asynchronous event-driven communication.

Kafka means:

```text
Something happened, and other services may react.
```

Do not use Kafka for regular frontend request/response behavior.

Correct Kafka usage:

```text
Drop-In Service saves RSVP
→ Drop-In Service publishes RSVP_CREATED
→ Notification Service consumes RSVP_CREATED
→ Search Service consumes RSVP_CREATED
```

Incorrect Kafka usage:

```text
Frontend requests list of drop-ins
→ API Gateway publishes GET_DROP_INS event to Kafka
```

Normal reads and writes should use REST.

---

## 9.1 Kafka Topics

Create these topics:

```text
user-events
court-events
dropin-events
payment-events
message-events
search-events
```

For the first milestone, the most important topic is:

```text
dropin-events
```

---

## 9.2 Kafka Events

### USER_CREATED

```json
{
  "eventType": "USER_CREATED",
  "userId": "uuid",
  "email": "user@example.com",
  "timestamp": "2026-06-09T12:00:00Z"
}
```

### COURT_CREATED

```json
{
  "eventType": "COURT_CREATED",
  "courtId": "uuid",
  "name": "Toronto Volleyball Centre",
  "city": "Toronto",
  "province": "ON",
  "timestamp": "2026-06-09T12:00:00Z"
}
```

### DROP_IN_CREATED

```json
{
  "eventType": "DROP_IN_CREATED",
  "dropInId": "uuid",
  "courtId": "uuid",
  "organizerUserId": "uuid",
  "startTime": "2026-06-12T19:00:00Z",
  "timestamp": "2026-06-09T12:00:00Z"
}
```

### RSVP_CREATED

```json
{
  "eventType": "RSVP_CREATED",
  "dropInId": "uuid",
  "userId": "uuid",
  "paymentRequired": false,
  "amount": 0,
  "timestamp": "2026-06-09T12:00:00Z"
}
```

### RSVP_CANCELLED

```json
{
  "eventType": "RSVP_CANCELLED",
  "dropInId": "uuid",
  "userId": "uuid",
  "timestamp": "2026-06-09T12:00:00Z"
}
```

### PAYMENT_SUCCEEDED

```json
{
  "eventType": "PAYMENT_SUCCEEDED",
  "paymentId": "uuid",
  "dropInId": "uuid",
  "userId": "uuid",
  "amount": 10.00,
  "currency": "CAD",
  "timestamp": "2026-06-09T12:00:00Z"
}
```

### PAYMENT_FAILED

```json
{
  "eventType": "PAYMENT_FAILED",
  "paymentId": "uuid",
  "dropInId": "uuid",
  "userId": "uuid",
  "reason": "Payment declined",
  "timestamp": "2026-06-09T12:00:00Z"
}
```

### MESSAGE_SENT

```json
{
  "eventType": "MESSAGE_SENT",
  "messageId": "uuid",
  "dropInId": "uuid",
  "senderUserId": "uuid",
  "timestamp": "2026-06-09T12:00:00Z"
}
```

---

# 10. Redis Design

Use Redis for fast temporary data.

Use Redis for:

```text
Caching
Temporary locks
Rate limiting
Online user tracking later
```

Initial Redis usage:

```text
RSVP lock by dropInId
```

Example RSVP lock flow:

```text
User clicks RSVP
→ Drop-In Service creates Redis lock for dropInId
→ checks capacity
→ creates RSVP
→ publishes RSVP_CREATED event
→ releases Redis lock
```

Future Redis usage:

```text
Cache court details
Cache drop-in details
Track online users in Messaging Service
Rate limit chat messages
Store short-lived sessions
```

Example keys:

```text
lock:dropin:{dropInId}
dropin:{dropInId}
court:{courtId}
online:user:{userId}
rate_limit:messages:{userId}
```

For the first milestone, Redis can be running in Docker Compose even if only basic locking is implemented.

---

# 11. Frontend Skeleton

Use Next.js with TypeScript.

Initial pages:

```text
/
 /drop-ins
 /drop-ins/create
 /drop-ins/[id]
 /courts
 /courts/create
 /profile
```

Initial components:

```text
Navbar
PageContainer
CourtCard
DropInCard
CourtForm
DropInForm
RSVPButton
LoadingState
ErrorState
```

Future components:

```text
ChatBox
PaymentButton
SearchFilters
MapView
NotificationBell
```

---

## 11.1 Home Page

Route:

```text
/
```

Purpose:

```text
Landing page
Show app name and description
Button to view drop-ins
Button to create a drop-in
```

---

## 11.2 Drop-Ins Page

Route:

```text
/drop-ins
```

Purpose:

```text
Display all drop-ins
Each card links to the drop-in detail page
```

---

## 11.3 Drop-In Detail Page

Route:

```text
/drop-ins/[id]
```

Purpose:

```text
Show drop-in details
Show court id or court information
Show player count
Show RSVP button
Show cancel RSVP button later
Show messaging placeholder
```

---

## 11.4 Create Drop-In Page

Route:

```text
/drop-ins/create
```

Purpose:

```text
Create a new volleyball drop-in
```

Fields:

```text
courtId
organizerUserId
title
description
startTime
endTime
maxPlayers
price
skillLevel
```

---

## 11.5 Courts Page

Route:

```text
/courts
```

Purpose:

```text
Show all courts
```

---

## 11.6 Create Court Page

Route:

```text
/courts/create
```

Purpose:

```text
Create a new court
```

Fields:

```text
name
address
city
province
latitude
longitude
courtType
indoor
```

---

# 12. API Gateway Routes

The frontend should call only the API Gateway.

Frontend should not call individual services directly.

Frontend base URL:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Gateway routes:

```text
/api/users/**      → user-service
/api/courts/**     → court-service
/api/drop-ins/**   → dropin-service
/api/messages/**   → messaging-service
/api/payments/**   → payment-service
/api/search/**     → search-service
```

---

# 13. Initial API Design

## User API

```text
POST /api/users
GET /api/users/{id}
PUT /api/users/{id}
```

## Court API

```text
POST /api/courts
GET /api/courts
GET /api/courts/{id}
```

## Drop-In API

```text
POST /api/drop-ins
GET /api/drop-ins
GET /api/drop-ins/{id}
POST /api/drop-ins/{id}/rsvp
DELETE /api/drop-ins/{id}/rsvp/{userId}
```

## Messaging API Skeleton

```text
GET /api/messages/health
GET /api/messages/drop-ins/{dropInId}
```

## Payment API Skeleton

```text
GET /api/payments/health
```

## Search API Skeleton

```text
GET /api/search/health
```

---

# 14. Environment Variables

Create `.env.example`:

```text
# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# PostgreSQL
POSTGRES_USER=courtsync
POSTGRES_PASSWORD=courtsync
POSTGRES_DB=courtsync

# Service URLs
USER_SERVICE_URL=http://user-service:8081
COURT_SERVICE_URL=http://court-service:8082
DROPIN_SERVICE_URL=http://dropin-service:8083
MESSAGING_SERVICE_URL=http://messaging-service:8084
PAYMENT_SERVICE_URL=http://payment-service:8085
NOTIFICATION_SERVICE_URL=http://notification-service:8086
SEARCH_SERVICE_URL=http://search-service:8087

# Kafka
KAFKA_BOOTSTRAP_SERVERS=kafka:9092

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Future Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Future Email
RESEND_API_KEY=

# Future Elasticsearch
ELASTICSEARCH_URL=http://elasticsearch:9200
```

---

# 15. Docker Compose Requirements

Create `docker-compose.yml` with:

```text
frontend
api-gateway
user-service
court-service
dropin-service
messaging-service
payment-service
notification-service
search-service
postgres
kafka
redis
```

Elasticsearch should be added later.

Suggested ports:

```text
frontend: 3000
api-gateway: 8080
user-service: 8081
court-service: 8082
dropin-service: 8083
messaging-service: 8084
payment-service: 8085
notification-service: 8086
search-service: 8087
postgres: 5432
kafka: 9092
redis: 6379
```

Each backend service must have a Dockerfile.

The final skeleton should run with:

```bash
docker compose up
```

---

# 16. Health Checks

Every backend service must expose:

```text
GET /health
```

Example response:

```json
{
  "service": "dropin-service",
  "status": "UP"
}
```

Each service should return its own service name.

---

# 17. Error Handling

Use consistent error responses.

Example:

```json
{
  "error": "DROP_IN_FULL",
  "message": "This drop-in is already full."
}
```

Important errors:

```text
USER_NOT_FOUND
COURT_NOT_FOUND
DROP_IN_NOT_FOUND
DROP_IN_FULL
DUPLICATE_RSVP
INVALID_REQUEST
INTERNAL_SERVER_ERROR
```

---

# 18. Validation Rules

Validate all request bodies.

Examples:

```text
Email must be valid
Court name is required
Drop-in title is required
Drop-in start time must be before end time
Max players must be greater than 0
Price cannot be negative
A user cannot RSVP twice to the same drop-in
A user cannot RSVP if the drop-in is full
```

---

# 19. Logging Rules

Each service should log:

```text
Service startup
Incoming requests
Important database actions
Kafka events produced
Kafka events consumed
Errors
```

Keep logs simple and readable.

Example:

```text
[dropin-service] RSVP_CREATED published for dropInId=123 userId=456
[notification-service] RSVP_CREATED consumed for dropInId=123 userId=456
```

---

# 20. First Milestone

The first milestone is complete when:

```text
Docker Compose starts PostgreSQL, Kafka, Redis, and all service containers.
Every backend service has a working /health endpoint.
The frontend loads at http://localhost:3000.
A user can create a court.
A user can create a drop-in using an existing court ID.
A user can view all drop-ins.
A user can view a drop-in detail page.
A user can RSVP to a drop-in.
The Drop-In Service publishes RSVP_CREATED to Kafka.
The Go Notification Service consumes RSVP_CREATED and logs it.
The Search Service consumes RSVP_CREATED and logs it.
```

Do not implement these in the first milestone:

```text
Real authentication
Real Stripe payments
Real email sending
Full WebSocket chat
Elasticsearch
Kubernetes
Terraform
```

Only create placeholders where useful.

---

# 21. Later Roadmap

After the skeleton works, add features in this order:

```text
1. Authentication and user sessions
2. Redis RSVP locking
3. Real-time messaging with WebSockets
4. Resend email notifications
5. Stripe payment flow
6. Elasticsearch search
7. Docker hardening
8. Kubernetes manifests
9. Monitoring and observability
10. Optional Rust Analytics Service
11. Terraform cloud deployment
```

---

# 22. Kubernetes Plan Later

Do not start with Kubernetes.

After Docker Compose works, create Kubernetes manifests for:

```text
frontend
api-gateway
user-service
court-service
dropin-service
messaging-service
payment-service
notification-service
search-service
postgres
kafka
redis
```

Each service should have:

```text
Deployment
Service
ConfigMap
Secret if needed
```

Use local Kubernetes first:

```text
Kind or Minikube
```

Do not deploy to AWS EKS or Azure AKS until local Kubernetes works.

---

# 23. Future Messaging Plan

Real-time messaging should be added after the RSVP flow works.

Messaging architecture:

```text
Next.js frontend
    |
    | WebSocket
    v
Messaging Service
    |
    | stores messages
    v
PostgreSQL
    |
    | publishes MESSAGE_SENT
    v
Kafka
    |
    v
Notification Service for offline users
```

Future message flow:

```text
User sends message
→ Messaging Service stores message
→ Messaging Service broadcasts through WebSocket
→ Messaging Service publishes MESSAGE_SENT event
→ Notification Service checks offline users later
```

Messaging should use:

```text
Spring Boot WebSockets
STOMP
PostgreSQL
Redis
Kafka
```

---

# 24. Future Payment Plan

Payments should be added after RSVP and messaging basics work.

Payment architecture:

```text
User RSVPs
→ Payment Service creates Stripe checkout session
→ User pays through Stripe
→ Stripe webhook calls Payment Service
→ Payment Service publishes PAYMENT_SUCCEEDED
→ Notification Service sends receipt later
```

Use Stripe test mode only during development.

---

# 25. Future Search Plan

Search should be added after the core app works.

Search architecture:

```text
Court Service / Drop-In Service publishes events
→ Search Service consumes events
→ Search Service indexes documents in Elasticsearch
→ Frontend searches through API Gateway
```

Search should support:

```text
Nearby courts
Nearby drop-ins
Skill-level filtering
Date filtering
Price filtering
Court type filtering
```

---

# 26. Resume Goals

The final project should eventually support resume bullets like:

```text
Built CourtSync, a full-stack volleyball drop-in platform using Next.js, Java Spring Boot, Go, PostgreSQL, Kafka, Redis, WebSockets, Docker, and Kubernetes.
```

```text
Designed a polyglot microservices architecture with Java Spring Boot domain services and a Go event-driven notification worker connected through Kafka.
```

```text
Implemented RSVP workflows with PostgreSQL persistence, Redis locking to prevent overbooking, and Kafka events to trigger notification and search-index updates.
```

```text
Built a real-time messaging service using Spring Boot WebSockets, PostgreSQL, Redis, and Kafka to support drop-in group chats and offline notification events.
```

---

# 27. Codex Instructions

## Main Instruction

Build the main skeleton first.

Do not fully implement every future feature.

The goal is to create a clean project foundation that can be expanded later.

## Step-by-Step Build Order

Follow this order exactly:

```text
Step 1: Create repo structure.
Step 2: Create .env.example.
Step 3: Create docker-compose.yml with PostgreSQL, Kafka, Redis, and service containers.
Step 4: Create Spring Boot skeleton services.
Step 5: Create Go notification-service skeleton.
Step 6: Add /health endpoint to every service.
Step 7: Create Court Service with entity, repository, service, controller.
Step 8: Create Drop-In Service with entity, repository, service, controller.
Step 9: Add RSVP functionality in Drop-In Service.
Step 10: Publish RSVP_CREATED event to Kafka.
Step 11: Make Go Notification Service consume RSVP_CREATED and log it.
Step 12: Make Search Service consume RSVP_CREATED and log it.
Step 13: Create API Gateway routes to User, Court, Drop-In, Messaging, Payment, and Search services.
Step 14: Create Next.js frontend skeleton.
Step 15: Add frontend pages for courts and drop-ins.
Step 16: Add create court form.
Step 17: Add create drop-in form.
Step 18: Add drop-in list page.
Step 19: Add drop-in detail page with RSVP button.
Step 20: Verify full flow end-to-end.
```

## Do Not Build Yet

Do not fully build these yet:

```text
Stripe payment flow
Real email sending
Elasticsearch indexing
Full WebSocket chat
Authentication
Kubernetes
Terraform
Rust analytics service
```

Only create placeholders or skeletons for them.

## Coding Style

Use clean, simple code.

For Java services, use this structure:

```text
controller
service
repository
entity
dto
config
exception
```

For Go notification-service, use this structure:

```text
cmd/notification-service
internal/config
internal/health
internal/kafka
internal/handlers
```

For frontend, use TypeScript types and simple reusable components.

Keep the project beginner-friendly but production-inspired.

---

# 28. Final Expected Result

At the end of the first skeleton build, I should be able to run:

```bash
docker compose up
```

Then visit:

```text
http://localhost:3000
```

And test:

```text
Create court
Create drop-in
View drop-ins
RSVP to drop-in
See RSVP_CREATED Kafka event logs in notification-service
See RSVP_CREATED Kafka event logs in search-service
```

That is the first finished version.
