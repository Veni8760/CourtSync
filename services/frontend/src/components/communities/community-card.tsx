import Image from "next/image"
import Link from "next/link"
import {
  UserGroupIcon,
  UserCheck01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Community } from "@/lib/mock-data"

type CommunityCardProps = {
  community: Community
}

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Card className="bg-background/80 shadow-sm">
      <Image
        src={community.coverImage}
        alt=""
        width={1600}
        height={720}
        className="aspect-[16/7] object-cover"
      />
      <CardHeader>
        <div className="min-w-0">
          <CardTitle className="truncate">{community.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {community.description}
          </CardDescription>
        </div>
        <CardAction>
          <Badge
            variant={
              community.isFollowedByCurrentUser ? "default" : "secondary"
            }
          >
            <HugeiconsIcon
              icon={
                community.isFollowedByCurrentUser
                  ? UserCheck01Icon
                  : UserAdd01Icon
              }
              data-icon="inline-start"
            />
            {community.isFollowedByCurrentUser ? "Following" : "Follow"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3">
          <HugeiconsIcon icon={UserGroupIcon} className="text-muted-foreground" />
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {community.followerCount.toLocaleString()}
            </div>
            <div className="text-[0.625rem] font-medium uppercase text-muted-foreground">
              Followers
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Link
          href={`/communities/${community.slug}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Open community
        </Link>
      </CardFooter>
    </Card>
  )
}
