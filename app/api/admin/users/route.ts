import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('q') ?? ''
    const page   = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit  = 25

    const where = search
      ? { walletAddress: { contains: search, mode: 'insensitive' as const } }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip:  (page - 1) * limit,
        take:  limit,
        include: {
          cheers: {
            select: { won: true, createdAt: true, pet: { select: { name: true, emoji: true } } },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    const formatted = users.map(u => {
      const totalCheers  = u.cheers.length
      const wins         = u.cheers.filter(c => c.won === true).length
      const settled      = u.cheers.filter(c => c.won !== null).length
      const winRate      = settled > 0 ? Math.round((wins / settled) * 100) : null
      const lastActivity = u.cheers[0]?.createdAt ?? null
      const favPet       = (() => {
        const counts: Record<string, { name: string; emoji: string; count: number }> = {}
        for (const c of u.cheers) {
          const key = c.pet.name
          if (!counts[key]) counts[key] = { name: c.pet.name, emoji: c.pet.emoji, count: 0 }
          counts[key].count++
        }
        return Object.values(counts).sort((a, b) => b.count - a.count)[0] ?? null
      })()

      return {
        id:           u.id,
        walletAddress: u.walletAddress,
        privyUserId:  u.privyUserId,
        createdAt:    u.createdAt,
        totalCheers,
        wins,
        winRate,
        lastActivity,
        favPet,
      }
    })

    return NextResponse.json({ users: formatted, total, page, pages: Math.ceil(total / limit) })
  } catch (e) {
    console.error('[/api/admin/users]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
