// app/api/admin/race/current/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
}
