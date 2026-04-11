import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PET_SELECT = {
  id: true, slug: true, name: true,
  emoji: true, color: true, number: true,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatRace(race: any, cheerCounts: Record<string, number>) {
  if (!race) return null
  const entries = race.entries.map((e: any) => ({
    petId:      e.pet.slug,
    pet:        e.pet,
    position:   e.position,
    totalSol:   Number(e.totalSol),
    supporters: cheerCounts[e.petId] ?? 0,
  }))
  return {
    id:             race.id,
    number:         race.number,
    status:         race.status,
    startsAt:       race.startsAt.toISOString(),
    endsAt:         race.endsAt.toISOString(),
    onChainRaceId:  race.onChainRaceId !== null && race.onChainRaceId !== undefined
                      ? String(race.onChainRaceId)   // BigInt → string for JSON
                      : null,
    onChainCreated: race.onChainCreated ?? false,
    escrowAddress:  race.escrowAddress ?? null,
    entries,
  }
}

export async function GET() {
  try {
    const [current, pastRaces] = await Promise.all([
      prisma.race.findFirst({
        where: { status: { not: 'FINISHED' } },
        orderBy: { number: 'desc' },
        include: {
          entries: {
            include: { pet: { select: PET_SELECT } },
            orderBy: { totalSol: 'desc' },
          },
        },
      }),
      prisma.race.findMany({
        where: { status: 'FINISHED' },
        orderBy: { number: 'desc' },
        take: 5,
        include: {
          entries: {
            include: { pet: { select: PET_SELECT } },
            orderBy: { position: 'asc' },
          },
        },
      }),
    ])

    // Count supporters (cheers) per pet for the current race
    let cheerCounts: Record<string, number> = {}
    if (current) {
      const cheers = await prisma.cheer.groupBy({
        by: ['petId'],
        where: { raceId: current.id },
        _count: { petId: true },
      })
      cheers.forEach(c => { cheerCounts[c.petId] = c._count.petId })
    }

    const currentRace = formatRace(current, cheerCounts)
    const totalSol = currentRace
      ? currentRace.entries.reduce((s: number, e: { totalSol: number }) => s + e.totalSol, 0)
      : 0

    return NextResponse.json({
      currentRace,
      pastRaces: pastRaces.map(r => formatRace(r, {})),
      totalSol,
    })
  } catch (err) {
    console.error('[/api/races]', err)
    return NextResponse.json({ currentRace: null, pastRaces: [], totalSol: 0 })
  }
}
