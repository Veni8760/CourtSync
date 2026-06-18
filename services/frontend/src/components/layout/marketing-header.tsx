import Link from "next/link"
import { VolleyballIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#community-proof", label: "Community" },
  { href: "#for-hosts-players", label: "For hosts" },
]

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={VolleyballIcon} />
          </span>
          <span className="truncate font-heading text-sm font-semibold">
            CourtSync
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Landing">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ variant: "default" }),
              "hidden sm:inline-flex"
            )}
          >
            Create account
          </Link>
        </div>
      </div>
    </header>
  )
}
