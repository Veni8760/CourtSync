"use client"

import { useActionState } from "react"

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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { userSkillLevels, type CurrentUserProfile } from "@/lib/users"
import {
  initialProfileFormState,
  updateProfile,
} from "./actions"

const NONE = "NONE"
const skillItems = [
  { value: NONE, label: "Not set" },
  ...userSkillLevels.map((level) => ({
    value: level,
    label: level.charAt(0) + level.slice(1).toLowerCase(),
  })),
]

export function ProfileForm({ profile }: { profile: CurrentUserProfile }) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialProfileFormState
  )

  return (
    <form action={formAction}>
      <FieldGroup>
        {state.error ? (
          <Field data-invalid>
            <FieldError>{state.error}</FieldError>
          </Field>
        ) : null}
        {state.ok ? (
          <Field>
            <FieldDescription className="text-rally">Profile saved.</FieldDescription>
          </Field>
        ) : null}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" value={profile.email} readOnly disabled />
          <FieldDescription>Email can&apos;t be changed here.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="firstName">First name</FieldLabel>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={profile.firstName ?? ""}
            maxLength={100}
            autoComplete="given-name"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="lastName">Last name</FieldLabel>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={profile.lastName ?? ""}
            maxLength={100}
            autoComplete="family-name"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="skillLevel">Skill level</FieldLabel>
          <Select
            name="skillLevel"
            defaultValue={profile.skillLevel ?? NONE}
            items={skillItems}
          >
            <SelectTrigger id="skillLevel" className="h-9 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {skillItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
