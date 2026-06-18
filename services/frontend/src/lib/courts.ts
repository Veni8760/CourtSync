import { getAccessToken } from "@/lib/auth"
import {
  netHeightOptions,
  surfaceOptions,
  type NetHeight,
  type Surface,
} from "@/lib/form-options"

export type { NetHeight, Surface }

export type Court = {
  id: string
  name: string
  address: string | null
  city: string | null
  province: string | null
  latitude: number | null
  longitude: number | null
  surface: Surface
  netHeight: NetHeight
  createdAt: string
  updatedAt: string
}

export type CreateCourtInput = {
  name: string
  address?: string
  city?: string
  province?: string
  latitude?: number
  longitude?: number
  surface: Surface
  netHeight: NetHeight
}

export class CourtApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = "CourtApiError"
  }
}

export async function listCourts() {
  const response = await fetch(courtApiUrl("/courts"), {
    headers: await authHeaders(),
    cache: "no-store",
  })

  return readCourtApiResponse<Court[]>(response)
}

export async function getCourt(id: string) {
  const response = await fetch(courtApiUrl(`/courts/${id}`), {
    headers: await authHeaders(),
    cache: "no-store",
  })

  return readCourtApiResponse<Court>(response)
}

export async function createCourt(input: CreateCourtInput) {
  const response = await fetch(courtApiUrl("/courts"), {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
    cache: "no-store",
  })

  return readCourtApiResponse<Court>(response)
}

export function formatSurface(surface: Surface) {
  return (
    surfaceOptions.find((option) => option.value === surface)?.label ?? surface
  )
}

export function formatNetHeight(netHeight: NetHeight) {
  return (
    netHeightOptions.find((option) => option.value === netHeight)?.label ??
    netHeight
  )
}

function courtApiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`
}

// Attaches the Supabase JWT (when signed in) so court-service accepts the request.
async function authHeaders(extra?: Record<string, string>) {
  const token = await getAccessToken()
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function getApiBaseUrl() {
  const baseUrl =
    process.env.COURTSYNC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080/api"

  return baseUrl.replace(/\/+$/, "")
}

async function readCourtApiResponse<T>(response: Response) {
  if (response.ok) {
    return response.json() as Promise<T>
  }

  throw new CourtApiError(await getErrorMessage(response), response.status)
}

async function getErrorMessage(response: Response) {
  const fallback = `Court API request failed with ${response.status}`

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
