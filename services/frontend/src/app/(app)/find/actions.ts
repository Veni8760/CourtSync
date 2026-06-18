"use server"

import { requireUser } from "@/lib/auth"
import {
  SearchApiError,
  searchNearbyDropIns,
  type NearbyDropIn,
  type NearbyFilters,
} from "@/lib/search"

export type NearbySearchState =
  | { status: "ok"; results: NearbyDropIn[] }
  | { status: "error"; error: string }

// The browser supplies the coordinates (map pin or geolocation); the JWT comes from
// the session cookie on the server, so the query runs server-side through the gateway.
export async function findNearby(
  latitude: number,
  longitude: number,
  radiusKm: number,
  filters: NearbyFilters = {}
): Promise<NearbySearchState> {
  await requireUser()
  try {
    const results = await searchNearbyDropIns(latitude, longitude, radiusKm, filters)
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
