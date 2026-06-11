# Drop-in Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the real drop-in frontend (list / detail / create / RSVP) wired to `dropin-service` through the API gateway, replacing the abandoned-design mock pages.

**Architecture:** Mirror the courts vertical exactly — server components for reads (`force-dynamic`, `cache: "no-store"`), server actions for mutations (create + RSVP, so all backend fetches stay server-side and avoid browser→gateway CORS), and a thin client component only for the localStorage dev-identity and RSVP buttons. UI composes shadcn primitives; no hand-written primitives.

**Tech Stack:** Next.js 16.2.6 (App Router, RSC, server actions), TypeScript, Tailwind, shadcn/ui (`base-mira`, hugeicons), `zod/v4`, `sonner`.

**Spec:** `docs/superpowers/specs/2026-06-10-dropin-frontend-design.md`

> **Testing note:** This frontend has **no unit-test runner** (scripts are `dev/build/start/lint` only). Per-task verification is therefore `pnpm lint` + `pnpm build` (build = the type-check gate) plus, for UI tasks, a manual browser check against the running stack (`docker compose up`, gateway on `:8080`, frontend on `:3000`). Run all commands from `services/frontend/`.

---

## File Structure

- `src/lib/dropins.ts` (new) — data layer: types + API functions + format helpers.
- `src/lib/courts.ts` (modify) — add `getCourt(id)`.
- `src/lib/dev-identity.ts` (new) — localStorage dev-player UUID.
- `src/components/drop-ins/dev-player-badge.tsx` (new) — client badge showing the dev identity.
- `src/components/drop-ins/drop-in-card.tsx` (new) — list card.
- `src/components/drop-ins/create-drop-in-form.tsx` (new) — client create form.
- `src/components/drop-ins/rsvp-panel.tsx` (new) — client RSVP/cancel buttons.
- `src/app/(app)/layout.tsx` (modify) — mount `<Toaster />`.
- `src/app/(app)/drop-ins/page.tsx` (new) — list.
- `src/app/(app)/drop-ins/create/page.tsx` (new) + `create/actions.ts` (new) — create.
- `src/app/(app)/drop-ins/[id]/page.tsx` (rewrite) + `[id]/actions.ts` (new) + `[id]/not-found.tsx` (keep) — detail + RSVP.
- Deletions: `drop-ins/new/`, `drop-ins/[id]/signup/`, `drop-ins/[id]/success/`, `components/drop-ins/session-card.tsx`, `components/drop-ins/signup-form.tsx`.
- `src/components/ui/{textarea,sonner,alert}.tsx` (added by shadcn CLI).

---

## Task 1: Add shadcn components + mount Toaster

**Files:**
- Create (via CLI): `src/components/ui/textarea.tsx`, `src/components/ui/sonner.tsx`, `src/components/ui/alert.tsx`
- Modify: `src/app/(app)/layout.tsx`

- [ ] **Step 1: Add the components from the shadcn registry**

Run (from `services/frontend/`):
```bash
pnpm dlx shadcn@latest add @shadcn/textarea @shadcn/sonner @shadcn/alert
```
Expected: three files created under `src/components/ui/`. If it prompts to overwrite, decline for any existing file.

- [ ] **Step 2: Mount the Toaster in the app layout**

Replace `src/app/(app)/layout.tsx` with:
```tsx
import { SiteHeader } from "@/components/layout/site-header"
import { Toaster } from "@/components/ui/sonner"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <SiteHeader />
      {children}
      <Toaster />
    </>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm lint && pnpm build`
Expected: both succeed (no type errors).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/textarea.tsx src/components/ui/sonner.tsx src/components/ui/alert.tsx "src/app/(app)/layout.tsx" package.json pnpm-lock.yaml
git commit -m "feat(frontend): add textarea/sonner/alert shadcn components + Toaster"
```

---

## Task 2: Data layer (`lib/dropins.ts`) + `getCourt`

**Files:**
- Create: `src/lib/dropins.ts`
- Modify: `src/lib/courts.ts`

- [ ] **Step 1: Add `getCourt(id)` to `lib/courts.ts`**

Add this function directly after the existing `listCourts` function in `src/lib/courts.ts`:
```ts
export async function getCourt(id: string) {
  const response = await fetch(courtApiUrl(`/courts/${id}`), {
    cache: "no-store",
  })

  return readCourtApiResponse<Court>(response)
}
```

- [ ] **Step 2: Create `src/lib/dropins.ts`**

```ts
export const dropInStatusValues = ["OPEN", "FULL", "CANCELLED"] as const
export type DropInStatus = (typeof dropInStatusValues)[number]

