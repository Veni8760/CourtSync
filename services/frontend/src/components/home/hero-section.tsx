"use client"

import Link from "next/link"
import { useLayoutEffect } from "react"
import type { ComponentProps } from "react"
import {
  ChampionIcon,
  TaskDone01Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useAnimationControls, useReducedMotion } from "motion/react"
import type { Variants } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type HeroIcon = ComponentProps<typeof HugeiconsIcon>["icon"]

type HeroSectionProps = {
  sessionsCount: number
  openSessionsCount: number
  totalPlayers: number
}

const metrics: Array<{
  icon: HeroIcon
  key: keyof HeroSectionProps
  label: string
}> = [
  {
    icon: VolleyballIcon,
    key: "sessionsCount",
    label: "Upcoming sessions",
  },
  {
    icon: TaskDone01Icon,
    key: "openSessionsCount",
    label: "Open sessions",
  },
  {
    icon: UserGroupIcon,
    key: "totalPlayers",
    label: "Tracked players",
  },
]

const introContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
}

const metricsVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

export function HeroSection({
  sessionsCount,
  openSessionsCount,
  totalPlayers,
}: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion()
  const introControls = useAnimationControls()
  const metricsControls = useAnimationControls()
  const counts = {
    sessionsCount,
    openSessionsCount,
    totalPlayers,
  }

  useLayoutEffect(() => {
    if (shouldReduceMotion) {
      introControls.set("visible")
      metricsControls.set("visible")
      return
    }

    introControls.set("hidden")
    metricsControls.set("hidden")
    void introControls.start("visible")
    void metricsControls.start("visible")
  }, [introControls, metricsControls, shouldReduceMotion])

  return (
    <section className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="flex max-w-4xl flex-col gap-5"
          initial={false}
          animate={introControls}
          variants={introContainerVariants}
        >
          <motion.div className="self-start" variants={fadeUpVariants}>
            <Badge variant="outline">Pickup intelligence for volleyball</Badge>
          </motion.div>
          <div className="flex flex-col gap-4">
            <motion.h1
              className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              variants={fadeUpVariants}
            >
              Run better volleyball drop-ins.
            </motion.h1>
            <motion.p
              className="max-w-2xl text-sm/relaxed text-muted-foreground sm:text-base/relaxed"
              variants={fadeUpVariants}
            >
              CourtSync connects local communities, pickup hosts, and players
              with signup flows, generated teams, game schedules, and ELO
              profiles.
            </motion.p>
          </div>
          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            variants={fadeUpVariants}
          >
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
          </motion.div>
        </motion.div>

        <motion.div
          className="grid gap-3 md:grid-cols-3"
          initial={false}
          animate={metricsControls}
          variants={metricsVariants}
        >
          {metrics.map((metric) => (
            <HeroMetric
              key={metric.key}
              icon={metric.icon}
              label={metric.label}
              value={counts[metric.key].toLocaleString()}
              shouldReduceMotion={Boolean(shouldReduceMotion)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function HeroMetric({
  icon,
  label,
  value,
  shouldReduceMotion,
}: {
  icon: HeroIcon
  label: string
  value: string
  shouldReduceMotion: boolean
}) {
  return (
    <motion.div
      className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-4"
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <HugeiconsIcon icon={icon} className="text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <div className="font-heading text-xl font-semibold">{value}</div>
        <div className="text-xs/relaxed text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  )
}
