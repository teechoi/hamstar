/**
 * lib/hamstar-program.ts
 *
 * On-chain plumbing for the HamstarHub Anchor program.
 * Provides PDA derivation, instruction builders, and account helpers
 * for every instruction in the program — all built against @solana/web3.js v1
 * without a separate Anchor client dependency.
 *
 * Instruction discriminators = sha256("global:<name>")[0:8].
 * Argument encoding = Borsh (LE integers, straight byte packing).
 */

import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js'

// ─── Program constants ────────────────────────────────────────────────────────

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? '7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ'
)

export const SPL_TOKEN_PROGRAM_ID   = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
export const ASSOC_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bEo')

// ─── Seeds ────────────────────────────────────────────────────────────────────

const SEED_CONFIG       = Buffer.from('config')
const SEED_RACE         = Buffer.from('race')
const SEED_RACE_ESCROW  = Buffer.from('race_escrow')
const SEED_CHEER        = Buffer.from('cheer')

// ─── PDA helpers ─────────────────────────────────────────────────────────────

export function getConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEED_CONFIG], PROGRAM_ID)
}

export function getRacePDA(raceId: bigint): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEED_RACE, raceIdToBytes(raceId)],
    PROGRAM_ID,
  )
}

/** The escrow token account AND its authority share the same PDA seeds. */
export function getEscrowPDA(raceId: bigint): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEED_RACE_ESCROW, raceIdToBytes(raceId)],
    PROGRAM_ID,
  )
}

export function getCheerPositionPDA(
  racePubkey:  PublicKey,
  userPubkey:  PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEED_CHEER, racePubkey.toBuffer(), userPubkey.toBuffer()],
    PROGRAM_ID,
  )
}

/** Derive the ATA for `owner` holding the given `mint`. */
export function getATA(owner: PublicKey, mint: PublicKey): PublicKey {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), SPL_TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOC_TOKEN_PROGRAM_ID,
  )
  return ata
}

// ─── Discriminators (sha256("global:<name>")[0:8]) ────────────────────────────
// Pre-computed — do not change unless the Rust function names change.

const DISC = {
  initialize:           Buffer.from([175,175,109,31,13,152,155,237]),
  update_config:        Buffer.from([29,158,252,191,10,83,219,99]),
  create_race:          Buffer.from([233,107,148,159,241,155,226,54]),
  place_cheer:          Buffer.from([254,212,229,234,37,28,212,166]),
  lock_race:            Buffer.from([233,66,157,161,246,216,116,109]),
  propose_settlement:   Buffer.from([228,149,56,61,137,43,106,25]),
  confirm_settlement:   Buffer.from([171,180,45,20,120,221,11,31]),
  push_reward:          Buffer.from([208,70,99,80,171,247,26,44]),
  claim_reward:         Buffer.from([149,95,181,242,94,90,158,162]),
  cancel_race:          Buffer.from([223,214,232,232,43,15,165,234]),
  claim_refund:         Buffer.from([15,16,30,161,255,228,97,60]),
} as const

// ─── Encoding helpers ─────────────────────────────────────────────────────────

function raceIdToBytes(raceId: bigint): Buffer {
  const b = Buffer.alloc(8)
  b.writeBigUInt64LE(raceId, 0)
  return b
}

function encodeU64(n: bigint): Buffer {
  const b = Buffer.alloc(8)
  b.writeBigUInt64LE(n, 0)
  return b
}

function encodeI64(n: bigint): Buffer {
  const b = Buffer.alloc(8)
  b.writeBigInt64LE(n, 0)
  return b
}

function encodeU8(n: number): Buffer {
  return Buffer.from([n & 0xff])
}

function encodeU16(n: number): Buffer {
  const b = Buffer.alloc(2)
  b.writeUInt16LE(n, 0)
  return b
}

// ─── On-chain config types ────────────────────────────────────────────────────

