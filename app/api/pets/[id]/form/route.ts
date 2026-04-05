import { NextRequest, NextResponse } from 'next/server'
import { RACE_HISTORY } from '@/config/site'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const petId = params.id.toLowerCase()

  // Most recent first
  const sorted = [...RACE_HISTORY].sort((a, b) => b.number - a.number)

  const allResults: ('W' | 'L')[] = sorted.map(r =>
    r.positions[0] === petId ? 'W' : 'L'
  )

  const results = allResults.slice(0, 5)
  const winRate = allResults.length > 0
    ? Math.round((allResults.filter(r => r === 'W').length / allResults.length) * 100)
    : 0

  // Current streak from most recent
  let streak = 0
  const streakType: 'W' | 'L' = allResults[0] ?? 'L'
  for (const r of allResults) {
    if (r === streakType) streak++
    else break
  }

  return NextResponse.json({ results, winRate, streak, streakType })
}
