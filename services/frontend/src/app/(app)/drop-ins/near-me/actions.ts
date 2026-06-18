"use server"

import { requireUser } from "@/lib/auth"
import {
  SearchApiError,
  searchNearbyDropIns,
  type NearbyDropIn,
  type NearbyFilters,
} from "@/lib/search"

export type NearbySearchState =
  | { status: "idle" }
  | { status: "ok"; results: NearbyDropIn[] }
  | { status: "error"; error: string }

// Browser supplies the coordinates (geolocation); the JWT comes from the session
// cookie on the server, so the query runs server-side through the gateway.
export async function findNearby(
  lat: number,
  lng: number,
  radiusKm: number,
  filters: NearbyFilters = {}
): Promise<NearbySearchState> {
  await requireUser()
  try {
    const results = await searchNearbyDropIns(lat, lng, radiusKm, filters)
    return { status: "ok", results }
  } catch (error) {
    return {
      status: "error",
      error:
        error instanceof SearchApiError
          ? error.message
          : "Search failed. Please try again.",
    }
  }
}