export interface ProgramConfigData {
  admin:                   string
  settlers:                string[]
  treasury:                string
  hamstarMint:             string
  feeBps:                  number
  burnBps:                 number
  minCheerAmount:          bigint
  timeWeightMaxBps:        number
  timeWeightMinBps:        number
  maxPoolShareBps:         number
  bump:                    number
  streakTwoBonusBps:       number
  streakThreeBonusBps:     number
  upsetReserve:            string
  upsetReserveBump:        number
  upsetReserveBps:         number
  darkHorseThresholdBps:   number
  darkHorseBonusBps:       number
  // derived
  treasuryBps:             number
}

/**
 * Deserialize the raw bytes of a ProgramConfig account.
 * Binary layout (after 8-byte discriminator):
 *   admin(32) settlers(96) treasury(32) hamstar_mint(32)
 *   fee_bps(2) burn_bps(2) min_cheer_amount(8)
 *   time_weight_max_bps(2) time_weight_min_bps(2) max_pool_share_bps(2) bump(1)
 *   streak_two_bonus_bps(2) streak_three_bonus_bps(2)
 *   upset_reserve(32) upset_reserve_bump(1)
 *   upset_reserve_bps(2) dark_horse_threshold_bps(2) dark_horse_bonus_bps(2)
 */
export function deserializeProgramConfig(data: Buffer): ProgramConfigData {
  let o = 8 // skip discriminator
  const readPubkey = (): string => { const pk = new PublicKey(data.slice(o, o + 32)).toBase58(); o += 32; return pk }
  const readU16    = (): number => { const v = data.readUInt16LE(o); o += 2; return v }
  const readU64    = (): bigint => { const v = data.readBigUInt64LE(o); o += 8; return v }
  const readU8     = (): number => { const v = data.readUInt8(o); o += 1; return v }

  const admin      = readPubkey()
  const settlers   = [readPubkey(), readPubkey(), readPubkey()]
  const treasury   = readPubkey()
  const hamstarMint = readPubkey()

  const feeBps             = readU16()
  const burnBps            = readU16()
  const minCheerAmount     = readU64()
  const timeWeightMaxBps   = readU16()
  const timeWeightMinBps   = readU16()
  const maxPoolShareBps    = readU16()
  const bump               = readU8()
  const streakTwoBonusBps  = readU16()
  const streakThreeBonusBps = readU16()
  const upsetReserve       = readPubkey()
  const upsetReserveBump   = readU8()
  const upsetReserveBps    = readU16()
  const darkHorseThresholdBps = readU16()
  const darkHorseBonusBps  = readU16()

  const treasuryBps = Math.max(0, feeBps - burnBps - upsetReserveBps)

  return {
    admin, settlers, treasury, hamstarMint,
    feeBps, burnBps, minCheerAmount,
    timeWeightMaxBps, timeWeightMinBps, maxPoolShareBps, bump,
    streakTwoBonusBps, streakThreeBonusBps,
    upsetReserve, upsetReserveBump, upsetReserveBps,
    darkHorseThresholdBps, darkHorseBonusBps,
    treasuryBps,
  }
}

export interface UpdateConfigParams {
  feeBps:                number
  burnBps:               number
  minCheerAmount:        bigint
  timeWeightMaxBps:      number
  timeWeightMinBps:      number
  maxPoolShareBps:       number
  upsetReserveBps:       number
  darkHorseThresholdBps: number
  darkHorseBonusBps:     number
  streakTwoBonusBps:     number
  streakThreeBonusBps:   number
}

// ─── Instruction builders ─────────────────────────────────────────────────────

/**
 * create_race — admin creates a new race with a pick window.
 * Signed by: admin keypair (server-side).
 */
