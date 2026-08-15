import { apiBaseUrl, authHeaders } from "@/lib/api"

// Mirrors notification-service's AlertType. Alerts are derived from Kafka events;
// there is deliberately no "create alert" call here.
export const alertTypeValues = [
  "RSVP_CONFIRMED",
  "WAITLISTED",
  "PROMOTED",
  "DROP_IN_CANCELLED",
] as const
export type AlertType = (typeof alertTypeValues)[number]

export type PlayerAlert = {
  id: string
  dropInId: string
  type: AlertType
  message: string
  read: boolean
  createdAt: string
}

export class AlertApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = "AlertApiError"
  }
}

// The signed-in user's 50 most recent alerts. WHOSE feed comes from the JWT.
export async function listAlerts() {
  const response = await fetch(alertApiUrl("/alerts"), {
    headers: await authHeaders(),
    cache: "no-store",
  })
  return readAlertApiResponse<PlayerAlert[]>(response)
}

// The bell badge. Backed by a Redis cache on the service side, so this is cheap
// enough to call on every authenticated page render.
export async function getUnreadAlertCount() {
  const response = await fetch(alertApiUrl("/alerts/unread-count"), {
    headers: await authHeaders(),
    cache: "no-store",
  })
  return readAlertApiResponse<{ unread: number }>(response)
}

export async function markAlertRead(id: string) {
  const response = await fetch(alertApiUrl(`/alerts/${id}/read`), {
    method: "POST",
    headers: await authHeaders(),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new AlertApiError(await getErrorMessage(response), response.status)
  }
}

export async function markAllAlertsRead() {
  const response = await fetch(alertApiUrl("/alerts/read-all"), {
    method: "POST",
    headers: await authHeaders(),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new AlertApiError(await getErrorMessage(response), response.status)
  }
}

function alertApiUrl(path: string) {
  return `${apiBaseUrl()}${path}`
}

async function readAlertApiResponse<T>(response: Response) {
  if (response.ok) {
    return response.json() as Promise<T>
  }
  throw new AlertApiError(await getErrorMessage(response), response.status)
}

async function getErrorMessage(response: Response) {
  const fallback = `Alert API request failed with ${response.status}`
  try {
    const body = (await response.json()) as { detail?: unknown; message?: unknown }
    // Backends return RFC 9457 problem+json (detail); message covers legacy shapes.
    const message =
      typeof body.detail === "string"
        ? body.detail
        : typeof body.message === "string"
          ? body.message
          : undefined
    return message ?? fallback
  } catch {
    return fallback
  }
}
