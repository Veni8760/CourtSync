import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Compass01Icon,
  FlashIcon,
  Location01Icon,
  MapsLocation01Icon,
  SlidersHorizontalIcon,
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

// Public marketing front door. Static server component — no interactivity, so no
// "use client". Composed entirely from shadcn primitives (Button / Card / Badge);
// the @shadcn registry ships no hero/marketing block, so this is the documented
// "compose primitives" path. Signed-in users never see this (root redirects them).

const STEPS = [
  {
    n: "01",
    title: "Drop a pin",
    body: "Search a neighbourhood or use your location, then set how far you're willing to travel.",
  },
  {
    n: "02",
    title: "See who's playing",
    body: "Open drop-ins appear on the map, nearest first — with skill level, surface, time and price.",
  },
  {
    n: "03",
    title: "Claim your spot",
    body: "RSVP in a tap. Show up, warm up, play. Hosting your own game takes about thirty seconds.",
  },
]

const FEATURES = [
  {
    icon: MapsLocation01Icon,
    title: "Map-first search",
    body: "Every open game on one map. Pan, zoom, and pick the spot that actually fits your commute.",
  },
  {
    icon: SlidersHorizontalIcon,
    title: "Filter what matters",
    body: "Indoor, beach, grass or outdoor — narrow by surface, skill level and price before you commit.",
  },
  {
    icon: FlashIcon,
    title: "Host in seconds",
    body: "Pick a court, set a time and a cap. Your drop-in is on the map for nearby players instantly.",
  },
  {
    icon: Compass01Icon,
    title: "Real distance",
    body: "Results are sorted by actual kilometres from your pin — not a vague postal-code guess.",
  },
]

export function LandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <MarketingHeader />

      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <ClosingCta />
      </main>

      <MarketingFooter />
    </div>
  )
}

function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={VolleyballIcon} />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight">
            CourtSync
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }), "h-9 px-3 text-sm")}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants(), "h-9 px-4 text-sm")}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* sand wash bleeding up from the bottom keeps the hero warm, not clinical */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-secondary/60" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24 lg:px-8">
        <div className="flex flex-col items-start gap-6">
          <Badge
            variant="outline"
            className="gap-1.5 border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary"
          >
            <HugeiconsIcon icon={VolleyballIcon} />
            Pickup volleyball, organised
          </Badge>

          <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Find your next game in&nbsp;minutes.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            CourtSync maps every open volleyball drop-in near you. Filter by skill
            and surface, see who&apos;s already in, and claim your spot — no group
            chats, no guesswork.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={cn(buttonVariants(), "h-11 gap-1.5 px-6 text-sm")}
            >
              Get started — it&apos;s free
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline" }), "h-11 px-6 text-sm")}
            >
              Browse drop-ins
            </Link>
          </div>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {["No booking fees", "Indoor · beach · grass · outdoor", "Live distances"].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="text-primary"
                  />
                  {item}
                </li>
              )
            )}
          </ul>
        </div>

        <HeroMap />
      </div>
    </section>
  )
}

// Signature element: a stylised version of the product's map — rally-yellow radius
// ring over a cobalt court grid, with a floating result card. Pure CSS/markup (no
// Leaflet) so the public page stays fast and SSR-safe.
function HeroMap() {
  return (
    <div className="relative">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-[#0e1830] shadow-xl">
        {/* court-line grid */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #2b5fe3 1px, transparent 1px), linear-gradient(to bottom, #2b5fe3 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* cobalt glow */}
        <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl" />

        {/* radius ring — the rally-yellow accent, used once */}
        <div className="absolute left-1/2 top-[46%] size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rally/70 bg-rally/10" />

        {/* pins */}
        <Pin className="left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2" big />
        <Pin className="left-[34%] top-[34%]" />
        <Pin className="left-[66%] top-[40%]" />
        <Pin className="left-[58%] top-[62%]" />

        {/* floating result card */}
        <div className="absolute inset-x-4 bottom-4 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium text-foreground">Sunday Smash</span>
            <span className="font-mono text-sm text-muted-foreground">2.3 km</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={Location01Icon} />
              The Beach, Toronto
            </span>
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={Calendar03Icon} />
              Sun 6:00 p.m.
            </span>
            <span className="font-mono">$12</span>
            <Badge variant="secondary" className="px-2">
              Intermediate
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

function Pin({ className, big = false }: { className?: string; big?: boolean }) {
  return (
    <span
      className={`absolute flex items-center justify-center rounded-full ring-2 ring-white/80 ${
        big ? "size-7 bg-rally text-[#16223a]" : "size-5 bg-primary text-white"
      } ${className ?? ""}`}
    >
      <HugeiconsIcon
        icon={VolleyballIcon}
        className={big ? "size-4" : "size-3"}
      />
    </span>
  )
}

function HowItWorks() {
  return (
    <section id="how" className="bg-[#16223a] text-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-rally">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            From couch to court in three steps.
          </h2>
        </div>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="flex flex-col gap-3 bg-[#16223a] p-7">
              <span className="font-mono text-2xl font-semibold text-rally">
                {step.n}
              </span>
              <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-background/70">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Built for players
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to get in a game.
        </h2>
        <p className="mt-3 text-muted-foreground">
          No spreadsheets, no endless group chats. Just the games near you, the
          way you&apos;d actually search for them.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="bg-card/70 transition-colors hover:border-primary/40">
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HugeiconsIcon icon={feature.icon} className="size-5" />
              </span>
              <CardTitle className="mt-3 text-base">{feature.title}</CardTitle>
              <CardDescription className="leading-relaxed">
                {feature.body}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

function ClosingCta() {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-secondary px-8 py-16 text-center sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-rally/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-64 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HugeiconsIcon icon={UserGroupIcon} className="size-6" />
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Ready to play?
          </h2>
          <p className="text-muted-foreground">
            Join CourtSync and find a drop-in near you tonight. It&apos;s free to
            get started.
          </p>
          <Link
            href="/signup"
            className={cn(buttonVariants(), "h-11 gap-1.5 px-6 text-sm")}
          >
            Get started
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function MarketingFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
            <HugeiconsIcon icon={VolleyballIcon} className="size-3.5" />
          </span>
          <span className="font-heading font-semibold text-foreground">CourtSync</span>
          <span>— find volleyball drop-ins near you.</span>
        </div>
        <div className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/login" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
          <Link href="/signup" className="transition-colors hover:text-foreground">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  )
}
