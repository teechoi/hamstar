/**
 * GET /api/user/claim-reward?walletAddress=<addr>&raceId=<id>
 *
 * Returns the account addresses needed for the user to build and sign
 * a claim_reward transaction client-side.
 *
 * This is the fallback path when push_reward failed or was delayed.
 *
 * POST /api/user/claim-reward
 * { walletAddress, raceId, txSignature }
 *
 * Records that the user claimed their reward on-chain.
 * txSignature is required and verified against on-chain state before
 * marking rewardPushed=true — prevents fake-sig abuse.
 */
import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { prisma } from '@/lib/prisma'
import { getEscrowPDA, PROGRAM_ID } from '@/lib/hamstar-program'

function getRpcUrl(): string {
  if (process.env.SOLANA_RPC_URL) return process.env.SOLANA_RPC_URL
  if (process.env.HELIUS_API_KEY)
    return `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  return 'https://api.mainnet-beta.solana.com'
}

/**
 * Verify that a claim_reward transaction:
 *   1. Is confirmed on-chain (no meta error)
 *   2. Was signed by the claimant's wallet
 *   3. Called our program (has PROGRAM_ID in accountKeys)
 */
async function verifyClaimRewardTx(
  txSignature: string,
  walletAddress: string,
  connection: Connection,
): Promise<boolean> {
  try {
    const parsed = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    })

    if (!parsed || parsed.meta?.err) return false

    const signers = parsed.transaction.message.accountKeys
      .filter(k => k.signer)
      .map(k => k.pubkey.toBase58())

    if (!signers.includes(walletAddress)) return false

    return parsed.transaction.message.accountKeys
      .some(k => k.pubkey.toBase58() === PROGRAM_ID.toBase58())
  } catch {
    return false
  }
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('walletAddress')
    const raceId        = searchParams.get('raceId')

    if (!walletAddress || !raceId) {
      return NextResponse.json({ error: 'walletAddress and raceId required' }, { status: 400 })
    }

    // Validate wallet address
    try { new PublicKey(walletAddress) } catch {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const [cheer, race, settings] = await Promise.all([
      prisma.cheer.findUnique({
        where: { walletAddress_raceId: { walletAddress, raceId } },
      }),
      prisma.race.findUnique({ where: { id: raceId } }),
      prisma.siteSettings.findFirst({ where: { id: 'singleton' } }),
    ])

    if (!cheer) return NextResponse.json({ error: 'No cheer found for this wallet/race' }, { status: 404 })
    if (!race)  return NextResponse.json({ error: 'Race not found' }, { status: 404 })

    if (!cheer.won) {
      return NextResponse.json({ error: 'You did not win this race' }, { status: 422 })
    }

    if (cheer.rewardPushed) {
      return NextResponse.json({ error: 'Reward already pushed to your wallet' }, { status: 422 })
    }

    if (!race.onChainSettled || !race.onChainRaceId) {
      return NextResponse.json({ error: 'Race is not yet settled on-chain' }, { status: 422 })
    }

    const mintAddress     = settings?.hamstarMint
    const treasuryAddress = process.env.TREASURY_WALLET

    if (!mintAddress || mintAddress.includes('xxx')) {
      return NextResponse.json({ error: 'Token not yet launched' }, { status: 422 })
    }
    if (!treasuryAddress) {
      return NextResponse.json({ error: 'Treasury not configured' }, { status: 503 })
    }

    const onChainRaceId = BigInt(race.onChainRaceId.toString())
    const [escrowPDA]   = getEscrowPDA(onChainRaceId)

    // Return all accounts and config needed for client to build claim_reward tx
    return NextResponse.json({
      ok: true,
      raceId:          onChainRaceId.toString(),
      escrowAddress:   escrowPDA.toBase58(),
      mintAddress,
      treasuryAddress,
    })
  } catch (e) {
    console.error('[GET /api/user/claim-reward]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, raceId, txSignature } = await req.json()

    if (!walletAddress || !raceId || !txSignature) {
      return NextResponse.json(
        { error: 'walletAddress, raceId, and txSignature required' },
        { status: 400 },
      )
    }

    // Validate wallet address format
    try { new PublicKey(walletAddress) } catch {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    const cheer = await prisma.cheer.findUnique({
      where: { walletAddress_raceId: { walletAddress, raceId } },
    })

    if (!cheer) return NextResponse.json({ error: 'Cheer not found' }, { status: 404 })
    if (!cheer.won) return NextResponse.json({ error: 'Not a winner' }, { status: 422 })

    if (cheer.rewardPushed) {
      return NextResponse.json({ error: 'Reward already recorded' }, { status: 422 })
    }

    // Verify the on-chain transaction before marking as claimed.
    // This prevents a user from submitting a fake signature to poison
    // the rewardPushed flag and block the admin push_reward later.
    const connection = new Connection(getRpcUrl(), 'confirmed')
    const txVerified = await verifyClaimRewardTx(txSignature, walletAddress, connection)

    if (!txVerified) {
      return NextResponse.json(
        { error: 'claim_reward transaction could not be verified on-chain' },
        { status: 422 },
      )
    }

    await prisma.cheer.update({
      where: { id: cheer.id },
      data:  { rewardPushed: true },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[POST /api/user/claim-reward]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
