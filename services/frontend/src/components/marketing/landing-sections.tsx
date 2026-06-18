"use client"

import Link from "next/link"
import type { ComponentProps } from "react"
import {
  ArrowRight01Icon,
  CalendarAdd01Icon,
  ChampionIcon,
  Search01Icon,
  TaskDone01Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type {
  LandingCommunityPreview,
  LandingPlayerPreview,
  LandingSessionPreview,
} from "./types"

type LandingSectionsProps = {
  sessionsCount: number
  openSessionsCount: number
  totalPlayers: number
  communitiesCount: number
  previewSessions: LandingSessionPreview[]
  previewPlayers: LandingPlayerPreview[]
  previewCommunities: LandingCommunityPreview[]
}

type HeroIcon = ComponentProps<typeof HugeiconsIcon>["icon"]

const workflowItems: Array<{
  icon: HeroIcon
  title: string
  description: string
}> = [
  {
    icon: CalendarAdd01Icon,
    title: "Create the session",
    description:
      "Publish location, price, capacity, skill level, and community context in one structured flow.",
  },
  {
    icon: Search01Icon,
    title: "Fill the roster",
    description:
      "Players can discover open sessions while hosts see capacity, waitlists, and signup pace.",
  },
  {
    icon: UserGroupIcon,
    title: "Balance the games",
    description:
      "Use role preferences and player history to make teams that feel fair before warmup starts.",
  },
  {
    icon: ChampionIcon,
    title: "Track progress",
    description:
      "Profiles keep ELO, roles, wins, losses, and recent activity connected across communities.",
  },
]

const hostBenefits = [
  "Session publishing with capacity, price, and skill filters.",
  "Roster visibility that replaces spreadsheet tabs and chat threads.",
  "Team balancing prompts built around roles and player history.",
]

const playerBenefits = [
  "A clean place to find open drop-ins and active communities.",
  "Player profiles that carry ELO, role fit, and match history forward.",
  "Clear context before joining: location, level, spots left, and host.",
]

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
})

