import Link from "next/link"
import {
  Calendar03Icon,
  Clock01Icon,
  Location01Icon,
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
import { cn } from "@/lib/utils"
import type { DropInSession } from "@/lib/mock-data"

type SessionCardProps = {
  session: DropInSession
}

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat("en-CA", {
  hour: "numeric",
  minute: "2-digit",
})

export function SessionCard({ session }: SessionCardProps) {
  const startsAt = new Date(session.startsAt)
  const endsAt = new Date(session.endsAt)
  const spotsLeft = Math.max(session.maxPlayers - session.registeredPlayers, 0)

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary-foreground">
            <HugeiconsIcon icon={VolleyballIcon} />
          </span>
          <div className="min-w-0">
            <CardTitle className="truncate">{session.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <HugeiconsIcon icon={Location01Icon} />
              <span className="truncate">{session.location}</span>
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <Badge
            variant={session.status === "Full" ? "secondary" : "default"}
            className="shrink-0"
          >
            {session.status}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          <SessionMetric
            icon={Calendar03Icon}
            label="Date"
            value={dateFormatter.format(startsAt)}
          />
          <SessionMetric
            icon={Clock01Icon}
            label="Time"
            value={`${timeFormatter.format(startsAt)}-${timeFormatter.format(endsAt)}`}
          />
          <SessionMetric
            icon={UserGroupIcon}
            label="Players"
            value={`${session.registeredPlayers}/${session.maxPlayers}`}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium">
            {session.priceCents === 0
              ? "Free"
              : `$${(session.priceCents / 100).toFixed(2)} ${session.currency}`}
          </span>
          <span className="text-xs/relaxed text-muted-foreground">
            {spotsLeft === 0 ? "Waitlist only" : `${spotsLeft} spots left`} -{" "}
            {session.skillLevel}
          </span>
        </div>
        <Link
          href={`/drop-ins/${session.id}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          View
        </Link>
      </CardFooter>
    </Card>
  )
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
