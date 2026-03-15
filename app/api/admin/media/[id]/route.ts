export const dynamic = 'force-dynamic'
// app/api/admin/media/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const allowed = ['type', 'title', 'description', 'url', 'thumbnail', 'duration', 'featured', 'publishedAt']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = key === 'publishedAt' ? new Date(body[key]) : body[key]
  }
  const media = await prisma.media.update({ where: { id: params.id }, data })
  return NextResponse.json(media)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.media.delete({ where: { id: params.id } })
  return NextResponse.json({
    success: true,
    note: 'DB record deleted. If this was a Cloudinary upload, remove the asset manually from your Cloudinary console.',
  })
}
