export const dynamic = 'force-dynamic'
// app/api/admin/pets/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const pets = await prisma.pet.findMany({ orderBy: { number: 'asc' } })
  return NextResponse.json(pets)
}
