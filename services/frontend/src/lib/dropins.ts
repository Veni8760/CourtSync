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
