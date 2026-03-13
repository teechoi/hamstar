// types/index.ts — Shared types for Hamstar

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
  petId:    string
  pet:      RacePet
  position: number | null
  totalSol: number
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
