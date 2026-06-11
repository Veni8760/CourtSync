import type { Metadata } from "next"
import Link from "next/link"
import {
  Add01Icon,
  AlertCircleIcon,
  CalendarAdd01Icon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DevPlayerBadge } from "@/components/drop-ins/dev-player-badge"
import { DropInCard } from "@/components/drop-ins/drop-in-card"
import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { DropInApiError, listDropIns, type DropIn } from "@/lib/dropins"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Drop-ins | VolleyIQ",
  description: "Browse and create volleyball drop-in sessions.",
}

export const dynamic = "force-dynamic"

export default async function DropInsPage() {
  const { dropIns, error } = await getDropIns()

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={VolleyballIcon} />
              </span>
              <div className="min-w-0">
                <h1 className="font-heading text-3xl font-semibold text-foreground">
                  Drop-ins
                </h1>
                <p className="text-sm/relaxed text-muted-foreground">
                  Open volleyball sessions you can join.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DevPlayerBadge />
              <Link href="/drop-ins/create" className={cn(buttonVariants({ size: "lg" }))}>
                <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
                Create drop-in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        {error ? <DropInsError message={error} /> : null}
        {!error && dropIns.length === 0 ? <DropInsEmpty /> : null}
        {dropIns.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dropIns.map((dropIn) => (
              <DropInCard key={dropIn.id} dropIn={dropIn} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

async function getDropIns() {
  try {
    return { dropIns: await listDropIns(), error: null }
  } catch (error) {
    return {
      dropIns: [] as DropIn[],
      error:
        error instanceof DropInApiError
          ? error.message
          : "Unable to load drop-ins right now.",
    }
  }
}

function DropInsEmpty() {
  return (
    <Empty className="min-h-72 border bg-background">
      <EmptyMedia variant="icon">
        <HugeiconsIcon icon={CalendarAdd01Icon} />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No drop-ins yet</EmptyTitle>
        <EmptyDescription>
          Create the first drop-in so players have a session to join.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/drop-ins/create" className={cn(buttonVariants())}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
          Create drop-in
        </Link>
      </EmptyContent>
    </Empty>
  )
}

function DropInsError({ message }: { message: string }) {
  return (
    <Empty className="min-h-72 border bg-background">
      <EmptyMedia variant="icon">
        <HugeiconsIcon icon={AlertCircleIcon} />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>Drop-ins unavailable</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
