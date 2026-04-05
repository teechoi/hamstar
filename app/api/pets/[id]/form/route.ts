import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RACE_HISTORY } from '@/config/site'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const petSlug = params.id.toLowerCase()

  try {
    // Try real DB first
    const races = await prisma.race.findMany({
      where: { status: 'FINISHED' },
      orderBy: { number: 'desc' },
      take: 10,
      include: {
        entries: {
          where: { pet: { slug: petSlug } },
          select: { position: true },
        },
      },
    })

    if (races.length > 0) {
      // A race where this pet has an entry counts; otherwise treat as no-show (skip)
      const participated = races.filter(r => r.entries.length > 0)
      const allResults: ('W' | 'L')[] = participated.map(r =>
        r.entries[0].position === 1 ? 'W' : 'L'
      )
      return NextResponse.json(computeForm(allResults))
    }
  } catch (err) {
    console.error('[/api/pets/form] DB error, falling back to static:', err)
  }

  // Fall back to static RACE_HISTORY
  const sorted = [...RACE_HISTORY].sort((a, b) => b.number - a.number)
  const allResults: ('W' | 'L')[] = sorted.map(r =>
    r.positions[0] === petSlug ? 'W' : 'L'
  )
  return NextResponse.json(computeForm(allResults))
}

function computeForm(allResults: ('W' | 'L')[]) {
  const results = allResults.slice(0, 5)
  const winRate = allResults.length > 0
    ? Math.round((allResults.filter(r => r === 'W').length / allResults.length) * 100)
    : 0

  let streak = 0
  const streakType: 'W' | 'L' = allResults[0] ?? 'L'
  for (const r of allResults) {
    if (r === streakType) streak++
    else break
  }

  return { results, winRate, streak, streakType }
}
