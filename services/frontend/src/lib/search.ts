import { apiBaseUrl, authHeaders } from "@/lib/api"

export type NearbyDropIn = {
  id: string
  title: string | null
  courtId: string
  city: string | null
  latitude: number
  longitude: number
  distanceKm: number
  price: number | null
  skillLevel: string | null
  startTime: string
}

export class SearchApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = "SearchApiError"
  }
}

// Server-side: queries the geo-search endpoint through the gateway with the
// caller's Supabase JWT. Browser geolocation supplies lat/lng (see the near-me page).
export async function searchNearbyDropIns(
  lat: number,
  lng: number,
  radiusKm: number
) {
  const qs = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusKm: String(radiusKm),
  })
  const response = await fetch(`${apiBaseUrl()}/search/drop-ins?${qs}`, {
    headers: await authHeaders(),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new SearchApiError(await getErrorMessage(response), response.status)
  }
  return response.json() as Promise<NearbyDropIn[]>
}

async function getErrorMessage(response: Response) {
  const fallback = `Search request failed with ${response.status}`
  try {
    const body = (await response.json()) as { detail?: unknown; message?: unknown }
    const message =
      typeof body.detail === "string"
        ? body.detail
        : typeof body.message === "string"
          ? body.message
          : fallback
    return message
  } catch {
    return fallback
  }
}
