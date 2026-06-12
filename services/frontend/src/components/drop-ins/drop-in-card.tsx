import Link from "next/link"
import {
  Calendar03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatDateTimeRange,
  formatPrice,
  formatStatus,
  type DropIn,
} from "@/lib/dropins"

export function DropInCard({ dropIn }: { dropIn: DropIn }) {
  return (
    <Link href={`/drop-ins/${dropIn.id}`} className="group block">
      <Card className="h-full bg-background/80 shadow-sm transition-colors group-hover:border-primary/40">
        <CardHeader>
          <div className="min-w-0">
            <CardTitle className="truncate">{dropIn.title}</CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Calendar03Icon} />
              {formatDateTimeRange(dropIn.startTime, dropIn.endTime)}
            </CardDescription>
          </div>
          <CardAction>
            <Badge variant={dropIn.status === "OPEN" ? "default" : "secondary"}>
              {formatStatus(dropIn.status)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon icon={UserGroupIcon} />
            {dropIn.confirmedPlayers}/{dropIn.maxPlayers} players ·{" "}
            {dropIn.spotsLeft} {dropIn.spotsLeft === 1 ? "spot" : "spots"} left
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <span className="text-xs/relaxed text-muted-foreground">
            {dropIn.skillLevel ?? "Any level"}
          </span>
          <Badge variant="secondary">{formatPrice(dropIn.price)}</Badge>
        </CardFooter>
      </Card>
    </Link>
  )
}
