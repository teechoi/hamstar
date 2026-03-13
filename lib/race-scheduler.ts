// lib/race-scheduler.ts
// Deterministic race timing — no cron needed.
// Race #1 starts at GENESIS_TIMESTAMP. Every 48h after = next race.

const RACE_DURATION_MS = 48 * 60 * 60 * 1000  // 48 hours
const LIVE_WINDOW_MS   =  2 * 60 * 60 * 1000  // First 2h = live race

// Set GENESIS_TIMESTAMP in your .env.local
// Generate: new Date('2025-04-01T18:00:00Z').getTime()
const GENESIS_TIMESTAMP =
  Number(process.env.GENESIS_TIMESTAMP) ||
  new Date('2025-04-01T18:00:00Z').getTime() // ← PLACEHOLDER: update in .env.local

export interface RaceWindow {
  raceNumber:   number
  startsAt:     Date
  endsAt:       Date
  status:       'UPCOMING' | 'LIVE'
  msUntilStart: number
  msUntilEnd:   number
}

export function getCurrentRaceWindow(now = Date.now()): RaceWindow {
  const elapsed = now - GENESIS_TIMESTAMP

  if (elapsed < 0) {
    return {
      raceNumber:   1,
      startsAt:     new Date(GENESIS_TIMESTAMP),
      endsAt:       new Date(GENESIS_TIMESTAMP + RACE_DURATION_MS),
      status:       'UPCOMING',
      msUntilStart: -elapsed,
      msUntilEnd:   -elapsed + RACE_DURATION_MS,
    }
  }

  const idx        = Math.floor(elapsed / RACE_DURATION_MS)
  const raceStart  = GENESIS_TIMESTAMP + idx * RACE_DURATION_MS
  const raceEnd    = raceStart + RACE_DURATION_MS
  const msIntoRace = now - raceStart

  return {
    raceNumber:   idx + 1,
    startsAt:     new Date(raceStart),
    endsAt:       new Date(raceEnd),
    status:       msIntoRace < LIVE_WINDOW_MS ? 'LIVE' : 'UPCOMING',
    msUntilStart: msIntoRace < LIVE_WINDOW_MS ? 0 : raceEnd - now,
    msUntilEnd:   raceEnd - now,
  }
}

export function getNextRaceWindow(now = Date.now()): RaceWindow {
  const current   = getCurrentRaceWindow(now)
  const nextStart = current.endsAt.getTime()
  return {
    raceNumber:   current.raceNumber + 1,
    startsAt:     new Date(nextStart),
    endsAt:       new Date(nextStart + RACE_DURATION_MS),
    status:       'UPCOMING',
    msUntilStart: nextStart - now,
    msUntilEnd:   nextStart + RACE_DURATION_MS - now,
  }
}

export function formatCountdown(ms: number): { h: number; m: number; s: number } {
  const total = Math.max(0, ms)
  return {
    h: Math.floor(total / 3_600_000),
    m: Math.floor((total % 3_600_000) / 60_000),
    s: Math.floor((total % 60_000) / 1_000),
  }
}
