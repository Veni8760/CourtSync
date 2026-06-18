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
}: {
  dropInId: string
  disabled: boolean
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

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        disabled={isPending || disabled}
        onClick={() => handle(rsvpAction, "RSVP confirmed")}
      >
        {isPending ? "Working…" : "RSVP"}
      </Button>
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() => handle(cancelRsvpAction, "RSVP cancelled")}
      >
        Cancel RSVP
      </Button>
    </div>
  )
}
