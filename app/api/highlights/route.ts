import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [races, media] = await Promise.all([
      prisma.race.findMany({
        where:   { status: 'FINISHED' },
        orderBy: { number: 'desc' },
        take: 20,
        include: {
          entries: {
            include: { pet: { select: { name: true, emoji: true, slug: true, color: true } } },
            orderBy: { position: 'asc' },
          },
          _count: { select: { cheers: true } },
        },
      }),
      prisma.media.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 12,
      }),
    ])

    const formattedRaces = races.map(r => ({
      id:         r.id,
      number:     r.number,
      date:       r.endsAt,
      recap:      r.recap,
      totalSol:   r.entries.reduce((s, e) => s + Number(e.totalSol), 0),
      supporters: r._count.cheers,
      podium:     r.entries
        .filter(e => e.position !== null)
        .sort((a, b) => (a.position ?? 9) - (b.position ?? 9))
        .map(e => ({ position: e.position, name: e.pet.name, emoji: e.pet.emoji, color: e.pet.color })),
    }))

    return NextResponse.json({ races: formattedRaces, media })
  } catch (e) {
    console.error('[/api/highlights]', e)
    return NextResponse.json({ races: [], media: [] })
  }
}
