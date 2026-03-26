export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PETS } from '@/config/site'

async function seedPets() {
  for (const pet of PETS) {
    try {
      // First try to find existing pet by slug and update name/stats
      const existing = await prisma.pet.findUnique({ where: { slug: pet.id } })

      if (existing) {
        // Always update name, number, and all stats from config
        await prisma.pet.update({
          where: { slug: pet.id },
          data: {
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
            active:     true,
            // image and walletAddress preserved (not overwritten)
          },
        })
      } else {
        // Create new pet — use timestamp suffix to avoid walletAddress collisions
        await prisma.pet.create({
          data: {
            slug:          pet.id,
            name:          pet.name,
            number:        String(pet.number),
            emoji:         pet.emoji,
            team:          pet.team,
            tagline:       pet.tagline,
            bio:           pet.bio,
            color:         pet.color,
            walletAddress: `placeholder-${pet.id}-${Date.now()}`,
            active:        true,
            image:         pet.image ?? '',
            wins:          pet.wins,
            speedBase:     pet.speed,
            chaosBase:     pet.chaos,
            snackLevel:    pet.snackLevel,
            cageLevel:     pet.cageLevel,
          },
        })
      }
    } catch {
      // Skip individual pet errors — log but continue so others still seed
      console.error(`[seed] Failed to sync pet ${pet.id}`)
    }
  }
}

export async function GET() {
  try {
    await seedPets()

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
