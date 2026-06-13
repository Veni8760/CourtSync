import type {
  DropInSession,
  GlobalLeaderboardEntry,
} from "@/lib/mock-data"

export type LandingSessionPreview = Pick<
  DropInSession,
  | "id"
  | "title"
  | "location"
  | "startsAt"
  | "maxPlayers"
  | "registeredPlayers"
  | "skillLevel"
  | "status"
>

export type LandingPlayerPreview = Pick<
  GlobalLeaderboardEntry,
  | "id"
  | "rank"
  | "playerId"
  | "playerName"
  | "initials"
  | "primaryRole"
  | "globalElo"
  | "wins"
  | "losses"
>

export type LandingCommunityPreview = {
  id: string
  name: string
  followerCount: number
}
