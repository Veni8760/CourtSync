import { redirect } from "next/navigation"

import { getIsSignedIn } from "@/lib/auth"
import { LandingPage } from "@/components/marketing/landing-page"

// Public marketing front door for signed-out visitors; signed-in users skip
// straight into the app.
export default async function RootPage() {
  if (await getIsSignedIn()) redirect("/find")
  return <LandingPage />
}
