"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import {
  cancelRsvpAction,
  rsvpAction,
} from "@/app/(app)/drop-ins/[id]/actions"
import { Button } from "@/components/ui/button"
import type { MyRsvpStatus } from "@/lib/dropins"

export function RsvpPanel({
  dropInId,
  full,
  cancelled,
  status,
}: {
  dropInId: string
  full: boolean
  cancelled: boolean
  status: MyRsvpStatus
}) {
  const [isPending, startTransition] = useTransition()

  function handle(action: typeof rsvpAction, successMessage: string) {
    startTransition(async () => {
      const result = await action(dropInId)
      if (result.ok) {
        toast.success(successMessage)
      } else {
        toast.error(result.error)
      }
    })
  }

  // After either mutation the detail page revalidates and re-renders this with a
  // fresh status, so the panel flips on its own — no client-side RSVP state.
  if (status.rsvpStatus === "CONFIRMED") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">
          You&apos;re in for this drop-in.
        </p>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => handle(cancelRsvpAction, "RSVP cancelled")}
          className="w-fit"
        >
          {isPending ? "Working…" : "Cancel RSVP"}
        </Button>
      </div>
    )
  }

  if (status.rsvpStatus === "WAITLISTED") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">
          You&apos;re #{status.waitlistPosition} on the waitlist.
        </p>
        <p className="text-sm/relaxed text-muted-foreground">
          We&apos;ll alert you the moment a spot opens up — you&apos;re moved in
          automatically, no need to check back.
        </p>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => handle(cancelRsvpAction, "Left the waitlist")}
          className="w-fit"
        >
          {isPending ? "Working…" : "Leave waitlist"}
        </Button>
      </div>
    )
  }

  // A full drop-in isn't a dead end any more: the same POST joins the waitlist.
  return (
    <div className="flex flex-col gap-2">
      {full ? (
        <p className="text-sm/relaxed text-muted-foreground">
          This drop-in is full. Join the waitlist and we&apos;ll confirm you
          automatically if someone drops out.
        </p>
      ) : null}
      <Button
        disabled={isPending || cancelled}
        onClick={() =>
          handle(
            rsvpAction,
            full ? "You're on the waitlist" : "RSVP confirmed"
          )
        }
        className="w-fit"
      >
        {isPending ? "Working…" : full ? "Join waitlist" : "RSVP"}
      </Button>
    </div>
  )
}
