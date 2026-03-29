import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getSettings() {
  return prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  })
}

export async function GET() {
  try {
    const s = await getSettings()
    return NextResponse.json(s)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const allowed = [
      'raceNumber','isLive','streamUrl','replayUrl','genesisTs',
      'twitterUrl','tiktokUrl','instagramUrl','youtubeUrl',
      'sponsorEmail','siteName','tagline','ogImageUrl','buttonLabels',
      'navTagline',
      'heroTitle','heroSubtitle','heroCtaTag','heroButtonText',
      'racersTitle',
      'aboutTitle','aboutText',
      'arenaTitle','arenaSubtitle','arenaStreamNote',
      'footerTagline','footerBrandDesc','footerTaglineRight','footerLinks',
      'loginTitle','loginSubtitle','termsButtonText','howitWorksSteps',
    ]
    const data: Record<string, unknown> = {}
    for (const k of allowed) if (k in body) data[k] = body[k]
    const s = await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    })
    return NextResponse.json(s)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
