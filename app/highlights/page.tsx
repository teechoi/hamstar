import { HighlightPageClient } from '@/components/arena/HighlightPageClient'
import { RACE_HISTORY } from '@/config/site'
import { prisma } from '@/lib/prisma'
import type { RaceResult } from '@/config/site'

export const dynamic = 'force-dynamic'

type VideoClip = {
  id: string; title: string; url: string
  thumbnail: string | null; duration: string | null; featured: boolean
}

export default async function HighlightsPage() {
  let raceHistory: RaceResult[] = RACE_HISTORY
  let videoClips: VideoClip[]   = []

  try {
    const [races, media] = await Promise.all([
      prisma.race.findMany({
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
      prisma.media.findMany({
        where: { type: 'VIDEO' },
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
        take: 9,
      }),
    ])

    if (races.length) {
      raceHistory = races.map((r) => ({
        number:    r.number,
        date:      r.endsAt.toISOString().split('T')[0],
        positions: r.entries.map((e) => e.pet.slug),
      }))
    }

    if (media.length) {
      videoClips = media.map((m) => ({
        id: m.id, title: m.title, url: m.url,
        thumbnail: m.thumbnail, duration: m.duration, featured: m.featured,
      }))
    }
  } catch {
    // DB unavailable — static fallbacks already set
  }

  return <HighlightPageClient raceHistory={raceHistory} videoClips={videoClips} />
}
