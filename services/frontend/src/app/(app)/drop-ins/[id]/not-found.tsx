import { VolleyballIcon } from "@hugeicons/core-free-icons"

import { ResourceNotFoundState } from "@/components/layout/route-states"

export default function DropInNotFound() {
  return (
    <ResourceNotFoundState
      badge="Session not found"
      title="Drop-in unavailable"
      description="This pickup session is not in the current VolleyIQ mock schedule."
      href="/explore"
      cta="Explore games"
      icon={VolleyballIcon}
    />
  )
}