export const skillLevelOptions = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Open", label: "Open" },
] as const

export type DropIn = {
  id: string
  courtId: string
  organizerUserId: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  maxPlayers: number
  confirmedPlayers: number
  spotsLeft: number
  price: number
  skillLevel: string | null
  status: DropInStatus
  createdAt: string
  updatedAt: string
}

export type CreateDropInInput = {
  courtId: string
  organizerUserId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  maxPlayers: number
  price: number
  skillLevel?: string
}

export class DropInApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = "DropInApiError"
  }
}

export async function listDropIns() {
  const response = await fetch(dropInApiUrl("/drop-ins"), { cache: "no-store" })
  return readDropInApiResponse<DropIn[]>(response)
}

export async function getDropIn(id: string) {
  const response = await fetch(dropInApiUrl(`/drop-ins/${id}`), {
    cache: "no-store",
  })
  return readDropInApiResponse<DropIn>(response)
}

export async function createDropIn(input: CreateDropInInput) {
  const response = await fetch(dropInApiUrl("/drop-ins"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  })
  return readDropInApiResponse<DropIn>(response)
}

export async function rsvp(dropInId: string, userId: string) {
  const response = await fetch(
    dropInApiUrl(`/drop-ins/${dropInId}/rsvp`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
      cache: "no-store",
    }
  )
  if (!response.ok) {
    throw new DropInApiError(await getErrorMessage(response), response.status)
  }
}

export async function cancelRsvp(dropInId: string, userId: string) {
  const response = await fetch(
    dropInApiUrl(`/drop-ins/${dropInId}/rsvp/${userId}`),
    { method: "DELETE", cache: "no-store" }
  )
  if (!response.ok) {
    throw new DropInApiError(await getErrorMessage(response), response.status)
  }
}

