import Image from "next/image"
import Link from "next/link"
import { MailOpenIcon, VolleyballIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HugeiconsIcon icon={VolleyballIcon} strokeWidth={2} />
            </div>
            VolleyIQ
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Empty className="max-w-sm border-none">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={MailOpenIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle className="text-2xl font-bold">
                Check your email
              </EmptyTitle>
              <EmptyDescription className="text-sm">
                {email ? (
                  <>
                    We sent a confirmation link to{" "}
                    <span className="font-medium text-foreground">{email}</span>.
                  </>
                ) : (
                  <>We sent you a confirmation link.</>
                )}{" "}
                Click it to finish setting up your account, then sign in.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/login" className={cn(buttonVariants(), "w-full")}>
                Go to sign in
              </Link>
              <EmptyDescription>
                Wrong email? <Link href="/signup">Back to sign up</Link>
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/covers/scarborough-grass.svg"
          alt="Outdoor volleyball court"
          fill
          priority
          sizes="50vw"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
