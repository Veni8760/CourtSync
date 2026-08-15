import Link from "next/link"
import { notFound } from "next/navigation"
import {
  AlertCircleIcon,
  ArrowLeft01Icon,
  Calendar03Icon,
  GameIcon,
  Location01Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { HostActions } from "@/components/drop-ins/host-actions"
import { RsvpPanel } from "@/components/drop-ins/rsvp-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireUser } from "@/lib/auth"
import { getCourt } from "@/lib/courts"
import {
  DropInApiError,
  formatDateTimeRange,
  formatPrice,
  formatStatus,
  getDropIn,
  getMyRsvpStatus,
  type MyRsvpStatus,
} from "@/lib/dropins"
import { cn } from "@/lib/utils"

type DropInDetailPageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export default async function DropInDetailPage({ params }: DropInDetailPageProps) {
  const user = await requireUser()
  const { id } = await params

  let dropIn
  try {
    dropIn = await getDropIn(id)
  } catch (error) {
    if (error instanceof DropInApiError && error.status === 404) {
      notFound()
    }
    throw error
  }

  const isHost = user.id === dropIn.organizerUserId
  const [courtName, rsvpStatus] = await Promise.all([
    resolveCourtName(dropIn.courtId),
    resolveRsvpStatus(isHost, dropIn.id),
  ])
  const isCancelled = dropIn.status === "CANCELLED"

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/find"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
            Back to map
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={dropIn.status === "OPEN" ? "default" : "secondary"}>
              {formatStatus(dropIn.status)}
            </Badge>
          </div>
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            {dropIn.title}
          </h1>
          <p className="flex items-center gap-2 text-sm/relaxed text-muted-foreground">
            <HugeiconsIcon icon={Location01Icon} />
            {courtName}
          </p>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        {isCancelled ? (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} />
            <AlertTitle>This drop-in was cancelled</AlertTitle>
            <AlertDescription>
              The organizer called it off. New RSVPs are rejected.
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle>Session details</CardTitle>
            {dropIn.description ? (
              <CardDescription>{dropIn.description}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={Calendar03Icon}
                label="When"
                value={formatDateTimeRange(dropIn.startTime, dropIn.endTime)}
              />
              <DetailItem
                icon={UserGroupIcon}
                label="Players"
                value={`${dropIn.confirmedPlayers}/${dropIn.maxPlayers} (${dropIn.spotsLeft} left)`}
              />
              <DetailItem
                icon={GameIcon}
                label="Price"
                value={formatPrice(dropIn.price)}
              />
              <DetailItem
                icon={VolleyballIcon}
                label="Skill level"
                value={dropIn.skillLevel ?? "Any level"}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle>{isHost ? "Hosting" : "Your RSVP"}</CardTitle>
            <CardDescription>
              {isHost
                ? "You're the organizer of this drop-in."
                : "Claim a spot, join the waitlist, or pull out."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isHost ? (
              <HostActions dropInId={dropIn.id} cancelled={isCancelled} />
            ) : (
              <RsvpPanel
                dropInId={dropIn.id}
                full={dropIn.spotsLeft === 0}
                cancelled={isCancelled}
                status={rsvpStatus}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

async function resolveCourtName(courtId: string) {
  try {
    const court = await getCourt(courtId)
    return court.name
  } catch {
    return `Court ${courtId.slice(0, 8)}…`
  }
}

const noRsvp: MyRsvpStatus = { hasRsvp: false, rsvpStatus: null, waitlistPosition: 0 }

// Hosts never RSVP; for everyone else, a failed status check defaults to
// not-RSVP'd (shows the RSVP button) rather than 500-ing the detail page.
async function resolveRsvpStatus(isHost: boolean, dropInId: string) {
  if (isHost) return noRsvp
  try {
    return await getMyRsvpStatus(dropInId)
  } catch {
    return noRsvp
  }
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border bg-card p-3">
      <HugeiconsIcon icon={icon} className="shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}
