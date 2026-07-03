"use server"

import { revalidatePath } from "next/cache"

import { requireUser } from "@/lib/auth"
import {
  cancelDropIn,
  cancelRsvp,
  DropInApiError,
  rsvp,
  rsvpErrorMessage,
} from "@/lib/dropins"

export type RsvpActionResult = { ok: true } | { ok: false; error: string }

export async function rsvpAction(
  dropInId: string
): Promise<RsvpActionResult> {
  await requireUser()
  try {
    await rsvp(dropInId)
  } catch (error) {
    if (error instanceof DropInApiError) {
      return { ok: false, error: rsvpErrorMessage(error.status) }
    }
    throw error
  }
  revalidatePath(`/drop-ins/${dropInId}`)
  return { ok: true }
}

// Organizer-only soft-cancel of the whole drop-in (not an RSVP). The backend
// enforces ownership from the JWT; a non-owner gets a 403 surfaced as an error toast.
export async function cancelDropInAction(
  dropInId: string
): Promise<RsvpActionResult> {
  await requireUser()
  try {
    await cancelDropIn(dropInId)
  } catch (error) {
    if (error instanceof DropInApiError) {
      return { ok: false, error: error.message }
    }
    throw error
  }
  revalidatePath(`/drop-ins/${dropInId}`)
  return { ok: true }
}

export async function cancelRsvpAction(
  dropInId: string
): Promise<RsvpActionResult> {
  await requireUser()
  try {
    await cancelRsvp(dropInId)
  } catch (error) {
    if (error instanceof DropInApiError) {
      // 404 on cancel means "you had no active RSVP" — not a missing drop-in.
      const message =
        error.status === 404
          ? "You had no active RSVP to cancel."
          : rsvpErrorMessage(error.status)
      return { ok: false, error: message }
    }
    throw error
  }
  revalidatePath(`/drop-ins/${dropInId}`)
  return { ok: true }
}
