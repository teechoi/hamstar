export const dynamic = 'force-dynamic'
// app/api/admin/pets/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const pet = await prisma.pet.findUnique({ where: { id: params.id } })
  if (!pet) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(pet)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const allowed = [
    'name', 'tagline', 'bio', 'image', 'emoji', 'team', 'color',
    'speedBase', 'chaosBase', 'wins', 'snackLevel', 'cageLevel', 'active',
  ]
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }
  // walletAddress intentionally excluded — too dangerous to change from admin UI
  const pet = await prisma.pet.update({ where: { id: params.id }, data })
  return NextResponse.json(pet)
}
