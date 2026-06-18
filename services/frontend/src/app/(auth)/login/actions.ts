"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import type { AuthFormState } from "@/lib/auth-form-state"
import { createClient } from "@/lib/supabase/server"
import { upsertCurrentUserProfile } from "@/lib/users"

export async function login(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = getString(formData, "email")
  const password = getString(formData, "password")

  if (!email || !password) {
    return { error: "Enter your email and password." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const accessToken = data.session?.access_token
  if (!accessToken) {
    return { error: "Supabase did not return a session for this sign in." }
  }

  try {
    await upsertCurrentUserProfile({}, accessToken)
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not update your profile." }
  }

  revalidatePath("/", "layout")
  redirect("/find")
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}
