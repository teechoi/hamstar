export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { active: true },
      include: {
        pet: {
          select: { id: true, slug: true, name: true, color: true, image: true },
        },
      },
      orderBy: [{ tier: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(
      sponsors.map((s) => ({ ...s, solPerRace: Number(s.solPerRace) }))
    )
  } catch {
    return NextResponse.json([])
  }
}