export function rsvpErrorMessage(status: number) {
  if (status === 409) {
    return "You've already RSVP'd, or this drop-in is full."
  }
  if (status === 400) {
    return "Couldn't RSVP — the drop-in may be closed."
  }
  if (status === 404) {
    return "This drop-in no longer exists."
  }
  return "Something went wrong. Please try again."
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

const timeFormatter = new Intl.DateTimeFormat("en-CA", {
  hour: "numeric",
  minute: "2-digit",
})

export function formatDateTimeRange(startIso: string, endIso: string) {
  const start = new Date(startIso)
  const end = new Date(endIso)
  return `${dateTimeFormatter.format(start)} – ${timeFormatter.format(end)}`
}

export function formatPrice(price: number) {
  return price === 0 ? "Free" : `$${price.toFixed(2)} CAD`
}

export function formatStatus(status: DropInStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function dropInApiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`
}

function getApiBaseUrl() {
  const baseUrl =
    process.env.COURTSYNC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080/api"

  return baseUrl.replace(/\/+$/, "")
}

async function readDropInApiResponse<T>(response: Response) {
  if (response.ok) {
    return response.json() as Promise<T>
  }
  throw new DropInApiError(await getErrorMessage(response), response.status)
}

async function getErrorMessage(response: Response) {
  const fallback = `Drop-in API request failed with ${response.status}`
  try {
    const body = (await response.json()) as {
      message?: unknown
      error?: unknown
    }
    const message = typeof body.message === "string" ? body.message : body.error
    return typeof message === "string" ? message : fallback
  } catch {
    return fallback
  }
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm lint && pnpm build`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add src/lib/dropins.ts src/lib/courts.ts
git commit -m "feat(frontend): add dropins data layer + getCourt"
```

---

## Task 3: Dev identity + badge

**Files:**
- Create: `src/lib/dev-identity.ts`, `src/components/drop-ins/dev-player-badge.tsx`

- [ ] **Step 1: Create `src/lib/dev-identity.ts`**

```ts
const STORAGE_KEY = "courtsync.dev-player-id"

/**
 * No auth yet: a stable per-browser UUID stands in for the logged-in user.
 * Used as organizerUserId (create) and userId (RSVP). Client-only — calling this
 * during SSR throws, so read it inside an effect.
 */
export function getDevPlayerId(): string {
  if (typeof window === "undefined") {
    throw new Error("getDevPlayerId() is client-only")
  }
  let id = window.localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    window.localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
```

- [ ] **Step 2: Create `src/components/drop-ins/dev-player-badge.tsx`**

```tsx
"use client"

import { useEffect, useState } from "react"
import { UserCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { getDevPlayerId } from "@/lib/dev-identity"

export function DevPlayerBadge() {
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    setPlayerId(getDevPlayerId())
  }, [])

  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <HugeiconsIcon icon={UserCircleIcon} />
      You (dev player) · {playerId ? `${playerId.slice(0, 8)}…` : "…"}
    </Badge>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm lint && pnpm build`
Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add src/lib/dev-identity.ts src/components/drop-ins/dev-player-badge.tsx
git commit -m "feat(frontend): add per-browser dev identity + badge"
```

---

## Task 4: Drop-in list page + card

**Files:**
- Create: `src/components/drop-ins/drop-in-card.tsx`, `src/app/(app)/drop-ins/page.tsx`

- [ ] **Step 1: Create `src/components/drop-ins/drop-in-card.tsx`**

```tsx
import Link from "next/link"
import {
  Calendar03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatDateTimeRange,
  formatPrice,
  formatStatus,
  type DropIn,
} from "@/lib/dropins"

export function DropInCard({ dropIn }: { dropIn: DropIn }) {
  return (
    <Link href={`/drop-ins/${dropIn.id}`} className="group block">
      <Card className="h-full bg-background/80 shadow-sm transition-colors group-hover:border-primary/40">
        <CardHeader>
          <div className="min-w-0">
            <CardTitle className="truncate">{dropIn.title}</CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Calendar03Icon} />
              {formatDateTimeRange(dropIn.startTime, dropIn.endTime)}
            </CardDescription>
          </div>
          <CardAction>
            <Badge variant={dropIn.status === "OPEN" ? "default" : "secondary"}>
              {formatStatus(dropIn.status)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon icon={UserGroupIcon} />
            {dropIn.confirmedPlayers}/{dropIn.maxPlayers} players ·{" "}
            {dropIn.spotsLeft} {dropIn.spotsLeft === 1 ? "spot" : "spots"} left
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <span className="text-xs/relaxed text-muted-foreground">
            {dropIn.skillLevel ?? "Any level"}
          </span>
          <Badge variant="secondary">{formatPrice(dropIn.price)}</Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 2: Create `src/app/(app)/drop-ins/page.tsx`**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import {
  Add01Icon,
  AlertCircleIcon,
  CalendarAdd01Icon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DevPlayerBadge } from "@/components/drop-ins/dev-player-badge"
import { DropInCard } from "@/components/drop-ins/drop-in-card"
import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { DropInApiError, listDropIns, type DropIn } from "@/lib/dropins"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Drop-ins | VolleyIQ",
  description: "Browse and create volleyball drop-in sessions.",
}

export const dynamic = "force-dynamic"

export default async function DropInsPage() {
  const { dropIns, error } = await getDropIns()

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={VolleyballIcon} />
              </span>
              <div className="min-w-0">
                <h1 className="font-heading text-3xl font-semibold text-foreground">
                  Drop-ins
                </h1>
                <p className="text-sm/relaxed text-muted-foreground">
                  Open volleyball sessions you can join.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DevPlayerBadge />
              <Link href="/drop-ins/create" className={cn(buttonVariants({ size: "lg" }))}>
                <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
                Create drop-in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        {error ? <DropInsError message={error} /> : null}
        {!error && dropIns.length === 0 ? <DropInsEmpty /> : null}
        {dropIns.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dropIns.map((dropIn) => (
              <DropInCard key={dropIn.id} dropIn={dropIn} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

async function getDropIns() {
  try {
    return { dropIns: await listDropIns(), error: null }
  } catch (error) {
    return {
      dropIns: [] as DropIn[],
      error:
        error instanceof DropInApiError
          ? error.message
          : "Unable to load drop-ins right now.",
    }
  }
}

function DropInsEmpty() {
  return (
    <Empty className="min-h-72 border bg-background">
      <EmptyMedia variant="icon">
        <HugeiconsIcon icon={CalendarAdd01Icon} />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No drop-ins yet</EmptyTitle>
        <EmptyDescription>
          Create the first drop-in so players have a session to join.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/drop-ins/create" className={cn(buttonVariants())}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
          Create drop-in
        </Link>
      </EmptyContent>
    </Empty>
  )
}

function DropInsError({ message }: { message: string }) {
  return (
    <Empty className="min-h-72 border bg-background">
      <EmptyMedia variant="icon">
        <HugeiconsIcon icon={AlertCircleIcon} />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Drop-ins unavailable</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
```

- [ ] **Step 3: Verify build + browser**

Run: `pnpm lint && pnpm build`
Expected: both succeed.

With the stack running, open `http://localhost:3000/drop-ins`.
Expected: page renders; any drop-ins created earlier this session appear as cards (or the empty state if none); the "You (dev player)" badge shows a short id.

- [ ] **Step 4: Commit**

```bash
git add src/components/drop-ins/drop-in-card.tsx "src/app/(app)/drop-ins/page.tsx"
git commit -m "feat(frontend): drop-in list page + card"
```

---

## Task 5: Create drop-in page + form + action

**Files:**
- Create: `src/app/(app)/drop-ins/create/actions.ts`, `src/app/(app)/drop-ins/create/page.tsx`, `src/components/drop-ins/create-drop-in-form.tsx`
- Delete: `src/app/(app)/drop-ins/new/` (whole folder)

- [ ] **Step 1: Create the server action `src/app/(app)/drop-ins/create/actions.ts`**

```ts
"use server"

import { redirect } from "next/navigation"
import { z } from "zod/v4"

import { createDropIn, DropInApiError } from "@/lib/dropins"

const createDropInSchema = z
  .object({
    courtId: z.string().uuid("Select a court."),
    organizerUserId: z.string().uuid("Missing dev identity — reload the page."),
    title: z.string().trim().min(1, "Title is required.").max(255),
    description: optionalTrimmedString(2000),
    startTime: isoDateTime("Start time is required."),
    endTime: isoDateTime("End time is required."),
    maxPlayers: z.coerce
      .number()
      .int("Whole number only.")
      .min(1, "At least 1 player."),
    price: z.coerce.number().min(0, "Price can't be negative."),
    skillLevel: optionalTrimmedString(50),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time.",
    path: ["endTime"],
  })

export type CreateDropInFormState = {
  formError: string | null
  fieldErrors: Partial<
    Record<keyof z.input<typeof createDropInSchema>, string[]>
  >
}

export async function createDropInAction(
  _state: CreateDropInFormState,
  formData: FormData
): Promise<CreateDropInFormState> {
  const result = createDropInSchema.safeParse({
    courtId: formData.get("courtId"),
    organizerUserId: formData.get("organizerUserId"),
    title: formData.get("title"),
    description: formData.get("description"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    maxPlayers: formData.get("maxPlayers"),
    price: formData.get("price"),
    skillLevel: formData.get("skillLevel"),
  })

  if (!result.success) {
    return { formError: null, fieldErrors: result.error.flatten().fieldErrors }
  }

  let created
  try {
    created = await createDropIn(result.data)
  } catch (error) {
    if (error instanceof DropInApiError) {
      return { formError: error.message, fieldErrors: {} }
    }
    throw error
  }

  redirect(`/drop-ins/${created.id}`)
}

function optionalTrimmedString(max: number) {
  return z.preprocess((value) => {
    if (typeof value !== "string") return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }, z.string().max(max).optional())
}

function isoDateTime(requiredMessage: string) {
  return z.preprocess((value) => {
    if (typeof value !== "string" || value.trim().length === 0) return undefined
    // <input type="datetime-local"> gives "YYYY-MM-DDTHH:mm" (local, no zone).
    // Convert to a full ISO instant the backend (Instant) accepts.
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toISOString()
  }, z.string({ error: requiredMessage }).min(1, requiredMessage))
}
```

- [ ] **Step 2: Create the client form `src/components/drop-ins/create-drop-in-form.tsx`**

```tsx
"use client"

import { useActionState, useEffect, useState } from "react"
import { Add01Icon, VolleyballIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  createDropInAction,
  type CreateDropInFormState,
} from "@/app/(app)/drop-ins/create/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Court } from "@/lib/courts"
import { getDevPlayerId } from "@/lib/dev-identity"
import { skillLevelOptions } from "@/lib/dropins"

const initialState: CreateDropInFormState = { formError: null, fieldErrors: {} }

export function CreateDropInForm({ courts }: { courts: Court[] }) {
  const [state, formAction, isPending] = useActionState(
    createDropInAction,
    initialState
  )
  const [organizerUserId, setOrganizerUserId] = useState("")

  useEffect(() => {
    setOrganizerUserId(getDevPlayerId())
  }, [])

  const ready = organizerUserId.length > 0

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Drop-in details</CardTitle>
        <CardDescription>
          Schedule a session at one of your courts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="create-drop-in-form" action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="organizerUserId" value={organizerUserId} />

          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors.courtId}>
              <FieldLabel>Court</FieldLabel>
              <Select name="courtId" disabled={isPending} required>
                <SelectTrigger className="w-full" aria-invalid={!!state.fieldErrors.courtId}>
                  <SelectValue placeholder="Select a court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                        {court.city ? ` — ${court.city}` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={toFieldErrors(state.fieldErrors.courtId)} />
            </Field>

            <Field data-invalid={!!state.fieldErrors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                name="title"
                placeholder="Friday Night Indoor"
                aria-invalid={!!state.fieldErrors.title}
                disabled={isPending}
                required
              />
              <FieldError errors={toFieldErrors(state.fieldErrors.title)} />
            </Field>

            <Field data-invalid={!!state.fieldErrors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Casual 6s, all welcome."
                aria-invalid={!!state.fieldErrors.description}
                disabled={isPending}
              />
              <FieldError errors={toFieldErrors(state.fieldErrors.description)} />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!state.fieldErrors.startTime}>
                <FieldLabel htmlFor="startTime">Start time</FieldLabel>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  aria-invalid={!!state.fieldErrors.startTime}
                  disabled={isPending}
                  required
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.startTime)} />
              </Field>

              <Field data-invalid={!!state.fieldErrors.endTime}>
                <FieldLabel htmlFor="endTime">End time</FieldLabel>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  aria-invalid={!!state.fieldErrors.endTime}
                  disabled={isPending}
                  required
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.endTime)} />
              </Field>
            </div>
            <FieldDescription>
              Start time must be in the future.
            </FieldDescription>
          </FieldGroup>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field data-invalid={!!state.fieldErrors.maxPlayers}>
                <FieldLabel htmlFor="maxPlayers">Max players</FieldLabel>
                <Input
                  id="maxPlayers"
                  name="maxPlayers"
                  type="number"
                  min={1}
                  defaultValue={12}
                  aria-invalid={!!state.fieldErrors.maxPlayers}
                  disabled={isPending}
                  required
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.maxPlayers)} />
              </Field>

              <Field data-invalid={!!state.fieldErrors.price}>
                <FieldLabel htmlFor="price">Price (CAD)</FieldLabel>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={0}
                  aria-invalid={!!state.fieldErrors.price}
                  disabled={isPending}
                  required
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.price)} />
              </Field>

              <Field data-invalid={!!state.fieldErrors.skillLevel}>
                <FieldLabel>Skill level</FieldLabel>
                <Select name="skillLevel" defaultValue="Open" disabled={isPending}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {skillLevelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError errors={toFieldErrors(state.fieldErrors.skillLevel)} />
              </Field>
            </div>
          </FieldGroup>

          {state.formError ? (
            <div className="text-xs/relaxed text-destructive" role="alert">
              {state.formError}
            </div>
          ) : null}
        </form>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t">
        <div className="flex items-center gap-2 text-xs/relaxed text-muted-foreground">
          <HugeiconsIcon icon={VolleyballIcon} />
          The court is validated by court-service over gRPC on submit.
        </div>
        <Button type="submit" form="create-drop-in-form" disabled={isPending || !ready}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
          {isPending ? "Creating" : "Create drop-in"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function toFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }))
}
```

- [ ] **Step 3: Create the page `src/app/(app)/drop-ins/create/page.tsx`**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CreateDropInForm } from "@/components/drop-ins/create-drop-in-form"
import { buttonVariants } from "@/components/ui/button"
import { listCourts, type Court } from "@/lib/courts"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Create drop-in | VolleyIQ",
}

export const dynamic = "force-dynamic"

export default async function CreateDropInPage() {
  let courts: Court[] = []
  try {
    courts = await listCourts()
  } catch {
    courts = []
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/drop-ins"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
            Back to drop-ins
          </Link>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Create drop-in
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {courts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No courts available. <Link href="/courts/create" className="underline">Add a court</Link> first.
          </p>
        ) : (
          <CreateDropInForm courts={courts} />
        )}
      </section>
    </main>
  )
}
```

- [ ] **Step 4: Delete the obsolete mock create route**

Run: `git rm -r "src/app/(app)/drop-ins/new"`
Expected: the `new/page.tsx` is removed.

- [ ] **Step 5: Verify build + browser**

Run: `pnpm lint && pnpm build`
Expected: both succeed.

With the stack running, open `http://localhost:3000/drop-ins/create`, pick a court, fill title + future start/end + max players, submit.
Expected: redirect to `/drop-ins/<new-id>` (created). A bad case (end before start) shows the inline field error.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(app)/drop-ins/create" src/components/drop-ins/create-drop-in-form.tsx
git commit -m "feat(frontend): create drop-in page + form + server action"
```

---

## Task 6: Detail page rewrite + RSVP

**Files:**
- Rewrite: `src/app/(app)/drop-ins/[id]/page.tsx`
- Create: `src/app/(app)/drop-ins/[id]/actions.ts`, `src/components/drop-ins/rsvp-panel.tsx`
- Keep: `src/app/(app)/drop-ins/[id]/not-found.tsx`, `loading.tsx`

- [ ] **Step 1: Create RSVP server actions `src/app/(app)/drop-ins/[id]/actions.ts`**

```ts
"use server"

