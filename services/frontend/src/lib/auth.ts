import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user
  } catch {
    return null
  }
}

export async function getIsSignedIn() {
  return Boolean(await getCurrentUser())
}

/**
 * Redirects to /login when there's no session. Use at the top of any page or
 * action that calls a backend service — those services now require a Supabase
 * JWT, so an unauthenticated request would only get a 401.
 */
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

/**
 * The Supabase access token (JWT) for the current session, or null if signed
 * out. Sent as a Bearer token to the backend, which validates it per-service.
 */
export async function getAccessToken() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token ?? null
  } catch {
    return null
  }
}
