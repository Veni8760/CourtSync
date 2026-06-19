"use client"

import { useState, useTransition } from "react"
import { Controller, useForm, type ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Add01Icon, VolleyballIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { submitDropIn } from "@/app/(app)/drop-ins/create/actions"
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
import { DateTimePicker } from "@/components/ui/date-time-picker"
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
import {
  createDropInSchema,
  type CreateDropInInput,
  type CreateDropInValues,
} from "@/lib/drop-in-schema"
import { skillLevelOptions } from "@/lib/form-options"

// preprocess/coerce schema fields have `unknown` input types; adapt the Controller
// field to a controlled text/number input (coerce value to a string).
function textInput(field: ControllerRenderProps<CreateDropInInput>) {
  const { value, ...rest } = field
  return { ...rest, value: (value as string | number | undefined) ?? "" }
}

export function CreateDropInForm({ courts }: { courts: Court[] }) {
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateDropInInput, unknown, CreateDropInValues>({
    resolver: zodResolver(createDropInSchema),
    defaultValues: {
      courtId: "",
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      maxPlayers: 12,
      price: 0,
      skillLevel: "Open",
    },
  })
  const { control } = form

  function onSubmit(values: CreateDropInValues) {
    setFormError(null)
    startTransition(async () => {
      const result = await submitDropIn(values)
      if (result?.error) setFormError(result.error)
      // success → the action redirects (throws), nothing returns here.
    })
  }

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Drop-in details</CardTitle>
        <CardDescription>Schedule a session at one of your courts.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="create-drop-in-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <FieldGroup>
            <Controller
              name="courtId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Court</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                    items={courts.map((court) => ({
                      value: court.id,
                      label: `${court.name}${court.city ? ` — ${court.city}` : ""}`,
                    }))}
                  >
                    <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                    {...textInput(field)}
                    id="title"
                    placeholder="Friday Night Indoor"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    {...textInput(field)}
                    id="description"
                    placeholder="Casual 6s, all welcome."
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="startTime"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="startTime">Start time</FieldLabel>
                    <DateTimePicker
                      id="startTime"
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="endTime"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="endTime">End time</FieldLabel>
                    <DateTimePicker
                      id="endTime"
                      value={(field.value as string) ?? ""}
                      onChange={field.onChange}
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <FieldDescription>Start time must be in the future.</FieldDescription>
          </FieldGroup>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="maxPlayers"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="maxPlayers">Max players</FieldLabel>
                    <Input
                      {...textInput(field)}
                      id="maxPlayers"
                      type="number"
                      min={1}
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="price"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="price">Price (CAD)</FieldLabel>
                    <Input
                      {...textInput(field)}
                      id="price"
                      type="number"
                      min={0}
                      step="0.01"
                      aria-invalid={fieldState.invalid}
                      disabled={isPending}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="skillLevel"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Skill level</FieldLabel>
                    <Select
                      value={(field.value as string | undefined) ?? ""}
                      onValueChange={field.onChange}
                      disabled={isPending}
                      items={skillLevelOptions}
                    >
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
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          {formError ? (
            <div className="text-xs/relaxed text-destructive" role="alert">
              {formError}
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
