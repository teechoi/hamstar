import { getCurrentRaceWindow } from '@/lib/race-scheduler'
import { RACE_HISTORY, SITE } from '@/config/site'
import { ArenaClient } from '@/components/arena/ArenaClient'
import { prisma } from '@/lib/prisma'
import type { RaceResult } from '@/config/site'

export const dynamic = 'force-dynamic'

export default async function ArenaPage() {
  const race = getCurrentRaceWindow()

  // Defaults from static config (fallback if DB unavailable)
  let isLive   = SITE.stream.isLive
  let streamUrl = SITE.stream.url
  let lastResult: RaceResult | undefined =
    RACE_HISTORY.length ? RACE_HISTORY[RACE_HISTORY.length - 1] : undefined

  try {
    const [settings, finishedRace] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.race.findFirst({
        where: { status: 'FINISHED' },
        orderBy: { number: 'desc' },
        include: {
          entries: {
            where: { position: { not: null } },
            orderBy: { position: 'asc' },
            include: { pet: { select: { slug: true } } },
          },
        },
      }),
    ])

    if (settings) {
      isLive    = settings.isLive
      streamUrl = settings.streamUrl || SITE.stream.url
    }

    if (finishedRace?.entries.length) {
      lastResult = {
        number:    finishedRace.number,
        date:      finishedRace.endsAt.toISOString().split('T')[0],
        positions: finishedRace.entries.map((e) => e.pet.slug),
      }
    }
  } catch {
    // DB unavailable — static config values already set above
  }

  return (
    <ArenaClient
      race={race}
      lastResult={lastResult}
      isLive={isLive}
      streamUrl={streamUrl}
    />
  )
}
