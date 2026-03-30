// Persists a user's cheering history per wallet address in localStorage.
// Each entry is written when a user cheers in the Arena.
// The `won` field is updated when a race result comes in.

export interface CheerEntry {
  round: number
  petId: string
  petName: string
  petColor: string
  petEmoji: string
  won: boolean | null    // null = result pending
  timestamp: number
}

const key = (addr: string) => `hamstar_cheers_${addr}`
const MAX_ENTRIES = 20

export function getCheerHistory(walletAddress: string): CheerEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key(walletAddress)) ?? '[]')
  } catch { return [] }
}

export function saveCheerEntry(walletAddress: string, entry: CheerEntry): void {
  if (typeof window === 'undefined') return
  const existing = getCheerHistory(walletAddress)
  // One entry per round — replace if already cheered this round
  const filtered = existing.filter(e => e.round !== entry.round)
  localStorage.setItem(key(walletAddress), JSON.stringify([entry, ...filtered].slice(0, MAX_ENTRIES)))
}

export function updateCheerResult(walletAddress: string, round: number, wonPetId: string): void {
  if (typeof window === 'undefined') return
  const entries = getCheerHistory(walletAddress)
  const updated = entries.map(e =>
    e.round === round ? { ...e, won: e.petId === wonPetId } : e
  )
  localStorage.setItem(key(walletAddress), JSON.stringify(updated))
}
