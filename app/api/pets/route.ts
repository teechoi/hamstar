// app/api/pets/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

export async function GET() {
  try {
    const pets = await prisma.pet.findMany({
      where:   { active: true },
      orderBy: { slug: 'asc' },
      include: {
        sponsors: {
          where:  { active: true },
          select: { id: true, name: true, emoji: true, tier: true },
        },
        upgrades: {
          include: { upgrade: true },
        },
      },
    })

    const enriched = await Promise.all(
      pets.map(async (pet) => {
        const wins = await prisma.raceEntry.count({ where: { petId: pet.id, position: 1 } })
        const agg  = await prisma.donation.aggregate({
          where: { petId: pet.id },
          _sum:  { amountSol: true },
        })
        return {
          ...pet,
          wins,
          lifetimeSol: Number(agg._sum.amountSol ?? 0),
        }
      })
    )

    return NextResponse.json({ pets: enriched })
  } catch (err) {
    console.error('[GET /api/pets]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
