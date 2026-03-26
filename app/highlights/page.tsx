import { RACE_HISTORY } from '@/config/site'
import { HighlightPageClient } from '@/components/arena/HighlightPageClient'

export default function HighlightsPage() {
  return <HighlightPageClient raceHistory={RACE_HISTORY} />
}
