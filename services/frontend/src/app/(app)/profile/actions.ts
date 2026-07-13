"use server"

import { revalidatePath } from "next/cache"

import { getAccessToken, requireUser } from "@/lib/auth"
import {
  upsertCurrentUserProfile,
  userSkillLevels,
  UserApiError,
  type UserSkillLevel,
} from "@/lib/users"

export type ProfileFormState = { error?: string; ok?: boolean }
export const initialProfileFormState: ProfileFormState = {}

function field(formData: FormData, name: string) {
  const value = formData.get(name)?.toString().trim()
  return value ? value : null
}

// Client validation is cosmetic; this is the trust boundary — re-check the skill
// value against the enum and let the backend enforce the rest (@Size, auth).
export async function updateProfile(
  _state: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  await requireUser()
  const accessToken = await getAccessToken()
  if (!accessToken) return { error: "Your session expired. Please sign in again." }

  const skillRaw = field(formData, "skillLevel")
  const skillLevel =
    skillRaw && userSkillLevels.includes(skillRaw as UserSkillLevel)
      ? (skillRaw as UserSkillLevel)
      : null

  try {
    await upsertCurrentUserProfile(
      {
        firstName: field(formData, "firstName"),
        lastName: field(formData, "lastName"),
        skillLevel,
      },
      accessToken
    )
  } catch (error) {
    if (error instanceof UserApiError) return { error: error.message }
    throw error
  }

  revalidatePath("/profile")
  return { ok: true }
}
