/**
 * lib/admin-signer.ts
 *
 * Server-side signing helpers for admin / settler operations.
 * All keys are loaded from environment variables — never exposed to the client.
 *
 * Required env vars (set in .env.local):
 *   ADMIN_KEYPAIR          — base58-encoded private key OR JSON byte array string
 *   SETTLER_2_KEYPAIR      — second settler's key (optional; falls back to admin key)
 *
 * The admin key serves as:
 *   - Admin authority for create_race, push_reward, cancel_race
 *   - Settler slot 0 for propose_settlement
 *
 * SETTLER_2_KEYPAIR is settler slot 1 for confirm_settlement.
 * In production, use a physically separate key for settler 2.
 */

import { Keypair, Connection, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js'
import bs58 from 'bs58'

function loadKeypair(envVar: string): Keypair | null {
  const raw = process.env[envVar]
  if (!raw) return null

  try {
    // Try JSON array first: "[1,2,3,...]"
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return Keypair.fromSecretKey(Uint8Array.from(parsed))
    }
  } catch { /* not JSON */ }

  try {
    // Try base58 encoded
    return Keypair.fromSecretKey(bs58.decode(raw))
  } catch { /* not base58 */ }

  throw new Error(`[admin-signer] ${envVar} is set but could not be parsed as JSON array or base58`)
}

let _adminKeypair:   Keypair | null | undefined = undefined
let _settler2Keypair: Keypair | null | undefined = undefined

export function getAdminKeypair(): Keypair | null {
  if (_adminKeypair === undefined) _adminKeypair = loadKeypair('ADMIN_KEYPAIR')
  return _adminKeypair
}

export function getSettler2Keypair(): Keypair {
  if (_settler2Keypair === undefined) _settler2Keypair = loadKeypair('SETTLER_2_KEYPAIR')
  // Fall back to admin key if not separately configured
  return _settler2Keypair ?? (getAdminKeypair() as Keypair)
}

/** Returns true if the admin keypair is configured. */
export function isOnChainConfigured(): boolean {
  return getAdminKeypair() !== null
}

/**
 * Build, sign and send a transaction with the given signers.
 * Returns the transaction signature.
 */
export async function sendAdminTx(
  connection: Connection,
  instructions: TransactionInstruction[],
  signers: Keypair[],
): Promise<string> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

  const tx = new Transaction({
    recentBlockhash:       blockhash,
    feePayer:              signers[0].publicKey,
  })
  tx.add(...instructions)

  const sig = await sendAndConfirmTransaction(connection, tx, signers, {
    commitment: 'confirmed',
    maxRetries: 3,
  })

  return sig
}

/** Derive the RPC URL from env vars (mirrors logic in API routes). */
export function getServerRpcUrl(): string {
  if (process.env.SOLANA_RPC_URL) return process.env.SOLANA_RPC_URL
  if (process.env.HELIUS_API_KEY) {
    return `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  }
  return 'https://api.mainnet-beta.solana.com'
}
