import { UserGroupIcon } from "@hugeicons/core-free-icons"

import { ResourceNotFoundState } from "@/components/layout/route-states"

export default function PlayerNotFound() {
  return (
    <ResourceNotFoundState
      badge="Player not found"
      title="Player profile unavailable"
      description="This player profile is not in the current VolleyIQ mock roster."
      href="/leaderboard"
      cta="View leaderboard"
      icon={UserGroupIcon}
    />
  )
}
