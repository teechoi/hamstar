// lib/helius.ts
// Processes incoming Helius webhook payloads and indexes Solana donations.

import { prisma } from './prisma'
import { getCurrentRaceWindow } from './race-scheduler'

const LAMPORTS_PER_SOL = 1_000_000_000
const MIN_DONATION_SOL = 0.001  // ignore dust transfers below this

export interface HeliusWebhookPayload {
  signature: string
  timestamp: number
  nativeTransfers?: Array<{
    fromUserAccount: string
    toUserAccount:   string
    amount:          number   // in lamports
  }>
  description?: string
}

/** Verify the Helius auth header matches our secret. */
export function verifyHeliusWebhook(authHeader: string | null): boolean {
  const expected = process.env.HELIUS_WEBHOOK_SECRET
  if (!expected) {
    console.warn('[helius] HELIUS_WEBHOOK_SECRET not set — skipping verification in dev')
    return process.env.NODE_ENV === 'development'
  }
  return authHeader === expected
}

/** Process a batch of Helius enhanced transaction payloads. */
export async function processHeliusWebhook(
  payloads: HeliusWebhookPayload[]
): Promise<{ processed: number; skipped: number }> {
  let processed = 0
  let skipped   = 0

  // Load pet wallets once per batch
  const pets = await prisma.pet.findMany({
    where:  { active: true },
    select: { id: true, walletAddress: true },
  })
  const walletToPetId = new Map(pets.map((p) => [p.walletAddress, p.id]))

  // Find the current race (if any)
  const window = getCurrentRaceWindow()
  const currentRace = await prisma.race.findFirst({
    where:  { number: window.raceNumber },
    select: { id: true },
  })

  for (const tx of payloads) {
    try {
      // Skip already-indexed transactions
      const exists = await prisma.donation.findUnique({ where: { txSignature: tx.signature } })
      if (exists) { skipped++; continue }

      for (const transfer of tx.nativeTransfers ?? []) {
        const petId = walletToPetId.get(transfer.toUserAccount)
        if (!petId) continue

        const amountSol = transfer.amount / LAMPORTS_PER_SOL
        if (amountSol < MIN_DONATION_SOL) continue

        const alias = extractAlias(tx.description ?? '')

        await prisma.$transaction(async (tx_) => {
          await tx_.donation.create({
            data: {
              txSignature:  tx.signature,
              petId,
              raceId:       currentRace?.id ?? null,
              walletAddress: transfer.fromUserAccount,
              alias,
              amountSol,
              type:         'RACE_SUPPORT',
              confirmedAt:  new Date(tx.timestamp * 1000),
            },
          })

          if (currentRace) {
            await tx_.raceEntry.upsert({
              where:  { raceId_petId: { raceId: currentRace.id, petId } },
              update: { totalSol: { increment: amountSol } },
              create: { raceId: currentRace.id, petId, totalSol: amountSol },
            })
          }
        })

        await checkAndUnlockUpgrades(petId)
        processed++
      }
    } catch (err) {
      console.error('[helius] Error processing tx:', tx.signature, err)
      skipped++
    }
  }

  return { processed, skipped }
}

/** Auto-unlock upgrade items when a pet's lifetime donations cross a cost threshold. */
async function checkAndUnlockUpgrades(petId: string) {
  const agg = await prisma.donation.aggregate({
    where: { petId },
    _sum:  { amountSol: true },
  })
  const lifetimeSol = Number(agg._sum.amountSol ?? 0)

  const upgrades  = await prisma.upgradeItem.findMany({ orderBy: { costSol: 'asc' } })
  const unlocked  = await prisma.petUpgrade.findMany({ where: { petId }, select: { upgradeId: true } })
  const unlockedIds = new Set(unlocked.map((u) => u.upgradeId))

  const TIER_BOOST: Record<string, number> = { BASIC: 20, UPGRADE: 45, ELITE: 70, LEGENDARY: 95 }
  let newSnackLevel = 20
  let newCageLevel  = 20

  for (const upgrade of upgrades) {
    const cost = Number(upgrade.costSol)
    if (cost <= lifetimeSol && !unlockedIds.has(upgrade.id)) {
      await prisma.petUpgrade.create({ data: { petId, upgradeId: upgrade.id } })
    }
    if (cost <= lifetimeSol) {
      const boost = TIER_BOOST[upgrade.tier] ?? 20
      if (upgrade.category === 'SNACK') newSnackLevel = Math.max(newSnackLevel, boost)
      if (upgrade.category === 'CAGE')  newCageLevel  = Math.max(newCageLevel,  boost)
    }
  }

  await prisma.pet.update({ where: { id: petId }, data: { snackLevel: newSnackLevel, cageLevel: newCageLevel } })
}

function extractAlias(description: string): string | null {
  const match = description.match(/memo:\s*"([^"]+)"/)
  return match ? match[1].slice(0, 32) : null
}
