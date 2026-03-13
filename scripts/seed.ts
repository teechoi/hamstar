// scripts/seed.ts
// Run: npm run seed
//
// Populates the database with pets, upgrade catalog, and Race #1.
// Pet profiles come from config/site.ts — so they stay in sync with the UI.
// Wallet addresses come from .env.local.
//
// Safe to re-run — uses upsert everywhere, won't duplicate data.

import { PrismaClient } from '@prisma/client'
import { PETS }         from '../config/site'
import { UPGRADE_CATALOG } from '../lib/pets-config'
import { getCurrentRaceWindow } from '../lib/race-scheduler'

const prisma = new PrismaClient()

// ─── Wallet addresses from env ────────────────────────────────────────────────
// Set these in .env.local before running seed.
const WALLETS: Record<string, string> = {
  hammy:    process.env.HAMMY_WALLET    ?? 'HAMMY_WALLET_PLACEHOLDER',
  whiskers: process.env.WHISKERS_WALLET ?? 'WHISKERS_WALLET_PLACEHOLDER',
  nugget:   process.env.NUGGET_WALLET   ?? 'NUGGET_WALLET_PLACEHOLDER',
}

async function main() {
  console.log('\n🌱 Seeding Hamstar database...\n')

  // Check for placeholder wallets
  const missing = Object.entries(WALLETS).filter(([, v]) => v.includes('PLACEHOLDER'))
  if (missing.length > 0) {
    console.warn('⚠️  Wallet addresses not set — using placeholders:')
    missing.forEach(([k]) => console.warn(`   ${k.toUpperCase()}_WALLET is missing from .env.local`))
    console.warn('   Run seed again after adding real wallet addresses.\n')
  }

  // ── 1. PETS ────────────────────────────────────────────────────────────────
  console.log('🐹 Creating pets...')
  for (const pet of PETS) {
    const walletAddress = WALLETS[pet.id]
    const created = await prisma.pet.upsert({
      where:  { slug: pet.id },
      update: {
        name:          pet.name,
        number:        String(pet.number),
        emoji:         pet.emoji,
        team:          pet.team,
        tagline:       pet.tagline,
        color:         pet.color,
        walletAddress,
        speedBase:     pet.speed,
        chaosBase:     pet.chaos,
      },
      create: {
        slug:          pet.id,
        name:          pet.name,
        number:        String(pet.number),
        emoji:         pet.emoji,
        team:          pet.team,
        tagline:       pet.tagline,
        color:         pet.color,
        walletAddress,
        speedBase:     pet.speed,
        chaosBase:     pet.chaos,
        snackLevel:    pet.snackLevel,
        cageLevel:     pet.cageLevel,
      },
    })
    console.log(`  ✓ ${created.emoji} ${created.name}  wallet: ${walletAddress.slice(0, 10)}...`)
  }

  // ── 2. UPGRADE CATALOG ─────────────────────────────────────────────────────
  console.log('\n⭐ Creating upgrade catalog...')
  for (const item of UPGRADE_CATALOG) {
    const existing = await prisma.upgradeItem.findFirst({
      where: { category: item.category, tier: item.tier },
    })
    if (!existing) {
      const created = await prisma.upgradeItem.create({
        data: {
          category:  item.category as 'SNACK' | 'CAGE',
          tier:      item.tier     as 'BASIC' | 'UPGRADE' | 'ELITE' | 'LEGENDARY',
          name:      item.name,
          emoji:     item.emoji,
          description: item.description,
          costSol:   item.costSol,
          sortOrder: item.sortOrder,
        },
      })
      console.log(`  ✓ ${created.emoji} ${created.name} (${created.tier} · ${created.costSol} SOL)`)
    } else {
      console.log(`  - ${item.emoji} ${item.name} already exists`)
    }
  }

  // Grant the free Basic Cage to all pets
  const basicCage = await prisma.upgradeItem.findFirst({ where: { category: 'CAGE', tier: 'BASIC' } })
  if (basicCage) {
    const dbPets = await prisma.pet.findMany()
    for (const pet of dbPets) {
      await prisma.petUpgrade.upsert({
        where:  { petId_upgradeId: { petId: pet.id, upgradeId: basicCage.id } },
        update: {},
        create: { petId: pet.id, upgradeId: basicCage.id },
      })
    }
    console.log('\n  ✓ Basic cage granted to all pets (free tier)')
  }

  // ── 3. RACE #1 ─────────────────────────────────────────────────────────────
  console.log('\n🏁 Creating Race #1...')
  const window = getCurrentRaceWindow()
  const race = await prisma.race.upsert({
    where:  { number: 1 },
    update: {},
    create: {
      number:   1,
      status:   window.raceNumber === 1 ? window.status : 'UPCOMING',
      startsAt: window.raceNumber === 1 ? window.startsAt : new Date(Date.now() + 24 * 60 * 60 * 1000),
      endsAt:   window.raceNumber === 1 ? window.endsAt   : new Date(Date.now() + 72 * 60 * 60 * 1000),
    },
  })
  console.log(`  ✓ Race #${race.number} (${race.status})`)

  const dbPets = await prisma.pet.findMany()
  for (const pet of dbPets) {
    await prisma.raceEntry.upsert({
      where:  { raceId_petId: { raceId: race.id, petId: pet.id } },
      update: {},
      create: { raceId: race.id, petId: pet.id, totalSol: 0 },
    })
  }
  console.log(`  ✓ Race entries created for ${dbPets.length} racers`)

  // ── DONE ───────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n')
  if (missing.length > 0) {
    console.log('🔴 Action required:')
    console.log('   Add wallet addresses to .env.local, then re-run: npm run seed\n')
  } else {
    console.log('Next steps:')
    console.log('  1. Deploy to Vercel and add env vars')
    console.log('  2. Run: npm run setup-helius')
    console.log('  3. Set GENESIS_TIMESTAMP to your launch date\n')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
