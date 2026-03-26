import { SponsorsPageClient } from '@/components/sponsors/SponsorsPageClient'
import { PETS, SITE } from '@/config/site'
import { prisma } from '@/lib/prisma'
import type { Pet } from '@/config/site'

export const dynamic = 'force-dynamic'

export type DbSponsor = {
  id: string; name: string; emoji: string; tier: string
  websiteUrl: string | null; solPerRace: number
  pet: { id: string; slug: string; name: string; color: string; image: string } | null
}

export default async function SponsorsPage() {
  let pets: Pet[]           = PETS
  let sponsors: DbSponsor[] = []
  let sponsorEmail          = SITE.sponsorEmail

  try {
    const [dbPets, dbSponsors, settings] = await Promise.all([
      prisma.pet.findMany({ where: { active: true }, orderBy: { number: 'asc' } }),
      prisma.sponsor.findMany({
        where: { active: true },
        include: { pet: { select: { id: true, slug: true, name: true, color: true, image: true } } },
        orderBy: [{ tier: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    ])

    if (dbPets.length) {
      pets = dbPets.map((p) => ({
        id: p.slug, name: p.name, number: parseInt(p.number, 10) || 1,
        emoji: p.emoji, team: p.team, tagline: p.tagline, bio: p.bio,
        color: p.color, image: p.image || undefined,
        speed: p.speedBase, chaos: p.chaosBase, wins: p.wins,
        snackLevel: p.snackLevel, cageLevel: p.cageLevel, sponsors: [],
      }))
    }

    sponsors = dbSponsors.map((s) => ({
      id: s.id, name: s.name, emoji: s.emoji, tier: s.tier,
      websiteUrl: s.websiteUrl, solPerRace: Number(s.solPerRace),
      pet: s.pet,
    }))

    if (settings?.sponsorEmail) sponsorEmail = settings.sponsorEmail
  } catch {
    // DB unavailable — static values already set
  }

  return <SponsorsPageClient pets={pets} sponsors={sponsors} sponsorEmail={sponsorEmail} />
}
