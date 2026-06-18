"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ChampionIcon,
  Medal01Icon,
  Search01Icon,
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  DropInSession,
  GlobalLeaderboardEntry,
  PlayerRole,
} from "@/lib/mock-data"

type GlobalLeaderboardProps = {
  entries: GlobalLeaderboardEntry[]
}

type RoleFilter = "all" | PlayerRole
type SkillFilter = "all" | DropInSession["skillLevel"]

const roleOptions: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "Setter", label: "Setter" },
  { value: "Attacker", label: "Attacker" },
  { value: "Defender", label: "Defender" },
]

const skillOptions: { value: SkillFilter; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Open", label: "Open" },
]

export function GlobalLeaderboard({ entries }: GlobalLeaderboardProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [skillFilter, setSkillFilter] = useState<SkillFilter>("all")

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const roleMatches =
          roleFilter === "all" || entry.preferredRoles.includes(roleFilter)
        const skillMatches =
          skillFilter === "all" || entry.skillLevel === skillFilter

        return roleMatches && skillMatches
      }),
    [entries, roleFilter, skillFilter]
  )

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>Global leaderboard</CardTitle>
          <CardDescription>
            Filter rankings by player role preference and current skill level.
          </CardDescription>
        </div>
        <CardAction>
          <Badge variant="outline">{filteredEntries.length} players</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-center lg:justify-end">
            <Select
              value={roleFilter}
              onValueChange={(value) =>
                setRoleFilter((value ?? "all") as RoleFilter)
              }
            >
              <SelectTrigger className="w-full sm:w-auto lg:min-w-40" aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectLabel>Role</SelectLabel>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={skillFilter}
              onValueChange={(value) =>
                setSkillFilter((value ?? "all") as SkillFilter)
              }
            >
              <SelectTrigger
                className="w-full sm:w-auto lg:min-w-44"
                aria-label="Skill level"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectLabel>Skill level</SelectLabel>
                  {skillOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {filteredEntries.length > 0 ? (
            <>
              <div className="flex flex-col gap-3 md:hidden">
                {filteredEntries.map((entry) => (
                  <MobileLeaderboardEntry key={entry.id} entry={entry} />
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-lg border bg-background md:block">
                <Table className="min-w-[54rem]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Skill</TableHead>
                      <TableHead>Record</TableHead>
                      <TableHead>Role fit</TableHead>
                      <TableHead className="text-right">Global ELO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <RankMarker rank={entry.rank} />
                        </TableCell>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-3">
                            <InitialsMark initials={entry.initials} />
                            <div className="min-w-0">
                              <Link
                                href={`/players/${entry.playerId}`}
                                className="font-medium hover:underline"
                              >
                                {entry.playerName}
                              </Link>
                              <div className="text-muted-foreground">
                                {entry.homeArea}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={entry.primaryRole} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.skillLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {entry.wins}W {entry.losses}L
                          </div>
                          <div className="text-muted-foreground">
                            {entry.winRatePercent}% win rate
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleFit value={entry.roleFitPercent} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-heading text-base font-semibold">
                            {entry.globalElo}
                          </div>
                          <Badge variant="secondary">{entry.currentStreak}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <Empty className="min-h-72 border bg-background">
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Search01Icon} />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No matching players</EmptyTitle>
                <EmptyDescription>
                  Adjust the role or skill filters to widen the leaderboard.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MobileLeaderboardEntry({
  entry,
}: {
  entry: GlobalLeaderboardEntry
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <RankMarker rank={entry.rank} />
          <InitialsMark initials={entry.initials} />
          <div className="min-w-0">
            <Link
              href={`/players/${entry.playerId}`}
              className="truncate text-sm font-medium hover:underline"
            >
              {entry.playerName}
            </Link>
            <div className="text-xs/relaxed text-muted-foreground">
              {entry.homeArea}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-heading text-lg font-semibold">
            {entry.globalElo}
          </div>
          <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
            ELO
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RoleBadge role={entry.primaryRole} />
        <Badge variant="outline">{entry.skillLevel}</Badge>
        <Badge variant="secondary">{entry.currentStreak}</Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md bg-muted/50 p-3">
          <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
            Record
          </div>
          <div className="mt-1 text-sm font-medium">
            {entry.wins}W {entry.losses}L
          </div>
          <div className="text-xs/relaxed text-muted-foreground">
            {entry.winRatePercent}% win rate
          </div>
        </div>
        <div className="rounded-md bg-muted/50 p-3">
          <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
            Role fit
          </div>
          <RoleFit value={entry.roleFitPercent} />
        </div>
      </div>
    </div>
  )
}

function RankMarker({ rank }: { rank: number }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted font-heading text-sm font-semibold">
      {rank === 1 ? (
        <HugeiconsIcon icon={ChampionIcon} />
      ) : rank <= 3 ? (
        <HugeiconsIcon icon={Medal01Icon} />
      ) : (
        rank
      )}
    </span>
  )
}

function InitialsMark({ initials }: { initials: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xs font-semibold text-primary-foreground">
      {initials}
    </span>
  )
}

function RoleFit({ value }: { value: number }) {
  return (
    <div className="flex min-w-28 flex-col gap-1">
      <div className="text-xs font-medium">{value}%</div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
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
