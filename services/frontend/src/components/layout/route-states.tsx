import type { ComponentProps } from "react"
import Link from "next/link"
import { Search01Icon, VolleyballIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type RouteStateIcon = ComponentProps<typeof HugeiconsIcon>["icon"]

type RouteLoadingStateProps = {
  badge: string
  title: string
  metricCount?: number
}

type ResourceNotFoundStateProps = {
  badge: string
  title: string
  description: string
  href: string
  cta: string
  icon?: RouteStateIcon
}

export function RouteLoadingState({
  badge,
  title,
  metricCount = 3,
}: RouteLoadingStateProps) {
  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-lg" />
            <div className="min-w-0">
              <Badge variant="outline" className="mb-2">
                {badge}
              </Badge>
              <div className="flex flex-col gap-2">
                <span className="sr-only">{title}</span>
                <Skeleton className="h-9 w-64 max-w-full" />
                <Skeleton className="h-4 w-80 max-w-full" />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: metricCount }, (_, index) => (
              <div
                key={`metric-${index}`}
                className="flex min-w-0 items-center gap-2 rounded-md border bg-card p-3"
              >
                <Skeleton className="size-4 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24 max-w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <RouteLoadingCard />
        <RouteLoadingCard rowCount={5} />
      </section>
    </main>
  )
}

export function ResourceNotFoundState({
  badge,
  title,
  description,
  href,
  cta,
  icon = Search01Icon,
}: ResourceNotFoundStateProps) {
  return (
    <main className="min-h-screen bg-muted/30">
      <section className="mx-auto flex w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="w-full bg-background/80 shadow-sm">
          <CardHeader>
            <Badge variant="outline" className="self-start">
              {badge}
            </Badge>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Empty className="min-h-64 border bg-background">
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={icon} />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>{description}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link href={href} className={cn(buttonVariants())}>
                  <HugeiconsIcon
                    icon={VolleyballIcon}
                    data-icon="inline-start"
                  />
                  {cta}
                </Link>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function RouteLoadingCard({ rowCount = 4 }: { rowCount?: number }) {
  return (
    <Card className="bg-background/80 shadow-sm">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-4 w-32" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-3 w-48 max-w-full" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {Array.from({ length: rowCount }, (_, index) => (
            <div key={`row-${index}`} className="rounded-md border bg-background p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-44 max-w-full" />
                  <Skeleton className="h-3 w-64 max-w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
