"use client"

import Link from "next/link"
import {
  ArrowRight01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LandingPreview } from "./landing-preview"
import type {
  LandingPlayerPreview,
  LandingSessionPreview,
} from "./types"

type LandingHeroProps = {
  previewSessions: LandingSessionPreview[]
  previewPlayers: LandingPlayerPreview[]
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export function LandingHero({
  previewSessions,
  previewPlayers,
}: LandingHeroProps) {
  const shouldReduceMotion = Boolean(useReducedMotion())

  return (
    <section className="overflow-hidden border-b bg-background">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:gap-10 sm:px-6 sm:py-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <motion.div
          className="flex flex-col justify-center gap-7"
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          transition={{ staggerChildren: 0.06 }}
        >
          <div className="flex flex-col gap-5">
            <motion.h1
              className="max-w-3xl font-heading text-3xl font-semibold text-foreground sm:text-5xl"
              variants={fadeUp}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              Run volleyball drop-ins without the spreadsheet chaos.
            </motion.h1>
            <motion.p
              className="max-w-2xl text-base/relaxed text-muted-foreground"
              variants={fadeUp}
              transition={{ duration: 0.32, ease: "easeOut" }}
            >
              Publish sessions, fill rosters, balance games, and keep player
              profiles moving from one pickup night to the next.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            variants={fadeUp}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            <Link href="/explore" className={cn(buttonVariants({ size: "lg" }))}>
              <HugeiconsIcon icon={Search01Icon} data-icon="inline-start" />
              Explore drop-ins
            </Link>
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Create account
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </Link>
          </motion.div>
        </motion.div>

        <LandingPreview
          sessions={previewSessions}
          players={previewPlayers}
          shouldReduceMotion={shouldReduceMotion}
        />
      </div>
    </section>
  )
}
