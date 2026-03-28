import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { folder = 'hamstar' } = await req.json()
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey    = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
    }

    const timestamp = Math.round(Date.now() / 1000)
    const params = `folder=${folder}&timestamp=${timestamp}`
    const signature = crypto.createHmac('sha256', apiSecret).update(params).digest('hex')

    return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
