"use server"

import { redirect } from "next/navigation"

import { requireUser } from "@/lib/auth"
import { DropInApiError, updateDropIn } from "@/lib/dropins"
import { createDropInSchema, type CreateDropInValues } from "@/lib/drop-in-schema"

// Mirrors submitDropIn: the client validates first, we re-validate as the trust
// boundary, then PUT. Court is immutable server-side, so courtId in the payload is
// ignored. On success the redirect throws, so callers only ever see a returned error.
export async function updateDropInAction(
  id: string,
  values: CreateDropInValues
): Promise<{ error: string } | void> {
  await requireUser()

  const result = createDropInSchema.safeParse(values)
  if (!result.success) {
    return { error: "Some fields are invalid. Please check the form." }
  }

  try {
    await updateDropIn(id, result.data)
  } catch (error) {
    if (error instanceof DropInApiError) {
      return { error: error.message }
    }
    throw error
  }

  redirect(`/drop-ins/${id}`)
}
