"use client"

import { UserCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { useDevPlayerId } from "@/lib/dev-identity"

export function DevPlayerBadge() {
  const playerId = useDevPlayerId()

  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <HugeiconsIcon icon={UserCircleIcon} />
      You (dev player) · {playerId ? `${playerId.slice(0, 8)}…` : "…"}
    </Badge>
  )
}
