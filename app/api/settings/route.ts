export const dynamic = 'force-dynamic'
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
          navTagline: 'The smallest sport on the internet.',
          heroTitle: 'Who Will Be The Hamstar?',
          heroSubtitle: 'Three hamsters race. One takes the wheel.',
          heroCtaTag: 'Round 1 Coming Soon!',
          heroButtonText: 'Watch Live Race',
          racersTitle: 'Meet the Racers',
          aboutTitle: 'About Hamstar',
          aboutText: 'Hamstar is a tiny internet sport built around real hamster races.\n\nIn each race, three hamsters compete on a small track while the community watches the race live and cheers for their favourite racer.\n\nIt\'s simple, fast, and unpredictable, just like the hamsters themselves.',
          arenaTitle: 'Hamstar Arena',
          arenaSubtitle: 'Hamstar races are streamed live on Pump.fun. Watch the race and return to see the winner.',
          arenaStreamNote: 'Race will be streamed live on Pump.fun',
          footerTagline: 'The smallest sport on the internet.',
          footerBrandDesc: 'Live hamster racing powered by community participation',
          footerTaglineRight: 'Real hamsters.\nReal races.\nOne tiny champion.',
          footerLinks: [],
          loginTitle: 'Welcome to Hamstar Arena 🐹',
          loginSubtitle: 'A live-streamed blockchain-based entertainment experience',
          termsButtonText: 'I Understand & Enter Arena',
          howitWorksSteps: [],
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
