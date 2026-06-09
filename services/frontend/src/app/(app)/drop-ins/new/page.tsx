import type { Metadata } from "next"
import Link from "next/link"
import {
  Add01Icon,
  Calendar03Icon,
  DatabaseIcon,
  Location01Icon,
  TaskDone01Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Host a Pickup | VolleyIQ",
  description: "Preview the future VolleyIQ host flow for creating pickup games.",
}

const plannedFields = [
  { label: "Court and location", icon: Location01Icon },
  { label: "Date, start, and end time", icon: Calendar03Icon },
  { label: "Capacity and price", icon: UserGroupIcon },
  { label: "Skill level and role mix", icon: VolleyballIcon },
]

export default function NewDropInPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex max-w-3xl flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={Add01Icon} />
              </span>
              <div className="min-w-0">
                <Badge variant="outline" className="mb-2">
                  Host flow preview
                </Badge>
                <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                  Host a Pickup
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
              This route is ready for the host workflow, but it is not wired to
              persistence yet. New sessions will remain mock-only until the
              Supabase-backed host flow is implemented.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/explore" className={cn(buttonVariants({ size: "lg" }))}>
                <HugeiconsIcon icon={VolleyballIcon} data-icon="inline-start" />
                Back to Explore
              </Link>
              <Link
                href="/leaderboard"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                View leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <Card className="bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle>Planned host form</CardTitle>
            <CardDescription>
              The real flow should collect only the details needed to publish a
              playable pickup game.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {plannedFields.map((field, index) => (
                <div key={field.label}>
                  <div className="flex items-center gap-3 py-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                      <HugeiconsIcon
                        icon={field.icon}
                        className="text-muted-foreground"
                      />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{field.label}</div>
                      <div className="text-xs/relaxed text-muted-foreground">
                        Required before publishing a session.
                      </div>
                    </div>
                  </div>
                  {index < plannedFields.length - 1 ? <Separator /> : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle>Current implementation state</CardTitle>
            <CardDescription>
              This placeholder protects navigation while backend work is still
              out of scope.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <StateItem
                icon={TaskDone01Icon}
                label="Route exists"
                value="/drop-ins/new is now reachable"
              />
              <StateItem
                icon={DatabaseIcon}
                label="Persistence"
                value="Not connected to Supabase yet"
              />
              <StateItem
                icon={VolleyballIcon}
                label="Published sessions"
                value="Still sourced from mock data"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function StateItem({
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
