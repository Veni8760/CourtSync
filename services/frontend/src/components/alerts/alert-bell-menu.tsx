"use client"

import Link from "next/link"
import { useTransition } from "react"
import { Notification03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  markAlertReadAction,
  markAllAlertsReadAction,
} from "@/components/alerts/alert-actions"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
// Type-only, so this import is erased and lib/alerts' server-only fetch helpers
// (which reach into next/headers for the JWT) never enter the client bundle.
import type { PlayerAlert } from "@/lib/alerts"
import { cn } from "@/lib/utils"

const relativeFormatter = new Intl.RelativeTimeFormat("en-CA", { numeric: "auto" })

// "3 hours ago". Alerts are read in a dropdown where an absolute timestamp is noise.
function formatAlertAge(createdAtIso: string) {
  const elapsedMs = Date.now() - new Date(createdAtIso).getTime()
  const units = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ] as const

  for (const [unit, ms] of units) {
    const value = Math.floor(elapsedMs / ms)
    if (value >= 1) return relativeFormatter.format(-value, unit)
  }
  return "just now"
}

/**
 * The bell itself. Clicking an alert marks it read and navigates to the drop-in
 * it's about; the server action revalidates the layout, so the badge updates
 * without any client-side alert state to keep in sync.
 */
export function AlertBellMenu({
  alerts,
  unread,
}: {
  alerts: PlayerAlert[]
  unread: number
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <Popover>
      <PopoverTrigger
        // PopoverTrigger renders its own element, so it takes buttonVariants
        // rather than wrapping a Button (which would nest two buttons).
        aria-label={unread > 0 ? `Alerts (${unread} unread)` : "Alerts"}
        className={cn(buttonVariants({ variant: "outline", size: "icon-lg" }), "relative")}
      >
        <HugeiconsIcon icon={Notification03Icon} />
        {unread > 0 ? (
          <Badge className="absolute -right-1.5 -top-1.5 h-4 min-w-4 justify-center px-1 text-[0.625rem] leading-none">
            {unread > 9 ? "9+" : unread}
          </Badge>
        ) : null}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-heading text-sm font-semibold">Alerts</span>
          {unread > 0 ? (
            <Button
              variant="ghost"
              size="xs"
              disabled={isPending}
              onClick={() => startTransition(() => markAllAlertsReadAction())}
            >
              Mark all read
            </Button>
          ) : null}
        </div>
        <Separator />

        {alerts.length > 0 ? (
          <ScrollArea className="max-h-96">
            <ul>
              {alerts.map((alert, index) => (
                <li key={alert.id}>
                  {index > 0 ? <Separator /> : null}
                  <Link
                    href={`/drop-ins/${alert.dropInId}`}
                    onClick={() =>
                      alert.read
                        ? undefined
                        : startTransition(() => markAlertReadAction(alert.id))
                    }
                    className={cn(
                      "flex flex-col gap-1 px-3 py-2.5 transition-colors hover:bg-accent",
                      !alert.read && "bg-accent/40"
                    )}
                  >
                    <span className="flex items-start gap-2">
                      {!alert.read ? (
                        <span
                          aria-hidden
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                        />
                      ) : null}
                      <span className="text-sm/relaxed text-foreground">
                        {alert.message}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatAlertAge(alert.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <Empty className="py-6">
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Notification03Icon} />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No alerts yet</EmptyTitle>
              <EmptyDescription>
                RSVP to a drop-in and we&apos;ll keep you posted.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </PopoverContent>
    </Popover>
  )
}
