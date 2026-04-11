import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Return any race that is either active OR finished but not yet settled on-chain
    const race = await prisma.race.findFirst({
      where: {
        OR: [
          { status: { not: 'FINISHED' } },
          { status: 'FINISHED', onChainSettled: false },
        ],
      },
      orderBy: { number: 'desc' },
      include: {
        entries: {
          include: { pet: { select: { id: true, name: true, slug: true, emoji: true } } },
          orderBy: { pet: { number: 'asc' } },
        },
      },
    })
    return NextResponse.json(race)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
