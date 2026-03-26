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
  // Remove any DB pets whose slug isn't in config (stale data from old schema)
  const configSlugs = PETS.map(p => p.id)
  await prisma.pet.deleteMany({ where: { slug: { notIn: configSlugs } } })

  // Upsert all config pets so DB stays in sync
  await seedPets()

  const pets = await prisma.pet.findMany({ orderBy: { number: 'asc' } })
  return NextResponse.json(pets)
}
