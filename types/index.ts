// types/index.ts — Shared types for Hamstar

export interface HowItWorksStep {
  num: number
  title: string
  body: string
  image: string
  badge?: { text: string; color: string } | null
  note?: string | null
  cta: string
}

export interface SiteContent {
  // Stream
  streamUrl: string
  isLive: boolean
  raceNumber: number
  // Socials
  twitterUrl?: string | null
  tiktokUrl?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
  sponsorEmail: string
  // Nav
  navTagline: string
  // Hero
  heroTitle: string
  heroSubtitle: string
  heroCtaTag: string
  heroButtonText: string
  // Racers
  racersTitle: string
  // About
  aboutTitle: string
  aboutText: string
  // Arena
  arenaTitle: string
  arenaSubtitle: string
  arenaStreamNote: string
  // Footer
  footerTagline: string
  footerBrandDesc: string
  footerTaglineRight: string
  // Modals
  loginTitle: string
  loginSubtitle: string
  termsButtonText: string
  howitWorksSteps: HowItWorksStep[]
}

export interface Race {
  id:       string
  number:   number
  status:   'UPCOMING' | 'LIVE' | 'FINISHED'
  startsAt: string
  endsAt:   string
  entries:  RaceEntry[]
  // Computed fields returned by /api/races
  msUntilEnd?:   number
  msUntilStart?: number
}

export interface RaceEntry {
  petId:      string
  pet:        RacePet
  position:   number | null
  totalSol:   number
  supporters: number
}

export interface RacePet {
  id:    string
  slug:  string
  name:  string
  emoji: string
  color: string
  number: string
}

export interface ApiPet {
  id:            string
  slug:          string
  name:          string
  number:        string
  emoji:         string
  team:          string
  tagline:       string
  color:         string
  walletAddress: string
  speedBase:     number
  chaosBase:     number
  snackLevel:    number
  cageLevel:     number
  wins:          number
  lifetimeSol:   number
  sponsors:      ApiSponsor[]
  upgrades:      PetUpgrade[]
}

export interface ApiSponsor {
  id:   string
  name: string
  emoji: string
  tier: 'SILVER' | 'GOLD' | 'TITLE'
}

export interface PetUpgrade {
  id:        string
  petId:     string
  upgradeId: string
  upgrade:   UpgradeItem
  unlockedAt: string
}

export interface UpgradeItem {
  id:          string
  category:    'SNACK' | 'CAGE'
  tier:        'BASIC' | 'UPGRADE' | 'ELITE' | 'LEGENDARY'
  name:        string
  emoji:       string
  description: string
  costSol:     number
}

export interface HeliusWebhookPayload {
  signature: string
  timestamp: number
  nativeTransfers?: Array<{
    fromUserAccount: string
    toUserAccount:   string
    amount:          number
  }>
  description?: string
}
