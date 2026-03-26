export const dynamic = 'force-dynamic'
// app/api/admin/race/current/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const race = await prisma.race.findFirst({
      where: { status: { not: 'FINISHED' } },
      include: {
        entries: {
          include: { pet: true },
          orderBy: { totalSol: 'desc' },
        },
      },
      orderBy: { number: 'asc' },
    })

    if (!race) return NextResponse.json(null)

    return NextResponse.json({
      ...race,
      entries: race.entries.map((e) => ({
        ...e,
        totalSol: Number(e.totalSol),
      })),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
