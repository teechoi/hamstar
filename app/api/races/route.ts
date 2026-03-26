export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const races = await prisma.race.findMany({
      where: { status: 'FINISHED' },
      include: {
        entries: {
          where: { position: { not: null } },
          orderBy: { position: 'asc' },
          include: { pet: { select: { id: true, slug: true } } },
        },
      },
      orderBy: { number: 'desc' },
    })

    const results = races.map((race) => ({
      number:    race.number,
      date:      race.endsAt.toISOString().split('T')[0],
      positions: race.entries.map((e) => e.pet.slug), // slug = "dash" | "flash" | "turbo"
      title:     race.title ?? null,
      recap:     race.recap ?? null,
    }))

    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
