import Image from "next/image"
import Link from "next/link"

import { HugeiconsIcon } from "@hugeicons/react"
import { VolleyballIcon } from "@hugeicons/core-free-icons"

import { LoginForm } from "@/components/auth/login-form"
import { login } from "./actions"

export default function LoginPage() {
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
          <div className="w-full max-w-xs">
            <LoginForm action={login} />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/covers/oshawa-indoor.svg"
          alt="Indoor volleyball court"
          fill
          priority
          sizes="50vw"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
