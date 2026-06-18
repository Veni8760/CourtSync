import type { Metadata } from "next"

import { requireUser } from "@/lib/auth"

import { NearMeClient } from "./near-me-client"

export const metadata: Metadata = {
  title: "Drop-ins near me | CourtSync",
  description: "Find volleyball drop-in sessions near your location.",
}

export const dynamic = "force-dynamic"

export default async function NearMePage() {
  await requireUser()
  return <NearMeClient />
}
