import type { Metadata } from "next"
import {
  Search01Icon,
  UserGroupIcon,
  VolleyballIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CommunityCard } from "@/components/communities/community-card"
import { SessionCard } from "@/components/drop-ins/session-card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getCommunities,
  getIndependentDropInSessions,
} from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "Explore | VolleyIQ",
  description: "Discover VolleyIQ communities and independent pickup games.",
}

export default function ExplorePage() {
  const communities = getCommunities()
  const independentSessions = getIndependentDropInSessions()

  return (
    <main className="min-h-screen bg-muted/30">
      <section className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HugeiconsIcon icon={Search01Icon} />
            </span>
            <div className="min-w-0">
              <h1 className="font-heading text-3xl font-semibold text-foreground">
                Explore
              </h1>
              <p className="text-sm/relaxed text-muted-foreground">
                Find volleyball communities and independent pickup games.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="communities" className="gap-5">
          <TabsList className="w-full justify-start overflow-x-auto" variant="line">
            <TabsTrigger value="communities">
              <HugeiconsIcon icon={UserGroupIcon} data-icon="inline-start" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="pickup-games">
              <HugeiconsIcon icon={VolleyballIcon} data-icon="inline-start" />
              Pickup Games
            </TabsTrigger>
          </TabsList>

          <TabsContent value="communities">
            {communities.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {communities.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </div>
            ) : (
              <Empty className="min-h-72 border bg-background">
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={UserGroupIcon} />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No communities yet</EmptyTitle>
                  <EmptyDescription>
                    Community discovery will appear here when organizers publish
                    their groups.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </TabsContent>

          <TabsContent value="pickup-games" className="flex flex-col gap-4">
            {independentSessions.length > 0 ? (
              independentSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <Empty className="min-h-72 border bg-background">
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={VolleyballIcon} />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No pickup games posted</EmptyTitle>
                  <EmptyDescription>
                    Independent pickup games will appear here once hosts publish
                    them.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}
