import type { Metadata } from "next"

import { requireUser } from "@/lib/auth"

import { FindClient } from "./find-client"

export const metadata: Metadata = {
  title: "Find drop-ins — CourtSync",
}

// The search runs client-side (map pin / geolocation), so keep this dynamic.
export const dynamic = "force-dynamic"

export default async function FindPage() {
  await requireUser()
  return <FindClient />
}
