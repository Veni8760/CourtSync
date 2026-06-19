"use server"

import { redirect } from "next/navigation"

import { requireUser } from "@/lib/auth"
import { createDropIn, DropInApiError } from "@/lib/dropins"
import { createDropInSchema, type CreateDropInValues } from "@/lib/drop-in-schema"

// Client (react-hook-form) validates first; we re-validate here as the trust-boundary
// backstop — never trust the client. On success the redirect throws, so callers only
// ever see a returned error.
export async function submitDropIn(
  values: CreateDropInValues
): Promise<{ error: string } | void> {
  await requireUser()

  const result = createDropInSchema.safeParse(values)
  if (!result.success) {
    return { error: "Some fields are invalid. Please check the form." }
  }

  let created
  try {
    created = await createDropIn(result.data)
  } catch (error) {
    if (error instanceof DropInApiError) {
      return { error: error.message }
    }
    throw error
  }

  redirect(`/drop-ins/${created.id}`)
}
