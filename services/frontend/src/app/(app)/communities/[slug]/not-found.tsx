import { UserGroupIcon } from "@hugeicons/core-free-icons"

import { ResourceNotFoundState } from "@/components/layout/route-states"

export default function CommunityNotFound() {
  return (
    <ResourceNotFoundState
      badge="Community not found"
      title="Community unavailable"
      description="This community is not in the current CourtSync mock directory."
      href="/explore"
      cta="Explore communities"
      icon={UserGroupIcon}
    />
  )
}
