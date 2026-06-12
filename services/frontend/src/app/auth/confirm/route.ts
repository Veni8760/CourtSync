import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"
import { upsertCurrentUserProfile, type CurrentUserProfileInput } from "@/lib/users"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null
  const next = requestUrl.searchParams.get("next") ?? "/drop-ins"
  const redirectTo = new URL(next, requestUrl.origin)

  if (tokenHash && type) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (!error) {
      const accessToken = data.session?.access_token
      if (accessToken) {
        await upsertCurrentUserProfile(
          profileFromMetadata(data.user?.user_metadata),
          accessToken
        )
      }
      return NextResponse.redirect(redirectTo, 303)
    }
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin), 303)
}

function profileFromMetadata(metadata: unknown): CurrentUserProfileInput {
  if (!metadata || typeof metadata !== "object") {
    return {}
  }

  const values = metadata as Record<string, unknown>
  return {
    firstName: getStringOrNull(values.first_name),
    lastName: getStringOrNull(values.last_name),
  }
}

function getStringOrNull(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null
}
