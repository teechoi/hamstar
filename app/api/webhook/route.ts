// POST /api/webhook — Helius enhanced-transaction webhook
// Register at dev.helius.xyz with auth header: x-helius-webhook-secret: <HELIUS_WEBHOOK_SECRET>
import { NextRequest, NextResponse } from 'next/server'
import { verifyHeliusWebhook, processHeliusWebhook, type HeliusWebhookPayload } from '@/lib/helius'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const authHeader =
    req.headers.get('authorization') ??
    req.headers.get('x-helius-webhook-secret')

  if (!verifyHeliusWebhook(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payloads: HeliusWebhookPayload[]
  try {
    const body = await req.json()
    // Helius sends either a single object or an array
    payloads = Array.isArray(body) ? body : [body]
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const result = await processHeliusWebhook(payloads)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[POST /api/webhook]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
