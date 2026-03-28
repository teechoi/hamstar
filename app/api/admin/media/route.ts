import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await prisma.media.findMany({ orderBy: { publishedAt: 'desc' } })
    return NextResponse.json(items)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.media.create({
      data: {
        type: body.type,
        title: body.title,
        description: body.description ?? null,
        url: body.url,
        thumbnail: body.thumbnail ?? null,
        duration: body.duration ?? null,
        featured: body.featured ?? false,
      },
    })
    return NextResponse.json(item)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
