// scripts/seed.ts
// Run: npx tsx scripts/seed.ts
//
// Seeds the database with:
//   - 3 pets (Hammy, Whiskers, Nugget)
//   - Upgrade catalog (8 items)
//   - Race #1

import { PrismaClient } from '@prisma/client'
import { PETS_CONFIG, UPGRADE_CATALOG } from '../lib/pets-config'
import { getCurrentRaceWindow } from '../lib/race-scheduler'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding HamstarHub database...\n')

  // ── 1. PETS ───────────────────────────────────────────────────────────────
  console.log('🐹 Creating pets...')
  for (const pet of PETS_CONFIG) {
    const created = await prisma.pet.upsert({
      where: { slug: pet.slug },
      update: {
        name: pet.name,
        number: pet.number,
        emoji: pet.emoji,
        team: pet.team,
        tagline: pet.tagline,
        color: pet.color,
        walletAddress: pet.walletAddress,
        speedBase: pet.speedBase,
        chaosBase: pet.chaosBase,
      },
      create: {
        slug: pet.slug,
        name: pet.name,
        number: pet.number,
        emoji: pet.emoji,
        team: pet.team,
        tagline: pet.tagline,
        color: pet.color,
        walletAddress: pet.walletAddress,
        speedBase: pet.speedBase,
        chaosBase: pet.chaosBase,
        snackLevel: 20,
        cageLevel: 20,
      },
    })
    console.log(`  ✓ ${created.emoji} ${created.name} (${created.walletAddress.slice(0, 8)}...)`)
  }

  // ── 2. UPGRADE CATALOG ────────────────────────────────────────────────────
  console.log('\n⭐ Creating upgrade catalog...')
  for (const item of UPGRADE_CATALOG) {
    const existing = await prisma.upgradeItem.findFirst({
      where: { category: item.category, tier: item.tier },
    })
    if (!existing) {
      const created = await prisma.upgradeItem.create({
        data: {
          category: item.category as 'SNACK' | 'CAGE',
          tier: item.tier as 'BASIC' | 'UPGRADE' | 'ELITE' | 'LEGENDARY',
          name: item.name,
          emoji: item.emoji,
          description: item.description,
          costSol: item.costSol,
          sortOrder: item.sortOrder,
        },
      })
      console.log(`  ✓ ${created.emoji} ${created.name} (${created.tier} · ${created.costSol} SOL)`)
    } else {
      console.log(`  - ${item.emoji} ${item.name} already exists, skipping`)
    }
  }

  // Grant basic cage to all pets (it's free)
  const basicCage = await prisma.upgradeItem.findFirst({
    where: { category: 'CAGE', tier: 'BASIC' },
  })
  if (basicCage) {
    const pets = await prisma.pet.findMany()
    for (const pet of pets) {
      await prisma.petUpgrade.upsert({
        where: { petId_upgradeId: { petId: pet.id, upgradeId: basicCage.id } },
        update: {},
        create: { petId: pet.id, upgradeId: basicCage.id },
      })
    }
    console.log('\n  ✓ Granted basic cage to all pets')
  }

  // ── 3. RACE #1 ────────────────────────────────────────────────────────────
  console.log('\n🏁 Creating Race #1...')
  const window = getCurrentRaceWindow()
  const race = await prisma.race.upsert({
    where: { number: 1 },
    update: {},
    create: {
      number: 1,
      status: window.raceNumber === 1 ? window.status : 'UPCOMING',
      startsAt: window.raceNumber === 1 ? window.startsAt : new Date(Date.now() + 24 * 60 * 60 * 1000),
      endsAt: window.raceNumber === 1 ? window.endsAt : new Date(Date.now() + 72 * 60 * 60 * 1000),
    },
  })
  console.log(`  ✓ Race #${race.number} created (${race.status})`)

  // Create entries for all pets
  const pets = await prisma.pet.findMany()
  for (const pet of pets) {
    await prisma.raceEntry.upsert({
      where: { raceId_petId: { raceId: race.id, petId: pet.id } },
      update: {},
      create: { raceId: race.id, petId: pet.id, totalSol: 0 },
    })
  }
  console.log(`  ✓ Created entries for ${pets.length} racers`)

  // ── 4. SAMPLE MEDIA ───────────────────────────────────────────────────────
  console.log('\n🎬 Adding sample media...')
  const mediaItems = [
    { type: 'VIDEO' as const, title: 'Welcome to HamstarHub', description: 'Introduction to the racers and platform', url: 'https://youtube.com', featured: true, duration: '2:14' },
    { type: 'VIDEO' as const, title: 'How It Works', description: 'Send SOL, watch them race', url: 'https://youtube.com', featured: false, duration: '0:58' },
    { type: 'PHOTO' as const, title: 'Race Day Setup', description: 'Behind the scenes of the first race', url: 'https://placeholder.co/800x600', featured: false },
  ]
  for (const item of mediaItems) {
    const existing = await prisma.media.findFirst({ where: { title: item.title } })
    if (!existing) {
      await prisma.media.create({ data: item })
      console.log(`  ✓ ${item.type} — "${item.title}"`)
    }
  }

  console.log('\n✅ Seed complete! HamstarHub is ready.\n')
  console.log('Next steps:')
  console.log('  1. Replace wallet addresses in .env (HAMMY_WALLET, WHISKERS_WALLET, NUGGET_WALLET)')
  console.log('  2. Set GENESIS_TIMESTAMP to your launch date')
  console.log('  3. Configure Helius webhook URL → https://yourdomain.com/api/webhook')
  console.log('  4. Run: npm run dev\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
