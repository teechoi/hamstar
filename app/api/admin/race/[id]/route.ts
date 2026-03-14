// app/api/admin/race/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const race = await prisma.race.findUnique({
    where: { id: params.id },
    include: {
      entries: {
        include: { pet: true },
        orderBy: { totalSol: 'desc' },
      },
    },
  })
  if (!race) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    ...race,
    entries: race.entries.map((e) => ({ ...e, totalSol: Number(e.totalSol) })),
  })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const allowed = ['title', 'recap', 'status']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }
  const race = await prisma.race.update({ where: { id: params.id }, data })
  return NextResponse.json(race)
}
