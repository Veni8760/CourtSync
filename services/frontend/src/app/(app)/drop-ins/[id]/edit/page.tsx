import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CreateDropInForm } from "@/components/drop-ins/create-drop-in-form"
import { buttonVariants } from "@/components/ui/button"
import { requireUser } from "@/lib/auth"
import { listCourts, type Court } from "@/lib/courts"
import { DropInApiError, getDropIn } from "@/lib/dropins"
import { cn } from "@/lib/utils"
import { updateDropInAction } from "./actions"

type EditDropInPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Edit drop-in | CourtSync",
}

export const dynamic = "force-dynamic"

export default async function EditDropInPage({ params }: EditDropInPageProps) {
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

  // Only the organizer may edit; hide existence from everyone else. A cancelled
  // drop-in is frozen — the backend rejects edits, so don't offer the form.
  if (user.id !== dropIn.organizerUserId) notFound()
  if (dropIn.status === "CANCELLED") notFound()

  let courts: Court[] = []
  try {
    courts = await listCourts()
  } catch {
    courts = []
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href={`/drop-ins/${dropIn.id}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
            Back to drop-in
          </Link>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Edit drop-in
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <CreateDropInForm
          courts={courts}
          courtEditable={false}
          submitLabel="Save changes"
          pendingLabel="Saving"
          description="Update your session. The court can't be changed."
          action={updateDropInAction.bind(null, dropIn.id)}
          defaultValues={{
            courtId: dropIn.courtId,
            title: dropIn.title,
            description: dropIn.description ?? "",
            startTime: dropIn.startTime,
            endTime: dropIn.endTime,
            maxPlayers: dropIn.maxPlayers,
            price: dropIn.price,
            skillLevel: dropIn.skillLevel ?? "",
          }}
        />
      </section>
    </main>
  )
}
