// POST /api/user/cheer   — record that a user cheered for a pet in a race
// PATCH /api/user/cheer  — admin-only: update won/lost for all cheers in a finished race
import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import { prisma } from '@/lib/prisma'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { PROGRAM_ID } from '@/lib/hamstar-program'
import { HAMSTAR_DECIMALS } from '@/lib/hamstar-token'

export const dynamic = 'force-dynamic'

// place_cheer instruction discriminator: sha256("global:place_cheer")[0:8]
const PLACE_CHEER_DISC = Buffer.from([254, 212, 229, 234, 37, 28, 212, 166])

function getRpcUrl(): string {
  if (process.env.SOLANA_RPC_URL) return process.env.SOLANA_RPC_URL
  if (process.env.HELIUS_API_KEY)
    return `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  return 'https://api.mainnet-beta.solana.com'
}

/**
 * Try to extract and decode the place_cheer instruction from a parsed tx.
 * Returns the decoded args or null if no matching instruction is found.
 */
function parsePlaceCheerInstruction(
  instructions: Array<{ data?: string; programId?: { toBase58(): string } }>,
): { raceId: bigint; hamsterIndex: number; amount: bigint } | null {
  for (const ix of instructions) {
    if (!('data' in ix) || typeof ix.data !== 'string') continue
    try {
      const data = Buffer.from(bs58.decode(ix.data))
      // Must be at least 25 bytes (8 disc + 8 raceId + 1 idx + 8 amount)
      if (data.length < 25) continue
      if (!data.slice(0, 8).equals(PLACE_CHEER_DISC)) continue
      return {
        raceId:       data.readBigUInt64LE(8),
        hamsterIndex: data[16],
        amount:       data.readBigUInt64LE(17),
      }
    } catch { /* not decodable — try next */ }
  }
  return null
}

/**
 * Verify that a transaction signature:
 *   1. Is confirmed on-chain with no error
 *   2. Was signed by the claimed wallet address
 *   3. Contains a place_cheer instruction for our program
 *   4. (When expectedArgs provided) Instruction args match the submitted values
 *
 * Returns 'no-tx' for the pre-launch off-chain path (null signature).
 */
async function verifyCheerTx(
  txSignature: string | null | undefined,
  walletAddress: string,
  connection: Connection,
  expectedArgs?: {
    onChainRaceId: bigint | null
    hamsterIndex:  number | null
    amountRaw:     bigint | null
  },
): Promise<'verified' | 'no-tx' | 'invalid'> {
  if (!txSignature) return 'no-tx'

  try {
    const parsed = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    })

    if (!parsed || parsed.meta?.err) return 'invalid'

    // Wallet must be a signer
    const signers = parsed.transaction.message.accountKeys
      .filter(k => k.signer)
      .map(k => k.pubkey.toBase58())
    if (!signers.includes(walletAddress)) return 'invalid'

    // Our program must be referenced
    const programCalled = parsed.transaction.message.accountKeys
      .some(k => k.pubkey.toBase58() === PROGRAM_ID.toBase58())
    if (!programCalled) return 'invalid'

    // Deep check: parse the place_cheer instruction and verify args
    if (expectedArgs?.onChainRaceId != null) {
      const ixData = parsePlaceCheerInstruction(
        parsed.transaction.message.instructions as Array<{ data?: string; programId?: { toBase58(): string } }>,
      )
      if (!ixData) return 'invalid'

      // raceId must match
      if (ixData.raceId !== expectedArgs.onChainRaceId) return 'invalid'

      // hamsterIndex must match (when known)
      if (
        expectedArgs.hamsterIndex !== null &&
        ixData.hamsterIndex !== expectedArgs.hamsterIndex
      ) return 'invalid'

      // amount must match within 1 raw unit (decimal rounding tolerance)
      if (expectedArgs.amountRaw !== null) {
        const diff = ixData.amount > expectedArgs.amountRaw
          ? ixData.amount - expectedArgs.amountRaw
          : expectedArgs.amountRaw - ixData.amount
        if (diff > BigInt(1)) return 'invalid'
      }
    }

    return 'verified'
  } catch {
    return 'invalid'
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      walletAddress,
      petId,
      raceId,
      raceNumber,
      amountHamstar,
      txSignature,
    } = await req.json()

    if (!walletAddress || !petId || (!raceId && raceNumber == null)) {
      return NextResponse.json(
        { error: 'walletAddress, petId, and raceId or raceNumber required' },
        { status: 400 },
      )
    }

    // Validate wallet address format
    try { new PublicKey(walletAddress) } catch {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    // Validate petId exists before touching on-chain or DB cheer records
    const pet = await prisma.pet.findUnique({ where: { id: petId }, select: { id: true } })
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 400 })
    }

    // Resolve raceId from raceNumber if not provided directly
    let resolvedRaceId = raceId
    let resolvedRace: { id: string; onChainRaceId: bigint | null; entries: Array<{ petId: string; pet: { number: string } }> } | null = null
    if (!resolvedRaceId && raceNumber != null) {
      resolvedRace = await prisma.race.findUnique({
        where: { number: Number(raceNumber) },
        select: {
          id: true,
          onChainRaceId: true,
          entries: {
            select: { petId: true, pet: { select: { number: true } } },
            orderBy: { pet: { number: 'asc' } },
          },
        },
      })
      if (!resolvedRace) return NextResponse.json({ error: 'Race not found' }, { status: 404 })
      resolvedRaceId = resolvedRace.id
    } else if (resolvedRaceId) {
      resolvedRace = await prisma.race.findUnique({
        where: { id: resolvedRaceId },
        select: {
          id: true,
          onChainRaceId: true,
          entries: {
            select: { petId: true, pet: { select: { number: true } } },
            orderBy: { pet: { number: 'asc' } },
          },
        },
      })
    }

    // Build expected tx args for deep verification
    let expectedArgs: { onChainRaceId: bigint | null; hamsterIndex: number | null; amountRaw: bigint | null } | undefined
    if (resolvedRace?.onChainRaceId) {
      const hamsterIndex = resolvedRace.entries.findIndex(e => e.petId === petId)
      expectedArgs = {
        onChainRaceId: resolvedRace.onChainRaceId,
        hamsterIndex:  hamsterIndex >= 0 ? hamsterIndex : null,
        amountRaw:     amountHamstar != null
          ? BigInt(Math.round(Number(amountHamstar) * 10 ** HAMSTAR_DECIMALS))
          : null,
      }
    }

    // Verify on-chain transaction before accepting (when txSignature provided)
    const connection = new Connection(getRpcUrl(), 'confirmed')
    const verifyResult = await verifyCheerTx(txSignature, walletAddress, connection, expectedArgs)

    if (verifyResult === 'invalid') {
      return NextResponse.json(
        { error: 'Transaction could not be verified on-chain. Please try again.' },
        { status: 422 },
      )
    }

    // Replay-attack guard: reject any non-null txSignature already in the DB
    if (txSignature) {
      const existing = await prisma.cheer.findUnique({ where: { txSignature } })
      if (existing) {
        return NextResponse.json(
          { error: 'Transaction already recorded.' },
          { status: 409 },
        )
      }
    }

    // Ensure user row exists and upsert cheer atomically — one per user per race
    const cheer = await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where:  { walletAddress },
        create: { walletAddress },
        update: {},
      })

      return tx.cheer.upsert({
        where:  { walletAddress_raceId: { walletAddress, raceId: resolvedRaceId } },
        create: {
          walletAddress,
          raceId: resolvedRaceId,
          petId,
          amountHamstar: verifyResult === 'verified' ? (amountHamstar ?? null) : null,
          txSignature:   txSignature ?? null,
        },
        update: {
          petId,
          // Only update amount and signature from a verified tx
          ...(verifyResult === 'verified' && amountHamstar != null ? { amountHamstar } : {}),
          ...(verifyResult === 'verified' && txSignature    ? { txSignature }    : {}),
        },
      })
    })

    return NextResponse.json({ cheer })
  } catch (err) {
    console.error('[POST /api/user/cheer]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Admin-only — marks all cheers in a race as won/lost
export async function PATCH(req: NextRequest) {
  try {
    // Verify admin session
    const token   = req.cookies.get(COOKIE_NAME)?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { raceId, raceNumber, winnerPetId } = await req.json()

    if ((!raceId && raceNumber == null) || !winnerPetId) {
      return NextResponse.json(
        { error: 'raceId or raceNumber, plus winnerPetId required' },
        { status: 400 },
      )
    }

    let resolvedRaceId = raceId
    if (!resolvedRaceId && raceNumber != null) {
      const race = await prisma.race.findUnique({ where: { number: Number(raceNumber) } })
      if (!race) return NextResponse.json({ error: 'Race not found' }, { status: 404 })
      resolvedRaceId = race.id
    }

    await prisma.$transaction([
      prisma.cheer.updateMany({
        where: { raceId: resolvedRaceId, petId: winnerPetId },
        data:  { won: true },
      }),
      prisma.cheer.updateMany({
        where: { raceId: resolvedRaceId, petId: { not: winnerPetId } },
        data:  { won: false },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/user/cheer]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
