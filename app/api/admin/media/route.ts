// app/api/admin/media/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const media = await prisma.media.findMany({
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
  })
  return NextResponse.json(media)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { type, title, description, url, thumbnail, duration, featured, publishedAt } = body

  if (!type || !title || !url) {
    return NextResponse.json({ error: 'type, title, and url are required' }, { status: 400 })
  }
  if (type !== 'VIDEO' && type !== 'PHOTO') {
    return NextResponse.json({ error: 'type must be VIDEO or PHOTO' }, { status: 400 })
  }

  const media = await prisma.media.create({
    data: {
      type,
      title,
      description: description || null,
      url,
      thumbnail: thumbnail || null,
      duration: duration || null,
      featured: featured ?? false,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
    },
  })
  return NextResponse.json(media, { status: 201 })
}
