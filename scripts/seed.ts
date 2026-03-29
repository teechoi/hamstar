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
import { getCurrentRaceWindow } from '../lib/race-scheduler'

const prisma = new PrismaClient()

// ─── Wallet addresses from env ────────────────────────────────────────────────
// Set DASH_WALLET, FLASH_WALLET, TURBO_WALLET in .env.local before running seed.
const WALLETS: Record<string, string> = {
  dash:  process.env.DASH_WALLET  ?? 'DASH_WALLET_PLACEHOLDER',
  flash: process.env.FLASH_WALLET ?? 'FLASH_WALLET_PLACEHOLDER',
  turbo: process.env.TURBO_WALLET ?? 'TURBO_WALLET_PLACEHOLDER',
}

const UPGRADE_CATALOG = [
  // SNACK UPGRADES
  { category: 'SNACK', tier: 'BASIC',     name: 'Sunflower Seeds',      emoji: '🌻', description: 'Standard daily fuel',                 costSol: 0.1, sortOrder: 1 },
  { category: 'SNACK', tier: 'UPGRADE',   name: 'Premium Veggie Mix',   emoji: '🥦', description: 'Fresh greens for peak performance',    costSol: 0.5, sortOrder: 2 },
  { category: 'SNACK', tier: 'ELITE',     name: 'Champion Seed Blend',  emoji: '⭐', description: 'Hand-selected racing nutrition',       costSol: 2.0, sortOrder: 3 },
  { category: 'SNACK', tier: 'LEGENDARY', name: 'Exotic Fruit Tray',    emoji: '🍇', description: 'Exclusive seasonal superfood platter', costSol: 5.0, sortOrder: 4 },
  // CAGE UPGRADES
  { category: 'CAGE',  tier: 'BASIC',     name: 'Basic Cage',           emoji: '📦', description: 'Standard starter habitat',            costSol: 0.0, sortOrder: 1 },
  { category: 'CAGE',  tier: 'UPGRADE',   name: 'Cozy Bedding',         emoji: '🛏️', description: 'Soft premium nesting material',        costSol: 0.5, sortOrder: 2 },
  { category: 'CAGE',  tier: 'ELITE',     name: 'Adventure Tunnel',     emoji: '🌀', description: 'Enrichment maze & tunnel system',     costSol: 2.0, sortOrder: 3 },
  { category: 'CAGE',  tier: 'LEGENDARY', name: 'Deluxe Penthouse',     emoji: '🏠', description: 'Multi-level luxury habitat',          costSol: 8.0, sortOrder: 4 },
] as const

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
