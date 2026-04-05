// scripts/setup-helius.ts
// Registers your Helius webhook automatically for all 3 pet wallets.
// Usage: npx tsx scripts/setup-helius.ts
//
// Requires in .env:
//   HELIUS_API_KEY
//   NEXT_PUBLIC_SITE_URL  (e.g. https://hamstarhub.xyz)
//   HELIUS_WEBHOOK_SECRET (any random string, must match webhook handler)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const apiKey = process.env.HELIUS_API_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const webhookSecret = process.env.HELIUS_WEBHOOK_SECRET

  if (!apiKey) { console.error('❌ Missing HELIUS_API_KEY in .env'); process.exit(1) }
  if (!siteUrl) { console.error('❌ Missing NEXT_PUBLIC_SITE_URL in .env'); process.exit(1) }
  if (!webhookSecret) { console.error('❌ Missing HELIUS_WEBHOOK_SECRET in .env'); process.exit(1) }

  const webhookUrl = `${siteUrl}/api/webhook`
  console.log(`\n🔧 Setting up Helius webhook...`)
  console.log(`   Webhook URL: ${webhookUrl}\n`)

  // Get all pet wallet addresses
  const pets = await prisma.pet.findMany({
    where: { active: true },
    select: { name: true, walletAddress: true },
  })

  if (pets.some((p) => p.walletAddress.includes('PLACEHOLDER'))) {
    console.error('❌ Pet wallet addresses still have PLACEHOLDER values.')
    console.error('   Update pet wallet addresses in .env and re-run seed.')
    process.exit(1)
  }

  const addresses = pets.map((p) => p.walletAddress)
  console.log('📍 Watching addresses:')
  pets.forEach((p) => console.log(`   ${p.name}: ${p.walletAddress}`))
  console.log()

  // Call Helius API to create webhook
  const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookURL: webhookUrl,
      transactionTypes: ['TRANSFER'],
      accountAddresses: addresses,
      webhookType: 'enhanced',
      authHeader: webhookSecret,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('❌ Helius API error:', response.status, text)
    process.exit(1)
  }

  const data = await response.json()
  console.log('✅ Helius webhook created!')
  console.log(`   Webhook ID: ${data.webhookID}`)
  console.log(`   Webhook URL: ${data.webhookURL}`)
  console.log('\n💡 Save this webhook ID — you can use it to update/delete via Helius dashboard.')
  console.log('   https://dev.helius.xyz/webhooks\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
