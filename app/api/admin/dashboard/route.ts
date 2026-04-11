import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [settings, cheerStats, finishedRaces, recentCheers, currentRace] = await Promise.all([
      prisma.siteSettings.findFirst({ where: { id: 'singleton' } }),
      prisma.cheer.aggregate({ _sum: { amountHamstar: true }, _count: true }),
      prisma.race.count({ where: { status: 'FINISHED' } }),
      prisma.cheer.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { pet: { select: { name: true, emoji: true } } },
      }),
      prisma.race.findFirst({ where: { status: { not: 'FINISHED' } }, orderBy: { number: 'desc' } }),
    ])

    const currentRaceStats = currentRace
      ? await prisma.cheer.aggregate({
          where: { raceId: currentRace.id },
          _sum:  { amountHamstar: true },
          _count: true,
        })
      : null

    const hamstarMint        = settings?.hamstarMint        ?? 'HAMSTARxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    const hamstarPoolAddress = settings?.hamstarPoolAddress ?? 'POOLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    const tokenLaunched      = !hamstarMint.includes('xxx') && !hamstarPoolAddress.includes('xxx')

    return NextResponse.json({
      raceNumber:          settings?.raceNumber ?? 1,
      isLive:              settings?.isLive     ?? false,
      tokenLaunched,
      hamstarMint,
      hamstarPoolAddress,
      currentRaceHamstar:  Number(currentRaceStats?._sum?.amountHamstar ?? 0),
      currentRaceCheers:   currentRaceStats?._count ?? 0,
      allTimeHamstar:      Number(cheerStats._sum.amountHamstar ?? 0),
      totalCheers:         cheerStats._count,
      finishedRaces,
      recentCheers: recentCheers.map(c => ({
        id:           c.id,
        petName:      c.pet.name,
        petEmoji:     c.pet.emoji ?? '',
        amountHamstar: c.amountHamstar !== null ? Number(c.amountHamstar) : null,
        txSignature:  c.txSignature,
        walletAddress: c.walletAddress,
        won:          c.won,
        createdAt:    c.createdAt,
      })),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
