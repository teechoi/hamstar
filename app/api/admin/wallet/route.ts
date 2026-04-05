import { NextResponse } from 'next/server'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const PROGRAM_ID_STR = process.env.NEXT_PUBLIC_PROGRAM_ID ?? '7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ'

function getRpcUrl(): string {
  if (process.env.SOLANA_RPC_URL) return process.env.SOLANA_RPC_URL
  if (process.env.HELIUS_API_KEY) {
    return `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  }
  return 'https://api.devnet.solana.com'
}

async function safeGetBalance(connection: Connection, address: string): Promise<number | null> {
  try {
    const pk = new PublicKey(address)
    const lamports = await connection.getBalance(pk)
    return lamports / LAMPORTS_PER_SOL
  } catch {
    return null
  }
}

function deriveUpsetReserve(programId: PublicKey): string | null {
  try {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('upset_reserve')],
      programId,
    )
    return pda.toBase58()
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const rpcUrl = getRpcUrl()
    const connection = new Connection(rpcUrl, 'confirmed')

    // Fetch pet wallets from DB
    const pets = await prisma.pet.findMany({
      where:  { active: true },
      select: { id: true, name: true, slug: true, emoji: true, walletAddress: true },
      orderBy: { number: 'asc' },
    })

    // Fetch current race for escrow derivation
    const currentRace = await prisma.race.findFirst({
      where:    { status: { not: 'FINISHED' } },
      orderBy:  { number: 'desc' },
      select:   { id: true, number: true },
    })

    const programId = new PublicKey(PROGRAM_ID_STR)
    const upsetReserveAddress = deriveUpsetReserve(programId)

    // Build wallet list
    const addressesToFetch: { label: string; address: string; type: string; meta?: string }[] = []

    const treasuryAddr = process.env.TREASURY_WALLET
    if (treasuryAddr) {
      addressesToFetch.push({ label: 'Treasury', address: treasuryAddr, type: 'treasury' })
    }

    for (const pet of pets) {
      if (pet.walletAddress) {
        addressesToFetch.push({ label: `${pet.emoji} ${pet.name}`, address: pet.walletAddress, type: 'pet', meta: pet.slug })
      }
    }

    if (upsetReserveAddress) {
      addressesToFetch.push({ label: 'Upset Reserve PDA', address: upsetReserveAddress, type: 'pda', meta: 'seeds: ["upset_reserve"]' })
    }

    // Fetch all balances in parallel
    const balances = await Promise.all(
      addressesToFetch.map(w => safeGetBalance(connection, w.address))
    )

    const wallets = addressesToFetch.map((w, i) => ({
      ...w,
      balanceSol: balances[i],
    }))

    return NextResponse.json({
      wallets,
      programId: PROGRAM_ID_STR,
      rpcUrl,
      currentRace,
    })
  } catch (e) {
    console.error('[/api/admin/wallet]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
