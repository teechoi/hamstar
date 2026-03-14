// app/api/admin/upload/route.ts
// Returns a Cloudinary pre-signed upload URL — client uploads directly (no Vercel bandwidth)
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
  }

  const { folder = 'hamstar' } = await req.json().catch(() => ({}))
  const timestamp = Math.round(Date.now() / 1000)

  // Cloudinary signature: SHA-1 of sorted params + api_secret
  const params = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto
    .createHash('sha1')
    .update(params + apiSecret)
    .digest('hex')

  return NextResponse.json({
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
  })
}
