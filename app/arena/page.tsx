import { getCurrentRaceWindow } from '@/lib/race-scheduler'
import { RACE_HISTORY } from '@/config/site'
import { ArenaClient } from '@/components/arena/ArenaClient'

export default function ArenaPage() {
  const race = getCurrentRaceWindow()
  const lastResult = RACE_HISTORY?.length ? RACE_HISTORY[RACE_HISTORY.length - 1] : undefined

  return <ArenaClient race={race} lastResult={lastResult} />
}
