import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowRight01Icon,
  Building03Icon,
  SparklesIcon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Post-login hub. Drop-ins is the only live surface today, so it's the hero of the
// page; Communities and Group rentals are shipped as empty shells so the dashboard
// layout already accommodates them. Static server component — every action is a Link.

// Surfaces that don't exist yet. Rendered as disabled shells with a "Coming soon"
// badge so the hub reads as a real product roadmap, not a dead end.
const UPCOMING = [
  {
    icon: UserGroupIcon,
    title: "Communities",
    body: "Join local volleyball crews, follow the regulars, and get a heads-up when they put up a game.",
  },
  {
    icon: Building03Icon,
    title: "Group court rentals",
    body: "Split a whole court with friends — book a private session as a group, separate from open drop-ins.",
  },
  {
    icon: SparklesIcon,
    title: "More on the way",
    body: "Ladders, player profiles and stats are next. Tell us what would get you on the court more often.",
  },
]

export function HomeHub({ name }: { name: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Welcome back
        </p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Hey {name}.
        </h1>
        <p className="text-muted-foreground">
          Jump into a game near you, or set up your next one.
        </p>
      </header>

      <DropInsPanel />

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold">More on CourtSync</h2>
          <span className="text-sm text-muted-foreground">Rolling out soon</span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UPCOMING.map((item) => (
            <Card
              key={item.title}
              aria-disabled
              className="bg-card/60 opacity-80"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={item.icon} className="size-5" />
                  </span>
                  <Badge variant="secondary">Coming soon</Badge>
                </div>
                <CardTitle className="mt-3 text-base">{item.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {item.body}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

// The live feature, given hero treatment on the hub.
function DropInsPanel() {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-secondary">
      <div className="grid items-stretch gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col items-start gap-5 p-8 sm:p-10">
          <Badge className="gap-1.5 bg-primary/10 text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Live now
          </Badge>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Drop-ins
            </h2>
            <p className="max-w-md text-muted-foreground">
              Find open volleyball games near you, filter by skill and surface, and
              RSVP in a tap. Or host your own and fill the court.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/find"
              className={cn(buttonVariants(), "h-10 gap-1.5 px-5 text-sm")}
            >
              Find drop-ins
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </Link>
            <Link
              href="/drop-ins/create"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 gap-1.5 px-5 text-sm"
              )}
            >
              <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
              Host a drop-in
            </Link>
          </div>
        </div>

        {/* decorative mini-map echoing the find screen */}
        <div className="relative min-h-44 overflow-hidden bg-[#0e1830]">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #2b5fe3 1px, transparent 1px), linear-gradient(to bottom, #2b5fe3 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
          <div className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rally/70 bg-rally/10" />
          <MiniPin className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-6 bg-rally text-[#16223a]" />
          <MiniPin className="left-[32%] top-[36%] size-4 bg-primary text-white" />
          <MiniPin className="left-[68%] top-[44%] size-4 bg-primary text-white" />
          <MiniPin className="left-[56%] top-[66%] size-4 bg-primary text-white" />
        </div>
      </div>
    </section>
  )
}

function MiniPin({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute flex items-center justify-center rounded-full ring-2 ring-white/80",
        className
      )}
    >
      <HugeiconsIcon icon={VolleyballIcon} className="size-3" />
    </span>
  )
}
