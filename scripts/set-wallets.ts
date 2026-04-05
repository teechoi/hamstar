// scripts/set-wallets.ts
// Updates pet wallet addresses in the DB from env vars.
// Run: npx dotenv -e .env.local -- tsx scripts/set-wallets.ts
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const WALLETS: Record<string, string | undefined> = {
  dash:  process.env.DASH_WALLET,
  flash: process.env.FLASH_WALLET,
  turbo: process.env.TURBO_WALLET,
}

async function main() {
  for (const [slug, addr] of Object.entries(WALLETS)) {
    if (!addr) { console.warn(`⚠️  ${slug.toUpperCase()}_WALLET not set — skipping`); continue }
    const updated = await prisma.pet.updateMany({ where: { slug }, data: { walletAddress: addr } })
    if (updated.count) console.log(`✅ ${slug}: ${addr}`)
    else console.warn(`⚠️  No pet with slug="${slug}" found`)
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
