import { apiBaseUrl, authHeaders } from "@/lib/api"

export const dropInStatusValues = ["OPEN", "FULL", "CANCELLED"] as const
export type DropInStatus = (typeof dropInStatusValues)[number]

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
  const response = await fetch(dropInApiUrl("/drop-ins"), {
    headers: await authHeaders(),
    cache: "no-store",
  })
  return readDropInApiResponse<DropIn[]>(response)
}

export async function getDropIn(id: string) {
  const response = await fetch(dropInApiUrl(`/drop-ins/${id}`), {
    headers: await authHeaders(),
    cache: "no-store",
  })
  return readDropInApiResponse<DropIn>(response)
}

// Drop-ins the signed-in user has a CONFIRMED RSVP for. WHO comes from the JWT.
export async function listMyRsvps() {
  const response = await fetch(dropInApiUrl("/drop-ins/rsvps/me"), {
    headers: await authHeaders(),
    cache: "no-store",
  })
  return readDropInApiResponse<DropIn[]>(response)
}

// Drop-ins the signed-in user organizes.
export async function listMyHostedDropIns() {
  const response = await fetch(dropInApiUrl("/drop-ins/hosted"), {
    headers: await authHeaders(),
    cache: "no-store",
  })
  return readDropInApiResponse<DropIn[]>(response)
}

// Whether the signed-in user already holds a CONFIRMED RSVP for this drop-in —
// lets the detail page render one correct action instead of both buttons.
export async function getMyRsvpStatus(dropInId: string) {
  const response = await fetch(dropInApiUrl(`/drop-ins/${dropInId}/rsvp/me`), {
    headers: await authHeaders(),
    cache: "no-store",
  })
  return readDropInApiResponse<{ hasRsvp: boolean }>(response)
}

export async function createDropIn(input: CreateDropInInput) {
  const response = await fetch(dropInApiUrl("/drop-ins"), {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
    cache: "no-store",
  })
  return readDropInApiResponse<DropIn>(response)
}

// WHO is RSVPing comes from the JWT on the backend — no userId here.
export async function rsvp(dropInId: string) {
  const response = await fetch(dropInApiUrl(`/drop-ins/${dropInId}/rsvp`), {
    method: "POST",
    headers: await authHeaders(),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new DropInApiError(await getErrorMessage(response), response.status)
  }
}

export async function cancelRsvp(dropInId: string) {
  const response = await fetch(dropInApiUrl(`/drop-ins/${dropInId}/rsvp`), {
    method: "DELETE",
    headers: await authHeaders(),
    cache: "no-store",
  })
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
  return `${apiBaseUrl()}${path}`
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
      detail?: unknown
      message?: unknown
      error?: unknown
    }
    // Backends return RFC 9457 problem+json (detail); message/error cover legacy shapes.
    const message =
      typeof body.detail === "string"
        ? body.detail
        : typeof body.message === "string"
          ? body.message
          : body.error
    return typeof message === "string" ? message : fallback
  } catch {
    return fallback
  }
}
