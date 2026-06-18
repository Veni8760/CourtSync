import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CreateDropInForm } from "@/components/drop-ins/create-drop-in-form"
import { buttonVariants } from "@/components/ui/button"
import { requireUser } from "@/lib/auth"
import { listCourts, type Court } from "@/lib/courts"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Create drop-in | CourtSync",
}

export const dynamic = "force-dynamic"

export default async function CreateDropInPage() {
  await requireUser()
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
            href="/find"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
            Back to map
          </Link>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Create drop-in
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {courts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No courts available.{" "}
            <Link href="/courts/create" className="underline">
              Add a court
            </Link>{" "}
            first.
          </p>
        ) : (
          <CreateDropInForm courts={courts} />
        )}
      </section>
    </main>
  )
}
