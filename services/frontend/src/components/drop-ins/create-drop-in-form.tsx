"use client"

import { useActionState } from "react"
import { Add01Icon, VolleyballIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  createDropInAction,
  type CreateDropInFormState,
} from "@/app/(app)/drop-ins/create/actions"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Court } from "@/lib/courts"
import { skillLevelOptions } from "@/lib/form-options"

const initialState: CreateDropInFormState = { formError: null, fieldErrors: {} }

export function CreateDropInForm({ courts }: { courts: Court[] }) {
  const [state, formAction, isPending] = useActionState(
    createDropInAction,
    initialState
  )

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Drop-in details</CardTitle>
        <CardDescription>
          Schedule a session at one of your courts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="create-drop-in-form" action={formAction} className="flex flex-col gap-5">
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors.courtId}>
              <FieldLabel>Court</FieldLabel>
              <Select name="courtId" disabled={isPending} required>
                <SelectTrigger className="w-full" aria-invalid={!!state.fieldErrors.courtId}>
                  <SelectValue placeholder="Select a court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                        {court.city ? ` — ${court.city}` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={toFieldErrors(state.fieldErrors.courtId)} />
            </Field>

            <Field data-invalid={!!state.fieldErrors.title}>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                name="title"
                placeholder="Friday Night Indoor"
                aria-invalid={!!state.fieldErrors.title}
                disabled={isPending}
                required
              />
              <FieldError errors={toFieldErrors(state.fieldErrors.title)} />
            </Field>

            <Field data-invalid={!!state.fieldErrors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Casual 6s, all welcome."
                aria-invalid={!!state.fieldErrors.description}
                disabled={isPending}
              />
              <FieldError errors={toFieldErrors(state.fieldErrors.description)} />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!state.fieldErrors.startTime}>
                <FieldLabel htmlFor="startTime">Start time</FieldLabel>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  aria-invalid={!!state.fieldErrors.startTime}
                  disabled={isPending}
                  required
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.startTime)} />
              </Field>

              <Field data-invalid={!!state.fieldErrors.endTime}>
                <FieldLabel htmlFor="endTime">End time</FieldLabel>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  aria-invalid={!!state.fieldErrors.endTime}
                  disabled={isPending}
                  required
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.endTime)} />
              </Field>
            </div>
            <FieldDescription>
              Start time must be in the future.
            </FieldDescription>
          </FieldGroup>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field data-invalid={!!state.fieldErrors.maxPlayers}>
                <FieldLabel htmlFor="maxPlayers">Max players</FieldLabel>
                <Input
                  id="maxPlayers"
                  name="maxPlayers"
                  type="number"
                  min={1}
                  defaultValue={12}
                  aria-invalid={!!state.fieldErrors.maxPlayers}
                  disabled={isPending}
                  required
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.maxPlayers)} />
              </Field>

              <Field data-invalid={!!state.fieldErrors.price}>
                <FieldLabel htmlFor="price">Price (CAD)</FieldLabel>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={0}
                  aria-invalid={!!state.fieldErrors.price}
                  disabled={isPending}
                  required
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.price)} />
              </Field>

              <Field data-invalid={!!state.fieldErrors.skillLevel}>
                <FieldLabel>Skill level</FieldLabel>
                <Select name="skillLevel" defaultValue="Open" disabled={isPending}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {skillLevelOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError errors={toFieldErrors(state.fieldErrors.skillLevel)} />
              </Field>
            </div>
          </FieldGroup>

          {state.formError ? (
            <div className="text-xs/relaxed text-destructive" role="alert">
              {state.formError}
            </div>
          ) : null}
        </form>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t">
        <div className="flex items-center gap-2 text-xs/relaxed text-muted-foreground">
          <HugeiconsIcon icon={VolleyballIcon} />
          The court is validated by court-service over gRPC on submit.
        </div>
        <Button type="submit" form="create-drop-in-form" disabled={isPending}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
          {isPending ? "Creating" : "Create drop-in"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function toFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }))
}
