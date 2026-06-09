"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Add01Icon,
  AlertCircleIcon,
  Cancel01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form"
import { z } from "zod/v4"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DropInSession, PlayerRole } from "@/lib/mock-data"

type SignupFormProps = {
  session: DropInSession
}

const roleOptions = [
  "Setter",
  "Attacker",
  "Defender",
] as const satisfies readonly PlayerRole[]

function createSignupSchema(maxGuests: number) {
  return z.object({
    playerName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(80, "Name must be 80 characters or fewer."),
    playerRole: z.enum(roleOptions),
    guests: z
      .array(
        z.object({
          name: z
            .string()
            .trim()
            .min(2, "Enter a guest name.")
            .max(80, "Guest name must be 80 characters or fewer."),
          role: z.enum(roleOptions),
        })
      )
      .max(maxGuests, `Add up to ${maxGuests} guests for this session.`),
  })
}

type SignupFormValues = z.infer<ReturnType<typeof createSignupSchema>>

export function SignupForm({ session }: SignupFormProps) {
  const router = useRouter()
  const spotsLeft = Math.max(session.maxPlayers - session.registeredPlayers, 0)
  const maxPartySize = Math.max(1, Math.min(spotsLeft || 1, 4))
  const maxGuests = maxPartySize - 1
  const schema = React.useMemo(
    () => createSignupSchema(maxGuests),
    [maxGuests]
  )
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      playerName: "",
      playerRole: "Setter",
      guests: [],
    },
  })
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: "guests",
  })
  const watchedGuests = useWatch({ control, name: "guests" }) ?? []
  const participantCount = 1 + watchedGuests.length
  const totals = getTotals(session.priceCents, participantCount)
  const isFull = spotsLeft === 0

  function onSubmit(values: SignupFormValues) {
    const params = new URLSearchParams({
      players: String(1 + values.guests.length),
      role: values.playerRole,
    })

    router.push(`/drop-ins/${session.id}/success?${params.toString()}`)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="bg-background/80 shadow-sm">
        <CardHeader>
          <CardTitle>Player details</CardTitle>
          <CardDescription>
            Reserve your spot and add guests while capacity is available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="session-signup-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FieldGroup>
              <Field data-invalid={!!errors.playerName}>
                <FieldLabel htmlFor="playerName">Full name</FieldLabel>
                <Input
                  id="playerName"
                  placeholder="Mina Chen"
                  aria-invalid={!!errors.playerName}
                  disabled={isSubmitting}
                  {...register("playerName")}
                />
                <FieldError errors={[errors.playerName]} />
              </Field>

              <Field data-invalid={!!errors.playerRole}>
                <FieldLabel>Preferred role</FieldLabel>
                <Controller
                  control={control}
                  name="playerRole"
                  render={({ field }) => (
                    <RoleSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                      invalid={!!errors.playerRole}
                    />
                  )}
                />
                <FieldDescription>
                  Teams try to keep players in their preferred role first.
                </FieldDescription>
                <FieldError errors={[errors.playerRole]} />
              </Field>
            </FieldGroup>

            <Separator />

            <FieldGroup>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-heading text-sm font-medium">Guests</h2>
                  <p className="text-xs/relaxed text-muted-foreground">
                    {isFull
                      ? "This session is full, so new guests are closed."
                      : `${maxGuests} guest ${maxGuests === 1 ? "spot" : "spots"} available for this signup.`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={fields.length >= maxGuests || isSubmitting}
                  onClick={() => append({ name: "", role: "Attacker" })}
                >
                  <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
                  Add guest
                </Button>
              </div>

              {fields.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-[1fr_12rem_auto] sm:items-start"
                    >
                      <Field data-invalid={!!errors.guests?.[index]?.name}>
                        <FieldLabel htmlFor={`guest-${field.id}-name`}>
                          Guest name
                        </FieldLabel>
                        <Input
                          id={`guest-${field.id}-name`}
                          placeholder="Guest name"
                          aria-invalid={!!errors.guests?.[index]?.name}
                          disabled={isSubmitting}
                          {...register(`guests.${index}.name`)}
                        />
                        <FieldError errors={[errors.guests?.[index]?.name]} />
                      </Field>

                      <Field data-invalid={!!errors.guests?.[index]?.role}>
                        <FieldLabel>Guest role</FieldLabel>
                        <Controller
                          control={control}
                          name={`guests.${index}.role`}
                          render={({ field }) => (
                            <RoleSelect
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isSubmitting}
                              invalid={!!errors.guests?.[index]?.role}
                            />
                          )}
                        />
                        <FieldError errors={[errors.guests?.[index]?.role]} />
                      </Field>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="sm:mt-5"
                        aria-label="Remove guest"
                        disabled={isSubmitting}
                        onClick={() => remove(index)}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed bg-background p-4 text-xs/relaxed text-muted-foreground">
                  No guests added.
                </div>
              )}

              <FieldError errors={[errors.guests]} />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <div className="flex items-center gap-2 text-xs/relaxed text-muted-foreground">
            {isFull ? (
              <>
                <HugeiconsIcon icon={AlertCircleIcon} />
                Submitting places you on the waitlist.
              </>
            ) : (
              <>
                <HugeiconsIcon icon={UserAdd01Icon} />
                {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left.
              </>
            )}
          </div>
          <Button type="submit" form="session-signup-form" disabled={isSubmitting}>
            {isFull ? "Join waitlist" : "Confirm signup"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="h-fit bg-background/80 shadow-sm">
        <CardHeader>
          <CardTitle>Price summary</CardTitle>
          <CardDescription>{session.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <SummaryRow
              label={`${participantCount} ${participantCount === 1 ? "player" : "players"}`}
              value={formatMoney(totals.subtotalCents, session.currency)}
            />
            <SummaryRow
              label="Service fee"
              value={formatMoney(totals.serviceFeeCents, session.currency)}
            />
            <Separator />
            <SummaryRow
              label="Total due"
              value={formatMoney(totals.totalCents, session.currency)}
              strong
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t">
          <Badge variant={session.priceCents === 0 ? "secondary" : "outline"}>
            {session.priceCents === 0
              ? "Free session"
              : `${formatMoney(session.priceCents, session.currency)} each`}
          </Badge>
          <span className="text-xs/relaxed text-muted-foreground">
            {session.skillLevel}
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}

function RoleSelect({
  value,
  onValueChange,
  disabled,
  invalid,
}: {
  value: PlayerRole
  onValueChange: (value: PlayerRole) => void
  disabled?: boolean
  invalid?: boolean
}) {
  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (isPlayerRole(nextValue)) {
          onValueChange(nextValue)
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-full" aria-invalid={invalid}>
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {roleOptions.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function isPlayerRole(value: PlayerRole | null): value is PlayerRole {
  return value !== null
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs/relaxed text-muted-foreground">{label}</span>
      <span
        className={
          strong
            ? "font-heading text-lg font-semibold"
            : "text-sm font-medium"
        }
      >
        {value}
      </span>
    </div>
  )
}

function getTotals(priceCents: number, playerCount: number) {
  const subtotalCents = priceCents * playerCount
  const serviceFeeCents =
    subtotalCents === 0 ? 0 : Math.round(subtotalCents * 0.08)

  return {
    subtotalCents,
    serviceFeeCents,
    totalCents: subtotalCents + serviceFeeCents,
  }
}

function formatMoney(cents: number, currency: DropInSession["currency"]) {
  if (cents === 0) {
    return "Free"
  }

  return `$${(cents / 100).toFixed(2)} ${currency}`
}
