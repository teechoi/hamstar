export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [currentRace, recentDonations, donationAgg, finishedRaces] = await Promise.all([
    prisma.race.findFirst({
      where: { status: { not: 'FINISHED' } },
      include: { entries: { include: { pet: true }, orderBy: { totalSol: 'desc' } } },
      orderBy: { number: 'asc' },
    }),
    prisma.donation.findMany({
      take: 10,
      orderBy: { confirmedAt: 'desc' },
      include: { pet: true },
    }),
    prisma.donation.aggregate({ _sum: { amountSol: true }, _count: true }),
    prisma.race.count({ where: { status: 'FINISHED' } }),
  ])

  return NextResponse.json({
    currentRace: currentRace
      ? {
          ...currentRace,
          entries: currentRace.entries.map((e) => ({ ...e, totalSol: Number(e.totalSol) })),
        }
      : null,
    recentDonations: recentDonations.map((d) => ({ ...d, amountSol: Number(d.amountSol) })),
    totalSol: Number(donationAgg._sum.amountSol ?? 0),
    totalDonations: donationAgg._count,
    finishedRaces,
  })
}
