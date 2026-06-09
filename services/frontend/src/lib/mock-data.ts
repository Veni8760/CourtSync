export type Community = {
  id: string
  name: string
  slug: string
  description: string
  coverImage: string
  followerCount: number
  isFollowedByCurrentUser: boolean
}

export type DropInSession = {
  id: string
  communityId: string | null
  title: string
  location: string
  startsAt: string
  endsAt: string
  priceCents: number
  currency: "CAD"
  maxPlayers: number
  registeredPlayers: number
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "Open"
  status: "Open" | "Filling fast" | "Full"
}

export type PlayerRole = "Setter" | "Attacker" | "Defender"

export type CheckoutTotals = {
  sessionId: string
  playerCount: number
  subtotalCents: number
  serviceFeeCents: number
  totalCents: number
  currency: "CAD"
}

export type SessionSignup = {
  id: string
  sessionId: string
  playerId: string
  playerName: string
  preferredRoles: PlayerRole[]
  partySize: number
  status: "Confirmed" | "Waitlisted"
  registeredAt: string
}

export type GeneratedTeamPlayer = {
  id: string
  playerId: string
  playerName: string
  preferredRoles: PlayerRole[]
  assignedRole: PlayerRole
  outOfPosition: boolean
}

export type GeneratedTeam = {
  id: string
  sessionId: string
  name: string
  court: string
  players: GeneratedTeamPlayer[]
}

export type SessionGame = {
  id: string
  sessionId: string
  round: number
  court: string
  teamAName: string
  teamBName: string
  status: "Scheduled" | "Final"
  teamAScore?: number
  teamBScore?: number
}

export type LeaderboardEntry = {
  id: string
  communityId: string
  rank: number
  playerName: string
  rating: number
  wins: number
  losses: number
}

export type PlayerActivityDay = {
  date: string
  sessions: number
}

export type PlayerEloPoint = {
  date: string
  rating: number
  change: number
}

export type PlayerMatchLedgerEntry = {
  id: string
  date: string
  sessionTitle: string
  communityName: string
  role: PlayerRole
  result: "Win" | "Loss"
  score: string
  eloChange: number
}

export type PlayerProfile = {
  id: string
  name: string
  initials: string
  homeArea: string
  skillLevel: DropInSession["skillLevel"]
  globalElo: number
  preferredRoles: PlayerRole[]
  primaryRole: PlayerRole
  wins: number
  losses: number
  currentStreak: string
  roleFitPercent: number
  activityDays: PlayerActivityDay[]
  eloHistory: PlayerEloPoint[]
  matchLedger: PlayerMatchLedgerEntry[]
}

export type GlobalLeaderboardEntry = {
  id: string
  rank: number
  playerId: string
  playerName: string
  initials: string
  homeArea: string
  skillLevel: DropInSession["skillLevel"]
  primaryRole: PlayerRole
  preferredRoles: PlayerRole[]
  globalElo: number
  wins: number
  losses: number
  winRatePercent: number
  roleFitPercent: number
  currentStreak: string
}

const communities: Community[] = [
  {
    id: "community-oshawa-indoor",
    name: "Oshawa Indoor",
    slug: "oshawa-indoor",
    description:
      "Official indoor drop-ins for competitive and intermediate players across Durham Region.",
    coverImage: "/covers/oshawa-indoor.svg",
    followerCount: 428,
    isFollowedByCurrentUser: true,
  },
  {
    id: "community-scarborough-grass",
    name: "Scarborough Grass",
    slug: "scarborough-grass",
    description:
      "Grass volleyball meetups, weekend ladders, and summer pickup around Scarborough parks.",
    coverImage: "/covers/scarborough-grass.svg",
    followerCount: 312,
    isFollowedByCurrentUser: false,
  },
]

const dropInSessions: DropInSession[] = [
  {
    id: "session-friday-oshawa",
    communityId: "community-oshawa-indoor",
    title: "Friday Night Indoor Drop-In",
    location: "Oshawa Community Centre",
    startsAt: "2026-05-15T19:00:00-04:00",
    endsAt: "2026-05-15T22:00:00-04:00",
    priceCents: 1200,
    currency: "CAD",
    maxPlayers: 24,
    registeredPlayers: 18,
    skillLevel: "Intermediate",
    status: "Open",
  },
  {
    id: "session-sunday-oshawa",
    communityId: "community-oshawa-indoor",
    title: "Sunday Advanced Runs",
    location: "Durham College Athletic Centre",
    startsAt: "2026-05-17T18:30:00-04:00",
    endsAt: "2026-05-17T21:30:00-04:00",
    priceCents: 1500,
    currency: "CAD",
    maxPlayers: 18,
    registeredPlayers: 16,
    skillLevel: "Advanced",
    status: "Filling fast",
  },
  {
    id: "session-saturday-scarborough",
    communityId: "community-scarborough-grass",
    title: "Saturday Grass Doubles",
    location: "Thomson Memorial Park",
    startsAt: "2026-05-16T10:00:00-04:00",
    endsAt: "2026-05-16T13:00:00-04:00",
    priceCents: 800,
    currency: "CAD",
    maxPlayers: 20,
    registeredPlayers: 14,
    skillLevel: "Open",
    status: "Open",
  },
  {
    id: "session-wednesday-scarborough",
    communityId: "community-scarborough-grass",
    title: "Wednesday Sunset Pickup",
    location: "Milliken Park",
    startsAt: "2026-05-20T18:00:00-04:00",
    endsAt: "2026-05-20T20:30:00-04:00",
    priceCents: 500,
    currency: "CAD",
    maxPlayers: 16,
    registeredPlayers: 16,
    skillLevel: "Beginner",
    status: "Full",
  },
  {
    id: "session-independent-north-york",
    communityId: null,
    title: "North York Pickup Night",
    location: "Avondale Public School",
    startsAt: "2026-05-18T20:00:00-04:00",
    endsAt: "2026-05-18T22:00:00-04:00",
    priceCents: 1000,
    currency: "CAD",
    maxPlayers: 12,
    registeredPlayers: 7,
    skillLevel: "Intermediate",
    status: "Open",
  },
  {
    id: "session-independent-downtown",
    communityId: null,
    title: "Downtown Lunch Volleyball",
    location: "Regent Park Athletic Grounds",
    startsAt: "2026-05-21T12:00:00-04:00",
    endsAt: "2026-05-21T13:30:00-04:00",
    priceCents: 0,
    currency: "CAD",
    maxPlayers: 18,
    registeredPlayers: 9,
    skillLevel: "Open",
    status: "Open",
  },
]

