"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod/v4"

import {
  createCourt,
  CourtApiError,
  type NetHeight,
  type Surface,
} from "@/lib/courts"

const surfaceValues = ["INDOOR", "GRASS", "BEACH"] as const satisfies readonly Surface[]
const netHeightValues = ["MENS", "WOMENS", "COED"] as const satisfies readonly NetHeight[]

const createCourtSchema = z.object({
  name: z.string().trim().min(1, "Court name is required.").max(255),
  address: optionalTrimmedString(255),
  city: optionalTrimmedString(100),
  province: optionalTrimmedString(100),
  latitude: optionalCoordinate(-90, 90, "Latitude must be between -90 and 90."),
  longitude: optionalCoordinate(
    -180,
    180,
    "Longitude must be between -180 and 180."
  ),
  surface: z.enum(surfaceValues),
  netHeight: z.enum(netHeightValues),
})

export type CreateCourtFormState = {
  formError: string | null
  fieldErrors: Partial<
    Record<keyof z.input<typeof createCourtSchema>, string[]>
  >
}

export async function createCourtAction(
  _state: CreateCourtFormState,
  formData: FormData
): Promise<CreateCourtFormState> {
  const result = createCourtSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    province: formData.get("province"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    surface: formData.get("surface"),
    netHeight: formData.get("netHeight"),
  })

  if (!result.success) {
    return {
      formError: null,
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  try {
    await createCourt(result.data)
  } catch (error) {
    if (error instanceof CourtApiError) {
      return {
        formError: error.message,
        fieldErrors: {},
      }
    }

    throw error
  }

  revalidatePath("/courts")
  redirect("/courts")
}

function optionalTrimmedString(max: number) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined
      }

      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : undefined
    },
    z.string().max(max).optional()
  )
}

function optionalCoordinate(min: number, max: number, message: string) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined
      }

      const trimmed = value.trim()
      return trimmed.length > 0 ? Number(trimmed) : undefined
    },
    z
      .number()
      .finite("Enter a valid number.")
      .min(min, message)
      .max(max, message)
      .optional()
  )
}
