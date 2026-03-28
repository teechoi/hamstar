import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const allowed = ['name','tagline','bio','image','color','wins','speedBase','chaosBase','snackLevel','cageLevel']
    const data: Record<string, unknown> = {}
    for (const k of allowed) if (k in body) data[k] = body[k]
    const pet = await prisma.pet.update({ where: { id: params.id }, data })
    return NextResponse.json(pet)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
