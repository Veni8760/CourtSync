import { MarketingHeader } from "@/components/layout/marketing-header"
import { LandingHero } from "./landing-hero"
import { LandingSections } from "./landing-sections"
import type {
  LandingCommunityPreview,
  LandingPlayerPreview,
  LandingSessionPreview,
} from "./types"

type LandingPageProps = {
  sessionsCount: number
  openSessionsCount: number
  totalPlayers: number
  communitiesCount: number
  previewSessions: LandingSessionPreview[]
  previewPlayers: LandingPlayerPreview[]
  previewCommunities: LandingCommunityPreview[]
}

export function LandingPage(props: LandingPageProps) {
  return (
    <>
      <MarketingHeader />
      <main className="min-h-screen bg-background">
        <LandingHero
          previewSessions={props.previewSessions}
          previewPlayers={props.previewPlayers}
        />
        <LandingSections {...props} />
      </main>
    </>
  )
}
