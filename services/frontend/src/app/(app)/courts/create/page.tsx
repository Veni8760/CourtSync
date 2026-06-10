import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft01Icon,
  LocationAdd01Icon,
  Location01Icon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CreateCourtForm } from "@/components/courts/create-court-form"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Add Court | VolleyIQ",
  description: "Create a volleyball court location in CourtSync.",
}

export default function CreateCourtPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/courts"
            className={cn(buttonVariants({ variant: "ghost" }), "self-start")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
            Courts
          </Link>
          <div className="flex max-w-3xl flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={LocationAdd01Icon} />
              </span>
              <div className="min-w-0">
                <Badge variant="outline" className="mb-2">
                  Court service
                </Badge>
                <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                  Add Court
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-sm/relaxed text-muted-foreground">
              Save a court with its play surface and net height so upcoming
              drop-ins can attach to a real location.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <CreateCourtForm />

        <Card className="h-fit bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle>What gets stored</CardTitle>
            <CardDescription>
              This form writes directly to the court-service through the API
              gateway.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <CreateCourtFact
                icon={Location01Icon}
                label="Location"
                value="Name, address, city, and province"
              />
              <CreateCourtFact
                icon={VolleyballIcon}
                label="Play setup"
                value="Surface and net height"
              />
              <CreateCourtFact
                icon={LocationAdd01Icon}
                label="Search prep"
                value="Optional latitude and longitude"
              />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function CreateCourtFact({
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
