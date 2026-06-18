"use server"

import { redirect } from "next/navigation"
import { z } from "zod/v4"

import { requireUser } from "@/lib/auth"
import { createDropIn, DropInApiError } from "@/lib/dropins"

const createDropInSchema = z
  .object({
    courtId: z.string().min(1, "Select a court."),
    title: z.string().trim().min(1, "Title is required.").max(255),
    description: optionalTrimmedString(2000),
    startTime: isoDateTime("Start time is required."),
    endTime: isoDateTime("End time is required."),
    maxPlayers: z.coerce
      .number()
      .int("Whole number only.")
      .min(1, "At least 1 player."),
    price: z.coerce.number().min(0, "Price can't be negative."),
    skillLevel: optionalTrimmedString(50),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time.",
    path: ["endTime"],
  })

export type CreateDropInFormState = {
  formError: string | null
  fieldErrors: Partial<
    Record<keyof z.input<typeof createDropInSchema>, string[]>
  >
}

export async function createDropInAction(
  _state: CreateDropInFormState,
  formData: FormData
): Promise<CreateDropInFormState> {
  await requireUser()
  const result = createDropInSchema.safeParse({
    courtId: formData.get("courtId"),
    title: formData.get("title"),
    description: formData.get("description"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    maxPlayers: formData.get("maxPlayers"),
    price: formData.get("price"),
    skillLevel: formData.get("skillLevel"),
  })

  if (!result.success) {
    return { formError: null, fieldErrors: result.error.flatten().fieldErrors }
  }

  let created
  try {
    created = await createDropIn(result.data)
  } catch (error) {
    if (error instanceof DropInApiError) {
      return { formError: error.message, fieldErrors: {} }
    }
    throw error
  }

  redirect(`/drop-ins/${created.id}`)
}

function optionalTrimmedString(max: number) {
  return z.preprocess((value) => {
    if (typeof value !== "string") return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }, z.string().max(max).optional())
}

function isoDateTime(requiredMessage: string) {
  return z.preprocess((value) => {
    if (typeof value !== "string" || value.trim().length === 0) return undefined
    // <input type="datetime-local"> gives "YYYY-MM-DDTHH:mm" (local, no zone).
    // Convert to a full ISO instant the backend (Instant) accepts.
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toISOString()
  }, z.string({ error: requiredMessage }).min(1, requiredMessage))
}
