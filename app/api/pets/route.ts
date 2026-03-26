export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pets = await prisma.pet.findMany({
      where: { active: true },
      orderBy: { number: 'asc' },
      select: {
        id: true, slug: true, name: true, number: true, emoji: true,
        team: true, tagline: true, bio: true, color: true, image: true,
        wins: true, speedBase: true, chaosBase: true, snackLevel: true, cageLevel: true,
      },
    })
    return NextResponse.json(pets)
  } catch {
    return NextResponse.json([])
  }
}
