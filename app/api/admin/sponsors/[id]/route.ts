export const dynamic = 'force-dynamic'
// app/api/admin/sponsors/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const allowed = ['name', 'emoji', 'tier', 'petId', 'websiteUrl', 'walletAddress', 'active', 'solPerRace']
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }
  const sponsor = await prisma.sponsor.update({ where: { id: params.id }, data })
  return NextResponse.json({ ...sponsor, solPerRace: Number(sponsor.solPerRace) })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.sponsor.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
