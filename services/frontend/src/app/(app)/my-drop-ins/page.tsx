import type { ComponentProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import {
  Calendar03Icon,
  Clock01Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DropInCard } from "@/components/drop-ins/drop-in-card"
import { HostActions } from "@/components/drop-ins/host-actions"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { requireUser } from "@/lib/auth"
import {
  listMyHostedDropIns,
  listMyRsvps,
  listMyWaitlist,
  type DropIn,
} from "@/lib/dropins"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "My drop-ins — CourtSync",
}

export default async function MyDropInsPage() {
  await requireUser()
  const [joined, waitlisted, hosting] = await Promise.all([
    listMyRsvps(),
    listMyWaitlist(),
    listMyHostedDropIns(),
  ])

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Badge variant="outline" className="mb-2">
            My drop-ins
          </Badge>
          <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            My drop-ins
          </h1>
          <p className="mt-2 text-sm/relaxed text-muted-foreground">
            Sessions you&apos;ve joined, are waiting on, and are hosting.
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <DropInSection
          icon={Calendar03Icon}
          title="Joined"
          dropIns={joined}
          emptyTitle="No drop-ins joined yet"
          emptyDescription="Find a session near you and claim a spot."
        />
        {/* Only rendered when there's something in it — an empty waitlist is the
            normal case and doesn't need its own empty state. */}
        {waitlisted.length > 0 ? (
          <DropInSection
            icon={Clock01Icon}
            title="On the waitlist"
            dropIns={waitlisted}
            emptyTitle=""
            emptyDescription=""
          />
        ) : null}
        <DropInSection
          icon={UserGroupIcon}
          title="Hosting"
          dropIns={hosting}
          hostActions
          emptyTitle="You're not hosting anything yet"
          emptyDescription="Host a drop-in and it'll show up here."
        />
      </div>
    </main>
  )
}

function DropInSection({
  icon,
  title,
  dropIns,
  hostActions = false,
  emptyTitle,
  emptyDescription,
}: {
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
  title: string
  dropIns: DropIn[]
  hostActions?: boolean
  emptyTitle: string
  emptyDescription: string
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
        <Badge variant="secondary">{dropIns.length}</Badge>
      </div>

      {dropIns.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dropIns.map((dropIn) =>
            hostActions ? (
              <div key={dropIn.id} className="flex flex-col gap-2">
                <DropInCard dropIn={dropIn} />
                <HostActions
                  dropInId={dropIn.id}
                  cancelled={dropIn.status === "CANCELLED"}
                />
              </div>
            ) : (
              <DropInCard key={dropIn.id} dropIn={dropIn} />
            )
          )}
        </div>
      ) : (
        <Empty className="border bg-background">
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={icon} />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/find" className={cn(buttonVariants())}>
              <HugeiconsIcon icon={VolleyballIcon} data-icon="inline-start" />
              Find drop-ins
            </Link>
          </EmptyContent>
        </Empty>
      )}
    </section>
  )
}
