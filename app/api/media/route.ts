export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'VIDEO' | 'PHOTO' | null
    const limit = parseInt(searchParams.get('limit') ?? '50')

    const media = await prisma.media.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
    })
    return NextResponse.json(media)
  } catch {
    return NextResponse.json([])
  }
}
