import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CheckmarkCircle02Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  getAllDropInSessions,
  getCheckoutTotals,
  getDropInSessionById,
  type DropInSession,
  type PlayerRole,
} from "@/lib/mock-data"

type SuccessPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    players?: string | string[]
    role?: string | string[]
  }>
}

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  month: "short",
  day: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat("en-CA", {
  hour: "numeric",
  minute: "2-digit",
})

const roleOptions = new Set<PlayerRole>(["Setter", "Attacker", "Defender"])

export function generateStaticParams() {
  return getAllDropInSessions().map((session) => ({
    id: session.id,
  }))
}

export default async function SuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { id } = await params
  const query = await searchParams
  const session = getDropInSessionById(id)

  if (!session) {
    notFound()
  }

  const playerCount = readPositiveInteger(query.players)
  const selectedRole = readRole(query.role)
  const totals = getCheckoutTotals(session.id, playerCount)

  if (!totals) {
    notFound()
  }

  const startsAt = new Date(session.startsAt)
  const endsAt = new Date(session.endsAt)
  const receiptId = `VIQ-${session.id.slice(8, 14).toUpperCase()}-${totals.playerCount}`

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} />
          </span>
          <div>
            <Badge variant="secondary" className="mb-2">
              Receipt {receiptId}
            </Badge>
            <h1 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Signup confirmed
            </h1>
            <p className="mt-2 text-sm/relaxed text-muted-foreground">
              Your registration for {session.title} is ready.
            </p>
          </div>
        </div>

        <Card className="bg-background/80 shadow-sm">
          <CardHeader>
            <CardTitle>Receipt</CardTitle>
            <CardDescription>
              {dateFormatter.format(startsAt)} at {timeFormatter.format(startsAt)}
              -{timeFormatter.format(endsAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReceiptMetric
                  icon={VolleyballIcon}
                  label="Session"
                  value={session.title}
                />
                <ReceiptMetric
                  icon={UserGroupIcon}
                  label="Players"
                  value={String(totals.playerCount)}
                />
              </div>

              <div className="rounded-lg border bg-background p-4">
                <div className="flex flex-col gap-3">
                  <ReceiptRow
                    label={`${totals.playerCount} ${totals.playerCount === 1 ? "player" : "players"}`}
                    value={formatMoney(totals.subtotalCents, totals.currency)}
                  />
                  <ReceiptRow
                    label="Service fee"
                    value={formatMoney(totals.serviceFeeCents, totals.currency)}
                  />
                  <Separator />
                  <ReceiptRow
                    label="Total"
                    value={formatMoney(totals.totalCents, totals.currency)}
                    strong
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{session.skillLevel}</Badge>
                {selectedRole ? <Badge>{selectedRole}</Badge> : null}
                <Badge variant={session.status === "Full" ? "secondary" : "outline"}>
                  {session.status === "Full" ? "Waitlist" : "Confirmed"}
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between gap-3 border-t">
            <Link
              href="/explore"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              Explore
            </Link>
            <Link
              href={`/drop-ins/${session.id}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Session details
            </Link>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}

function ReceiptMetric({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md bg-muted/50 p-3">
      <HugeiconsIcon icon={icon} className="shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-xs font-medium">{value}</div>
      </div>
    </div>
  )
}

function ReceiptRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs/relaxed text-muted-foreground">{label}</span>
      <span
        className={
          strong
            ? "font-heading text-lg font-semibold"
            : "text-sm font-medium"
        }
      >
        {value}
      </span>
    </div>
  )
}

function readPositiveInteger(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value
  const parsed = Number.parseInt(rawValue ?? "1", 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function readRole(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value

  return roleOptions.has(rawValue as PlayerRole)
    ? (rawValue as PlayerRole)
    : null
}

function formatMoney(cents: number, currency: DropInSession["currency"]) {
  if (cents === 0) {
    return "Free"
  }

  return `$${(cents / 100).toFixed(2)} ${currency}`
}
