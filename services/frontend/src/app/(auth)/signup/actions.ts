"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import type { AuthFormState } from "@/lib/auth-form-state"
import { createClient } from "@/lib/supabase/server"
import { upsertCurrentUserProfile } from "@/lib/users"

export async function signup(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const fullName = getString(formData, "fullName")
  const email = getString(formData, "email")
  const password = getString(formData, "password")
  const confirmPassword = getString(formData, "confirmPassword")

  if (!fullName || !email || !password || !confirmPassword) {
    return { error: "Complete every field to create your account." }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  const profile = splitFullName(fullName)
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        first_name: profile.firstName,
        last_name: profile.lastName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  const accessToken = data.session?.access_token
  if (!accessToken) {
    return { message: "Check your email to confirm your account, then sign in." }
  }

  try {
    await upsertCurrentUserProfile(profile, accessToken)
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create your profile." }
  }

  revalidatePath("/", "layout")
  redirect("/drop-ins")
}

function splitFullName(fullName: string) {
  const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/)
  const lastName = lastNameParts.join(" ")

  return {
    firstName,
    lastName: lastName.length > 0 ? lastName : null,
  }
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}
