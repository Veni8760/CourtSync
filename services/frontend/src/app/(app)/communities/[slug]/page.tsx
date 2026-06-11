import { notFound } from "next/navigation"

import { CommunityDashboard } from "./community-dashboard"
import {
  getCommunities,
  getCommunityBySlug,
  getLeaderboardByCommunity,
} from "@/lib/mock-data"

type CommunityPageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return getCommunities().map((community) => ({
    slug: community.slug,
  }))
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { slug } = await params
  const community = getCommunityBySlug(slug)

  if (!community) {
    notFound()
  }

  return (
    <CommunityDashboard
      community={community}
      leaderboard={getLeaderboardByCommunity(community.id)}
    />
  )
}
