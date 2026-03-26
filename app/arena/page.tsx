import { getCurrentRaceWindow } from '@/lib/race-scheduler'
import { RACE_HISTORY, SITE } from '@/config/site'
import { ArenaClient } from '@/components/arena/ArenaClient'
import type { RaceWindow } from '@/lib/race-scheduler'
import type { RaceResult } from '@/config/site'

export default function ArenaPage() {
  const realRace = getCurrentRaceWindow()
  const lastHistoryResult = RACE_HISTORY.length ? RACE_HISTORY[RACE_HISTORY.length - 1] : undefined

  const demoState = SITE.demo?.arenaState
  if (!demoState) {
    return <ArenaClient race={realRace} lastResult={lastHistoryResult} />
  }

  // Build a mock RaceWindow so ArenaClient's existing logic produces the demo state.
  // FINISHED  → race.raceNumber matches lastResult.number  → isFinished = true
  // OPEN      → race.status = 'LIVE', stream.isLive = false → arenaState = 'OPEN'
  // LIVE      → race.status = 'LIVE', stream.isLive = true  → arenaState = 'LIVE'
  // PREPARING → race.status = 'UPCOMING'                    → arenaState = 'PREPARING'
  const now = Date.now()
  const ONE_HOUR = 60 * 60 * 1000

  // For FINISHED we reuse the last history result and set raceNumber to match it.
  // For other states we use the next round number so no stale result interferes.
  const demoRaceNumber = demoState === 'FINISHED'
    ? (lastHistoryResult?.number ?? 3)
    : (lastHistoryResult ? lastHistoryResult.number + 1 : 4)

  const mockRace: RaceWindow = {
    raceNumber:   demoRaceNumber,
    startsAt:     new Date(now - ONE_HOUR),
    endsAt:       new Date(now + ONE_HOUR),
    status:       (demoState === 'LIVE' || demoState === 'OPEN') ? 'LIVE' : 'UPCOMING',
    msUntilStart: 0,
    msUntilEnd:   ONE_HOUR,
  }

  // The OPEN vs LIVE split inside 'LIVE' status is driven by SITE.stream.isLive in ArenaClient.
  // Temporarily override here by patching SITE (server-only, no runtime cost).
  if (demoState === 'LIVE')  SITE.stream.isLive = true
  if (demoState === 'OPEN')  SITE.stream.isLive = false

  const demoLastResult: RaceResult | undefined = demoState === 'FINISHED'
    ? (lastHistoryResult ?? { number: demoRaceNumber, date: '2026-03-25', positions: ['dash', 'flash', 'turbo'] })
    : undefined

  return <ArenaClient race={mockRace} lastResult={demoLastResult} />
}
