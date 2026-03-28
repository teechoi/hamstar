import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { raceId, positions } = await req.json() // positions: string[] of pet slugs [1st, 2nd, 3rd]

    const race = await prisma.race.findUnique({
      where: { id: raceId },
      include: { entries: { include: { pet: true } } },
    })
    if (!race) return NextResponse.json({ error: 'Race not found' }, { status: 404 })

    // Update entry positions
    await Promise.all(
      positions.map((slug: string, idx: number) => {
        const entry = race.entries.find(e => e.pet.slug === slug)
        if (!entry) return null
        return prisma.raceEntry.update({
          where: { id: entry.id },
          data: { position: idx + 1 },
        })
      }).filter(Boolean)
    )

    // Mark race finished
    await prisma.race.update({ where: { id: raceId }, data: { status: 'FINISHED' } })

    // Increment win count for 1st place
    const winner = race.entries.find(e => e.pet.slug === positions[0])
    if (winner) {
      await prisma.pet.update({ where: { id: winner.petId }, data: { wins: { increment: 1 } } })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
