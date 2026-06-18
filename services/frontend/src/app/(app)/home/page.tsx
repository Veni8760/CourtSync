import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  Calendar03Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { HeroSection } from "@/components/home/hero-section"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/auth"
import {
  getAllDropInSessions,
  getCommunities,
  getGlobalLeaderboard,
  type DropInSession,
  type GlobalLeaderboardEntry,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Home | CourtSync",
  description: "Manage your CourtSync drop-ins, communities, and players.",
}

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat("en-CA", {
  hour: "numeric",
  minute: "2-digit",
})

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const sessions = getAllDropInSessions()
    .sort(
      (sessionA, sessionB) =>
        new Date(sessionA.startsAt).getTime() -
        new Date(sessionB.startsAt).getTime()
    )
    .slice(0, 3)
  const communities = getCommunities()
  const leaderboard = getGlobalLeaderboard().slice(0, 3)
  const openSessions = sessions.filter((session) => session.status !== "Full")
  const totalPlayers = getGlobalLeaderboard().length

  return (
    <main className="min-h-screen bg-muted/30">
      <HeroSection
        sessionsCount={sessions.length}
        openSessionsCount={openSessions.length}
        totalPlayers={totalPlayers}
      />

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <UpcomingSessionsCard sessions={sessions} />
        <div className="flex flex-col gap-5">
          <CommunitiesCard count={communities.length} />
          <LeaderboardCard entries={leaderboard} />
        </div>
      </section>
    </main>
  )
}

function UpcomingSessionsCard({ sessions }: { sessions: DropInSession[] }) {
  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>Next sessions</CardTitle>
          <CardDescription>
            Fast path into the live pickup schedule.
          </CardDescription>
        </div>
        <CardAction>
          <Link
            href="/explore"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Browse all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SessionPreviewRow key={session.id} session={session} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SessionPreviewRow({ session }: { session: DropInSession }) {
  const startsAt = new Date(session.startsAt)
  const spotsLeft = Math.max(session.maxPlayers - session.registeredPlayers, 0)

  return (
    <Link
      href={`/drop-ins/${session.id}`}
      className="grid gap-3 rounded-md border bg-background p-3 transition-colors hover:bg-muted/50 sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={session.status === "Full" ? "secondary" : "default"}>
            {session.status}
          </Badge>
          <Badge variant="outline">{session.skillLevel}</Badge>
        </div>
        <div className="mt-2 truncate text-sm font-medium">{session.title}</div>
        <div className="mt-1 flex flex-wrap gap-3 text-xs/relaxed text-muted-foreground">
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Calendar03Icon} />
            {dateFormatter.format(startsAt)} at {timeFormatter.format(startsAt)}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon icon={Location01Icon} />
            {session.location}
          </span>
        </div>
      </div>
      <div className="text-left sm:text-right">
        <div className="font-heading text-lg font-semibold">
          {spotsLeft === 0 ? "Waitlist" : spotsLeft}
        </div>
        <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
          {spotsLeft === 0 ? "Only" : "Spots left"}
        </div>
      </div>
    </Link>
  )
}

function CommunitiesCard({ count }: { count: number }) {
  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Communities</CardTitle>
        <CardDescription>
          Follow official hosts and local pickup groups.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 p-4">
          <div>
            <div className="font-heading text-2xl font-semibold">{count}</div>
            <div className="text-xs/relaxed text-muted-foreground">
              Active communities
            </div>
          </div>
          <Link
            href="/explore"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Discover
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function LeaderboardCard({ entries }: { entries: GlobalLeaderboardEntry[] }) {
  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Top ELO</CardTitle>
        <CardDescription>Global player rankings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {entries.map((entry, index) => (
            <div key={entry.id}>
              <Link
                href={`/players/${entry.playerId}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3"
              >
                <span className="flex size-8 items-center justify-center rounded-md bg-muted font-heading text-xs font-semibold">
                  {entry.rank}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {entry.playerName}
                  </div>
                  <div className="text-xs/relaxed text-muted-foreground">
                    {entry.primaryRole} - {entry.wins}W {entry.losses}L
                  </div>
                </div>
                <Badge>{entry.globalElo}</Badge>
              </Link>
              {index < entries.length - 1 ? <Separator /> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
