export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PETS } from '@/config/site'

export async function POST() {
  try {
    let count = 0
    for (const pet of PETS) {
      await prisma.pet.upsert({
        where: { slug: pet.id },
        create: {
          slug:         pet.id,
          name:         pet.name,
          number:       String(pet.number),
          emoji:        pet.emoji,
          team:         pet.team,
          tagline:      pet.tagline,
          bio:          pet.bio,
          color:        pet.color,
          walletAddress: `placeholder-${pet.id}-${Date.now()}`,
          active:       true,
          image:        pet.image ?? '',
          wins:         pet.wins,
          speedBase:    pet.speed,
          chaosBase:    pet.chaos,
          snackLevel:   pet.snackLevel,
          cageLevel:    pet.cageLevel,
        },
        update: {
          name:      pet.name,
          number:    String(pet.number),
          emoji:     pet.emoji,
          team:      pet.team,
          tagline:   pet.tagline,
          bio:       pet.bio,
          color:     pet.color,
          wins:      pet.wins,
          speedBase: pet.speed,
          chaosBase: pet.chaos,
          snackLevel: pet.snackLevel,
          cageLevel:  pet.cageLevel,
          // Note: image and walletAddress are NOT overwritten on update
          // so existing uploaded photos and wallet addresses are preserved
        },
      })
      count++
    }
    return NextResponse.json({ ok: true, count })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
