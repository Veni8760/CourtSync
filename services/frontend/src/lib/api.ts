import { getAccessToken } from "@/lib/auth"

// Resolve the API gateway base URL, trailing slashes stripped.
export function apiBaseUrl() {
  const baseUrl =
    process.env.COURTSYNC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080/api"

  return baseUrl.replace(/\/+$/, "")
}

// Attaches the Supabase JWT (when signed in) so backend services accept the request.
export async function authHeaders(extra?: Record<string, string>) {
  const token = await getAccessToken()
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
