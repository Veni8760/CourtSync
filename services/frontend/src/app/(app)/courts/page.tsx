import type { Metadata } from "next"
import Link from "next/link"
import {
  Add01Icon,
  AlertCircleIcon,
  Location01Icon,
  MapsSearchIcon,
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  CourtApiError,
  formatNetHeight,
  formatSurface,
  listCourts,
  type Court,
} from "@/lib/courts"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Courts | VolleyIQ",
  description: "View volleyball courts saved in CourtSync.",
}

export const dynamic = "force-dynamic"

export default async function CourtsPage() {
  const { courts, error } = await getCourts()

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={Location01Icon} />
              </span>
              <div className="min-w-0">
                <h1 className="font-heading text-3xl font-semibold text-foreground">
                  Courts
                </h1>
                <p className="text-sm/relaxed text-muted-foreground">
                  Volleyball locations available for future drop-ins.
                </p>
              </div>
            </div>
            <Link href="/courts/create" className={cn(buttonVariants({ size: "lg" }))}>
              <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
              Add court
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        {error ? <CourtsError message={error} /> : null}

        {!error && courts.length === 0 ? <CourtsEmpty /> : null}

        {courts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {courts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

async function getCourts() {
  try {
    return {
      courts: await listCourts(),
      error: null,
    }
  } catch (error) {
    return {
      courts: [],
      error:
        error instanceof CourtApiError
          ? error.message
          : "Unable to load courts right now.",
    }
  }
}

function CourtsEmpty() {
  return (
    <Empty className="min-h-72 border bg-background">
      <EmptyMedia variant="icon">
        <HugeiconsIcon icon={MapsSearchIcon} />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No courts saved</EmptyTitle>
        <EmptyDescription>
          Add the first court so hosts can attach drop-ins to a real location.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/courts/create" className={cn(buttonVariants())}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
          Add court
        </Link>
      </EmptyContent>
    </Empty>
  )
}

function CourtsError({ message }: { message: string }) {
  return (
    <Empty className="min-h-72 border bg-background">
      <EmptyMedia variant="icon">
        <HugeiconsIcon icon={AlertCircleIcon} />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Courts unavailable</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function CourtCard({ court }: { court: Court }) {
  const location = [court.address, court.city, court.province]
    .filter(Boolean)
    .join(", ")

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <div className="min-w-0">
          <CardTitle className="truncate">{court.name}</CardTitle>
          <CardDescription>
            {location || "Location details not provided"}
          </CardDescription>
        </div>
        <CardAction>
          <Badge variant={court.surface === "INDOOR" ? "default" : "outline"}>
            {formatSurface(court.surface)}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <CourtFact
            icon={VolleyballIcon}
            label="Net height"
            value={formatNetHeight(court.netHeight)}
          />
          <CourtFact
            icon={Location01Icon}
            label="Coordinates"
            value={formatCoordinates(court)}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t">
        <span className="truncate text-xs/relaxed text-muted-foreground">
          ID {court.id}
        </span>
        <Badge variant="secondary">Active</Badge>
      </CardFooter>
    </Card>
  )
}

function CourtFact({
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
        <div className="truncate text-xs font-medium">{value}</div>
      </div>
    </div>
  )
}

function formatCoordinates(court: Court) {
  if (court.latitude == null || court.longitude == null) {
    return "Not set"
  }

  return `${court.latitude.toFixed(4)}, ${court.longitude.toFixed(4)}`
}
