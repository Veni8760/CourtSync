import Link from "next/link"
import {
  Calendar03Icon,
  ChampionIcon,
  Location01Icon,
  TaskDone01Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { SiteHeader } from "@/components/layout/site-header"
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
import { cn } from "@/lib/utils"
import {
  getAllDropInSessions,
  getCommunities,
  getGlobalLeaderboard,
  type DropInSession,
  type GlobalLeaderboardEntry,
} from "@/lib/mock-data"

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat("en-CA", {
  hour: "numeric",
  minute: "2-digit",
})

export default function Home() {
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
    <>
      <SiteHeader />
      <main className="min-h-screen bg-muted/30">
        <section className="border-b bg-background">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex max-w-4xl flex-col gap-5">
              <Badge variant="outline" className="self-start">
                Pickup intelligence for volleyball
              </Badge>
              <div className="flex flex-col gap-4">
                <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Run better volleyball drop-ins.
                </h1>
                <p className="max-w-2xl text-sm/relaxed text-muted-foreground sm:text-base/relaxed">
                  VolleyIQ connects local communities, pickup hosts, and players
                  with signup flows, generated teams, game schedules, and ELO
                  profiles.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/explore" className={cn(buttonVariants({ size: "lg" }))}>
                  <HugeiconsIcon icon={VolleyballIcon} data-icon="inline-start" />
                  Explore games
                </Link>
                <Link
                  href="/leaderboard"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  <HugeiconsIcon icon={ChampionIcon} data-icon="inline-start" />
                  View leaderboard
                </Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <HeroMetric
                icon={VolleyballIcon}
                label="Upcoming sessions"
                value={sessions.length.toLocaleString()}
              />
              <HeroMetric
                icon={TaskDone01Icon}
                label="Open sessions"
                value={openSessions.length.toLocaleString()}
              />
              <HeroMetric
                icon={UserGroupIcon}
                label="Tracked players"
                value={totalPlayers.toLocaleString()}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <UpcomingSessionsCard sessions={sessions} />
          <div className="flex flex-col gap-5">
            <CommunitiesCard count={communities.length} />
            <LeaderboardCard entries={leaderboard} />
          </div>
        </section>
      </main>
    </>
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

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <HugeiconsIcon icon={icon} className="text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <div className="font-heading text-xl font-semibold">{value}</div>
        <div className="text-xs/relaxed text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
