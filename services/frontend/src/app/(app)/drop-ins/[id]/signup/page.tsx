import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Calendar03Icon,
  Clock01Icon,
  Location01Icon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { SignupForm } from "@/components/drop-ins/signup-form"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  getAllDropInSessions,
  getDropInSessionById,
} from "@/lib/mock-data"

type SignupPageProps = {
  params: Promise<{
    id: string
  }>
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

export function generateStaticParams() {
  return getAllDropInSessions().map((session) => ({
    id: session.id,
  }))
}

export default async function SignupPage({ params }: SignupPageProps) {
  const { id } = await params
  const session = getDropInSessionById(id)

  if (!session) {
    notFound()
  }

  const startsAt = new Date(session.startsAt)
  const endsAt = new Date(session.endsAt)

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href={`/drop-ins/${session.id}`}
            className={cn(buttonVariants({ variant: "ghost" }), "self-start")}
          >
            Session details
          </Link>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={VolleyballIcon} />
              </span>
              <div className="min-w-0">
                <Badge variant="outline" className="mb-2">
                  Signup
                </Badge>
                <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
                  {session.title}
                </h1>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SignupMetric
                icon={Calendar03Icon}
                label="Date"
                value={dateFormatter.format(startsAt)}
              />
              <SignupMetric
                icon={Clock01Icon}
                label="Time"
                value={`${timeFormatter.format(startsAt)}-${timeFormatter.format(endsAt)}`}
              />
              <SignupMetric
                icon={Location01Icon}
                label="Location"
                value={session.location}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <SignupForm session={session} />
      </section>
    </main>
  )
}

function SignupMetric({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border bg-card p-3">
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
