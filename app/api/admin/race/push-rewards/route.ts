/**
 * POST /api/admin/race/push-rewards
 *
 * After a race is settled on-chain, loops every winning cheer and calls
 * push_reward for each wallet that hasn't been paid yet.
 *
 * Body: { raceId: string }
 *
 * Returns a summary of successes and failures.
 * Requires admin session cookie.
 */
import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { prisma } from '@/lib/prisma'
import {
  buildPushRewardInstruction,
  getEscrowPDA,
} from '@/lib/hamstar-program'
import {
  getAdminKeypair,
  sendAdminTx,
  getServerRpcUrl,
} from '@/lib/admin-signer'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Defense-in-depth auth check
  const token   = req.cookies.get(COOKIE_NAME)?.value
  const payload = token ? await verifyToken(token) : null
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { raceId } = await req.json()
    if (!raceId) return NextResponse.json({ error: 'raceId required' }, { status: 400 })

    const race = await prisma.race.findUnique({
      where:   { id: raceId },
      include: { cheers: { where: { won: true, rewardPushed: false } } },
    })

    if (!race) return NextResponse.json({ error: 'Race not found' }, { status: 404 })

    if (!race.onChainSettled) {
      return NextResponse.json(
        { error: 'Race is not yet settled on-chain. Call /settle first.' },
        { status: 422 },
      )
    }

    if (!race.onChainRaceId) {
      return NextResponse.json(
        { error: 'Race was not created on-chain — cannot push rewards' },
        { status: 422 },
      )
    }

    const adminKeypair = getAdminKeypair()
    if (!adminKeypair) {
      return NextResponse.json(
        { error: 'ADMIN_KEYPAIR not configured on server' },
        { status: 503 },
      )
    }

    const settings = await prisma.siteSettings.findFirst({ where: { id: 'singleton' } })
    const mintAddress     = settings?.hamstarMint
    const treasuryAddress = process.env.TREASURY_WALLET

    if (!mintAddress || mintAddress.includes('xxx')) {
      return NextResponse.json({ error: 'HAMSTAR_MINT not configured in settings' }, { status: 422 })
    }
    if (!treasuryAddress) {
      return NextResponse.json({ error: 'TREASURY_WALLET env var not set' }, { status: 422 })
    }

    const connection   = new Connection(getServerRpcUrl(), 'confirmed')
    const onChainRaceId = BigInt(race.onChainRaceId.toString())
    const hamstarMint   = new PublicKey(mintAddress)
    const treasuryPk    = new PublicKey(treasuryAddress)
    const [escrowPDA]   = getEscrowPDA(onChainRaceId)

    const results: { wallet: string; status: 'pushed' | 'failed'; sig?: string; error?: string }[] = []

    // Process each winning cheer sequentially to avoid nonce conflicts
    for (const cheer of race.cheers) {
      try {
        const winnerPk = new PublicKey(cheer.walletAddress)

        const ix = buildPushRewardInstruction({
          adminPubkey:    adminKeypair.publicKey,
          winnerPubkey:   winnerPk,
          treasuryPubkey: treasuryPk,
          hamstarMint,
          raceId:         onChainRaceId,
          escrowPubkey:   escrowPDA,
        })

        const sig = await sendAdminTx(connection, [ix], [adminKeypair])

        // Mark as pushed in DB
        await prisma.cheer.update({
          where: { id: cheer.id },
          data:  { rewardPushed: true },
        })

        results.push({ wallet: cheer.walletAddress, status: 'pushed', sig })
      } catch (e: unknown) {
        const msg = String(e)
        // AlreadyClaimed = user already pulled their reward via claim_reward — mark as pushed
        if (msg.includes('AlreadyClaimed')) {
          await prisma.cheer.update({
            where: { id: cheer.id },
            data:  { rewardPushed: true },
          })
          results.push({ wallet: cheer.walletAddress, status: 'pushed', error: 'already claimed by user' })
        } else {
          results.push({ wallet: cheer.walletAddress, status: 'failed', error: msg })
          console.error(`[push-rewards] failed for ${cheer.walletAddress}:`, e)
        }
      }
    }

    const pushed = results.filter(r => r.status === 'pushed').length
    const failed = results.filter(r => r.status === 'failed').length

    return NextResponse.json({ ok: true, pushed, failed, results })
  } catch (e) {
    console.error('[/api/admin/race/push-rewards]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