const sessionSignups: SessionSignup[] = [
  {
    id: "signup-friday-mina",
    sessionId: "session-friday-oshawa",
    playerId: "player-mina-chen",
    playerName: "Mina Chen",
    preferredRoles: ["Setter"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T09:10:00-04:00",
  },
  {
    id: "signup-friday-ali",
    sessionId: "session-friday-oshawa",
    playerId: "player-ali-rahman",
    playerName: "Ali Rahman",
    preferredRoles: ["Attacker", "Defender"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T09:16:00-04:00",
  },
  {
    id: "signup-friday-layla",
    sessionId: "session-friday-oshawa",
    playerId: "player-layla-grant",
    playerName: "Layla Grant",
    preferredRoles: ["Defender", "Setter"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T09:22:00-04:00",
  },
  {
    id: "signup-friday-noah",
    sessionId: "session-friday-oshawa",
    playerId: "player-noah-patel",
    playerName: "Noah Patel",
    preferredRoles: ["Attacker"],
    partySize: 2,
    status: "Confirmed",
    registeredAt: "2026-05-12T10:04:00-04:00",
  },
  {
    id: "signup-friday-priya",
    sessionId: "session-friday-oshawa",
    playerId: "player-priya-shah",
    playerName: "Priya Shah",
    preferredRoles: ["Setter", "Defender"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T10:37:00-04:00",
  },
  {
    id: "signup-friday-ethan",
    sessionId: "session-friday-oshawa",
    playerId: "player-ethan-ross",
    playerName: "Ethan Ross",
    preferredRoles: ["Attacker"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T11:13:00-04:00",
  },
  {
    id: "signup-friday-sofia",
    sessionId: "session-friday-oshawa",
    playerId: "player-sofia-martin",
    playerName: "Sofia Martin",
    preferredRoles: ["Defender"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T11:48:00-04:00",
  },
  {
    id: "signup-friday-lucas",
    sessionId: "session-friday-oshawa",
    playerId: "player-lucas-kim",
    playerName: "Lucas Kim",
    preferredRoles: ["Setter"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T12:06:00-04:00",
  },
  {
    id: "signup-friday-chloe",
    sessionId: "session-friday-oshawa",
    playerId: "player-chloe-singh",
    playerName: "Chloe Singh",
    preferredRoles: ["Defender", "Attacker"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T13:20:00-04:00",
  },
  {
    id: "signup-friday-daniel",
    sessionId: "session-friday-oshawa",
    playerId: "player-daniel-woods",
    playerName: "Daniel Woods",
    preferredRoles: ["Attacker"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T13:31:00-04:00",
  },
  {
    id: "signup-friday-aisha",
    sessionId: "session-friday-oshawa",
    playerId: "player-aisha-owens",
    playerName: "Aisha Owens",
    preferredRoles: ["Setter", "Defender"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T14:02:00-04:00",
  },
  {
    id: "signup-friday-marco",
    sessionId: "session-friday-oshawa",
    playerId: "player-marco-ibarra",
    playerName: "Marco Ibarra",
    preferredRoles: ["Defender"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-12T14:45:00-04:00",
  },
  {
    id: "signup-sunday-mina",
    sessionId: "session-sunday-oshawa",
    playerId: "player-mina-chen",
    playerName: "Mina Chen",
    preferredRoles: ["Setter"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-13T08:14:00-04:00",
  },
  {
    id: "signup-sunday-ali",
    sessionId: "session-sunday-oshawa",
    playerId: "player-ali-rahman",
    playerName: "Ali Rahman",
    preferredRoles: ["Attacker"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-13T08:21:00-04:00",
  },
  {
    id: "signup-sunday-layla",
    sessionId: "session-sunday-oshawa",
    playerId: "player-layla-grant",
    playerName: "Layla Grant",
    preferredRoles: ["Defender"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-13T08:30:00-04:00",
  },
  {
    id: "signup-north-york-jordan",
    sessionId: "session-independent-north-york",
    playerId: "player-jordan-lee",
    playerName: "Jordan Lee",
    preferredRoles: ["Setter", "Attacker"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-13T17:11:00-04:00",
  },
  {
    id: "signup-north-york-emma",
    sessionId: "session-independent-north-york",
    playerId: "player-emma-rodriguez",
    playerName: "Emma Rodriguez",
    preferredRoles: ["Defender"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-13T17:44:00-04:00",
  },
  {
    id: "signup-north-york-hamza",
    sessionId: "session-independent-north-york",
    playerId: "player-hamza-malik",
    playerName: "Hamza Malik",
    preferredRoles: ["Attacker"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-13T18:09:00-04:00",
  },
  {
    id: "signup-north-york-sara",
    sessionId: "session-independent-north-york",
    playerId: "player-sara-ahmed",
    playerName: "Sara Ahmed",
    preferredRoles: ["Setter"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-13T18:27:00-04:00",
  },
  {
    id: "signup-north-york-omar",
    sessionId: "session-independent-north-york",
    playerId: "player-omar-lewis",
    playerName: "Omar Lewis",
    preferredRoles: ["Defender", "Attacker"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-13T19:03:00-04:00",
  },
  {
    id: "signup-north-york-grace",
    sessionId: "session-independent-north-york",
    playerId: "player-grace-ng",
    playerName: "Grace Ng",
    preferredRoles: ["Defender"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-13T19:17:00-04:00",
  },
  {
    id: "signup-north-york-mateo",
    sessionId: "session-independent-north-york",
    playerId: "player-mateo-diaz",
    playerName: "Mateo Diaz",
    preferredRoles: ["Attacker"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-13T19:58:00-04:00",
  },
  {
    id: "signup-downtown-ava",
    sessionId: "session-independent-downtown",
    playerId: "player-ava-thomas",
    playerName: "Ava Thomas",
    preferredRoles: ["Setter"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-14T09:01:00-04:00",
  },
  {
    id: "signup-downtown-ben",
    sessionId: "session-independent-downtown",
    playerId: "player-ben-wong",
    playerName: "Ben Wong",
    preferredRoles: ["Attacker"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-14T09:09:00-04:00",
  },
  {
    id: "signup-downtown-nadia",
    sessionId: "session-independent-downtown",
    playerId: "player-nadia-hassan",
    playerName: "Nadia Hassan",
    preferredRoles: ["Defender"],
    partySize: 1,
    status: "Confirmed",
    registeredAt: "2026-05-14T09:13:00-04:00",
  },
]

const generatedTeams: GeneratedTeam[] = [
  {
    id: "team-friday-alpha",
    sessionId: "session-friday-oshawa",
    name: "Team Alpha",
    court: "Court 1",
    players: [
      {
        id: "team-player-friday-mina",
        playerId: "player-mina-chen",
        playerName: "Mina Chen",
        preferredRoles: ["Setter"],
        assignedRole: "Setter",
        outOfPosition: false,
      },
      {
        id: "team-player-friday-ali",
        playerId: "player-ali-rahman",
        playerName: "Ali Rahman",
        preferredRoles: ["Attacker", "Defender"],
        assignedRole: "Attacker",
        outOfPosition: false,
      },
      {
        id: "team-player-friday-layla",
        playerId: "player-layla-grant",
        playerName: "Layla Grant",
        preferredRoles: ["Defender", "Setter"],
        assignedRole: "Defender",
        outOfPosition: false,
      },
    ],
  },
  {
    id: "team-friday-bravo",
    sessionId: "session-friday-oshawa",
    name: "Team Bravo",
    court: "Court 1",
    players: [
      {
        id: "team-player-friday-noah",
        playerId: "player-noah-patel",
        playerName: "Noah Patel",
        preferredRoles: ["Attacker"],
        assignedRole: "Attacker",
        outOfPosition: false,
      },
      {
        id: "team-player-friday-priya",
        playerId: "player-priya-shah",
        playerName: "Priya Shah",
        preferredRoles: ["Setter", "Defender"],
        assignedRole: "Setter",
        outOfPosition: false,
      },
      {
        id: "team-player-friday-ethan",
        playerId: "player-ethan-ross",
        playerName: "Ethan Ross",
        preferredRoles: ["Attacker"],
        assignedRole: "Defender",
        outOfPosition: true,
      },
    ],
  },
  {
    id: "team-friday-charlie",
    sessionId: "session-friday-oshawa",
    name: "Team Charlie",
    court: "Court 2",
    players: [
      {
        id: "team-player-friday-sofia",
        playerId: "player-sofia-martin",
        playerName: "Sofia Martin",
        preferredRoles: ["Defender"],
        assignedRole: "Defender",
        outOfPosition: false,
      },
      {
        id: "team-player-friday-lucas",
        playerId: "player-lucas-kim",
        playerName: "Lucas Kim",
        preferredRoles: ["Setter"],
        assignedRole: "Setter",
        outOfPosition: false,
      },
      {
        id: "team-player-friday-chloe",
        playerId: "player-chloe-singh",
        playerName: "Chloe Singh",
        preferredRoles: ["Defender", "Attacker"],
        assignedRole: "Attacker",
        outOfPosition: false,
      },
    ],
  },
  {
    id: "team-friday-delta",
    sessionId: "session-friday-oshawa",
    name: "Team Delta",
    court: "Court 2",
    players: [
      {
        id: "team-player-friday-daniel",
        playerId: "player-daniel-woods",
        playerName: "Daniel Woods",
        preferredRoles: ["Attacker"],
        assignedRole: "Attacker",
        outOfPosition: false,
      },
      {
        id: "team-player-friday-aisha",
        playerId: "player-aisha-owens",
        playerName: "Aisha Owens",
        preferredRoles: ["Setter", "Defender"],
        assignedRole: "Setter",
        outOfPosition: false,
      },
      {
        id: "team-player-friday-marco",
        playerId: "player-marco-ibarra",
        playerName: "Marco Ibarra",
        preferredRoles: ["Defender"],
        assignedRole: "Defender",
        outOfPosition: false,
      },
    ],
  },
  {
    id: "team-north-york-a",
    sessionId: "session-independent-north-york",
    name: "North Side",
    court: "Court A",
    players: [
      {
        id: "team-player-north-york-jordan",
        playerId: "player-jordan-lee",
        playerName: "Jordan Lee",
        preferredRoles: ["Setter", "Attacker"],
        assignedRole: "Setter",
        outOfPosition: false,
      },
      {
        id: "team-player-north-york-emma",
        playerId: "player-emma-rodriguez",
        playerName: "Emma Rodriguez",
        preferredRoles: ["Defender"],
        assignedRole: "Defender",
        outOfPosition: false,
      },
      {
        id: "team-player-north-york-hamza",
        playerId: "player-hamza-malik",
        playerName: "Hamza Malik",
        preferredRoles: ["Attacker"],
        assignedRole: "Attacker",
        outOfPosition: false,
      },
    ],
  },
  {
    id: "team-north-york-b",
    sessionId: "session-independent-north-york",
    name: "York Setters",
    court: "Court A",
    players: [
      {
        id: "team-player-north-york-sara",
        playerId: "player-sara-ahmed",
        playerName: "Sara Ahmed",
        preferredRoles: ["Setter"],
        assignedRole: "Setter",
        outOfPosition: false,
      },
      {
        id: "team-player-north-york-omar",
        playerId: "player-omar-lewis",
        playerName: "Omar Lewis",
        preferredRoles: ["Defender", "Attacker"],
        assignedRole: "Defender",
        outOfPosition: false,
      },
      {
        id: "team-player-north-york-grace",
        playerId: "player-grace-ng",
        playerName: "Grace Ng",
        preferredRoles: ["Defender"],
        assignedRole: "Attacker",
        outOfPosition: true,
      },
    ],
  },
  {
    id: "team-downtown-one",
    sessionId: "session-independent-downtown",
    name: "Lunch Rush",
    court: "Outdoor 1",
    players: [
      {
        id: "team-player-downtown-ava",
        playerId: "player-ava-thomas",
        playerName: "Ava Thomas",
        preferredRoles: ["Setter"],
        assignedRole: "Setter",
        outOfPosition: false,
      },
      {
        id: "team-player-downtown-ben",
        playerId: "player-ben-wong",
        playerName: "Ben Wong",
        preferredRoles: ["Attacker"],
        assignedRole: "Attacker",
        outOfPosition: false,
      },
      {
        id: "team-player-downtown-nadia",
        playerId: "player-nadia-hassan",
        playerName: "Nadia Hassan",
        preferredRoles: ["Defender"],
        assignedRole: "Defender",
        outOfPosition: false,
      },
    ],
  },
]

const sessionGames: SessionGame[] = [
  {
    id: "game-friday-1",
    sessionId: "session-friday-oshawa",
    round: 1,
    court: "Court 1",
    teamAName: "Team Alpha",
    teamBName: "Team Bravo",
    status: "Scheduled",
  },
  {
    id: "game-friday-2",
    sessionId: "session-friday-oshawa",
    round: 1,
    court: "Court 2",
    teamAName: "Team Charlie",
    teamBName: "Team Delta",
    status: "Scheduled",
  },
  {
    id: "game-friday-3",
    sessionId: "session-friday-oshawa",
    round: 2,
    court: "Court 1",
    teamAName: "Team Alpha",
    teamBName: "Team Charlie",
    status: "Scheduled",
  },
  {
    id: "game-north-york-1",
    sessionId: "session-independent-north-york",
    round: 1,
    court: "Court A",
    teamAName: "North Side",
    teamBName: "York Setters",
    status: "Scheduled",
  },
  {
    id: "game-downtown-1",
    sessionId: "session-independent-downtown",
    round: 1,
    court: "Outdoor 1",
    teamAName: "Lunch Rush",
    teamBName: "Open Challenger",
    status: "Scheduled",
  },
]

const leaderboardEntries: LeaderboardEntry[] = [
  {
    id: "leaderboard-oshawa-1",
    communityId: "community-oshawa-indoor",
    rank: 1,
    playerName: "Mina Chen",
    rating: 1350,
    wins: 18,
    losses: 5,
  },
  {
    id: "leaderboard-oshawa-2",
    communityId: "community-oshawa-indoor",
    rank: 2,
    playerName: "Ali Rahman",
    rating: 1320,
    wins: 16,
    losses: 7,
  },
  {
    id: "leaderboard-oshawa-3",
    communityId: "community-oshawa-indoor",
    rank: 3,
    playerName: "Layla Grant",
    rating: 1300,
    wins: 14,
    losses: 8,
  },
  {
    id: "leaderboard-scarborough-1",
    communityId: "community-scarborough-grass",
    rank: 1,
    playerName: "Hamza Malik",
    rating: 1220,
    wins: 12,
    losses: 6,
  },
  {
    id: "leaderboard-scarborough-2",
    communityId: "community-scarborough-grass",
    rank: 2,
    playerName: "Sara Ahmed",
    rating: 1180,
    wins: 10,
    losses: 8,
  },
  {
    id: "leaderboard-scarborough-3",
    communityId: "community-scarborough-grass",
    rank: 3,
    playerName: "Omar Lewis",
    rating: 1160,
    wins: 8,
    losses: 9,
  },
]

const playerProfiles: PlayerProfile[] = [
  {
    id: "player-mina-chen",
    name: "Mina Chen",
    initials: "MC",
    homeArea: "Oshawa",
    skillLevel: "Advanced",
    globalElo: 1350,
    preferredRoles: ["Setter", "Defender"],
    primaryRole: "Setter",
    wins: 18,
    losses: 5,
    currentStreak: "4W",
    roleFitPercent: 92,
    activityDays: [
      { date: "2026-04-20", sessions: 0 },
      { date: "2026-04-21", sessions: 1 },
      { date: "2026-04-22", sessions: 0 },
      { date: "2026-04-23", sessions: 2 },
      { date: "2026-04-24", sessions: 0 },
      { date: "2026-04-25", sessions: 1 },
      { date: "2026-04-26", sessions: 0 },
      { date: "2026-04-27", sessions: 1 },
      { date: "2026-04-28", sessions: 0 },
      { date: "2026-04-29", sessions: 2 },
      { date: "2026-04-30", sessions: 0 },
      { date: "2026-05-01", sessions: 1 },
      { date: "2026-05-02", sessions: 0 },
      { date: "2026-05-03", sessions: 1 },
      { date: "2026-05-04", sessions: 0 },
      { date: "2026-05-05", sessions: 2 },
      { date: "2026-05-06", sessions: 1 },
      { date: "2026-05-07", sessions: 0 },
      { date: "2026-05-08", sessions: 1 },
      { date: "2026-05-09", sessions: 0 },
      { date: "2026-05-10", sessions: 2 },
      { date: "2026-05-11", sessions: 0 },
      { date: "2026-05-12", sessions: 1 },
      { date: "2026-05-13", sessions: 1 },
      { date: "2026-05-14", sessions: 0 },
      { date: "2026-05-15", sessions: 1 },
      { date: "2026-05-16", sessions: 0 },
      { date: "2026-05-17", sessions: 1 },
    ],
    eloHistory: [
      { date: "2026-04-21", rating: 1288, change: 12 },
      { date: "2026-04-23", rating: 1304, change: 16 },
      { date: "2026-04-29", rating: 1298, change: -6 },
      { date: "2026-05-05", rating: 1320, change: 22 },
      { date: "2026-05-10", rating: 1334, change: 14 },
      { date: "2026-05-13", rating: 1350, change: 16 },
    ],
    matchLedger: [
      {
        id: "match-mina-1",
        date: "2026-05-13",
        sessionTitle: "Sunday Advanced Runs",
        communityName: "Oshawa Indoor",
        role: "Setter",
        result: "Win",
        score: "21-17",
        eloChange: 16,
      },
      {
        id: "match-mina-2",
        date: "2026-05-10",
        sessionTitle: "Friday Night Indoor Drop-In",
        communityName: "Oshawa Indoor",
        role: "Setter",
        result: "Win",
        score: "21-15",
        eloChange: 14,
      },
      {
        id: "match-mina-3",
        date: "2026-04-29",
        sessionTitle: "Wednesday Sunset Pickup",
        communityName: "Scarborough Grass",
        role: "Defender",
        result: "Loss",
        score: "18-21",
        eloChange: -6,
      },
    ],
  },
  {
    id: "player-ali-rahman",
    name: "Ali Rahman",
    initials: "AR",
    homeArea: "Whitby",
    skillLevel: "Advanced",
    globalElo: 1320,
    preferredRoles: ["Attacker", "Defender"],
    primaryRole: "Attacker",
    wins: 16,
    losses: 7,
    currentStreak: "2W",
    roleFitPercent: 88,
    activityDays: [
      { date: "2026-04-20", sessions: 1 },
      { date: "2026-04-21", sessions: 0 },
      { date: "2026-04-22", sessions: 1 },
      { date: "2026-04-23", sessions: 0 },
      { date: "2026-04-24", sessions: 2 },
      { date: "2026-04-25", sessions: 0 },
      { date: "2026-04-26", sessions: 1 },
      { date: "2026-04-27", sessions: 0 },
      { date: "2026-04-28", sessions: 1 },
      { date: "2026-04-29", sessions: 0 },
      { date: "2026-04-30", sessions: 1 },
      { date: "2026-05-01", sessions: 0 },
      { date: "2026-05-02", sessions: 2 },
      { date: "2026-05-03", sessions: 0 },
      { date: "2026-05-04", sessions: 1 },
      { date: "2026-05-05", sessions: 0 },
      { date: "2026-05-06", sessions: 1 },
      { date: "2026-05-07", sessions: 1 },
      { date: "2026-05-08", sessions: 0 },
      { date: "2026-05-09", sessions: 1 },
      { date: "2026-05-10", sessions: 1 },
      { date: "2026-05-11", sessions: 0 },
      { date: "2026-05-12", sessions: 1 },
      { date: "2026-05-13", sessions: 1 },
      { date: "2026-05-14", sessions: 0 },
      { date: "2026-05-15", sessions: 1 },
      { date: "2026-05-16", sessions: 0 },
      { date: "2026-05-17", sessions: 1 },
    ],
    eloHistory: [
      { date: "2026-04-20", rating: 1262, change: 10 },
      { date: "2026-04-24", rating: 1285, change: 23 },
      { date: "2026-05-02", rating: 1276, change: -9 },
      { date: "2026-05-09", rating: 1298, change: 22 },
      { date: "2026-05-12", rating: 1310, change: 12 },
      { date: "2026-05-13", rating: 1320, change: 10 },
    ],
    matchLedger: [
      {
        id: "match-ali-1",
        date: "2026-05-13",
        sessionTitle: "Sunday Advanced Runs",
        communityName: "Oshawa Indoor",
        role: "Attacker",
        result: "Win",
        score: "21-19",
        eloChange: 10,
      },
      {
        id: "match-ali-2",
        date: "2026-05-12",
        sessionTitle: "Friday Night Indoor Drop-In",
        communityName: "Oshawa Indoor",
        role: "Attacker",
        result: "Win",
        score: "21-18",
        eloChange: 12,
      },
      {
        id: "match-ali-3",
        date: "2026-05-02",
        sessionTitle: "Saturday Grass Doubles",
        communityName: "Scarborough Grass",
        role: "Defender",
        result: "Loss",
        score: "16-21",
        eloChange: -9,
      },
    ],
  },
  {
    id: "player-layla-grant",
    name: "Layla Grant",
    initials: "LG",
    homeArea: "Pickering",
    skillLevel: "Advanced",
    globalElo: 1300,
    preferredRoles: ["Defender", "Setter"],
    primaryRole: "Defender",
    wins: 14,
    losses: 8,
    currentStreak: "1L",
    roleFitPercent: 84,
    activityDays: [
      { date: "2026-04-20", sessions: 0 },
      { date: "2026-04-21", sessions: 1 },
      { date: "2026-04-22", sessions: 1 },
      { date: "2026-04-23", sessions: 0 },
      { date: "2026-04-24", sessions: 1 },
      { date: "2026-04-25", sessions: 0 },
      { date: "2026-04-26", sessions: 0 },
      { date: "2026-04-27", sessions: 1 },
      { date: "2026-04-28", sessions: 0 },
      { date: "2026-04-29", sessions: 1 },
      { date: "2026-04-30", sessions: 0 },
      { date: "2026-05-01", sessions: 2 },
      { date: "2026-05-02", sessions: 0 },
      { date: "2026-05-03", sessions: 1 },
      { date: "2026-05-04", sessions: 0 },
      { date: "2026-05-05", sessions: 1 },
      { date: "2026-05-06", sessions: 0 },
      { date: "2026-05-07", sessions: 1 },
      { date: "2026-05-08", sessions: 0 },
      { date: "2026-05-09", sessions: 0 },
      { date: "2026-05-10", sessions: 1 },
      { date: "2026-05-11", sessions: 2 },
      { date: "2026-05-12", sessions: 1 },
      { date: "2026-05-13", sessions: 1 },
      { date: "2026-05-14", sessions: 0 },
      { date: "2026-05-15", sessions: 1 },
      { date: "2026-05-16", sessions: 0 },
      { date: "2026-05-17", sessions: 1 },
    ],
    eloHistory: [
      { date: "2026-04-21", rating: 1246, change: 8 },
      { date: "2026-04-29", rating: 1270, change: 24 },
      { date: "2026-05-01", rating: 1286, change: 16 },
      { date: "2026-05-10", rating: 1312, change: 26 },
      { date: "2026-05-11", rating: 1308, change: -4 },
      { date: "2026-05-13", rating: 1300, change: -8 },
    ],
    matchLedger: [
      {
        id: "match-layla-1",
        date: "2026-05-13",
        sessionTitle: "Sunday Advanced Runs",
        communityName: "Oshawa Indoor",
        role: "Defender",
        result: "Loss",
        score: "19-21",
        eloChange: -8,
      },
      {
        id: "match-layla-2",
        date: "2026-05-10",
        sessionTitle: "Friday Night Indoor Drop-In",
        communityName: "Oshawa Indoor",
        role: "Defender",
        result: "Win",
        score: "21-14",
        eloChange: 26,
      },
      {
        id: "match-layla-3",
        date: "2026-05-01",
        sessionTitle: "Saturday Grass Doubles",
        communityName: "Scarborough Grass",
        role: "Setter",
        result: "Win",
        score: "21-17",
        eloChange: 16,
      },
    ],
  },
  {
    id: "player-hamza-malik",
    name: "Hamza Malik",
    initials: "HM",
    homeArea: "Scarborough",
    skillLevel: "Open",
    globalElo: 1220,
    preferredRoles: ["Attacker"],
    primaryRole: "Attacker",
    wins: 12,
    losses: 6,
    currentStreak: "3W",
    roleFitPercent: 79,
    activityDays: [
      { date: "2026-04-20", sessions: 1 },
      { date: "2026-04-21", sessions: 0 },
      { date: "2026-04-22", sessions: 0 },
      { date: "2026-04-23", sessions: 1 },
      { date: "2026-04-24", sessions: 0 },
      { date: "2026-04-25", sessions: 1 },
      { date: "2026-04-26", sessions: 1 },
      { date: "2026-04-27", sessions: 0 },
      { date: "2026-04-28", sessions: 0 },
      { date: "2026-04-29", sessions: 1 },
      { date: "2026-04-30", sessions: 0 },
      { date: "2026-05-01", sessions: 0 },
      { date: "2026-05-02", sessions: 1 },
      { date: "2026-05-03", sessions: 0 },
      { date: "2026-05-04", sessions: 1 },
      { date: "2026-05-05", sessions: 0 },
      { date: "2026-05-06", sessions: 0 },
      { date: "2026-05-07", sessions: 1 },
      { date: "2026-05-08", sessions: 0 },
      { date: "2026-05-09", sessions: 1 },
      { date: "2026-05-10", sessions: 1 },
      { date: "2026-05-11", sessions: 0 },
      { date: "2026-05-12", sessions: 0 },
      { date: "2026-05-13", sessions: 1 },
      { date: "2026-05-14", sessions: 0 },
      { date: "2026-05-15", sessions: 0 },
      { date: "2026-05-16", sessions: 1 },
      { date: "2026-05-17", sessions: 0 },
    ],
    eloHistory: [
      { date: "2026-04-20", rating: 1174, change: 9 },
      { date: "2026-04-25", rating: 1186, change: 12 },
      { date: "2026-05-02", rating: 1198, change: 12 },
      { date: "2026-05-09", rating: 1210, change: 12 },
      { date: "2026-05-13", rating: 1220, change: 10 },
    ],
    matchLedger: [
      {
        id: "match-hamza-1",
        date: "2026-05-13",
        sessionTitle: "North York Pickup Night",
        communityName: "Independent",
        role: "Attacker",
        result: "Win",
        score: "21-18",
        eloChange: 10,
      },
      {
        id: "match-hamza-2",
        date: "2026-05-09",
        sessionTitle: "Saturday Grass Doubles",
        communityName: "Scarborough Grass",
        role: "Attacker",
        result: "Win",
        score: "21-16",
        eloChange: 12,
      },
      {
        id: "match-hamza-3",
        date: "2026-04-20",
        sessionTitle: "Wednesday Sunset Pickup",
        communityName: "Scarborough Grass",
        role: "Attacker",
        result: "Loss",
        score: "17-21",
        eloChange: -7,
      },
    ],
  },
]

export function getCommunities() {
  return communities.map((community) => ({ ...community }))
}

export function getCommunityBySlug(slug: string) {
  const community = communities.find((item) => item.slug === slug)

  return community ? { ...community } : null
}

export function getDropInSessionById(sessionId: string) {
  const session = dropInSessions.find((item) => item.id === sessionId)

  return session ? { ...session } : null
}

export function getAllDropInSessions() {
  return dropInSessions.map((session) => ({ ...session }))
}

export function getDropInSessionsByCommunity(communityId: string) {
  return dropInSessions
    .filter((session) => session.communityId === communityId)
    .map((session) => ({ ...session }))
}

export function getIndependentDropInSessions() {
  return dropInSessions
    .filter((session) => session.communityId === null)
    .map((session) => ({ ...session }))
}

export function getSessionSignups(sessionId: string) {
  return sessionSignups
    .filter((signup) => signup.sessionId === sessionId)
    .map((signup) => ({
      ...signup,
      preferredRoles: [...signup.preferredRoles],
    }))
}

export function getGeneratedTeams(sessionId: string) {
  return generatedTeams
    .filter((team) => team.sessionId === sessionId)
    .map((team) => ({
      ...team,
      players: team.players.map((player) => ({
        ...player,
        preferredRoles: [...player.preferredRoles],
      })),
    }))
}

export function getSessionGames(sessionId: string) {
  return sessionGames
    .filter((game) => game.sessionId === sessionId)
    .map((game) => ({ ...game }))
}

export function getPlayerProfiles() {
  return getAllPlayerProfiles().map(clonePlayerProfile)
}

export function getPlayerProfileById(playerId: string) {
  const profile = getAllPlayerProfiles().find((player) => player.id === playerId)

  return profile ? clonePlayerProfile(profile) : null
}

export function getGlobalLeaderboard() {
  return getAllPlayerProfiles()
    .sort((playerA, playerB) => {
      if (playerA.globalElo !== playerB.globalElo) {
        return playerB.globalElo - playerA.globalElo
      }

      if (playerA.wins !== playerB.wins) {
        return playerB.wins - playerA.wins
      }

      if (playerA.losses !== playerB.losses) {
        return playerA.losses - playerB.losses
      }

      return playerA.name.localeCompare(playerB.name)
    })
    .map((player, index) => {
      const gamesPlayed = player.wins + player.losses

      return {
        id: `global-leaderboard-${player.id}`,
        rank: index + 1,
        playerId: player.id,
        playerName: player.name,
        initials: player.initials,
        homeArea: player.homeArea,
        skillLevel: player.skillLevel,
        primaryRole: player.primaryRole,
        preferredRoles: [...player.preferredRoles],
        globalElo: player.globalElo,
        wins: player.wins,
        losses: player.losses,
        winRatePercent:
          gamesPlayed === 0 ? 0 : Math.round((player.wins / gamesPlayed) * 100),
        roleFitPercent: player.roleFitPercent,
        currentStreak: player.currentStreak,
      } satisfies GlobalLeaderboardEntry
    })
}

export function getCheckoutTotals(sessionId: string, playerCount: number) {
  const session = dropInSessions.find((item) => item.id === sessionId)

  if (!session) {
    return null
  }

  const normalizedPlayerCount = Math.max(
    1,
    Math.min(Math.trunc(playerCount) || 1, session.maxPlayers)
  )
  const subtotalCents = session.priceCents * normalizedPlayerCount
  const serviceFeeCents =
    subtotalCents === 0 ? 0 : Math.round(subtotalCents * 0.08)

  return {
    sessionId,
    playerCount: normalizedPlayerCount,
    subtotalCents,
    serviceFeeCents,
    totalCents: subtotalCents + serviceFeeCents,
    currency: session.currency,
  } satisfies CheckoutTotals
}

export function getLeaderboardByCommunity(communityId: string) {
  return leaderboardEntries
    .filter((entry) => entry.communityId === communityId)
    .map((entry) => ({ ...entry }))
}

export function toggleCommunityFollow(communityId: string) {
  const community = communities.find((item) => item.id === communityId)

  if (!community) {
    return null
  }

  const isFollowed = !community.isFollowedByCurrentUser
  community.isFollowedByCurrentUser = isFollowed
  community.followerCount += isFollowed ? 1 : -1

  return { ...community }
}

function clonePlayerProfile(profile: PlayerProfile) {
  return {
    ...profile,
    preferredRoles: [...profile.preferredRoles],
    activityDays: profile.activityDays.map((day) => ({ ...day })),
    eloHistory: profile.eloHistory.map((point) => ({ ...point })),
    matchLedger: profile.matchLedger.map((entry) => ({ ...entry })),
  }
}

function getAllPlayerProfiles() {
  const profileIds = new Set(playerProfiles.map((player) => player.id))
  const fallbackProfiles = sessionSignups
    .filter((signup) => !profileIds.has(signup.playerId))
    .filter(
      (signup, index, signups) =>
        signups.findIndex((item) => item.playerId === signup.playerId) === index
    )
    .map((signup, index) => createFallbackPlayerProfile(signup, index))

  return [...playerProfiles, ...fallbackProfiles]
}

function createFallbackPlayerProfile(signup: SessionSignup, index: number) {
  const session = dropInSessions.find((item) => item.id === signup.sessionId)
  const community = session?.communityId
    ? communities.find((item) => item.id === session.communityId)
    : null
  const primaryRole = signup.preferredRoles[0] ?? "Defender"
  const wins = 6 + (index % 5)
  const losses = 4 + (index % 4)
  const globalElo = 1080 + index * 12
  const eloChange = index % 3 === 0 ? -6 : 8 + (index % 4)

  return {
    id: signup.playerId,
    name: signup.playerName,
    initials: getInitials(signup.playerName),
    homeArea: community?.name ?? "Toronto",
    skillLevel: session?.skillLevel ?? "Open",
    globalElo,
    preferredRoles: [...signup.preferredRoles],
    primaryRole,
    wins,
    losses,
    currentStreak: index % 3 === 0 ? "1L" : "2W",
    roleFitPercent: 72 + (index % 5) * 4,
    activityDays: createActivityDays(index),
    eloHistory: [
      { date: "2026-04-24", rating: globalElo - 18, change: 6 },
      { date: "2026-05-03", rating: globalElo - 10, change: 8 },
      { date: "2026-05-13", rating: globalElo, change: eloChange },
    ],
    matchLedger: [
      {
        id: `match-${signup.playerId}`,
        date: signup.registeredAt,
        sessionTitle: session?.title ?? "Pickup session",
        communityName: community?.name ?? "Independent",
        role: primaryRole,
        result: eloChange > 0 ? "Win" : "Loss",
        score: eloChange > 0 ? "21-18" : "18-21",
        eloChange,
      },
    ],
  } satisfies PlayerProfile
}

function createActivityDays(seed: number) {
  return Array.from({ length: 28 }, (_, index) => {
    const day = index + 20
    const date =
      day <= 30
        ? `2026-04-${String(day).padStart(2, "0")}`
        : `2026-05-${String(day - 30).padStart(2, "0")}`

    return {
      date,
      sessions: (index + seed) % 5 === 0 ? 2 : (index + seed) % 3 === 0 ? 1 : 0,
    }
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
