export const dynamic = 'force-dynamic'
// app/api/admin/settings/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SITE } from '@/config/site'

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

export async function GET() {
  let settings = await prisma.siteSettings.findFirst({ where: { id: 'singleton' } })
  if (!settings) {
    settings = await prisma.siteSettings.create({ data: DEFAULTS })
  }
  return NextResponse.json({ ...settings, genesisTs: Number(settings.genesisTs) })
}

export async function PATCH(req: Request) {
  const body = await req.json()

  // Sanitize: only allow known fields
  const allowed = [
    'raceNumber', 'isLive', 'streamUrl', 'replayUrl', 'genesisTs',
    'twitterUrl', 'tiktokUrl', 'instagramUrl', 'youtubeUrl',
    'sponsorEmail', 'siteName', 'tagline', 'ogImageUrl', 'buttonLabels',
  ]
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }
  if ('genesisTs' in data) data.genesisTs = BigInt(data.genesisTs as number)

  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { ...DEFAULTS, ...data },
  })
  return NextResponse.json({ ...settings, genesisTs: Number(settings.genesisTs) })
}