export function LandingSections({
  sessionsCount,
  openSessionsCount,
  totalPlayers,
  communitiesCount,
  previewSessions,
  previewPlayers,
  previewCommunities,
}: LandingSectionsProps) {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const revealProps = shouldReduceMotion
    ? { initial: false }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, amount: 0.18 },
        variants: {
          hidden: { opacity: 0, y: 12 },
          visible: { opacity: 1, y: 0 },
        },
        transition: { duration: 0.32, ease: "easeOut" as const },
      }

  return (
    <>
      <section
        id="how-it-works"
        className="border-b bg-muted/30 px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <motion.div className="max-w-2xl" {...revealProps}>
            <h2 className="font-heading text-3xl font-semibold">
              One flow from open signup to final score.
            </h2>
            <p className="mt-3 text-sm/relaxed text-muted-foreground">
              VolleyIQ keeps the moving pieces of a drop-in connected, so hosts
              and players do not have to reconcile rosters by hand.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {workflowItems.map((item, index) => (
              <motion.div
                key={item.title}
                className="flex h-full flex-col gap-4 rounded-lg border bg-background p-4"
                {...revealProps}
                transition={{
                  duration: 0.32,
                  ease: "easeOut",
                  delay: shouldReduceMotion ? 0 : index * 0.04,
                }}
              >
                <span className="flex size-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <HugeiconsIcon icon={item.icon} />
                </span>
                <div>
                  <h3 className="font-heading text-sm font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs/relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="community-proof"
        className="border-b bg-background px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div className="flex flex-col justify-center gap-5" {...revealProps}>
            <h2 className="font-heading text-3xl font-semibold">
              Live community proof, pulled from the same drop-in data.
            </h2>
            <p className="text-sm/relaxed text-muted-foreground">
              The landing page shows the marketplace is alive without inventing
              new datasets: upcoming sessions, open spots, tracked players, and
              active communities all come from existing mock data.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <ProofStat label="upcoming sessions" value={sessionsCount} />
              <ProofStat label="open sessions" value={openSessionsCount} />
              <ProofStat label="tracked players" value={totalPlayers} />
              <ProofStat label="active communities" value={communitiesCount} />
            </div>
          </motion.div>

          <motion.div
            className="grid gap-4 md:grid-cols-[1fr_0.8fr]"
            {...revealProps}
            transition={{ duration: 0.32, ease: "easeOut", delay: 0.06 }}
          >
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-heading text-sm font-semibold">
                  Upcoming drop-ins
                </h3>
                <Badge variant="outline" className="bg-background">
                  {openSessionsCount} open
                </Badge>
              </div>
              <div className="flex flex-col">
                {previewSessions.slice(0, 3).map((session) => {
                  const spotsLeft = Math.max(
                    session.maxPlayers - session.registeredPlayers,
                    0
                  )

                  return (
                    <Link
                      key={session.id}
                      href={`/drop-ins/${session.id}`}
                      className="grid grid-cols-[1fr_auto] gap-3 border-b py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {session.title}
                        </div>
                        <div className="text-xs/relaxed text-muted-foreground">
                          {dateFormatter.format(new Date(session.startsAt))} -{" "}
                          {session.skillLevel}
                        </div>
                      </div>
                      <div className="text-right text-xs/relaxed">
                        <div className="font-heading text-base font-semibold">
                          {spotsLeft === 0 ? "Full" : spotsLeft}
                        </div>
                        <div className="text-muted-foreground">
                          {spotsLeft === 0 ? "status" : "spots"}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-lg border bg-background p-4">
                <h3 className="font-heading text-sm font-semibold">
                  Active communities
                </h3>
                <div className="mt-3 flex flex-col gap-3">
                  {previewCommunities.map((community) => (
                    <div
                      key={community.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="min-w-0 truncate text-sm">
                        {community.name}
                      </span>
                      <Badge variant="secondary">
                        {community.followerCount.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <h3 className="font-heading text-sm font-semibold">
                  Player movement
                </h3>
                <div className="mt-3 flex flex-col gap-2">
                  {previewPlayers.slice(0, 2).map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 truncate">
                        {player.playerName}
                      </span>
                      <span className="font-heading font-semibold">
                        {player.globalElo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="for-hosts-players"
        className="border-b bg-muted/30 px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-2">
          <ValuePanel
            title="Hosts get operational control."
            icon={TaskDone01Icon}
            benefits={hostBenefits}
            shouldReduceMotion={shouldReduceMotion}
          />
          <ValuePanel
            title="Players get a better place to play."
            icon={VolleyballIcon}
            benefits={playerBenefits}
            shouldReduceMotion={shouldReduceMotion}
          />
        </div>
      </section>

      <section className="bg-background px-4 py-14 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-5 rounded-lg border bg-foreground p-6 text-background sm:p-8 lg:flex-row lg:items-center"
          {...revealProps}
        >
          <div className="max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold">
              Put the next drop-in on a cleaner system.
            </h2>
            <p className="mt-2 text-sm/relaxed text-background/70">
              Start by browsing the current community schedule, then sign in
              when you are ready to host or track your player profile.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/explore"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" })
              )}
            >
              Explore drop-ins
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-background/30 text-background hover:bg-background/10 hover:text-background"
              )}
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}

function ProofStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background p-4">
      <div className="font-heading text-2xl font-semibold">
        {value.toLocaleString()}
      </div>
      <div className="text-xs/relaxed text-muted-foreground">{label}</div>
    </div>
  )
}

function ValuePanel({
  title,
  icon,
  benefits,
  shouldReduceMotion,
}: {
  title: string
  icon: HeroIcon
  benefits: string[]
  shouldReduceMotion: boolean
}) {
  return (
    <motion.div
      className="rounded-lg border bg-background p-5"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <HugeiconsIcon icon={icon} />
        </span>
        <div>
          <h3 className="font-heading text-xl font-semibold">{title}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-sm/relaxed">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-600" />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
