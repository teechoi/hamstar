import { PetPageClient } from '@/components/pet/PetPageClient'
import { PETS } from '@/config/site'
import { prisma } from '@/lib/prisma'
import type { Pet } from '@/config/site'

export const dynamic = 'force-dynamic'

export default async function PetPage() {
  let pets: Pet[] = PETS

  try {
    const dbPets = await prisma.pet.findMany({
      where: { active: true },
      orderBy: { number: 'asc' },
    })

    if (dbPets.length) {
      pets = dbPets.map((p) => ({
        id:         p.slug,
        name:       p.name,
        number:     parseInt(p.number, 10) || 1,
        emoji:      p.emoji,
        team:       p.team,
        tagline:    p.tagline,
        bio:        p.bio,
        color:      p.color,
        image:      p.image || undefined,
        speed:      p.speedBase,
        chaos:      p.chaosBase,
        wins:       p.wins,
        snackLevel: p.snackLevel,
        cageLevel:  p.cageLevel,
        sponsors:   [],
      }))
    }
  } catch {
    // DB unavailable — static PETS already set
  }

  return <PetPageClient pets={pets} />
}
