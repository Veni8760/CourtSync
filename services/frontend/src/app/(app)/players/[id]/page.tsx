import { notFound } from "next/navigation"
import {
  Activity01Icon,
  ChampionIcon,
  ChartLineData02Icon,
  Location01Icon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
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
  getPlayerProfileById,
  getPlayerProfiles,
  type PlayerActivityDay,
  type PlayerEloPoint,
  type PlayerMatchLedgerEntry,
  type PlayerProfile,
  type PlayerRole,
} from "@/lib/mock-data"

type PlayerPageProps = {
  params: Promise<{
    id: string
  }>
}

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
})

export function generateStaticParams() {
  return getPlayerProfiles().map((player) => ({
    id: player.id,
  }))
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params
  const player = getPlayerProfileById(id)

  if (!player) {
    notFound()
  }

  const lastEloPoint = player.eloHistory.at(-1)

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-lg font-semibold text-primary-foreground">
                  {player.initials}
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{player.skillLevel}</Badge>
                    <Badge>{player.primaryRole}</Badge>
                  </div>
                  <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                    {player.name}
                  </h1>
                  <p className="mt-1 flex items-center gap-2 text-sm/relaxed text-muted-foreground">
                    <HugeiconsIcon icon={Location01Icon} />
                    {player.homeArea}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {player.preferredRoles.map((role) => (
                  <RoleBadge key={role} role={role} />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[30rem]">
              <ProfileMetric
                icon={ChampionIcon}
                label="Global ELO"
                value={String(player.globalElo)}
              />
              <ProfileMetric
                icon={VolleyballIcon}
                label="Record"
                value={`${player.wins}W ${player.losses}L`}
              />
              <ProfileMetric
                icon={Activity01Icon}
                label="Streak"
                value={player.currentStreak}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div className="flex flex-col gap-5">
          <EloSummaryCard player={player} lastEloPoint={lastEloPoint} />
          <ActivityCard days={player.activityDays} />
        </div>

        <div className="flex flex-col gap-5">
          <EloHistoryCard history={player.eloHistory} />
          <MatchLedgerCard entries={player.matchLedger} />
        </div>
      </section>
    </main>
  )
}

function EloSummaryCard({
  player,
  lastEloPoint,
}: {
  player: PlayerProfile
  lastEloPoint?: PlayerEloPoint
}) {
  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Role profile</CardTitle>
        <CardDescription>
          Role preference fit and latest rating movement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-md bg-muted/50 p-4">
              <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
                Role fit
              </div>
              <div className="mt-1 font-heading text-2xl font-semibold">
                {player.roleFitPercent}%
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${player.roleFitPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-md bg-muted/50 p-4">
              <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
                Latest ELO change
              </div>
              <div className="mt-1 flex items-center gap-2">
                <EloChangeBadge value={lastEloPoint?.change ?? 0} />
                <span className="text-xs/relaxed text-muted-foreground">
                  {lastEloPoint ? dateFormatter.format(new Date(lastEloPoint.date)) : "No matches"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {player.preferredRoles.map((role) => (
              <RoleBadge key={role} role={role} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityCard({ days }: { days: PlayerActivityDay[] }) {
  const totalSessions = days.reduce((total, day) => total + day.sessions, 0)

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>
          Last {days.length} days across mock sessions.
        </CardDescription>
        <CardAction>
          <Badge variant="outline">{totalSessions} sessions</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-1">
            {days.map((day) => (
              <ActivityBlock key={day.date} day={day} />
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[0.625rem] font-medium uppercase text-muted-foreground">
          <span>Less</span>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityBlock({ day }: { day: PlayerActivityDay }) {
  return (
    <div
      title={`${dateFormatter.format(new Date(day.date))}: ${day.sessions} sessions`}
      className={cn(
        "size-4 rounded-sm border border-background",
        day.sessions === 0 && "bg-muted",
        day.sessions === 1 && "bg-primary/30",
        day.sessions === 2 && "bg-primary/60",
        day.sessions >= 3 && "bg-primary"
      )}
    />
  )
}

function EloHistoryCard({ history }: { history: PlayerEloPoint[] }) {
  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>ELO history</CardTitle>
        <CardDescription>
          Rating movement from recent completed matches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {history.map((point) => (
            <div
              key={`${point.date}-${point.rating}`}
              className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-muted">
                <HugeiconsIcon icon={ChartLineData02Icon} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium">{point.rating}</div>
                <div className="text-xs/relaxed text-muted-foreground">
                  {dateFormatter.format(new Date(point.date))}
                </div>
              </div>
              <EloChangeBadge value={point.change} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MatchLedgerCard({
  entries,
}: {
  entries: PlayerMatchLedgerEntry[]
}) {
  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Match ledger</CardTitle>
        <CardDescription>
          Recent results with role and ELO impact.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y overflow-hidden rounded-lg border bg-background">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {entry.sessionTitle}
                </div>
                <div className="text-xs/relaxed text-muted-foreground">
                  {entry.communityName} - {dateFormatter.format(new Date(entry.date))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <RoleBadge role={entry.role} />
                <ResultBadge result={entry.result} />
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-xs/relaxed text-muted-foreground">
                  {entry.score}
                </span>
                <EloChangeBadge value={entry.eloChange} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ResultBadge({
  result,
}: {
  result: PlayerMatchLedgerEntry["result"]
}) {
  return (
    <Badge variant={result === "Win" ? "default" : "destructive"}>
      {result}
    </Badge>
  )
}

function EloChangeBadge({ value }: { value: number }) {
  if (value > 0) {
    return <Badge>+{value}</Badge>
  }

  if (value < 0) {
    return <Badge variant="destructive">{value}</Badge>
  }

  return <Badge variant="outline">0</Badge>
}

function RoleBadge({ role }: { role: PlayerRole }) {
  if (role === "Setter") {
    return <Badge>Setter</Badge>
  }

  if (role === "Attacker") {
    return <Badge variant="secondary">Attacker</Badge>
  }

  return <Badge variant="outline">Defender</Badge>
}

function ProfileMetric({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border bg-card p-3">
      <HugeiconsIcon icon={icon} className="shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-xs font-medium">{value}</div>
      </div>
    </div>
  )
}
