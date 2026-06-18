"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import {
  cancelRsvpAction,
  rsvpAction,
} from "@/app/(app)/drop-ins/[id]/actions"
import { Button } from "@/components/ui/button"
import { useDevPlayerId } from "@/lib/dev-identity"

export function RsvpPanel({
  dropInId,
  disabled,
}: {
  dropInId: string
  disabled: boolean
}) {
  const userId = useDevPlayerId()
  const [isPending, startTransition] = useTransition()

  function handle(
    action: typeof rsvpAction,
    successMessage: string
  ) {
    if (!userId) return
    startTransition(async () => {
      const result = await action(dropInId, userId)
      if (result.ok) {
        toast.success(successMessage)
      } else {
        toast.error(result.error)
      }
    })
  }

  const ready = userId !== null && !isPending

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        disabled={!ready || disabled}
        onClick={() => handle(rsvpAction, "RSVP confirmed")}
      >
        {isPending ? "Working…" : "RSVP"}
      </Button>
      <Button
        variant="outline"
        disabled={!ready}
        onClick={() => handle(cancelRsvpAction, "RSVP cancelled")}
      >
        Cancel RSVP
      </Button>
    </div>
  )
}
