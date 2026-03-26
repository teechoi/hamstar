export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PETS } from '@/config/site'

async function seedPets() {
  for (const pet of PETS) {
    await prisma.pet.upsert({
      where: { slug: pet.id },
      create: {
        slug:          pet.id,
        name:          pet.name,
        number:        String(pet.number),
        emoji:         pet.emoji,
        team:          pet.team,
        tagline:       pet.tagline,
        bio:           pet.bio,
        color:         pet.color,
        walletAddress: `placeholder-${pet.id}`,
        active:        true,
        image:         pet.image ?? '',
        wins:          pet.wins,
        speedBase:     pet.speed,
        chaosBase:     pet.chaos,
        snackLevel:    pet.snackLevel,
        cageLevel:     pet.cageLevel,
      },
      update: {
        name:       pet.name,
        number:     String(pet.number),
        emoji:      pet.emoji,
        team:       pet.team,
        tagline:    pet.tagline,
        bio:        pet.bio,
        color:      pet.color,
        wins:       pet.wins,
        speedBase:  pet.speed,
        chaosBase:  pet.chaos,
        snackLevel: pet.snackLevel,
        cageLevel:  pet.cageLevel,
        // image and walletAddress are intentionally NOT overwritten
        // so uploaded photos and real wallet addresses are preserved
      },
    })
  }
}

export async function GET() {
  try {
    // Upsert all config pets (old slugs are ignored, not deleted — FK constraints)
    await seedPets()

    // Return only pets whose slugs match config (filters out stale hammy/whiskers/nugget)
    const configSlugs = PETS.map(p => p.id)
    const pets = await prisma.pet.findMany({
      where: { slug: { in: configSlugs } },
      orderBy: { number: 'asc' },
    })
    return NextResponse.json(pets)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
