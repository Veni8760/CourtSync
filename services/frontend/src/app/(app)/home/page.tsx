import type { Metadata } from "next"

import { requireUser } from "@/lib/auth"
import { HomeHub } from "@/components/home/home-hub"

export const metadata: Metadata = {
  title: "Home — CourtSync",
}

function displayName(email: string | undefined) {
  if (!email) return "player"
  const local = email.split("@")[0].split(/[._-]/)[0]
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export default async function HomePage() {
  const user = await requireUser()
  return <HomeHub name={displayName(user.email)} />
}
