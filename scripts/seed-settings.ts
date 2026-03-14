// scripts/seed-settings.ts
// One-time script: copies config/site.ts values into the SiteSettings DB table.
// Run after migrations: npx tsx scripts/seed-settings.ts
import { PrismaClient } from '@prisma/client'
import { SITE, PETS } from '../config/site'

const prisma = new PrismaClient()

async function main() {
  console.log('\n🐹 Seeding site settings...\n')

  const genesisTs = BigInt(process.env.GENESIS_TIMESTAMP || '0')

  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      raceNumber: SITE.stream.raceNumber,
      isLive: SITE.stream.isLive,
      streamUrl: SITE.stream.url,
      replayUrl: SITE.stream.replayUrl || null,
      genesisTs,
      twitterUrl: SITE.socials.twitter || null,
      tiktokUrl: SITE.socials.tiktok || null,
      instagramUrl: SITE.socials.instagram || null,
      youtubeUrl: SITE.socials.youtube || null,
      sponsorEmail: SITE.sponsorEmail,
      siteName: SITE.name,
      tagline: SITE.tagline,
      buttonLabels: {},
    },
  })
  console.log('✓ SiteSettings created')

  // Sync pet bio/image/wins from config into DB pets (matched by slug)
  for (const pet of PETS) {
    const dbPet = await prisma.pet.findUnique({ where: { slug: pet.id } })
    if (dbPet) {
      await prisma.pet.update({
        where: { slug: pet.id },
        data: { bio: pet.bio, image: pet.image ?? '', wins: pet.wins },
      })
      console.log(`✓ Updated pet: ${pet.name}`)
    } else {
      console.log(`⚠️  Pet not found in DB: ${pet.id} — run seed.ts first`)
    }
  }

  console.log('\n✅ Done!\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
