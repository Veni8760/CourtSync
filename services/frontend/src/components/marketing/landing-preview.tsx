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
import { motion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type {
  LandingPlayerPreview,
  LandingSessionPreview,
} from "./types"

type LandingPreviewProps = {
  sessions: LandingSessionPreview[]
  players: LandingPlayerPreview[]
  shouldReduceMotion: boolean
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

export function LandingPreview({
  sessions,
  players,
  shouldReduceMotion,
}: LandingPreviewProps) {
  const primarySession = sessions[0]
  const rosterPercent = primarySession
    ? Math.round(
        (primarySession.registeredPlayers / primarySession.maxPlayers) * 100
      )
    : 0
  const spotsLeft = primarySession
    ? Math.max(primarySession.maxPlayers - primarySession.registeredPlayers, 0)
    : 0

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border bg-background shadow-lg shadow-foreground/5"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: "easeOut", delay: 0.12 }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
    >
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white">
              <HugeiconsIcon icon={VolleyballIcon} />
            </span>
            <div className="min-w-0">
              <div className="font-heading text-sm font-semibold">
                Live drop-in command center
              </div>
              <div className="hidden truncate text-xs/relaxed text-muted-foreground sm:block">
                Publish, fill, balance, and track one session.
              </div>
            </div>
          </div>
          <Badge variant="outline" className="hidden bg-background sm:inline-flex">
            {primarySession?.status ?? "Open"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-3 sm:hidden">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            {primarySession?.title ?? "Friday Night Indoor Drop-In"}
          </h2>
        </div>

        <div className="rounded-md border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-3 text-xs/relaxed">
            <span className="font-medium text-foreground">Roster fill</span>
            <span className="text-muted-foreground">
              {primarySession?.registeredPlayers ?? 18}/
              {primarySession?.maxPlayers ?? 24} players
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${rosterPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-background px-3 py-2 text-xs/relaxed">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">
              {spotsLeft} spots left - 4 teams queued
            </span>
          </div>
        </div>
      </div>

      <div className="hidden gap-0 sm:grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-4 border-b p-4 lg:border-r lg:border-b-0">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="font-heading text-xl font-semibold">
                {primarySession?.title ?? "Friday Night Indoor Drop-In"}
              </h2>
              <div className="mt-2 flex flex-wrap gap-3 text-xs/relaxed text-muted-foreground">
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Calendar03Icon} />
                  {primarySession
                    ? `${dateFormatter.format(
                        new Date(primarySession.startsAt)
                      )} at ${timeFormatter.format(
                        new Date(primarySession.startsAt)
                      )}`
                    : "Fri at 7:00 PM"}
                </span>
                <span className="flex items-center gap-1">
                  <HugeiconsIcon icon={Location01Icon} />
                  {primarySession?.location ?? "Oshawa Community Centre"}
                </span>
              </div>
            </div>

            <div className="rounded-md border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-3 text-xs/relaxed">
                <span className="font-medium text-foreground">
                  Roster fill
                </span>
                <span className="text-muted-foreground">
                  {primarySession?.registeredPlayers ?? 18}/
                  {primarySession?.maxPlayers ?? 24} players
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${rosterPercent}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs/relaxed">
                <div className="rounded-md bg-background px-2 py-2">
                  <div className="font-heading text-base font-semibold">
                    {spotsLeft}
                  </div>
                  <div className="text-muted-foreground">spots left</div>
                </div>
                <div className="rounded-md bg-background px-2 py-2">
                  <div className="font-heading text-base font-semibold">4</div>
                  <div className="text-muted-foreground">teams</div>
                </div>
                <div className="rounded-md bg-background px-2 py-2">
                  <div className="font-heading text-base font-semibold">6</div>
                  <div className="text-muted-foreground">games</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <WorkflowTile
              icon={TaskDone01Icon}
              label="Roster"
              value="Waitlist guarded"
            />
            <WorkflowTile
              icon={UserGroupIcon}
              label="Teams"
              value="Role balanced"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-heading text-sm font-semibold">
                Player profiles
              </div>
              <div className="text-xs/relaxed text-muted-foreground">
                ELO, role fit, and recent results.
              </div>
            </div>
            <Link
              href="/leaderboard"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Rankings
            </Link>
          </div>

          <div className="flex flex-col">
            {players.slice(0, 2).map((player, index) => (
              <div
                key={player.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b py-3 last:border-b-0"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-muted font-heading text-xs font-semibold">
                  {player.initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {player.playerName}
                  </div>
                  <div className="text-xs/relaxed text-muted-foreground">
                    #{player.rank} {player.primaryRole} - {player.wins}W{" "}
                    {player.losses}L
                  </div>
                </div>
                <Badge variant={index === 0 ? "default" : "secondary"}>
                  {player.globalElo}
                </Badge>
              </div>
            ))}
          </div>

          <div className="rounded-md border bg-emerald-50/80 p-3 text-xs/relaxed text-emerald-950">
            <div className="flex items-center gap-2 font-medium">
              <HugeiconsIcon icon={ChampionIcon} />
              Suggested court split
            </div>
            <p className="mt-2 text-emerald-900/80">
              Keep setters distributed and publish a fair game order before
              players arrive.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function WorkflowTile({
  icon,
  label,
  value,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-background p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} />
      </span>
      <div className="min-w-0">
        <div className="text-xs/relaxed text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}
