import type { Metadata } from "next"
import {
  ChampionIcon,
  ChartLineData02Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { GlobalLeaderboard } from "@/components/leaderboard/global-leaderboard"
import { Badge } from "@/components/ui/badge"
import { getGlobalLeaderboard } from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "Leaderboard | VolleyIQ",
  description: "Compare VolleyIQ players by global ELO, role, and skill level.",
}

export default function LeaderboardPage() {
  const leaderboard = getGlobalLeaderboard()
  const topPlayer = leaderboard[0]
  const totalMatches = leaderboard.reduce(
    (total, player) => total + player.wins + player.losses,
    0
  )
  const averageElo =
    leaderboard.length === 0
      ? 0
      : Math.round(
          leaderboard.reduce((total, player) => total + player.globalElo, 0) /
            leaderboard.length
        )

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={ChampionIcon} />
                </span>
                <div className="min-w-0">
                  <Badge variant="outline" className="mb-2">
                    Global rankings
                  </Badge>
                  <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                    Leaderboard
                  </h1>
                </div>
              </div>
              <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
                Rank every VolleyIQ player by global ELO, then narrow the board
                by preferred role or current skill level.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[30rem]">
              <LeaderboardMetric
                icon={UserGroupIcon}
                label="Players"
                value={leaderboard.length.toLocaleString()}
              />
              <LeaderboardMetric
                icon={VolleyballIcon}
                label="Matches"
                value={totalMatches.toLocaleString()}
              />
              <LeaderboardMetric
                icon={ChartLineData02Icon}
                label="Avg ELO"
                value={averageElo.toLocaleString()}
              />
            </div>
          </div>

          {topPlayer ? (
            <div className="rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
                    Current leader
                  </div>
                  <div className="mt-1 truncate font-heading text-xl font-semibold">
                    {topPlayer.playerName}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{topPlayer.globalElo} ELO</Badge>
                  <Badge variant="outline">{topPlayer.primaryRole}</Badge>
                  <Badge variant="secondary">{topPlayer.currentStreak}</Badge>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <GlobalLeaderboard entries={leaderboard} />
      </section>
    </main>
  )
}

function LeaderboardMetric({
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
