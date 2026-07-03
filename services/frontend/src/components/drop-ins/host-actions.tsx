"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Edit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { cancelDropInAction } from "@/app/(app)/drop-ins/[id]/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HostActions({
  dropInId,
  cancelled,
}: {
  dropInId: string
  cancelled: boolean
}) {
  const [isPending, startTransition] = useTransition()

  if (cancelled) {
    return (
      <p className="text-sm text-muted-foreground">This drop-in is cancelled.</p>
    )
  }

  function handleCancel() {
    // ponytail: window.confirm; swap for AlertDialog if branded confirmation is wanted.
    if (
      !window.confirm(
        "Cancel this drop-in? Players who RSVP'd will see it as cancelled."
      )
    ) {
      return
    }
    startTransition(async () => {
      const result = await cancelDropInAction(dropInId)
      if (result.ok) {
        toast.success("Drop-in cancelled")
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/drop-ins/${dropInId}/edit`}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
        Edit
      </Link>
      <Button variant="destructive" disabled={isPending} onClick={handleCancel}>
        {isPending ? "Working…" : "Cancel drop-in"}
      </Button>
    </div>
  )
}
