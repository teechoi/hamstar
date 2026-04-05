import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { createdAt: 'desc' },
      include: { pet: { select: { id: true, name: true } } },
    })
    return NextResponse.json(sponsors)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const sponsor = await prisma.sponsor.create({
      data: {
        name: body.name,
        emoji: body.emoji ?? '🏆',
        tier: body.tier,
        solPerRace: body.solPerRace ?? 0,
        petId: body.petId ?? null,
        walletAddress: body.walletAddress ?? null,
        websiteUrl: body.websiteUrl ?? null,
        active: body.active ?? true,
      },
      include: { pet: { select: { id: true, name: true } } },
    })
    return NextResponse.json(sponsor)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
