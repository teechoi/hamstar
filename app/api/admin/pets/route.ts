import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const pets = await prisma.pet.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(pets)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
