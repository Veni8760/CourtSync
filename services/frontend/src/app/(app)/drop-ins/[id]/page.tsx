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
} from "@/lib/dropins"
import { cn } from "@/lib/utils"

type DropInDetailPageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export default async function DropInDetailPage({ params }: DropInDetailPageProps) {
  await requireUser()
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

  const courtName = await resolveCourtName(dropIn.courtId)
  const isClosed = dropIn.status !== "OPEN"

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/drop-ins"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
            Back to drop-ins
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
        {isClosed ? (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} />
            <AlertTitle>This drop-in is {formatStatus(dropIn.status).toLowerCase()}</AlertTitle>
            <AlertDescription>
              New RSVPs may be rejected by the server.
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
            <CardTitle>Your RSVP</CardTitle>
            <CardDescription>
              RSVP as your dev player, or cancel a previous RSVP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RsvpPanel dropInId={dropIn.id} disabled={dropIn.spotsLeft === 0} />
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
