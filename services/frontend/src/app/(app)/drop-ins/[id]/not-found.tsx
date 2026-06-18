import { VolleyballIcon } from "@hugeicons/core-free-icons"

import { ResourceNotFoundState } from "@/components/layout/route-states"

export default function DropInNotFound() {
  return (
    <ResourceNotFoundState
      badge="Drop-in not found"
      title="Drop-in unavailable"
      description="This drop-in doesn't exist or has been removed."
      href="/drop-ins"
      cta="Back to drop-ins"
      icon={VolleyballIcon}
    />
  )
}
