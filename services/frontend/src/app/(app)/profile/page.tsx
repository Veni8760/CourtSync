import type { Metadata } from "next"

import { getAccessToken, requireUser } from "@/lib/auth"
import { getCurrentUserProfile } from "@/lib/users"
import { ProfileForm } from "./profile-form"

export const metadata: Metadata = {
  title: "Profile | CourtSync",
}

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  await requireUser()
  const accessToken = await getAccessToken()
  const profile = accessToken ? await getCurrentUserProfile(accessToken) : null

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-1 font-heading text-2xl font-semibold">Your profile</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Update how you show up to other players.
      </p>

      {profile ? (
        <ProfileForm profile={profile} />
      ) : (
        <p className="text-sm text-destructive">
          Couldn&apos;t load your profile. Try refreshing.
        </p>
      )}
    </main>
  )
}
