import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PATCH /api/admin/race/status
// Body: { raceId, status: 'UPCOMING' | 'LIVE' | 'FINISHED' }
export async function PATCH(req: Request) {
  try {
    const { raceId, status } = await req.json()

    if (!raceId || !status) {
      return NextResponse.json({ error: 'raceId and status are required' }, { status: 400 })
    }
    if (!['UPCOMING', 'LIVE', 'FINISHED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const race = await prisma.race.update({
      where: { id: raceId },
      data:  { status },
    })

    // Keep isLive in sync: auto-set when transitioning to/from LIVE
    if (status === 'LIVE') {
      await prisma.siteSettings.upsert({
        where:  { id: 'singleton' },
        update: { isLive: true },
        create: { id: 'singleton', isLive: true },
      })
    } else if (status === 'UPCOMING' || status === 'FINISHED') {
      await prisma.siteSettings.upsert({
        where:  { id: 'singleton' },
        update: { isLive: false },
        create: { id: 'singleton', isLive: false },
      })
    }

    return NextResponse.json({ ok: true, race })
  } catch (e) {
    console.error('[/api/admin/race/status]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
