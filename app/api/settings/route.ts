// app/api/settings/route.ts — public, cached
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SITE } from '@/config/site'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })

    const data = settings
      ? { ...settings, genesisTs: Number(settings.genesisTs) }
      : {
          id: 'singleton',
          raceNumber: SITE.stream.raceNumber,
          isLive: SITE.stream.isLive,
          streamUrl: SITE.stream.url,
          replayUrl: SITE.stream.replayUrl || null,
          genesisTs: Number(process.env.GENESIS_TIMESTAMP) || 0,
          twitterUrl: SITE.socials.twitter || null,
          tiktokUrl: SITE.socials.tiktok || null,
          instagramUrl: SITE.socials.instagram || null,
          youtubeUrl: SITE.socials.youtube || null,
          sponsorEmail: SITE.sponsorEmail,
          siteName: SITE.name,
          tagline: SITE.tagline,
          ogImageUrl: null,
          buttonLabels: {},
        }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch {
    // Fallback to static config if DB is unavailable
    return NextResponse.json({
      raceNumber: SITE.stream.raceNumber,
      isLive: SITE.stream.isLive,
      streamUrl: SITE.stream.url,
      replayUrl: SITE.stream.replayUrl || null,
      genesisTs: Number(process.env.GENESIS_TIMESTAMP) || 0,
      twitterUrl: SITE.socials.twitter || null,
      tiktokUrl: SITE.socials.tiktok || null,
      instagramUrl: SITE.socials.instagram || null,
      youtubeUrl: SITE.socials.youtube || null,
      sponsorEmail: SITE.sponsorEmail,
      siteName: SITE.name,
      tagline: SITE.tagline,
      ogImageUrl: null,
      buttonLabels: {},
    })
  }
}
