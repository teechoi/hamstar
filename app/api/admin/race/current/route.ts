import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const race = await prisma.race.findFirst({
      where: { status: { not: 'FINISHED' } },
      orderBy: { number: 'desc' },
      include: {
        entries: { include: { pet: { select: { id: true, name: true, slug: true } } } },
      },
    })
    return NextResponse.json(race)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
