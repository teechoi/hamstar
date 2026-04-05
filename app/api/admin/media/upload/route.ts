import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Returns a signed Cloudinary upload signature so the client can upload directly
// without exposing the API secret to the browser.
export async function POST(req: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 503 })
  }

  const { folder = 'hamstar' } = await req.json().catch(() => ({}))
  const timestamp = Math.floor(Date.now() / 1000)
  const params = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto
    .createHash('sha256')
    .update(params + apiSecret)
    .digest('hex')

  return NextResponse.json({ cloudName, apiKey, timestamp, signature, folder })
}
