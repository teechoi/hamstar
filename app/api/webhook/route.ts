// app/api/webhook/route.ts
// Receives Helius enhanced transaction webhooks.
// Register this URL in the Helius dashboard: https://your-domain.com/api/webhook
import { NextRequest, NextResponse } from 'next/server'
import { verifyHeliusWebhook, processHeliusWebhook } from '@/lib/helius'
import type { HeliusWebhookPayload } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('helius-auth-header')

    if (!verifyHeliusWebhook(authHeader)) {
      console.warn('[webhook] Unauthorized request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: HeliusWebhookPayload[] = await req.json()

    if (!Array.isArray(payload)) {
      return NextResponse.json({ error: 'Invalid payload — expected array' }, { status: 400 })
    }

    const result = await processHeliusWebhook(payload)
    console.log(`[webhook] Processed: ${result.processed}, Skipped: ${result.skipped}`)

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Helius pings GET to verify the endpoint is reachable
export async function GET() {
  return NextResponse.json({ ok: true, service: 'Hamstar webhook' })
}
