import { redirect } from "next/navigation"

import { getIsSignedIn } from "@/lib/auth"

// No marketing site — the product is the map. Send people straight to the find
// screen, or to login if they're not signed in.
export default async function RootPage() {
  redirect((await getIsSignedIn()) ? "/find" : "/login")
}
