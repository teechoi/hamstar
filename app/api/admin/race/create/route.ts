import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { prisma } from '@/lib/prisma'
import {
  buildCreateRaceInstruction,
  getEscrowPDA,
} from '@/lib/hamstar-program'
import {
  getAdminKeypair,
  isOnChainConfigured,
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
    const { startsAt, endsAt, raceNumber } = await req.json()

    if (!startsAt || !endsAt) {
      return NextResponse.json({ error: 'startsAt and endsAt are required' }, { status: 400 })
    }

    // Determine next race number
    let nextNumber = raceNumber
    if (!nextNumber) {
      const last = await prisma.race.findFirst({ orderBy: { number: 'desc' } })
      nextNumber = (last?.number ?? 0) + 1
    }

    // Check for conflict
    const conflict = await prisma.race.findUnique({ where: { number: nextNumber } })
    if (conflict) {
      return NextResponse.json({ error: `Race #${nextNumber} already exists` }, { status: 409 })
    }

    // Get all active pets ordered by number (determines hamster_index 0, 1, 2)
    const pets = await prisma.pet.findMany({
      where: { active: true },
      select: { id: true },
      orderBy: { number: 'asc' },
    })
    if (pets.length === 0) {
      return NextResponse.json({ error: 'No active pets found — seed pets first' }, { status: 422 })
    }

    // on-chain race_id = race number (u64)
    const onChainRaceId = BigInt(nextNumber)
    const [escrowPDA] = getEscrowPDA(onChainRaceId)

    // Create race + entries in one DB transaction
    const race = await prisma.race.create({
      data: {
        number:         nextNumber,
        status:         'UPCOMING',
        startsAt:       new Date(startsAt),
        endsAt:         new Date(endsAt),
        onChainRaceId,
        escrowAddress:  escrowPDA.toBase58(),
        onChainCreated: false,
        entries: {
          create: pets.map(p => ({ petId: p.id, totalSol: 0 })),
        },
      },
      include: {
        entries: { include: { pet: { select: { id: true, name: true, slug: true } } } },
      },
    })

    // Sync SiteSettings raceNumber
    await prisma.siteSettings.upsert({
      where:  { id: 'singleton' },
      update: { raceNumber: nextNumber },
      create: { id: 'singleton', raceNumber: nextNumber },
    })

    // ── Attempt on-chain race creation ────────────────────────────────────────
    let onChainError: string | null = null

    if (isOnChainConfigured()) {
      try {
        const settings = await prisma.siteSettings.findFirst({ where: { id: 'singleton' } })
        const mintAddress = settings?.hamstarMint

        if (mintAddress && !mintAddress.includes('xxx')) {
          const adminKeypair = getAdminKeypair()!
          const connection   = new Connection(getServerRpcUrl(), 'confirmed')

          // Pick window: open at race startsAt, close at race endsAt
          const pickWindowOpen  = BigInt(Math.floor(new Date(startsAt).getTime() / 1000))
          const pickWindowClose = BigInt(Math.floor(new Date(endsAt).getTime()   / 1000))

          const ix = buildCreateRaceInstruction({
            adminPubkey:     adminKeypair.publicKey,
            hamstarMint:     new PublicKey(mintAddress),
            raceId:          onChainRaceId,
            pickWindowOpen,
            pickWindowClose,
          })

          await sendAdminTx(connection, [ix], [adminKeypair])

          await prisma.race.update({
            where: { id: race.id },
            data:  { onChainCreated: true },
          })
        } else {
          onChainError = 'HAMSTAR_MINT not configured — race created off-chain only'
        }
      } catch (chainErr) {
        onChainError = `On-chain create_race failed: ${String(chainErr)}`
        console.error('[/api/admin/race/create] on-chain error:', chainErr)
        // Don't fail the whole request — DB race is created, on-chain can be retried
      }
    } else {
      onChainError = 'ADMIN_KEYPAIR not configured — race created off-chain only'
    }

    return NextResponse.json({ ok: true, race, onChainError })
  } catch (e) {
    console.error('[/api/admin/race/create]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
