import Link from "next/link"
import { Add01Icon, VolleyballIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { AlertBell } from "@/components/alerts/alert-bell"
import { buttonVariants } from "@/components/ui/button"
import { getIsSignedIn } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { MobileNav } from "./mobile-nav"
import { signOut } from "./site-header-actions"

export async function SiteHeader({
  isSignedIn: providedIsSignedIn,
}: {
  isSignedIn?: boolean
} = {}) {
  const isSignedIn = providedIsSignedIn ?? (await getIsSignedIn())

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href={isSignedIn ? "/home" : "/"}
          className="flex min-w-0 items-center gap-2"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={VolleyballIcon} />
          </span>
          <span className="truncate font-heading text-base font-bold tracking-tight">
            CourtSync
          </span>
        </Link>

        {isSignedIn ? (
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/home" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/find" className="transition-colors hover:text-foreground">
              Drop-ins
            </Link>
            <Link
              href="/my-drop-ins"
              className="transition-colors hover:text-foreground"
            >
              My drop-ins
            </Link>
            <Link href="/profile" className="transition-colors hover:text-foreground">
              Profile
            </Link>
          </nav>
        ) : null}

        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              {/* Visible at every breakpoint — a promotion off the waitlist is
                  time-critical, so the bell doesn't hide behind the mobile menu. */}
              <AlertBell />
              <Link
                href="/drop-ins/create"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "hidden md:inline-flex"
                )}
              >
                <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
                Host a drop-in
              </Link>
              <form action={signOut} className="hidden md:block">
                <button
                  type="submit"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Sign out
                </button>
              </form>
              <MobileNav />
            </>
          ) : (
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