export function buildCreateRaceInstruction(params: {
  adminPubkey:      PublicKey
  hamstarMint:      PublicKey
  raceId:           bigint
  pickWindowOpen:   bigint  // unix timestamp
  pickWindowClose:  bigint  // unix timestamp
}): TransactionInstruction {
  const { adminPubkey, hamstarMint, raceId, pickWindowOpen, pickWindowClose } = params

  const [configPDA]  = getConfigPDA()
  const [racePDA]    = getRacePDA(raceId)
  const [escrowPDA]  = getEscrowPDA(raceId)

  const data = Buffer.concat([
    DISC.create_race,
    encodeU64(raceId),
    encodeI64(pickWindowOpen),
    encodeI64(pickWindowClose),
  ])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      { pubkey: configPDA,   isSigner: false, isWritable: false },
      { pubkey: racePDA,     isSigner: false, isWritable: true  },
      { pubkey: escrowPDA,   isSigner: false, isWritable: true  }, // escrow token account
      { pubkey: escrowPDA,   isSigner: false, isWritable: false }, // race_escrow_authority (same PDA)
      { pubkey: hamstarMint, isSigner: false, isWritable: false },
      { pubkey: adminPubkey, isSigner: true,  isWritable: true  },
      { pubkey: SPL_TOKEN_PROGRAM_ID,    isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY,      isSigner: false, isWritable: false },
    ],
  })
}

/**
 * place_cheer — user stakes HAMSTAR on a hamster during the pick window.
 * Signed by: user wallet (client-side via wallet adapter).
 */
export function buildPlaceCheerInstruction(params: {
  userPubkey:       PublicKey
  hamstarMint:      PublicKey
  raceId:           bigint
  hamsterIndex:     number  // 0 | 1 | 2
  amount:           bigint  // raw token amount (ui_amount × 10^decimals)
  racePubkey?:      PublicKey  // if pre-derived; otherwise derived from raceId
  escrowPubkey?:    PublicKey  // if pre-derived; otherwise derived from raceId
}): TransactionInstruction {
  const { userPubkey, hamstarMint, raceId, hamsterIndex, amount } = params

  const [configPDA]              = getConfigPDA()
  const [racePDA]                = params.racePubkey   ? [params.racePubkey]   : getRacePDA(raceId)
  const [escrowPDA]              = params.escrowPubkey ? [params.escrowPubkey] : getEscrowPDA(raceId)
  const [cheerPositionPDA]       = getCheerPositionPDA(racePDA as PublicKey, userPubkey)
  const userTokenAccount         = getATA(userPubkey, hamstarMint)

  const data = Buffer.concat([
    DISC.place_cheer,
    encodeU64(raceId),
    encodeU8(hamsterIndex),
    encodeU64(amount),
  ])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      { pubkey: configPDA,          isSigner: false, isWritable: false },
      { pubkey: racePDA as PublicKey, isSigner: false, isWritable: true  },
      { pubkey: cheerPositionPDA,   isSigner: false, isWritable: true  },
      { pubkey: userTokenAccount,   isSigner: false, isWritable: true  },
      { pubkey: escrowPDA as PublicKey, isSigner: false, isWritable: true  },
      { pubkey: userPubkey,         isSigner: true,  isWritable: true  },
      { pubkey: SPL_TOKEN_PROGRAM_ID,    isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
  })
}

/**
 * lock_race — closes the pick window. Permissionless once timestamp has passed.
 * Signed by: any keypair (admin server key is fine).
 */
export function buildLockRaceInstruction(params: {
  callerPubkey: PublicKey
  raceId:       bigint
}): TransactionInstruction {
  const { callerPubkey, raceId } = params
  const [racePDA] = getRacePDA(raceId)

  const data = Buffer.concat([DISC.lock_race, encodeU64(raceId)])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      { pubkey: racePDA,       isSigner: false, isWritable: true },
      { pubkey: callerPubkey,  isSigner: true,  isWritable: false },
    ],
  })
}

/**
 * propose_settlement — settler votes for the winning hamster.
 * Signed by: settler keypair.
 */
export function buildProposeSettlementInstruction(params: {
  settlerPubkey:  PublicKey
  raceId:         bigint
  hamsterIndex:   number  // 0 | 1 | 2
}): TransactionInstruction {
  const { settlerPubkey, raceId, hamsterIndex } = params
  const [configPDA] = getConfigPDA()
  const [racePDA]   = getRacePDA(raceId)

  const data = Buffer.concat([
    DISC.propose_settlement,
    encodeU64(raceId),
    encodeU8(hamsterIndex),
  ])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      { pubkey: configPDA,     isSigner: false, isWritable: false },
      { pubkey: racePDA,       isSigner: false, isWritable: true  },
      { pubkey: settlerPubkey, isSigner: true,  isWritable: false },
    ],
  })
}