import { revalidatePath } from "next/cache"

import {
  cancelRsvp,
  DropInApiError,
  rsvp,
  rsvpErrorMessage,
} from "@/lib/dropins"

export type RsvpActionResult = { ok: true } | { ok: false; error: string }

export async function rsvpAction(
  dropInId: string,
  userId: string
): Promise<RsvpActionResult> {
  try {
    await rsvp(dropInId, userId)
  } catch (error) {
    if (error instanceof DropInApiError) {
      return { ok: false, error: rsvpErrorMessage(error.status) }
    }
    throw error
  }
  revalidatePath(`/drop-ins/${dropInId}`)
  return { ok: true }
}

export async function cancelRsvpAction(
  dropInId: string,
  userId: string
): Promise<RsvpActionResult> {
  try {
    await cancelRsvp(dropInId, userId)
  } catch (error) {
    if (error instanceof DropInApiError) {
      return { ok: false, error: rsvpErrorMessage(error.status) }
    }
    throw error
  }
  revalidatePath(`/drop-ins/${dropInId}`)
  return { ok: true }
}
```

- [ ] **Step 2: Create the RSVP panel `src/components/drop-ins/rsvp-panel.tsx`**

```tsx
"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import {
  cancelRsvpAction,
  rsvpAction,
} from "@/app/(app)/drop-ins/[id]/actions"
import { Button } from "@/components/ui/button"
import { getDevPlayerId } from "@/lib/dev-identity"

