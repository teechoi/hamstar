import { getCurrentRaceWindow } from '@/lib/race-scheduler'
import { RACE_HISTORY, SITE } from '@/config/site'
import { ArenaClient } from '@/components/arena/ArenaClient'
import { prisma } from '@/lib/prisma'
import type { RaceWindow } from '@/lib/race-scheduler'
import type { RaceResult } from '@/config/site'

export const dynamic = 'force-dynamic'

export default async function ArenaPage() {
  // Pull live settings and last finished race from DB
  let isLive:    boolean         = SITE.stream.isLive
  let streamUrl: string          = SITE.stream.url
  let lastResult: RaceResult | undefined = RACE_HISTORY.length ? RACE_HISTORY[RACE_HISTORY.length - 1] : undefined

  try {
    const [settings, lastRace] = await Promise.all([
      prisma.siteSettings.findFirst({ where: { id: 'singleton' } }),
      prisma.race.findFirst({
        where: { status: 'FINISHED' },
        orderBy: { number: 'desc' },
        include: { entries: { orderBy: { position: 'asc' }, include: { pet: { select: { slug: true } } } } },
      }),
    ])
    if (settings) {
      isLive    = settings.isLive
      streamUrl = settings.streamUrl || SITE.stream.url
    }
    if (lastRace) {
      lastResult = {
        number:    lastRace.number,
        date:      lastRace.startsAt.toISOString().split('T')[0],
        positions: lastRace.entries.map(e => e.pet.slug),
      }
    }
  } catch { /* DB unavailable — using config defaults */ }

  const realRace = getCurrentRaceWindow()

  // Demo mode override
  const demoState = SITE.demo?.arenaState
  if (!demoState) {
    return <ArenaClient race={realRace} lastResult={lastResult} isLive={isLive} streamUrl={streamUrl} />
  }

  const now = Date.now()
  const ONE_HOUR = 60 * 60 * 1000
  const demoRaceNumber = demoState === 'FINISHED'
    ? (lastResult?.number ?? 3)
    : (lastResult ? lastResult.number + 1 : 4)

  const mockRace: RaceWindow = {
    raceNumber:   demoRaceNumber,
    startsAt:     new Date(now - ONE_HOUR),
    endsAt:       new Date(now + ONE_HOUR),
    status:       (demoState === 'LIVE' || demoState === 'OPEN') ? 'LIVE' : 'UPCOMING',
    msUntilStart: 0,
    msUntilEnd:   ONE_HOUR,
  }

  const demoLastResult: RaceResult | undefined = demoState === 'FINISHED'
    ? (lastResult ?? { number: demoRaceNumber, date: '2026-03-25', positions: ['dash', 'flash', 'turbo'] })
    : undefined

  return (
    <ArenaClient
      race={mockRace}
      lastResult={demoLastResult}
      isLive={demoState === 'LIVE'}
      streamUrl={streamUrl}
    />
  )
}
