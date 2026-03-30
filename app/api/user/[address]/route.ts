// GET /api/user/[address] — full profile + history for a wallet address.
// Returns: user record, cheer history (with pet/race info), donation totals.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { address: string } },
) {
  const { address } = params

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 })
  }

  try {
    // Fetch user + cheers + donations in parallel
    const [user, cheers, donations] = await Promise.all([
      prisma.user.findUnique({ where: { walletAddress: address } }),

      prisma.cheer.findMany({
        where: { walletAddress: address },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          pet:  { select: { id: true, name: true, emoji: true, color: true } },
          race: { select: { id: true, number: true, status: true, startsAt: true } },
        },
      }),

      prisma.donation.findMany({
        where: { walletAddress: address },
        orderBy: { confirmedAt: 'desc' },
        take: 50,
        include: {
          pet:  { select: { id: true, name: true, emoji: true } },
          race: { select: { id: true, number: true } },
        },
      }),
    ])

    // Compute totals
    const totalDonatedSol = donations.reduce(
      (sum, d) => sum + Number(d.amountSol), 0
    )
    const wins  = cheers.filter(c => c.won === true).length
    const races = cheers.filter(c => c.won !== null).length

    return NextResponse.json({
      user: user ?? { walletAddress: address, privyUserId: null, createdAt: null },
      cheers,
      donations,
      stats: { totalDonatedSol, wins, races },
    })
  } catch (err) {
    console.error('[GET /api/user/[address]]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
