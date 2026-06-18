"use client"

import Link from "next/link"
import { useActionState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  initialAuthFormState,
  type AuthFormState,
} from "@/lib/auth-form-state"

type LoginFormProps = Omit<React.ComponentProps<"form">, "action"> & {
  action: (
    state: AuthFormState,
    formData: FormData
  ) => Promise<AuthFormState>
}

export function LoginForm({
  action,
  className,
  ...props
}: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialAuthFormState
  )

  return (
    <form
      action={formAction}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Log in to VolleyIQ</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Use your email and password to continue.
          </p>
        </div>
        {state.error ? (
          <Field data-invalid>
            <FieldError>{state.error}</FieldError>
          </Field>
        ) : null}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Logging in..." : "Log in"}
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
