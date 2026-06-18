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
