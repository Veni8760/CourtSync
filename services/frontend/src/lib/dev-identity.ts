import { useSyncExternalStore } from "react"

const STORAGE_KEY = "courtsync.dev-player-id"

/**
 * No auth yet: a stable per-browser UUID stands in for the logged-in user.
 * Used as organizerUserId (create) and userId (RSVP). Client-only — calling this
 * during SSR throws, so read it through {@link useDevPlayerId} (or inside an effect).
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

// The id is fixed per browser, so there is nothing external to subscribe to.
const subscribe = () => () => {}

/**
 * Client hook for the dev player id. Returns `null` on the server and the first
 * client render (so SSR and hydration match), then the id. Uses
 * useSyncExternalStore so we never call setState inside an effect.
 */
export function useDevPlayerId(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => getDevPlayerId(),
    () => null
  )
}
