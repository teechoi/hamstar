// scripts/finish-race.ts
// Run at end of each race window to declare winner and reset for next race.
// Usage: npx tsx scripts/finish-race.ts [raceNumber]
//   e.g. npx tsx scripts/finish-race.ts 1
//
// What it does:
//   1. Finds race by number (or current race if no arg)
//   2. Ranks entries by totalSol
//   3. Sets positions (1st, 2nd, 3rd)
//   4. Marks race as FINISHED
//   5. Creates next race entry

import { PrismaClient } from '@prisma/client'
import { getCurrentRaceWindow } from '../lib/race-scheduler'

const prisma = new PrismaClient()

async function main() {
  const raceNumArg = process.argv[2]
  const raceNumber = raceNumArg ? parseInt(raceNumArg) : getCurrentRaceWindow().raceNumber

  console.log(`\n🏁 Finishing Race #${raceNumber}...\n`)

  // Find race
  const race = await prisma.race.findUnique({
    where: { number: raceNumber },
    include: {
      entries: {
        include: { pet: true },
        orderBy: { totalSol: 'desc' },
      },
    },
  })

  if (!race) {
    console.error(`❌ Race #${raceNumber} not found. Run seed first.`)
    process.exit(1)
  }

  if (race.status === 'FINISHED') {
    console.log(`⚠️  Race #${raceNumber} is already finished.`)
    process.exit(0)
  }

  if (race.entries.length === 0) {
    console.error('❌ No entries found for this race.')
    process.exit(1)
  }

  // ── DISPLAY RESULTS ───────────────────────────────────────────────────────
  console.log('📊 Final standings:')
  console.log('─'.repeat(40))
  race.entries.forEach((entry, i) => {
    const medal = ['🥇', '🥈', '🥉'][i] ?? '  '
    console.log(`${medal}  ${entry.pet.emoji} ${entry.pet.name.padEnd(12)} ${Number(entry.totalSol).toFixed(3)} SOL`)
  })
  console.log('─'.repeat(40))
  const totalSol = race.entries.reduce((s, e) => s + Number(e.totalSol), 0)
  console.log(`   Total: ${totalSol.toFixed(3)} SOL\n`)

  const winner = race.entries[0]
  console.log(`🏆 Winner: ${winner.pet.emoji} ${winner.pet.name}!\n`)

  // ── UPDATE DB ─────────────────────────────────────────────────────────────
  await prisma.$transaction(async (tx) => {
    // Set positions on entries
    for (let i = 0; i < race.entries.length; i++) {
      await tx.raceEntry.update({
        where: { id: race.entries[i].id },
        data: { position: i + 1 },
      })
    }

    // Mark race finished
    await tx.race.update({
      where: { id: race.id },
      data: { status: 'FINISHED' },
    })

    console.log(`✓ Race #${raceNumber} marked as FINISHED`)
    console.log(`✓ Positions set for ${race.entries.length} entries`)
  })

  // ── CREATE NEXT RACE ──────────────────────────────────────────────────────
  const nextNumber = raceNumber + 1
  const window = getCurrentRaceWindow()
  const nextWindow = {
    startsAt: window.endsAt,
    endsAt: new Date(window.endsAt.getTime() + 48 * 60 * 60 * 1000),
  }

  const nextRace = await prisma.race.upsert({
    where: { number: nextNumber },
    update: {},
    create: {
      number: nextNumber,
      status: 'UPCOMING',
      startsAt: nextWindow.startsAt,
      endsAt: nextWindow.endsAt,
    },
  })

  // Create entries for next race
  const pets = await prisma.pet.findMany({ where: { active: true } })
  for (const pet of pets) {
    await prisma.raceEntry.upsert({
      where: { raceId_petId: { raceId: nextRace.id, petId: pet.id } },
      update: {},
      create: { raceId: nextRace.id, petId: pet.id, totalSol: 0 },
    })
  }

  console.log(`\n✓ Race #${nextNumber} created and ready for support`)
  console.log(`  Starts: ${nextWindow.startsAt.toISOString()}`)
  console.log(`  Ends:   ${nextWindow.endsAt.toISOString()}`)
  console.log('\n✅ Done!\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
