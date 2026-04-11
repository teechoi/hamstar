/**
 * POST /api/admin/race/settle
 *
 * Runs the full on-chain settlement pipeline for a race that has just finished:
 *   1. lock_race  — closes the pick window (permissionless, signed by admin)
 *   2. propose_settlement(hamsterIndex)  — settler slot 0 (admin key)
 *   3. confirm_settlement(hamsterIndex) — settler slot 1 (SETTLER_2_KEYPAIR or admin)
 *   Race status becomes Settled on-chain after step 3.
 *
 * Body: { raceId: string, winnerHamsterIndex: number (0|1|2) }
 *
 * Requires admin session cookie.
 */
import { NextRequest, NextResponse } from 'next/server'
import { Connection } from '@solana/web3.js'
import { prisma } from '@/lib/prisma'
import {
  buildLockRaceInstruction,
  buildProposeSettlementInstruction,
  buildConfirmSettlementInstruction,
} from '@/lib/hamstar-program'
import {
  getAdminKeypair,
  getSettler2Keypair,
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
    const { raceId, winnerHamsterIndex } = await req.json()

    if (!raceId || winnerHamsterIndex == null) {
      return NextResponse.json(
        { error: 'raceId and winnerHamsterIndex required' },
        { status: 400 },
      )
    }

    if (![0, 1, 2].includes(winnerHamsterIndex)) {
      return NextResponse.json({ error: 'winnerHamsterIndex must be 0, 1, or 2' }, { status: 400 })
    }

    const race = await prisma.race.findUnique({ where: { id: raceId } })
    if (!race) return NextResponse.json({ error: 'Race not found' }, { status: 404 })

    if (race.status !== 'FINISHED') {
      return NextResponse.json({ error: 'Race must be FINISHED before settling' }, { status: 422 })
    }

    if (race.onChainSettled) {
      return NextResponse.json({ ok: true, alreadySettled: true })
    }

    if (!race.onChainRaceId) {
      return NextResponse.json(
        { error: 'Race was not created on-chain — cannot settle' },
        { status: 422 },
      )
    }

    const adminKeypair   = getAdminKeypair()
    if (!adminKeypair) {
      return NextResponse.json(
        { error: 'ADMIN_KEYPAIR not configured on server' },
        { status: 503 },
      )
    }

    const settler2 = getSettler2Keypair()
    const connection = new Connection(getServerRpcUrl(), 'confirmed')
    const onChainRaceId = BigInt(race.onChainRaceId.toString())
    const hamsterIndex  = winnerHamsterIndex as number

    const steps: string[] = []

    // ── Step 1: lock_race ─────────────────────────────────────────────────────
    try {
      const lockIx = buildLockRaceInstruction({
        callerPubkey: adminKeypair.publicKey,
        raceId:       onChainRaceId,
      })
      const sig = await sendAdminTx(connection, [lockIx], [adminKeypair])
      steps.push(`lock_race: ${sig}`)
    } catch (e: unknown) {
      const msg = String(e)
      // "WindowStillOpen" = pick window hasn't passed yet on-chain (clock mismatch)
      // "RaceNotOpen"     = already locked (idempotent, continue)
      if (msg.includes('RaceNotOpen') || msg.includes('already')) {
        steps.push('lock_race: already locked (skipped)')
      } else {
        throw new Error(`lock_race failed: ${msg}`)
      }
    }

    // ── Step 2: propose_settlement (settler 0 = admin) ───────────────────────
    try {
      const proposeIx = buildProposeSettlementInstruction({
        settlerPubkey: adminKeypair.publicKey,
        raceId:        onChainRaceId,
        hamsterIndex,
      })
      const sig = await sendAdminTx(connection, [proposeIx], [adminKeypair])
      steps.push(`propose_settlement: ${sig}`)
    } catch (e: unknown) {
      const msg = String(e)
      if (msg.includes('AlreadyVoted')) {
        steps.push('propose_settlement: already voted (skipped)')
      } else {
        throw new Error(`propose_settlement failed: ${msg}`)
      }
    }

    // ── Step 3: confirm_settlement (settler 1 = settler2 key) ────────────────
    // If admin key IS settler2, we're using same key for both slots — only valid
    // in dev/single-settler mode. The contract will return AlreadyVoted for slot 1
    // if the same pubkey was registered in both settler slots.
    try {
      const confirmIx = buildConfirmSettlementInstruction({
        settlerPubkey: settler2.publicKey,
        raceId:        onChainRaceId,
        hamsterIndex,
      })
      const sig = await sendAdminTx(connection, [confirmIx], [settler2])
      steps.push(`confirm_settlement: ${sig}`)
    } catch (e: unknown) {
      const msg = String(e)
      if (msg.includes('AlreadyVoted') || msg.includes('RaceNotLocked')) {
        // RaceNotLocked after propose means it already reached 2-of-3 consensus
        steps.push('confirm_settlement: already settled (skipped)')
      } else {
        throw new Error(`confirm_settlement failed: ${msg}`)
      }
    }

    // ── Mark settled in DB ────────────────────────────────────────────────────
    await prisma.race.update({
      where: { id: raceId },
      data:  { onChainSettled: true },
    })

    return NextResponse.json({ ok: true, steps })
  } catch (e) {
    console.error('[/api/admin/race/settle]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
