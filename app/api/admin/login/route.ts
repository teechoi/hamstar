import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signToken, makeSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const hash = process.env.ADMIN_PASSWORD_HASH

    if (!hash || !password || !(await bcrypt.compare(password, hash))) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = await signToken({ role: 'admin' })
    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', makeSessionCookie(token))
    return res
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
