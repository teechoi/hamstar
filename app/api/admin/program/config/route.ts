/**
 * GET  /api/admin/program/config
 *   Reads the on-chain ProgramConfig PDA and returns all fee/game-mechanic
 *   parameters as JSON. Works even if ADMIN_KEYPAIR is not configured.
 *
 * POST /api/admin/program/config
 *   { feeBps, burnBps, minCheerAmount, timeWeightMaxBps, timeWeightMinBps,
 *     maxPoolShareBps, upsetReserveBps, darkHorseThresholdBps,
 *     darkHorseBonusBps, streakTwoBonusBps, streakThreeBonusBps }
 *
 *   Calls update_config on-chain via the admin keypair.
 *   Requires ADMIN_KEYPAIR env var and admin session cookie.
 */
import { NextRequest, NextResponse } from 'next/server'
import { Connection } from '@solana/web3.js'
import {
  getConfigPDA,
  deserializeProgramConfig,
  buildUpdateConfigInstruction,
  type UpdateConfigParams,
} from '@/lib/hamstar-program'
import { getAdminKeypair, sendAdminTx, getServerRpcUrl } from '@/lib/admin-signer'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function getRpcUrl(): string {
  if (process.env.SOLANA_RPC_URL) return process.env.SOLANA_RPC_URL
  if (process.env.HELIUS_API_KEY)
    return `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  return 'https://api.mainnet-beta.solana.com'
}

// ─── GET — read current on-chain config ──────────────────────────────────────

export async function GET(req: NextRequest) {
  // Auth check
  const token   = req.cookies.get(COOKIE_NAME)?.value
  const payload = token ? await verifyToken(token) : null
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const connection = new Connection(getRpcUrl(), 'confirmed')
    const [configPDA] = getConfigPDA()

    const info = await connection.getAccountInfo(configPDA)
    if (!info) {
      return NextResponse.json({
        initialized: false,
        message: 'Program config account not found — run initialize first',
      })
    }

    const config = deserializeProgramConfig(Buffer.from(info.data))

    return NextResponse.json({
      initialized: true,
      configAddress: configPDA.toBase58(),
      ...config,
      // Serialize BigInt as string for JSON transport
      minCheerAmount: config.minCheerAmount.toString(),
    })
  } catch (e) {
    console.error('[GET /api/admin/program/config]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// ─── POST — write new config on-chain ────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Auth check
  const token   = req.cookies.get(COOKIE_NAME)?.value
  const payload = token ? await verifyToken(token) : null
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    const {
      feeBps, burnBps, minCheerAmount,
      timeWeightMaxBps, timeWeightMinBps,
      maxPoolShareBps,
      upsetReserveBps,
      darkHorseThresholdBps, darkHorseBonusBps,
      streakTwoBonusBps, streakThreeBonusBps,
    } = body

    // Validate all fields present
    const required = [
      'feeBps','burnBps','minCheerAmount','timeWeightMaxBps','timeWeightMinBps',
      'maxPoolShareBps','upsetReserveBps','darkHorseThresholdBps',
      'darkHorseBonusBps','streakTwoBonusBps','streakThreeBonusBps',
    ]
    for (const k of required) {
      if (body[k] == null) {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 })
      }
    }

    // Client-side invariant pre-check (contract will also validate)
    if (burnBps > feeBps || (burnBps + upsetReserveBps) > feeBps) {
      return NextResponse.json(
        { error: 'burn_bps + upset_reserve_bps must not exceed fee_bps' },
        { status: 400 },
      )
    }
    if (timeWeightMaxBps < timeWeightMinBps) {
      return NextResponse.json(
        { error: 'time_weight_max_bps must be ≥ time_weight_min_bps' },
        { status: 400 },
      )
    }
    if (maxPoolShareBps > 10_000) {
      return NextResponse.json({ error: 'max_pool_share_bps cannot exceed 10000' }, { status: 400 })
    }

    const adminKeypair = getAdminKeypair()
    if (!adminKeypair) {
      return NextResponse.json(
        { error: 'ADMIN_KEYPAIR not configured — cannot sign update_config transaction' },
        { status: 503 },
      )
    }

    const params: UpdateConfigParams = {
      feeBps:                Number(feeBps),
      burnBps:               Number(burnBps),
      minCheerAmount:        BigInt(minCheerAmount),
      timeWeightMaxBps:      Number(timeWeightMaxBps),
      timeWeightMinBps:      Number(timeWeightMinBps),
      maxPoolShareBps:       Number(maxPoolShareBps),
      upsetReserveBps:       Number(upsetReserveBps),
      darkHorseThresholdBps: Number(darkHorseThresholdBps),
      darkHorseBonusBps:     Number(darkHorseBonusBps),
      streakTwoBonusBps:     Number(streakTwoBonusBps),
      streakThreeBonusBps:   Number(streakThreeBonusBps),
    }

    const connection = new Connection(getServerRpcUrl(), 'confirmed')
    const ix  = buildUpdateConfigInstruction(adminKeypair.publicKey, params)
    const sig = await sendAdminTx(connection, [ix], [adminKeypair])

    return NextResponse.json({ ok: true, sig })
  } catch (e) {
    console.error('[POST /api/admin/program/config]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
