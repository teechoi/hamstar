import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = 20

    const [races, total] = await Promise.all([
      prisma.race.findMany({
        where:   { status: 'FINISHED' },
        orderBy: { number: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
        include: {
          entries: {
            include: { pet: { select: { id: true, name: true, emoji: true, slug: true } } },
            orderBy: { position: 'asc' },
          },
          _count: { select: { cheers: true } },
        },
      }),
      prisma.race.count({ where: { status: 'FINISHED' } }),
    ])

    const formatted = races.map(r => {
      const totalSol = r.entries.reduce((s, e) => s + Number(e.totalSol), 0)
      return {
        id:         r.id,
        number:     r.number,
        startsAt:   r.startsAt,
        endsAt:     r.endsAt,
        recap:      r.recap,
        totalSol,
        supporters: r._count.cheers,
        podium: r.entries
          .filter(e => e.position !== null)
          .sort((a, b) => (a.position ?? 9) - (b.position ?? 9))
          .map(e => ({ position: e.position, name: e.pet.name, emoji: e.pet.emoji, slug: e.pet.slug })),
      }
    })

    return NextResponse.json({ races: formatted, total, page, pages: Math.ceil(total / limit) })
  } catch (e) {
    console.error('[/api/admin/history]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// PATCH /api/admin/history — update race recap
export async function PATCH(req: Request) {
  try {
    const { raceId, recap } = await req.json()
    if (!raceId) return NextResponse.json({ error: 'raceId required' }, { status: 400 })

    const race = await prisma.race.update({
      where: { id: raceId },
      data:  { recap },
    })
    return NextResponse.json({ ok: true, race })
  } catch (e) {
    console.error('[/api/admin/history PATCH]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
