// app/api/sponsors/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 300

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where:   { active: true },
      include: { pet: { select: { slug: true, name: true, emoji: true } } },
      orderBy: [{ tier: 'asc' }, { solPerRace: 'desc' }],
    })
    return NextResponse.json({
      sponsors: sponsors.map((s) => ({ ...s, solPerRace: Number(s.solPerRace) })),
    })
  } catch (err) {
    console.error('[GET /api/sponsors]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
