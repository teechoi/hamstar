/**
 * POST /api/admin/race/cancel
 *
 * Cancels a race on-chain (enables full refunds for all cheerers)
 * and marks the race as FINISHED with a cancelled flag in the DB.
 *
 * Body: { raceId: string }
 * Requires admin session cookie (enforced by middleware).
 */
import { NextRequest, NextResponse } from 'next/server'
import { Connection } from '@solana/web3.js'
import { prisma } from '@/lib/prisma'
import { buildCancelRaceInstruction } from '@/lib/hamstar-program'
import { getAdminKeypair, sendAdminTx, getServerRpcUrl } from '@/lib/admin-signer'
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

    const race = await prisma.race.findUnique({ where: { id: raceId } })
    if (!race) return NextResponse.json({ error: 'Race not found' }, { status: 404 })

    if (race.status === 'FINISHED' && race.onChainSettled) {
      return NextResponse.json(
        { error: 'Race is already settled — cannot cancel' },
        { status: 422 },
      )
    }

    let onChainSig: string | null = null
    let onChainError: string | null = null

    if (race.onChainRaceId) {
      const adminKeypair = getAdminKeypair()
      if (!adminKeypair) {
        return NextResponse.json(
          { error: 'ADMIN_KEYPAIR not configured on server' },
          { status: 503 },
        )
      }

      try {
        const connection    = new Connection(getServerRpcUrl(), 'confirmed')
        const onChainRaceId = BigInt(race.onChainRaceId.toString())

        const ix = buildCancelRaceInstruction({
          adminPubkey: adminKeypair.publicKey,
          raceId:      onChainRaceId,
        })
        onChainSig = await sendAdminTx(connection, [ix], [adminKeypair])
      } catch (e: unknown) {
        const msg = String(e)
        if (msg.includes('RaceAlreadyFinal')) {
          onChainError = 'Race is already final on-chain'
        } else {
          onChainError = `cancel_race on-chain failed: ${msg}`
          console.error('[/api/admin/race/cancel] on-chain error:', e)
        }
      }
    } else {
      onChainError = 'Race was not created on-chain — cancelled DB record only'
    }

    // Mark all cheers as refunded in DB (note: actual HAMSTAR refund is on-chain via claim_refund)
    await prisma.$transaction([
      prisma.race.update({
        where: { id: raceId },
        data:  { status: 'FINISHED', onChainSettled: false },
      }),
      // Mark cheers as not won (null → they'll get refund on-chain via claim_refund)
      prisma.cheer.updateMany({
        where: { raceId },
        data:  { won: false },
      }),
    ])

    return NextResponse.json({ ok: true, onChainSig, onChainError })
  } catch (e) {
    console.error('[/api/admin/race/cancel]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
