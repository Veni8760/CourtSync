// Geocoding via OpenStreetMap's Nominatim — free, no API key.
// ponytail: plain fetch, no SDK. Nominatim's usage policy asks for <=1 req/s and a
// descriptive User-Agent/Referer; fine for a dev/demo project. Swap for a paid
// geocoder only if this ever ships at real volume.

const NOMINATIM = "https://nominatim.openstreetmap.org"

export type GeoPlace = {
  label: string
  latitude: number
  longitude: number
}

/** Forward geocode a city / neighborhood / ZIP query to the top match, or null. */
export async function geocode(query: string): Promise<GeoPlace | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  const url = `${NOMINATIM}/search?format=jsonv2&limit=1&q=${encodeURIComponent(trimmed)}`
  const places = await fetchJson<NominatimPlace[]>(url)
  const place = places?.[0]
  if (!place) return null

  return {
    label: shortLabel(place.display_name),
    latitude: Number(place.lat),
    longitude: Number(place.lon),
  }
}

/** Reverse geocode a point to a short "City, Region" label for the location chip. */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  const place = await fetchJson<NominatimPlace>(url)
  return place ? shortLabel(place.display_name) : null
}

type NominatimPlace = { display_name: string; lat: string; lon: string }

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

// Nominatim returns a long comma path ("Toronto, Golden Horseshoe, Ontario, Canada");
// keep the first part plus the region for a compact chip.
function shortLabel(displayName: string): string {
  const parts = displayName.split(",").map((part) => part.trim())
  if (parts.length <= 2) return displayName
  const city = parts[0]
  const region = parts[parts.length - 2] // usually the province/state
  return `${city}, ${region}`
}
