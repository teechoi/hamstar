export const dynamic = 'force-dynamic'
// app/api/admin/login/route.ts
import { NextResponse } from 'next/server'
import { signToken, makeSessionCookie } from '@/lib/auth'

export async function POST() {
  const token = await signToken({ admin: true })
  const cookie = makeSessionCookie(token)
  return NextResponse.json({ ok: true }, {
    status: 200,
    headers: { 'Set-Cookie': cookie },
  })
}
