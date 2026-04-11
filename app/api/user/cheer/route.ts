// POST /api/user/cheer   — record that a user cheered for a pet in a race
// PATCH /api/user/cheer  — update won/lost for all cheers in a finished race
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, petId, raceId, raceNumber, amountHamstar, txSignature } = await req.json()

    if (!walletAddress || !petId || (!raceId && raceNumber == null)) {
      return NextResponse.json({ error: 'walletAddress, petId, and raceId or raceNumber required' }, { status: 400 })
    }

    // Resolve raceId from raceNumber if not provided directly
    let resolvedRaceId = raceId
    if (!resolvedRaceId && raceNumber != null) {
      const race = await prisma.race.findUnique({ where: { number: Number(raceNumber) } })
      if (!race) return NextResponse.json({ error: 'Race not found' }, { status: 404 })
      resolvedRaceId = race.id
    }

    // Ensure user row exists first
    await prisma.user.upsert({
      where:  { walletAddress },
      create: { walletAddress },
      update: {},
    })

    // Upsert cheer — one per user per race
    const cheer = await prisma.cheer.upsert({
      where:  { walletAddress_raceId: { walletAddress, raceId: resolvedRaceId } },
      create: {
        walletAddress,
        raceId: resolvedRaceId,
        petId,
        amountHamstar: amountHamstar ?? null,
        txSignature:   txSignature   ?? null,
      },
      update: {
        petId,
        amountHamstar: amountHamstar ?? undefined,
        txSignature:   txSignature   ?? undefined,
      },
    })

    return NextResponse.json({ cheer })
  } catch (err) {
    console.error('[POST /api/user/cheer]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Called when a race finishes — marks all cheers as won/lost
export async function PATCH(req: NextRequest) {
  try {
    const { raceId, raceNumber, winnerPetId } = await req.json()

    if ((!raceId && raceNumber == null) || !winnerPetId) {
      return NextResponse.json({ error: 'raceId or raceNumber, plus winnerPetId required' }, { status: 400 })
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
