"use client"

import { useState } from "react"
import {
  ChampionIcon,
  Medal01Icon,
  UserAdd01Icon,
  UserCheck01Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  toggleCommunityFollow,
  type Community,
  type LeaderboardEntry,
} from "@/lib/mock-data"

type CommunityDashboardProps = {
  community: Community
  leaderboard: LeaderboardEntry[]
}

export function CommunityDashboard({
  community: initialCommunity,
  leaderboard,
}: CommunityDashboardProps) {
  const [community, setCommunity] = useState(initialCommunity)

  function handleFollowToggle() {
    const updatedCommunity = toggleCommunityFollow(community.id)

    if (updatedCommunity) {
      setCommunity(updatedCommunity)
    }
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="relative overflow-hidden bg-background">
        <div
          className="h-56 bg-cover bg-center sm:h-72"
          style={{ backgroundImage: `url(${community.coverImage})` }}
        />
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/20 to-black/60 sm:h-72" />
        <div className="relative mx-auto -mt-28 flex w-full max-w-6xl flex-col gap-5 px-4 pb-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 rounded-lg border bg-background/95 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={VolleyballIcon} />
                </span>
                <div className="min-w-0">
                  <Badge variant="secondary" className="mb-2">
                    Official community
                  </Badge>
                  <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                    {community.name}
                  </h1>
                </div>
              </div>
              <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
                {community.description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  className="text-muted-foreground"
                />
                <div>
                  <div className="text-sm font-semibold">
                    {community.followerCount.toLocaleString()}
                  </div>
                  <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
                    Followers
                  </div>
                </div>
              </div>
              <Button
                variant={
                  community.isFollowedByCurrentUser ? "outline" : "default"
                }
                size="lg"
                onClick={handleFollowToggle}
                aria-pressed={community.isFollowedByCurrentUser}
              >
                <HugeiconsIcon
                  icon={
                    community.isFollowedByCurrentUser
                      ? UserCheck01Icon
                      : UserAdd01Icon
                  }
                  data-icon="inline-start"
                />
                {community.isFollowedByCurrentUser ? "Unfollow" : "Follow"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="drop-ins" className="gap-5">
          <TabsList className="w-full justify-start overflow-x-auto" variant="line">
            <TabsTrigger value="drop-ins">Drop-ins</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="drop-ins" className="flex flex-col gap-4">
            <Empty className="border bg-background">
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={VolleyballIcon} />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No drop-ins posted yet</EmptyTitle>
                <EmptyDescription>
                  This community has not published an official session.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TabsContent>

          <TabsContent value="tournaments">
            <Empty className="min-h-72 border bg-background">
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={ChampionIcon} />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No upcoming tournaments</EmptyTitle>
                <EmptyDescription>
                  Tournament support is planned for a later CourtSync phase.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </TabsContent>

          <TabsContent value="leaderboard">
            <div className="overflow-hidden rounded-lg border bg-background">
              <div className="flex items-center justify-between gap-4 border-b p-4">
                <div>
                  <h2 className="font-heading text-lg font-semibold">
                    Community leaderboard
                  </h2>
                  <p className="text-xs/relaxed text-muted-foreground">
                    Ratings are scoped to official sessions in this community.
                  </p>
                </div>
                <Badge variant="outline">{leaderboard.length} players</Badge>
              </div>
              <div className="divide-y">
                {leaderboard.map((entry) => (
                  <LeaderboardRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4 sm:grid-cols-[auto_1fr_auto_auto]">
      <span className="flex size-9 items-center justify-center rounded-md bg-muted font-heading text-sm font-semibold">
        {entry.rank === 1 ? (
          <HugeiconsIcon icon={ChampionIcon} />
        ) : entry.rank <= 3 ? (
          <HugeiconsIcon icon={Medal01Icon} />
        ) : (
          entry.rank
        )}
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{entry.playerName}</div>
        <div className="text-xs/relaxed text-muted-foreground">
          {entry.wins}W - {entry.losses}L
        </div>
      </div>
      <div className="text-right">
        <div className="font-heading text-lg font-semibold">{entry.rating}</div>
        <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
          ELO
        </div>
      </div>
    </div>
  )
}
