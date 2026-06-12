import Link from "next/link"
import {
  Add01Icon,
  ChampionIcon,
  Location01Icon,
  Search01Icon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/explore", label: "Explore", icon: Search01Icon },
  { href: "/courts", label: "Courts", icon: Location01Icon },
  { href: "/leaderboard", label: "Leaderboard", icon: ChampionIcon },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={VolleyballIcon} />
          </span>
          <span className="truncate font-heading text-sm font-semibold">
            VolleyIQ
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              <HugeiconsIcon icon={item.icon} data-icon="inline-start" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/explore"
            className={cn(buttonVariants({ variant: "ghost" }), "md:hidden")}
          >
            Explore
          </Link>
          <Link
            href="/courts"
            className={cn(buttonVariants({ variant: "ghost" }), "md:hidden")}
          >
            Courts
          </Link>
          <Link
            href="/drop-ins/create"
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
            Host
          </Link>
        </div>
      </div>
    </header>
  )
}