export function RsvpPanel({
  dropInId,
  disabled,
}: {
  dropInId: string
  disabled: boolean
}) {
  const [userId, setUserId] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setUserId(getDevPlayerId())
  }, [])

  function handle(action: typeof rsvpAction, successMessage: string) {
    startTransition(async () => {
      const result = await action(dropInId, userId)
      if (result.ok) {
        toast.success(successMessage)
      } else {
        toast.error(result.error)
      }
    })
  }

  const ready = userId.length > 0 && !isPending

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        disabled={!ready || disabled}
        onClick={() => handle(rsvpAction, "RSVP confirmed")}
      >
        {isPending ? "Working…" : "RSVP"}
      </Button>
      <Button
        variant="outline"
        disabled={!ready}
        onClick={() => handle(cancelRsvpAction, "RSVP cancelled")}
      >
        Cancel RSVP
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Rewrite the detail page `src/app/(app)/drop-ins/[id]/page.tsx`**

Replace the entire file with:
```tsx
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AlertCircleIcon,
  ArrowLeft01Icon,
  Calendar03Icon,
  GameIcon,
  Location01Icon,
  TaskDone01Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DevPlayerBadge } from "@/components/drop-ins/dev-player-badge"
import { RsvpPanel } from "@/components/drop-ins/rsvp-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCourt } from "@/lib/courts"
import {
  DropInApiError,
  formatDateTimeRange,
  formatPrice,
  formatStatus,
  getDropIn,
} from "@/lib/dropins"
import { cn } from "@/lib/utils"

type DropInDetailPageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export default async function DropInDetailPage({ params }: DropInDetailPageProps) {
  const { id } = await params

  let dropIn
  try {
    dropIn = await getDropIn(id)
  } catch (error) {
    if (error instanceof DropInApiError && error.status === 404) {
      notFound()
    }
    throw error
  }

  const courtName = await resolveCourtName(dropIn.courtId)
  const isClosed = dropIn.status !== "OPEN"

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/drop-ins"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
            Back to drop-ins
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={dropIn.status === "OPEN" ? "default" : "secondary"}>
              {formatStatus(dropIn.status)}
            </Badge>
            <DevPlayerBadge />
          </div>
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            {dropIn.title}
          </h1>
          <p className="flex items-center gap-2 text-sm/relaxed text-muted-foreground">
            <HugeiconsIcon icon={Location01Icon} />
            {courtName}
          </p>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        {isClosed ? (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} />
            <AlertTitle>This drop-in is {formatStatus(dropIn.status).toLowerCase()}</AlertTitle>
            <AlertDescription>
              New RSVPs may be rejected by the server.
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle>Session details</CardTitle>
            {dropIn.description ? (
              <CardDescription>{dropIn.description}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={Calendar03Icon}
                label="When"
                value={formatDateTimeRange(dropIn.startTime, dropIn.endTime)}
              />
              <DetailItem
                icon={UserGroupIcon}
                label="Players"
                value={`${dropIn.confirmedPlayers}/${dropIn.maxPlayers} (${dropIn.spotsLeft} left)`}
              />
              <DetailItem
                icon={GameIcon}
                label="Price"
                value={formatPrice(dropIn.price)}
              />
              <DetailItem
                icon={VolleyballIcon}
                label="Skill level"
                value={dropIn.skillLevel ?? "Any level"}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle>Your RSVP</CardTitle>
            <CardDescription>
              RSVP as your dev player, or cancel a previous RSVP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RsvpPanel dropInId={dropIn.id} disabled={dropIn.spotsLeft === 0} />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

async function resolveCourtName(courtId: string) {
  try {
    const court = await getCourt(courtId)
    return court.name
  } catch {
    return `Court ${courtId.slice(0, 8)}…`
  }
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border bg-card p-3">
      <HugeiconsIcon icon={icon} className="shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify the `not-found.tsx` references no removed mock imports**

Run: `cat "src/app/(app)/drop-ins/[id]/not-found.tsx"`
Expected: a static not-found page. If it imports from `@/lib/mock-data`, replace those with plain text (no drop-in data needed). If it's already static, leave it.

- [ ] **Step 5: Verify build + browser**

Run: `pnpm lint && pnpm build`
Expected: both succeed.

With the stack running, open a drop-in from the list. Click **RSVP**.
Expected: a success toast; the "players" count increments after the page revalidates. Click **RSVP** again → an error toast ("already RSVP'd…"). Click **Cancel RSVP** → success toast; count decrements.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(app)/drop-ins/[id]/page.tsx" "src/app/(app)/drop-ins/[id]/actions.ts" src/components/drop-ins/rsvp-panel.tsx "src/app/(app)/drop-ins/[id]/not-found.tsx"
git commit -m "feat(frontend): real drop-in detail page + RSVP via server actions"
```

