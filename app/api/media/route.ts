// app/api/media/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const type = new URL(req.url).searchParams.get('type') // 'VIDEO' | 'PHOTO' | null

  try {
    const media = await prisma.media.findMany({
      where:   type ? { type: type as 'VIDEO' | 'PHOTO' } : undefined,
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    })
    return NextResponse.json({ media })
  } catch (err) {
    console.error('[GET /api/media]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
