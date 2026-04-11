// lib/hamstar-token.ts
// $HAMSTAR SPL token config, fan tier logic, balance fetching, and transfer helpers.
// Replace placeholder values with real addresses before launch.

import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

// ─── Token config ─────────────────────────────────────────────────────────────
// TODO: replace with real mint address once token is deployed
export const HAMSTAR_MINT        = 'HAMSTARxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
export const HAMSTAR_SYMBOL      = '$HAMSTAR'
export const HAMSTAR_DECIMALS    = 9

// TODO: replace with the race-pool wallet/PDA address once token is deployed.
// This account's ATA receives cheered HAMSTAR and distributes to winners after settlement.
// Must be a multisig, program PDA, or dedicated treasury — never a hot wallet.
export const HAMSTAR_POOL_ADDRESS = 'POOLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

// TODO: replace with real Jupiter swap URL once pool is live
export const HAMSTAR_JUPITER_URL = 'https://jup.ag/swap/SOL-HAMSTAR'

// ─── SPL token helpers ─────────────────────────────────────────────────────────

const SPL_TOKEN_PROGRAM_ID   = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ASSOC_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bEo')

/** Derive the associated token account (ATA) address for a given owner + HAMSTAR mint. */
export function getHamstarATA(owner: PublicKey): PublicKey {
  const [ata] = PublicKey.findProgramAddressSync(
    [
      owner.toBuffer(),
      SPL_TOKEN_PROGRAM_ID.toBuffer(),
      new PublicKey(HAMSTAR_MINT).toBuffer(),
    ],
    ASSOC_TOKEN_PROGRAM_ID,
  )
  return ata
}

/**
 * Build a Transaction that transfers `uiAmount` HAMSTAR from the sender's ATA
 * to the race-pool's ATA.
 *
 * Returns `null` if either the mint or pool address is still a placeholder,
 * so callers can gracefully skip the on-chain step before launch.
 */
export async function buildCheerTransaction(
  senderPubkey: PublicKey,
  uiAmount:     number,
  connection:   Connection,
): Promise<{ tx: Transaction; blockhash: string; lastValidBlockHeight: number } | null> {
  if (HAMSTAR_MINT.includes('xxx') || HAMSTAR_POOL_ADDRESS.includes('xxx')) return null

  const mint      = new PublicKey(HAMSTAR_MINT)
  const pool      = new PublicKey(HAMSTAR_POOL_ADDRESS)
  const sourceATA = getHamstarATA(senderPubkey)

  // Derive the pool's ATA for the HAMSTAR mint
  const [destATA] = PublicKey.findProgramAddressSync(
    [pool.toBuffer(), SPL_TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOC_TOKEN_PROGRAM_ID,
  )

  const rawAmount = BigInt(Math.round(uiAmount * 10 ** HAMSTAR_DECIMALS))

  // Build raw SPL Transfer instruction (instruction index 3, 8-byte LE u64 amount)
  const ixData = Buffer.alloc(9)
  ixData.writeUInt8(3, 0)
  ixData.writeBigUInt64LE(rawAmount, 1)

  const transferIx = new TransactionInstruction({
    programId: SPL_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: sourceATA,    isSigner: false, isWritable: true  },
      { pubkey: destATA,      isSigner: false, isWritable: true  },
      { pubkey: senderPubkey, isSigner: true,  isWritable: false },
    ],
    data: ixData,
  })

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: senderPubkey })
  tx.add(transferIx)

  return { tx, blockhash, lastValidBlockHeight }
}

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
