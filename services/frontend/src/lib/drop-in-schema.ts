import { z } from "zod/v4"

// Shared by the client form (react-hook-form resolver) and the server action, so
// both validate identically. The datetime preprocess turns the <input
// type="datetime-local"> string ("YYYY-MM-DDTHH:mm", local) into a full ISO instant
// the backend accepts — the parsed output carries ISO, the input keeps the raw string.

export const createDropInSchema = z
  .object({
    courtId: z.string().min(1, "Select a court."),
    title: z.string().trim().min(1, "Title is required.").max(255),
    description: optionalTrimmedString(2000),
    startTime: isoDateTime("Start time is required."),
    endTime: isoDateTime("End time is required."),
    maxPlayers: z.coerce.number().int("Whole number only.").min(1, "At least 1 player."),
    price: z.coerce.number().min(0, "Price can't be negative."),
    skillLevel: optionalTrimmedString(50),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "End time must be after start time.",
    path: ["endTime"],
  })

export type CreateDropInInput = z.input<typeof createDropInSchema>
export type CreateDropInValues = z.output<typeof createDropInSchema>

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
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toISOString()
  }, z.string({ error: requiredMessage }).min(1, requiredMessage))
}
