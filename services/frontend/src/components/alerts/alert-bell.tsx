import { getUnreadAlertCount, listAlerts, type PlayerAlert } from "@/lib/alerts"
import { AlertBellMenu } from "./alert-bell-menu"

/**
 * Server half of the bell: fetches the feed and the badge for the signed-in user,
 * then hands them to the client popup. Rendered in the header, so a failing
 * notification-service must degrade to "no alerts" rather than break every page.
 */
export async function AlertBell() {
  let alerts: PlayerAlert[] = []
  let unread = 0

  try {
    const [feed, count] = await Promise.all([listAlerts(), getUnreadAlertCount()])
    alerts = feed
    unread = count.unread
  } catch {
    return null
  }

  return <AlertBellMenu alerts={alerts} unread={unread} />
}
