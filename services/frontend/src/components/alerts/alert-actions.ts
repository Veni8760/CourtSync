"use server"

import { revalidatePath } from "next/cache"

import { requireUser } from "@/lib/auth"
import { markAlertRead, markAllAlertsRead } from "@/lib/alerts"

// The bell lives in the header on every authenticated route, so a read has to
// refresh the whole app shell, not one page.
export async function markAlertReadAction(id: string) {
  await requireUser()
  await markAlertRead(id)
  revalidatePath("/", "layout")
}

export async function markAllAlertsReadAction() {
  await requireUser()
  await markAllAlertsRead()
  revalidatePath("/", "layout")
}
