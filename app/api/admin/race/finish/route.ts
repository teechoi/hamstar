export const dynamic = 'force-dynamic'
// app/api/admin/race/finish/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RACE_DURATION_MS = 48 * 60 * 60 * 1000

export async function POST(req: Request) {
  const { raceId } = await req.json()

  const race = await prisma.race.findUnique({
    where: { id: raceId },
    include: {
      entries: {
        include: { pet: true },
        orderBy: { totalSol: 'desc' },
      },
    },
  })

  if (!race) return NextResponse.json({ error: 'Race not found' }, { status: 404 })
  if (race.status === 'FINISHED') return NextResponse.json({ error: 'Already finished' }, { status: 400 })
  if (race.entries.length === 0) return NextResponse.json({ error: 'No entries' }, { status: 400 })

  const winner = race.entries[0]

  await prisma.$transaction(async (tx) => {
    // Set positions
    for (let i = 0; i < race.entries.length; i++) {
      await tx.raceEntry.update({
        where: { id: race.entries[i].id },
        data: { position: i + 1 },
      })
    }
    // Mark finished
    await tx.race.update({
      where: { id: race.id },
      data: { status: 'FINISHED' },
    })
    // Increment winner's wins
    await tx.pet.update({
      where: { id: winner.petId },
      data: { wins: { increment: 1 } },
    })
  })

  // Create next race
  const nextNumber = race.number + 1
  const nextStart = new Date(race.endsAt.getTime())
  const nextEnd = new Date(nextStart.getTime() + RACE_DURATION_MS)

  const nextRace = await prisma.race.upsert({
    where: { number: nextNumber },
    update: {},
    create: { number: nextNumber, status: 'UPCOMING', startsAt: nextStart, endsAt: nextEnd },
  })

  const pets = await prisma.pet.findMany({ where: { active: true } })
  for (const pet of pets) {
    await prisma.raceEntry.upsert({
      where: { raceId_petId: { raceId: nextRace.id, petId: pet.id } },
      update: {},
      create: { raceId: nextRace.id, petId: pet.id, totalSol: 0 },
    })
  }

  // Update site settings to reflect new race number and reset live status
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: { raceNumber: nextNumber, isLive: false },
    create: { id: 'singleton', raceNumber: nextNumber, isLive: false },
  })

  return NextResponse.json({
    success: true,
    finishedRace: race.number,
    winner: { name: winner.pet.name, emoji: winner.pet.emoji },
    nextRaceNumber: nextNumber,
    standings: race.entries.map((e, i) => ({
      position: i + 1,
      name: e.pet.name,
      emoji: e.pet.emoji,
      totalSol: Number(e.totalSol),
    })),
  })
}
