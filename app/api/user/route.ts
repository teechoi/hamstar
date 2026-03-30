// POST /api/user — upsert a user record by wallet address.
// Called when a wallet connects so we have a DB record to attach history to.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, privyUserId } = await req.json()

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'walletAddress required' }, { status: 400 })
    }

    const user = await prisma.user.upsert({
      where: { walletAddress },
      create: { walletAddress, privyUserId: privyUserId ?? null },
      update: {
        // Update privyUserId if it wasn't set before (e.g. user later signs in via Privy)
        ...(privyUserId ? { privyUserId } : {}),
      },
    })

    return NextResponse.json({ user })
  } catch (err) {
    console.error('[POST /api/user]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