/**
 * confirm_settlement — second settler confirms (race auto-settles if consensus).
 * Signed by: settler keypair.
 */
export function buildConfirmSettlementInstruction(params: {
  settlerPubkey:  PublicKey
  raceId:         bigint
  hamsterIndex:   number
}): TransactionInstruction {
  const { settlerPubkey, raceId, hamsterIndex } = params
  const [configPDA] = getConfigPDA()
  const [racePDA]   = getRacePDA(raceId)

  const data = Buffer.concat([
    DISC.confirm_settlement,
    encodeU64(raceId),
    encodeU8(hamsterIndex),
  ])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      { pubkey: configPDA,     isSigner: false, isWritable: false },
      { pubkey: racePDA,       isSigner: false, isWritable: true  },
      { pubkey: settlerPubkey, isSigner: true,  isWritable: false },
    ],
  })
}

/**
 * push_reward — admin pushes reward tokens to a single winner.
 * Signed by: admin keypair (server-side).
 */
export function buildPushRewardInstruction(params: {
  adminPubkey:     PublicKey
  winnerPubkey:    PublicKey
  treasuryPubkey:  PublicKey
  hamstarMint:     PublicKey
  raceId:          bigint
  escrowPubkey?:   PublicKey
}): TransactionInstruction {
  const { adminPubkey, winnerPubkey, treasuryPubkey, hamstarMint, raceId } = params

  const [configPDA]   = getConfigPDA()
  const [racePDA]     = getRacePDA(raceId)
  const [escrowPDA]   = params.escrowPubkey ? [params.escrowPubkey] : getEscrowPDA(raceId)
  const [racePDA2]    = getRacePDA(raceId)

  const [cheerPositionPDA] = getCheerPositionPDA(racePDA2, winnerPubkey)

  const winnerTokenAccount   = getATA(winnerPubkey,   hamstarMint)
  const treasuryTokenAccount = getATA(treasuryPubkey, hamstarMint)

  const data = Buffer.concat([DISC.push_reward, encodeU64(raceId)])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      { pubkey: configPDA,            isSigner: false, isWritable: false },
      { pubkey: racePDA,              isSigner: false, isWritable: false },
      { pubkey: cheerPositionPDA,     isSigner: false, isWritable: true  },
      { pubkey: escrowPDA as PublicKey, isSigner: false, isWritable: true  }, // escrow token acct
      { pubkey: escrowPDA as PublicKey, isSigner: false, isWritable: false }, // escrow authority (same PDA)
      { pubkey: winnerTokenAccount,   isSigner: false, isWritable: true  },
      { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true  },
      { pubkey: winnerPubkey,         isSigner: false, isWritable: false },
      { pubkey: adminPubkey,          isSigner: true,  isWritable: false },
      { pubkey: SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
  })
}

/**
 * claim_reward — user pulls their own reward (fallback if push failed).
 * Signed by: user wallet (client-side).
 */
export function buildClaimRewardInstruction(params: {
  userPubkey:       PublicKey
  treasuryPubkey:   PublicKey
  hamstarMint:      PublicKey
  raceId:           bigint
  escrowPubkey?:    PublicKey
}): TransactionInstruction {
  const { userPubkey, treasuryPubkey, hamstarMint, raceId } = params

  const [configPDA]   = getConfigPDA()
  const [racePDA]     = getRacePDA(raceId)
  const [escrowPDA]   = params.escrowPubkey ? [params.escrowPubkey] : getEscrowPDA(raceId)
  const [cheerPositionPDA] = getCheerPositionPDA(racePDA, userPubkey)

  const userTokenAccount     = getATA(userPubkey,      hamstarMint)
  const treasuryTokenAccount = getATA(treasuryPubkey,  hamstarMint)

  const data = Buffer.concat([DISC.claim_reward, encodeU64(raceId)])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      { pubkey: configPDA,            isSigner: false, isWritable: false },
      { pubkey: racePDA,              isSigner: false, isWritable: false },
      { pubkey: cheerPositionPDA,     isSigner: false, isWritable: true  },
      { pubkey: escrowPDA as PublicKey, isSigner: false, isWritable: true  }, // escrow token acct
      { pubkey: escrowPDA as PublicKey, isSigner: false, isWritable: false }, // escrow authority
      { pubkey: userTokenAccount,     isSigner: false, isWritable: true  },
      { pubkey: treasuryTokenAccount, isSigner: false, isWritable: true  },
      { pubkey: userPubkey,           isSigner: true,  isWritable: false },
      { pubkey: SPL_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
  })
}

