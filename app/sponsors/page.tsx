import { SponsorsPageClient } from '@/components/sponsors/SponsorsPageClient'
import type { DbSponsor } from '@/components/sponsors/SponsorsPageClient'
import { PETS, SITE } from '@/config/site'
import { prisma } from '@/lib/prisma'
import type { Pet } from '@/config/site'

export const dynamic = 'force-dynamic'

export default async function SponsorsPage() {
  let pets: Pet[]            = PETS
  let sponsors:  DbSponsor[] = []
  let sponsorEmail           = SITE.sponsorEmail

  try {
    const [dbPets, dbSponsors, settings] = await Promise.all([
      prisma.pet.findMany({ where: { active: true }, orderBy: { number: 'asc' } }),
      prisma.sponsor.findMany({
        where: { active: true },
        orderBy: [{ tier: 'asc' }, { createdAt: 'asc' }],
        include: { pet: { select: { id: true, slug: true, name: true, color: true, image: true } } },
      }),
      prisma.siteSettings.findFirst({ where: { id: 'singleton' } }),
    ])

    if (dbPets.length) {
      pets = dbPets.map(p => ({
        id: p.slug, name: p.name, number: parseInt(p.number) || 1,
        emoji: p.emoji, team: p.team, tagline: p.tagline, bio: p.bio,
        color: p.color, image: p.image || undefined,
        speed: p.speedBase, chaos: p.chaosBase, wins: p.wins,
        snackLevel: p.snackLevel, cageLevel: p.cageLevel, sponsors: [],
      }))
    }

    sponsors = dbSponsors.map(s => ({
      id: s.id, name: s.name, emoji: s.emoji, tier: s.tier,
      websiteUrl: s.websiteUrl,
      solPerRace: Number(s.solPerRace),
      pet: s.pet ? { id: s.pet.id, slug: s.pet.slug, name: s.pet.name, color: s.pet.color, image: s.pet.image } : null,
    }))

    if (settings?.sponsorEmail) sponsorEmail = settings.sponsorEmail
  } catch { /* DB unavailable — using static config */ }

  return <SponsorsPageClient pets={pets} sponsors={sponsors} sponsorEmail={sponsorEmail} />
}
