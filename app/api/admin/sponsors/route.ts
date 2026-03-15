export const dynamic = 'force-dynamic'
// app/api/admin/sponsors/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sponsors = await prisma.sponsor.findMany({
    include: { pet: { select: { id: true, name: true, emoji: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sponsors.map((s) => ({ ...s, solPerRace: Number(s.solPerRace) })))
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, emoji, tier, petId, websiteUrl, walletAddress } = body

  if (!name || !tier) {
    return NextResponse.json({ error: 'name and tier are required' }, { status: 400 })
  }
  if (!['SILVER', 'GOLD', 'TITLE'].includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const sponsor = await prisma.sponsor.create({
    data: {
      name,
      emoji: emoji || '🏆',
      tier,
      petId: petId || null,
      websiteUrl: websiteUrl || null,
      walletAddress: walletAddress || null,
      solPerRace: 0,
      active: true,
    },
    include: { pet: { select: { id: true, name: true, emoji: true } } },
  })
  return NextResponse.json({ ...sponsor, solPerRace: Number(sponsor.solPerRace) }, { status: 201 })
}
