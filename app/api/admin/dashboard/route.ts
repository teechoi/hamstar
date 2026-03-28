import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [settings, totalDonations, finishedRaces, recentDonations, currentRace] = await Promise.all([
      prisma.siteSettings.findFirst({ where: { id: 'singleton' } }),
      prisma.donation.aggregate({ _sum: { amountSol: true }, _count: true }),
      prisma.race.count({ where: { status: 'FINISHED' } }),
      prisma.donation.findMany({
        take: 10, orderBy: { confirmedAt: 'desc' },
        include: { pet: { select: { name: true } } },
      }),
      prisma.race.findFirst({ where: { status: { not: 'FINISHED' } }, orderBy: { number: 'desc' } }),
    ])

    const currentSol = currentRace
      ? await prisma.donation.aggregate({
          where: { raceId: currentRace.id },
          _sum: { amountSol: true },
        })
      : null

    return NextResponse.json({
      raceNumber: settings?.raceNumber ?? 1,
      isLive: settings?.isLive ?? false,
      currentRaceSol: Number(currentSol?._sum?.amountSol ?? 0),
      allTimeSol: Number(totalDonations._sum.amountSol ?? 0),
      totalDonations: totalDonations._count,
      finishedRaces,
      recentDonations: recentDonations.map(d => ({
        id: d.id,
        petName: d.pet.name,
        amountSol: Number(d.amountSol),
        type: d.type,
        walletAddress: d.walletAddress,
        confirmedAt: d.confirmedAt,
      })),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
