"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import {
  cancelRsvpAction,
  rsvpAction,
} from "@/app/(app)/drop-ins/[id]/actions"
import { Button } from "@/components/ui/button"

export function RsvpPanel({
  dropInId,
  disabled,
  hasRsvp,
}: {
  dropInId: string
  disabled: boolean
  hasRsvp: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handle(
    action: typeof rsvpAction,
    successMessage: string
  ) {
    startTransition(async () => {
      const result = await action(dropInId)
      if (result.ok) {
        toast.success(successMessage)
      } else {
        toast.error(result.error)
      }
    })
  }

  // Already in → the only action is to cancel. (After either mutation the detail
  // page revalidates and re-renders this with the fresh hasRsvp, so the button
  // flips on its own — no client-side RSVP state to keep in sync.)
  if (hasRsvp) {
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

  return (
    <Button
      disabled={isPending || disabled}
      onClick={() => handle(rsvpAction, "RSVP confirmed")}
    >
      {isPending ? "Working…" : "RSVP"}
    </Button>
  )
}
