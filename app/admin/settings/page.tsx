import { prisma } from '@/lib/prisma'
import { SITE } from '@/config/site'
import { SettingsForm } from './SettingsForm'

const DEFAULTS = {
  id: 'singleton' as const,
  raceNumber: SITE.stream.raceNumber,
  isLive: SITE.stream.isLive,
  streamUrl: SITE.stream.url,
  replayUrl: SITE.stream.replayUrl || null,
  genesisTs: BigInt(process.env.GENESIS_TIMESTAMP || '0'),
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

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  let row = await prisma.siteSettings.findFirst({ where: { id: 'singleton' } })
  if (!row) {
    row = await prisma.siteSettings.create({ data: DEFAULTS })
  }

  return (
    <SettingsForm
      initialSettings={{
        raceNumber: row.raceNumber,
        isLive: row.isLive,
        streamUrl: row.streamUrl,
        replayUrl: row.replayUrl,
        twitterUrl: row.twitterUrl,
        tiktokUrl: row.tiktokUrl,
        instagramUrl: row.instagramUrl,
        youtubeUrl: row.youtubeUrl,
        sponsorEmail: row.sponsorEmail,
        siteName: row.siteName,
        tagline: row.tagline,
        ogImageUrl: row.ogImageUrl,
        buttonLabels: (row.buttonLabels as Record<string, string>) ?? {},
      }}
    />
  )
}