---

## Task 7: Remove mock cruft + fix references

**Files:**
- Delete: `src/app/(app)/drop-ins/[id]/signup/`, `src/app/(app)/drop-ins/[id]/success/`, `src/components/drop-ins/session-card.tsx`, `src/components/drop-ins/signup-form.tsx`

- [ ] **Step 1: Find references to the files being removed**

Run (from `services/frontend/`):
```bash
grep -rn "drop-ins/.*/signup\|/success\|session-card\|signup-form\|getDropInSessions\|getSessionSignups\|getCheckoutTotals" src --include="*.tsx" --include="*.ts"
```
Expected: a list of importers. Anything outside the files we're deleting (e.g. a link in `site-header.tsx`, `home`, or `explore/page.tsx` pointing at `/drop-ins/[id]/signup`) must be updated to point at `/drop-ins` or removed. Note each hit to fix in Step 3.

- [ ] **Step 2: Delete the mock-only files**

```bash
git rm -r "src/app/(app)/drop-ins/[id]/signup" "src/app/(app)/drop-ins/[id]/success"
git rm src/components/drop-ins/session-card.tsx src/components/drop-ins/signup-form.tsx
```

- [ ] **Step 3: Fix each reference found in Step 1**

For every importer of a deleted file: if it's a nav/link to a removed route, repoint it to `/drop-ins`; if it renders `SessionCard` from mock sessions on a page that's out of scope (e.g. `explore`), replace that usage with a link to `/drop-ins` or remove the block. Make the minimal edit that keeps the page compiling. (Do not wire those out-of-scope pages to the real backend — that's a later phase.)

- [ ] **Step 4: Verify build**

Run: `pnpm lint && pnpm build`
Expected: both succeed with no unresolved imports.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(frontend): remove mock drop-in signup/checkout cruft"
```

---

## Task 8: Final end-to-end verification

- [ ] **Step 1: Ensure the stack is running**

Run (from repo root): `docker compose up -d` (or confirm it's already up). Gateway `:8080`, frontend `:3000`.

- [ ] **Step 2: Full browser walkthrough**

At `http://localhost:3000/drop-ins`:
1. **Create:** "Create drop-in" → pick a court, future start/end, submit → lands on the detail page (HTTP 201 under the hood).
2. **List:** back to `/drop-ins` → the new drop-in appears.
3. **RSVP:** open it → RSVP → players count goes up (toast). RSVP again → error toast. Cancel → count goes down.
4. **Validation:** create with end before start → inline field error, no submit.

Expected: all four behave as described.

- [ ] **Step 3: Confirm the backend saw it (optional but recommended)**

Run (repo root): `docker compose logs --since 3m court-service dropin-service | grep -iE "gRPC GetCourt served|Drop-in created|RSVP confirmed"`
Expected: a `gRPC GetCourt served` line (court validation on create) and `Drop-in created` / `RSVP confirmed` lines.

- [ ] **Step 4: Final lint + build**

Run (from `services/frontend/`): `pnpm lint && pnpm build`
Expected: both succeed.

---

## Self-Review notes (already applied)

- **Spec coverage:** list / detail / create / RSVP+cancel, dev identity, shadcn add (textarea/sonner/alert), `getCourt`, datetime-local, removals, error handling, browser done-when — all mapped to Tasks 1–8.
- **CORS correction:** create + RSVP go through **server actions** (server-side fetch), not browser→gateway calls, so no CORS config is needed (consistent with why the courts server-component reads work).
- **Type consistency:** `DropIn`, `CreateDropInInput`, `DropInApiError`, `rsvpErrorMessage`, `RsvpActionResult`, `getDevPlayerId`, `getCourt` are defined once and reused with the same signatures across tasks.
- **Icon names** (`CalendarAdd01Icon`, `UserCircleIcon`, `ArrowLeft01Icon`, etc.) are from `@hugeicons/core-free-icons`; if any name doesn't resolve at build, swap for the nearest existing hugeicons name (the build error names the missing export).
- **Zod v4 caveat:** this project uses `zod/v4`. If `z.string().uuid()` errors at build (v4 moved string formats to top-level like `z.uuid()`), either switch to `z.uuid("…")` or relax to `z.string().min(1, "…")` — `courtId` comes from a select of real ids and `organizerUserId` from `getDevPlayerId()`, so strict UUID validation isn't load-bearing.
