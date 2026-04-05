import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
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

    // Get all active pets
    const pets = await prisma.pet.findMany({
      where: { active: true },
      select: { id: true },
      orderBy: { number: 'asc' },
    })
    if (pets.length === 0) {
      return NextResponse.json({ error: 'No active pets found — seed pets first' }, { status: 422 })
    }

    // Create race + entries in one transaction
    const race = await prisma.race.create({
      data: {
        number:   nextNumber,
        status:   'UPCOMING',
        startsAt: new Date(startsAt),
        endsAt:   new Date(endsAt),
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

    return NextResponse.json({ ok: true, race })
  } catch (e) {
    console.error('[/api/admin/race/create]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
