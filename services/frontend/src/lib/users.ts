export const userSkillLevels = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "COMPETITIVE",
] as const

export type UserSkillLevel = (typeof userSkillLevels)[number]

export type CurrentUserProfileInput = {
  firstName?: string | null
  lastName?: string | null
  skillLevel?: UserSkillLevel | null
}

export type UserRole = "PLAYER" | "ORGANIZER" | "ADMIN"

export type CurrentUserProfile = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  skillLevel: UserSkillLevel | null
  role: UserRole
  createdAt: string
  updatedAt: string
}

export class UserApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = "UserApiError"
  }
}

export async function getCurrentUserProfile(accessToken: string) {
  const response = await fetch(userApiUrl("/users/me"), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })

  return readUserApiResponse<CurrentUserProfile>(response)
}

export async function upsertCurrentUserProfile(
  input: CurrentUserProfileInput,
  accessToken: string
) {
  const response = await fetch(userApiUrl("/users/me"), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  })

  return readUserApiResponse<CurrentUserProfile>(response)
}

function userApiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`
}

function getApiBaseUrl() {
  const baseUrl =
    process.env.COURTSYNC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080/api"

  return baseUrl.replace(/\/+$/, "")
}

async function readUserApiResponse<T>(response: Response) {
  if (response.ok) {
    return response.json() as Promise<T>
  }

  throw new UserApiError(await getErrorMessage(response), response.status)
}

async function getErrorMessage(response: Response) {
  const fallback = `User API request failed with ${response.status}`

  try {
    const body = (await response.json()) as {
      detail?: unknown
      message?: unknown
      error?: unknown
    }
    const message =
      typeof body.detail === "string"
        ? body.detail
        : typeof body.message === "string"
          ? body.message
          : body.error

    return typeof message === "string" ? message : fallback
  } catch {
    return fallback
  }
}
