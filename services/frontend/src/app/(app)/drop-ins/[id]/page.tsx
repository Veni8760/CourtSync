import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AlertCircleIcon,
  Calendar03Icon,
  Clock01Icon,
  GameIcon,
  Location01Icon,
  TaskDone01Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  getAllDropInSessions,
  getCommunities,
  getDropInSessionById,
  getGeneratedTeams,
  getSessionGames,
  getSessionSignups,
  type DropInSession,
  type GeneratedTeam,
  type GeneratedTeamPlayer,
  type PlayerRole,
  type SessionGame,
  type SessionSignup,
} from "@/lib/mock-data"

type DropInSessionPageProps = {
  params: Promise<{
    id: string
  }>
}

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  weekday: "long",
  month: "long",
  day: "numeric",
})

const shortDateFormatter = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat("en-CA", {
  hour: "numeric",
  minute: "2-digit",
})

export function generateStaticParams() {
  return getAllDropInSessions().map((session) => ({
    id: session.id,
  }))
}

export default async function DropInSessionPage({
  params,
}: DropInSessionPageProps) {
  const { id } = await params
  const session = getDropInSessionById(id)

  if (!session) {
    notFound()
  }

  const community = session.communityId
    ? getCommunities().find((item) => item.id === session.communityId) ?? null
    : null
  const signups = getSessionSignups(session.id)
  const teams = getGeneratedTeams(session.id)
  const games = getSessionGames(session.id)
  const startsAt = new Date(session.startsAt)
  const endsAt = new Date(session.endsAt)
  const spotsLeft = Math.max(session.maxPlayers - session.registeredPlayers, 0)

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <HugeiconsIcon icon={VolleyballIcon} />
                </span>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <SessionStatusBadge status={session.status} />
                    <Badge variant="outline">
                      {community ? community.name : "Independent pickup"}
                    </Badge>
                  </div>
                  <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                    {session.title}
                  </h1>
                </div>
              </div>
              <p className="flex max-w-2xl items-center gap-2 text-sm/relaxed text-muted-foreground">
                <HugeiconsIcon icon={Location01Icon} />
                <span>{session.location}</span>
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
              <SessionMetric
                icon={Calendar03Icon}
                label="Date"
                value={shortDateFormatter.format(startsAt)}
              />
              <SessionMetric
                icon={Clock01Icon}
                label="Time"
                value={`${timeFormatter.format(startsAt)}-${timeFormatter.format(endsAt)}`}
              />
              <SessionMetric
                icon={UserGroupIcon}
                label="Spots"
                value={spotsLeft === 0 ? "Waitlist" : `${spotsLeft} left`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview" className="gap-5">
          <TabsList className="w-full justify-start overflow-x-auto" variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="signups">Signups</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              session={session}
              communityName={community?.name}
              signups={signups}
              startsAt={startsAt}
              endsAt={endsAt}
            />
          </TabsContent>

          <TabsContent value="signups">
            <SignupsTab signups={signups} registeredPlayers={session.registeredPlayers} />
          </TabsContent>

          <TabsContent value="teams">
            <TeamsTab teams={teams} />
          </TabsContent>

          <TabsContent value="games">
            <GamesTab games={games} />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}

function OverviewTab({
  session,
  communityName,
  signups,
  startsAt,
  endsAt,
}: {
  session: DropInSession
  communityName?: string
  signups: SessionSignup[]
  startsAt: Date
  endsAt: Date
}) {
  const spotsLeft = Math.max(session.maxPlayers - session.registeredPlayers, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <Card className="bg-background/80 shadow-sm">
        <CardHeader>
          <CardTitle>Session overview</CardTitle>
          <CardDescription>
            Core details for this drop-in and the current roster state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem
              label="Date"
              value={dateFormatter.format(startsAt)}
              icon={Calendar03Icon}
            />
            <DetailItem
              label="Time"
              value={`${timeFormatter.format(startsAt)}-${timeFormatter.format(endsAt)}`}
              icon={Clock01Icon}
            />
            <DetailItem
              label="Location"
              value={session.location}
              icon={Location01Icon}
            />
            <DetailItem
              label="Skill level"
              value={session.skillLevel}
              icon={VolleyballIcon}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background/80 shadow-sm">
        <CardHeader>
          <CardTitle>Capacity and cost</CardTitle>
          <CardDescription>
            {communityName
              ? `Hosted by ${communityName}`
              : "Hosted as an independent pickup game"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <DetailItem
              label="Registered"
              value={`${session.registeredPlayers}/${session.maxPlayers}`}
              icon={UserGroupIcon}
            />
            <DetailItem
              label="Available"
              value={spotsLeft === 0 ? "Waitlist only" : `${spotsLeft} spots left`}
              icon={TaskDone01Icon}
            />
            <DetailItem
              label="Price"
              value={
                session.priceCents === 0
                  ? "Free"
                  : `$${(session.priceCents / 100).toFixed(2)} ${session.currency}`
              }
              icon={GameIcon}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <span className="text-xs/relaxed text-muted-foreground">
            {signups.length} visible signups in mock data
          </span>
          <Link
            href={`/drop-ins/${session.id}/signup`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

function SignupsTab({
  signups,
  registeredPlayers,
}: {
  signups: SessionSignup[]
  registeredPlayers: number
}) {
  if (signups.length === 0) {
    return (
      <Empty className="min-h-72 border bg-background">
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={UserGroupIcon} />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No signups visible</EmptyTitle>
          <EmptyDescription>
            Signups will appear here once players join this session.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Signup roster</CardTitle>
        <CardDescription>
          {signups.length} visible signups from {registeredPlayers} registered
          players.
        </CardDescription>
        <CardAction>
          <Badge variant="outline">{registeredPlayers} registered</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="divide-y overflow-hidden rounded-lg border bg-background">
          {signups.map((signup) => (
            <div
              key={signup.id}
              className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"
            >
              <div className="min-w-0">
                <Link
                  href={`/players/${signup.playerId}`}
                  className="block truncate text-sm font-medium hover:underline"
                >
                  {signup.playerName}
                </Link>
                <div className="text-xs/relaxed text-muted-foreground">
                  Party of {signup.partySize} - Registered{" "}
                  {shortDateFormatter.format(new Date(signup.registeredAt))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {signup.preferredRoles.map((role) => (
                  <RoleBadge key={role} role={role} />
                ))}
              </div>
              <Badge variant={signup.status === "Confirmed" ? "default" : "outline"}>
                {signup.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TeamsTab({ teams }: { teams: GeneratedTeam[] }) {
  if (teams.length === 0) {
    return (
      <Empty className="min-h-72 border bg-background">
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={VolleyballIcon} />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No generated teams yet</EmptyTitle>
          <EmptyDescription>
            Teams will appear here once the organizer generates assignments.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  )
}

function TeamCard({ team }: { team: GeneratedTeam }) {
  const outOfPositionCount = team.players.filter(
    (player) => player.outOfPosition
  ).length

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
        <CardDescription>{team.court}</CardDescription>
        <CardAction>
          <Badge variant={outOfPositionCount > 0 ? "destructive" : "outline"}>
            {outOfPositionCount > 0
              ? `${outOfPositionCount} out of position`
              : "Balanced"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {team.players.map((player) => (
            <TeamPlayerRow key={player.id} player={player} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TeamPlayerRow({ player }: { player: GeneratedTeamPlayer }) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-[1fr_auto] sm:items-center",
        player.outOfPosition && "border-dashed border-destructive/50 bg-destructive/5"
      )}
    >
      <div className="min-w-0">
        <Link
          href={`/players/${player.playerId}`}
          className="block truncate text-sm font-medium hover:underline"
        >
          {player.playerName}
        </Link>
        <div className="mt-1 flex flex-wrap gap-2">
          {player.preferredRoles.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="flex items-center gap-2">
          <span className="text-[0.625rem] font-medium uppercase text-muted-foreground">
            Assigned
          </span>
          <RoleBadge role={player.assignedRole} />
        </div>
        {player.outOfPosition ? (
          <div className="flex items-center gap-1 text-xs/relaxed text-destructive">
            <HugeiconsIcon icon={AlertCircleIcon} />
            Assigned outside preferred roles
          </div>
        ) : (
          <div className="text-xs/relaxed text-muted-foreground">
            In preferred role
          </div>
        )}
      </div>
    </div>
  )
}

function GamesTab({ games }: { games: SessionGame[] }) {
  if (games.length === 0) {
    return (
      <Empty className="min-h-72 border bg-background">
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={GameIcon} />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No games scheduled</EmptyTitle>
          <EmptyDescription>
            Game rows will appear here after teams are ready.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Game schedule</CardTitle>
        <CardDescription>
          Draft matchups generated from the current team assignments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y overflow-hidden rounded-lg border bg-background">
          {games.map((game) => (
            <div
              key={game.id}
              className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              <div className="flex size-10 items-center justify-center rounded-md bg-muted font-heading text-sm font-semibold">
                R{game.round}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {game.teamAName} vs {game.teamBName}
                </div>
                <div className="text-xs/relaxed text-muted-foreground">
                  {game.court}
                </div>
              </div>
              <GameStatus game={game} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function GameStatus({ game }: { game: SessionGame }) {
  if (game.status === "Final") {
    return (
      <div className="flex items-center gap-2 sm:justify-end">
        <Badge variant="secondary">Final</Badge>
        <span className="text-sm font-medium">
          {game.teamAScore}-{game.teamBScore}
        </span>
      </div>
    )
  }

  return <Badge variant="outline">Scheduled</Badge>
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

function SessionStatusBadge({ status }: { status: DropInSession["status"] }) {
  if (status === "Full") {
    return <Badge variant="secondary">Full</Badge>
  }

  if (status === "Filling fast") {
    return <Badge variant="outline">Filling fast</Badge>
  }

  return <Badge>Open</Badge>
}

function SessionMetric({
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

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md bg-muted/50 p-3">
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
