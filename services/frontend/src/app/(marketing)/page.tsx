import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LandingPage } from "@/components/marketing/landing-page"
import { getIsSignedIn } from "@/lib/auth"
import {
  getAllDropInSessions,
  getCommunities,
  getGlobalLeaderboard,
} from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "VolleyIQ | Volleyball drop-in management",
  description:
    "Run volleyball drop-ins without spreadsheet chaos. Publish sessions, fill rosters, balance games, and track player profiles.",
}

export default async function MarketingPage() {
  const isSignedIn = await getIsSignedIn()

  if (isSignedIn) {
    redirect("/home")
  }

  const sessions = getAllDropInSessions().sort(
    (sessionA, sessionB) =>
      new Date(sessionA.startsAt).getTime() -
      new Date(sessionB.startsAt).getTime()
  )
  const communities = getCommunities()
  const leaderboard = getGlobalLeaderboard()
  const openSessions = sessions.filter((session) => session.status !== "Full")

  return (
    <LandingPage
      sessionsCount={sessions.length}
      openSessionsCount={openSessions.length}
      totalPlayers={leaderboard.length}
      communitiesCount={communities.length}
      previewSessions={sessions.slice(0, 4)}
      previewPlayers={leaderboard.slice(0, 4)}
      previewCommunities={communities.map((community) => ({
        id: community.id,
        name: community.name,
        followerCount: community.followerCount,
      }))}
    />
  )
}
