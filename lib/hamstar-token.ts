// lib/hamstar-token.ts
// $HAMSTAR SPL token config, fan tier logic, and balance fetching.
// Replace placeholder values with real addresses before launch.

import { Connection, PublicKey } from '@solana/web3.js'

// ─── Token config ─────────────────────────────────────────────────────────────
// TODO: replace with real mint address once token is deployed
export const HAMSTAR_MINT        = 'HAMSTARxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
export const HAMSTAR_SYMBOL      = '$HAMSTAR'
export const HAMSTAR_DECIMALS    = 9

// TODO: replace with real Jupiter swap URL once pool is live
export const HAMSTAR_JUPITER_URL = 'https://jup.ag/swap/SOL-HAMSTAR'

// ─── Fan tiers ────────────────────────────────────────────────────────────────
export interface FanTier {
  label: string
  emoji: string
  minTokens: number
  ringGradient: string    // CSS gradient for avatar ring
  badgeBg: string
  badgeColor: string
  cardGradient: string    // CSS gradient for HAMSTAR token card
}

export const FAN_TIERS: FanTier[] = [
  {
    label: 'Fan',
    emoji: '🌱',
    minTokens: 0,
    ringGradient: 'linear-gradient(135deg, #735DFF 0%, #AB9FF2 100%)',
    badgeBg: 'rgba(0,0,0,0.08)',
    badgeColor: '#503F00',
    cardGradient: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
  },
  {
    label: 'Bronze Fan',
    emoji: '🥉',
    minTokens: 100,
    ringGradient: 'linear-gradient(135deg, #CD7F32 0%, #E8A857 100%)',
    badgeBg: 'rgba(205,127,50,0.18)',
    badgeColor: '#7A4A10',
    cardGradient: 'linear-gradient(135deg, #2C1A06 0%, #5C3410 100%)',
  },
  {
    label: 'Silver Fan',
    emoji: '🥈',
    minTokens: 1_000,
    ringGradient: 'linear-gradient(135deg, #9E9E9E 0%, #E0E0E0 100%)',
    badgeBg: 'rgba(158,158,158,0.15)',
    badgeColor: '#444',
    cardGradient: 'linear-gradient(135deg, #1C1C1C 0%, #3A3A3A 100%)',
  },
  {
    label: 'Gold Fan',
    emoji: '🥇',
    minTokens: 10_000,
    ringGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    badgeBg: 'rgba(255,215,0,0.2)',
    badgeColor: '#7A5800',
    cardGradient: 'linear-gradient(135deg, #2A1F00 0%, #5C4400 100%)',
  },
  {
    label: 'Legend',
    emoji: '👑',
    minTokens: 100_000,
    ringGradient: 'linear-gradient(135deg, #735DFF 0%, #FFD700 33%, #FF3B5C 66%, #735DFF 100%)',
    badgeBg: '#FFE790',
    badgeColor: '#503F00',
    cardGradient: 'linear-gradient(135deg, #1A0A2E 0%, #2D1560 50%, #1A0A2E 100%)',
  },
]

export function getFanTier(hamstarBalance: number): FanTier {
  for (let i = FAN_TIERS.length - 1; i >= 0; i--) {
    if (hamstarBalance >= FAN_TIERS[i].minTokens) return FAN_TIERS[i]
  }
  return FAN_TIERS[0]
}

export function formatHamstar(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

// ─── Balance fetch ────────────────────────────────────────────────────────────

export async function getHamstarBalance(
  connection: Connection,
  walletAddress: string,
): Promise<number> {
  // Return 0 while mint address is still a placeholder
  if (HAMSTAR_MINT.includes('xxx')) return 0
  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { mint: new PublicKey(HAMSTAR_MINT) },
    )
    if (!accounts.value.length) return 0
    return accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount ?? 0
  } catch {
    return 0
  }
}
