import { NextResponse } from 'next/server'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const PROGRAM_ID_STR     = process.env.NEXT_PUBLIC_PROGRAM_ID ?? '7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ'
const SPL_TOKEN_PROGRAM  = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ASSOC_TOKEN_PROG   = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bEo')

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

async function safeGetHamstarBalance(
  connection: Connection,
  ownerAddress: string,
  mintAddress: string,
): Promise<number | null> {
  try {
    const owner = new PublicKey(ownerAddress)
    const mint  = new PublicKey(mintAddress)
    const [ata] = PublicKey.findProgramAddressSync(
      [owner.toBuffer(), SPL_TOKEN_PROGRAM.toBuffer(), mint.toBuffer()],
      ASSOC_TOKEN_PROG,
    )
    const info = await connection.getTokenAccountBalance(ata)
    return parseFloat(info.value.uiAmountString ?? '0')
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const rpcUrl = getRpcUrl()
    const connection = new Connection(rpcUrl, 'confirmed')

    // Fetch pet wallets + token config from DB in parallel
    const [pets, settings, currentRace] = await Promise.all([
      prisma.pet.findMany({
        where:   { active: true },
        select:  { id: true, name: true, slug: true, emoji: true, walletAddress: true },
        orderBy: { number: 'asc' },
      }),
      prisma.siteSettings.findFirst({ where: { id: 'singleton' } }),
      prisma.race.findFirst({
        where:   { status: { not: 'FINISHED' } },
        orderBy: { number: 'desc' },
        select:  { id: true, number: true },
      }),
    ])

    const hamstarMint        = settings?.hamstarMint        ?? 'HAMSTARxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    const hamstarPoolAddress = settings?.hamstarPoolAddress ?? 'POOLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    const tokenLaunched      = !hamstarMint.includes('xxx') && !hamstarPoolAddress.includes('xxx')

    const programId = new PublicKey(PROGRAM_ID_STR)
    const upsetReserveAddress = deriveUpsetReserve(programId)

    // Build SOL wallet list
    const solWallets: { label: string; address: string; type: string; meta?: string }[] = []

    const treasuryAddr = process.env.TREASURY_WALLET
    if (treasuryAddr) solWallets.push({ label: 'Treasury', address: treasuryAddr, type: 'treasury' })

    for (const pet of pets) {
      if (pet.walletAddress) {
        solWallets.push({ label: `${pet.emoji ?? ''} ${pet.name}`, address: pet.walletAddress, type: 'pet', meta: pet.slug })
      }
    }

    if (upsetReserveAddress) {
      solWallets.push({ label: 'Upset Reserve PDA', address: upsetReserveAddress, type: 'pda', meta: 'seeds: ["upset_reserve"]' })
    }

    // Fetch SOL balances + HAMSTAR pool balance in parallel
    const [solBalances, poolHamstarBalance] = await Promise.all([
      Promise.all(solWallets.map(w => safeGetBalance(connection, w.address))),
      tokenLaunched ? safeGetHamstarBalance(connection, hamstarPoolAddress, hamstarMint) : Promise.resolve(null),
    ])

    const wallets = solWallets.map((w, i) => ({ ...w, balanceSol: solBalances[i] }))

    return NextResponse.json({
      wallets,
      programId:           PROGRAM_ID_STR,
      rpcUrl,
      currentRace,
      tokenLaunched,
      hamstarMint,
      hamstarPoolAddress,
      poolHamstarBalance,
    })
  } catch (e) {
    console.error('[/api/admin/wallet]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
