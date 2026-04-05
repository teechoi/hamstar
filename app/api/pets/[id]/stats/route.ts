import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const petSlug = params.id.toLowerCase()

  try {
    const pet = await prisma.pet.findUnique({
      where: { slug: petSlug },
      select: {
        wins: true,
        _count: { select: { raceEntries: true } },
      },
    })

    if (!pet) return NextResponse.json({ wins: 0, races: 0, winRate: 0 })

    const races = pet._count.raceEntries
    const winRate = races > 0 ? Math.round((pet.wins / races) * 100) : 0

    return NextResponse.json({ wins: pet.wins, races, winRate })
  } catch (err) {
    console.error('[/api/pets/stats]', err)
    return NextResponse.json({ wins: 0, races: 0, winRate: 0 })
  }
}
