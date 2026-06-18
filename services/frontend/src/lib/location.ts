"use client"

import { useCallback, useSyncExternalStore } from "react"

// The chosen search location lives only on the client (the map picker writes it,
// the find screen reads it). ponytail: persisted in localStorage, not the backend —
// it's a UI preference, not data anyone else needs. Read via useSyncExternalStore so
// it's hydration-safe and doesn't setState-in-effect.

export type SearchLocation = {
  latitude: number
  longitude: number
  radiusKm: number
  label: string
}

// Downtown Toronto — the fallback so the page always shows something before the
// user grants geolocation or picks a spot.
export const DEFAULT_LOCATION: SearchLocation = {
  latitude: 43.6532,
  longitude: -79.3832,
  radiusKm: 10,
  label: "Toronto, Ontario",
}

export const RADIUS_OPTIONS = [5, 10, 25, 50] as const

const STORAGE_KEY = "courtsync.searchLocation"

// getSnapshot must return a stable reference while the stored value is unchanged,
// or useSyncExternalStore loops — so cache the parsed object keyed on the raw string.
let cache: { raw: string | null; value: SearchLocation } = {
  raw: null,
  value: DEFAULT_LOCATION,
}

const listeners = new Set<() => void>()

function getSnapshot(): SearchLocation {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === cache.raw) return cache.value

  let value = DEFAULT_LOCATION
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<SearchLocation>
      if (
        typeof parsed.latitude === "number" &&
        typeof parsed.longitude === "number"
      ) {
        value = { ...DEFAULT_LOCATION, ...parsed } as SearchLocation
      }
    } catch {
      // corrupt entry — fall back to default
    }
  }
  cache = { raw, value }
  return value
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener("storage", callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", callback)
  }
}

export function useSearchLocation() {
  const location = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => DEFAULT_LOCATION // server snapshot (stable ref)
  )

  const setLocation = useCallback((next: SearchLocation) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // private mode / quota — notify anyway so the in-memory snapshot updates.
    }
    listeners.forEach((listener) => listener())
  }, [])

  // `ready` is always true: useSyncExternalStore hands back the stored value on the
  // first client render, so the find screen never queries against a stale default.
  return { location, setLocation, ready: true }
}
