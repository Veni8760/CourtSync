"use server"

import { revalidatePath } from "next/cache"

import {
  cancelRsvp,
  DropInApiError,
  rsvp,
  rsvpErrorMessage,
} from "@/lib/dropins"

export type RsvpActionResult = { ok: true } | { ok: false; error: string }

export async function rsvpAction(
  dropInId: string,
  userId: string
): Promise<RsvpActionResult> {
  try {
    await rsvp(dropInId, userId)
  } catch (error) {
    if (error instanceof DropInApiError) {
      return { ok: false, error: rsvpErrorMessage(error.status) }
    }
    throw error
  }
  revalidatePath(`/drop-ins/${dropInId}`)
  return { ok: true }
}

export async function cancelRsvpAction(
  dropInId: string,
  userId: string
): Promise<RsvpActionResult> {
  try {
    await cancelRsvp(dropInId, userId)
  } catch (error) {
    if (error instanceof DropInApiError) {
      return { ok: false, error: rsvpErrorMessage(error.status) }
    }
    throw error
  }
  revalidatePath(`/drop-ins/${dropInId}`)
  return { ok: true }
}