/**
 * cancel_race — admin cancels a race. Enables full refunds.
 * Signed by: admin keypair (server-side).
 */
export function buildCancelRaceInstruction(params: {
  adminPubkey: PublicKey
  raceId:      bigint
}): TransactionInstruction {
  const { adminPubkey, raceId } = params
  const [configPDA] = getConfigPDA()
  const [racePDA]   = getRacePDA(raceId)

  const data = Buffer.concat([DISC.cancel_race, encodeU64(raceId)])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      { pubkey: configPDA,   isSigner: false, isWritable: false },
      { pubkey: racePDA,     isSigner: false, isWritable: true  },
      { pubkey: adminPubkey, isSigner: true,  isWritable: false },
    ],
  })
}

/**
 * claim_refund — user claims full refund from a cancelled race.
 * Signed by: user wallet (client-side).
 */
export function buildClaimRefundInstruction(params: {
  userPubkey:    PublicKey
  hamstarMint:   PublicKey
  raceId:        bigint
  escrowPubkey?: PublicKey
}): TransactionInstruction {
  const { userPubkey, hamstarMint, raceId } = params

  const [configPDA] = getConfigPDA()
  const [racePDA]   = getRacePDA(raceId)
  const [escrowPDA] = params.escrowPubkey ? [params.escrowPubkey] : getEscrowPDA(raceId)
  const [cheerPositionPDA] = getCheerPositionPDA(racePDA, userPubkey)
  const userTokenAccount   = getATA(userPubkey, hamstarMint)

  const data = Buffer.concat([DISC.claim_refund, encodeU64(raceId)])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      { pubkey: configPDA,              isSigner: false, isWritable: false },
      { pubkey: racePDA,                isSigner: false, isWritable: false },
      { pubkey: cheerPositionPDA,       isSigner: false, isWritable: true  },
      { pubkey: escrowPDA as PublicKey, isSigner: false, isWritable: true  },
      { pubkey: escrowPDA as PublicKey, isSigner: false, isWritable: false }, // authority
      { pubkey: userTokenAccount,       isSigner: false, isWritable: true  },
      { pubkey: userPubkey,             isSigner: true,  isWritable: false },
      { pubkey: SPL_TOKEN_PROGRAM_ID,   isSigner: false, isWritable: false },
    ],
  })
}

/**
 * update_config — admin updates mutable fee/game-mechanic parameters on-chain.
 * Accounts: config (mut, PDA), admin (signer).
 * Borsh-encodes UpdateConfigParams in exact field order matching the Rust struct.
 */
export function buildUpdateConfigInstruction(
  adminPubkey: PublicKey,
  params: UpdateConfigParams,
): TransactionInstruction {
  const [configPDA] = getConfigPDA()

  const data = Buffer.concat([
    DISC.update_config,
    encodeU16(params.feeBps),
    encodeU16(params.burnBps),
    encodeU64(params.minCheerAmount),
    encodeU16(params.timeWeightMaxBps),
    encodeU16(params.timeWeightMinBps),
    encodeU16(params.maxPoolShareBps),
    encodeU16(params.upsetReserveBps),
    encodeU16(params.darkHorseThresholdBps),
    encodeU16(params.darkHorseBonusBps),
    encodeU16(params.streakTwoBonusBps),
    encodeU16(params.streakThreeBonusBps),
  ])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    data,
    keys: [
      { pubkey: configPDA,   isSigner: false, isWritable: true },
      { pubkey: adminPubkey, isSigner: true,  isWritable: false },
    ],
  })
}
