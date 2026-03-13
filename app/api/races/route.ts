// app/api/races/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentRaceWindow } from '@/lib/race-scheduler'

export const revalidate = 30

export async function GET() {
  try {
    const window = getCurrentRaceWindow()

    // Upsert the current race record
    const currentRace = await prisma.race.upsert({
      where:  { number: window.raceNumber },
      update: { status: window.status },
      create: {
        number:   window.raceNumber,
        status:   window.status,
        startsAt: window.startsAt,
        endsAt:   window.endsAt,
      },
      include: {
        entries: {
          include: {
            pet: { select: { id: true, slug: true, name: true, emoji: true, color: true, number: true } },
          },
          orderBy: { totalSol: 'desc' },
        },
      },
    })

    // Ensure all active pets have an entry for this race
    const pets = await prisma.pet.findMany({ where: { active: true } })
    for (const pet of pets) {
      await prisma.raceEntry.upsert({
        where:  { raceId_petId: { raceId: currentRace.id, petId: pet.id } },
        update: {},
        create: { raceId: currentRace.id, petId: pet.id, totalSol: 0 },
      })
    }

    // Last 8 finished races
    const pastRaces = await prisma.race.findMany({
      where:   { status: 'FINISHED' },
      orderBy: { number: 'desc' },
      take:    8,
      include: {
        entries: {
          include: {
            pet: { select: { id: true, slug: true, name: true, emoji: true, color: true, number: true } },
          },
          orderBy: { position: 'asc' },
        },
      },
    })

    const totalSol = currentRace.entries.reduce((sum, e) => sum + Number(e.totalSol), 0)

    return NextResponse.json({
      currentRace: {
        ...currentRace,
        entries:      currentRace.entries.map((e) => ({ ...e, totalSol: Number(e.totalSol) })),
        msUntilEnd:   window.msUntilEnd,
        msUntilStart: window.msUntilStart,
      },
      pastRaces: pastRaces.map((r) => ({
        ...r,
        entries: r.entries.map((e) => ({ ...e, totalSol: Number(e.totalSol) })),
      })),
      totalSol,
    })
  } catch (err) {
    console.error('[GET /api/races]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
