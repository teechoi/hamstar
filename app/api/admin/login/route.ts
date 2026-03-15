export const dynamic = 'force-dynamic'
// app/api/admin/login/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signToken, makeSessionCookie } from '@/lib/auth'

export async function POST(req: Request) {
  // Artificial delay to blunt brute-force timing attacks
  await new Promise((r) => setTimeout(r, 300))

  const { password } = await req.json().catch(() => ({ password: '' }))

  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash || !password) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, hash)
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = await signToken({ admin: true })
  const cookie = makeSessionCookie(token)

  return NextResponse.json({ ok: true }, {
    status: 200,
    headers: { 'Set-Cookie': cookie },
  })
}
