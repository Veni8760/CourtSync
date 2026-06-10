"use client"

import { useActionState } from "react"
import {
  Add01Icon,
  Location01Icon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  createCourtAction,
  type CreateCourtFormState,
} from "@/app/(app)/courts/create/actions"
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
import { netHeightOptions, surfaceOptions } from "@/lib/courts"

const initialCreateCourtFormState: CreateCourtFormState = {
  formError: null,
  fieldErrors: {},
}

export function CreateCourtForm() {
  const [state, formAction, isPending] = useActionState(
    createCourtAction,
    initialCreateCourtFormState
  )

  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>Court details</CardTitle>
        <CardDescription>
          Add a playable location that drop-ins can use later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="create-court-form" action={formAction} className="flex flex-col gap-5">
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors.name}>
              <FieldLabel htmlFor="name">Court name</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="Toronto Volleyball Centre"
                aria-invalid={!!state.fieldErrors.name}
                disabled={isPending}
                required
              />
              <FieldError errors={toFieldErrors(state.fieldErrors.name)} />
            </Field>

            <Field data-invalid={!!state.fieldErrors.address}>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                name="address"
                placeholder="123 Queen St W"
                aria-invalid={!!state.fieldErrors.address}
                disabled={isPending}
              />
              <FieldError errors={toFieldErrors(state.fieldErrors.address)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!state.fieldErrors.city}>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input
                  id="city"
                  name="city"
                  placeholder="Toronto"
                  aria-invalid={!!state.fieldErrors.city}
                  disabled={isPending}
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.city)} />
              </Field>

              <Field data-invalid={!!state.fieldErrors.province}>
                <FieldLabel htmlFor="province">Province</FieldLabel>
                <Input
                  id="province"
                  name="province"
                  placeholder="Ontario"
                  aria-invalid={!!state.fieldErrors.province}
                  disabled={isPending}
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.province)} />
              </Field>
            </div>
          </FieldGroup>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!state.fieldErrors.surface}>
                <FieldLabel>Surface</FieldLabel>
                <Select name="surface" defaultValue="INDOOR" disabled={isPending} required>
                  <SelectTrigger className="w-full" aria-invalid={!!state.fieldErrors.surface}>
                    <SelectValue placeholder="Select surface" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {surfaceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Indoor, grass, or beach keeps court filtering simple.
                </FieldDescription>
                <FieldError errors={toFieldErrors(state.fieldErrors.surface)} />
              </Field>

              <Field data-invalid={!!state.fieldErrors.netHeight}>
                <FieldLabel>Net height</FieldLabel>
                <Select name="netHeight" defaultValue="COED" disabled={isPending} required>
                  <SelectTrigger className="w-full" aria-invalid={!!state.fieldErrors.netHeight}>
                    <SelectValue placeholder="Select net height" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {netHeightOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Used later when hosts match games to available courts.
                </FieldDescription>
                <FieldError errors={toFieldErrors(state.fieldErrors.netHeight)} />
              </Field>
            </div>
          </FieldGroup>

          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!state.fieldErrors.latitude}>
                <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="43.6532"
                  aria-invalid={!!state.fieldErrors.latitude}
                  disabled={isPending}
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.latitude)} />
              </Field>

              <Field data-invalid={!!state.fieldErrors.longitude}>
                <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="-79.3832"
                  aria-invalid={!!state.fieldErrors.longitude}
                  disabled={isPending}
                />
                <FieldError errors={toFieldErrors(state.fieldErrors.longitude)} />
              </Field>
            </div>
            <FieldDescription>
              Coordinates are optional for now but will support nearby court search.
            </FieldDescription>
          </FieldGroup>

          {state.formError ? (
            <div className="flex items-center gap-2 text-xs/relaxed text-destructive" role="alert">
              <HugeiconsIcon icon={Location01Icon} />
              {state.formError}
            </div>
          ) : null}
        </form>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t">
        <div className="flex items-center gap-2 text-xs/relaxed text-muted-foreground">
          <HugeiconsIcon icon={VolleyballIcon} />
          Saved courts appear in the list immediately.
        </div>
        <Button type="submit" form="create-court-form" disabled={isPending}>
          <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
          {isPending ? "Creating" : "Create court"}
        </Button>
      </CardFooter>
    </Card>
  )
}

function toFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }))
}
