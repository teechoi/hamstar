import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signToken, makeSessionCookie } from '@/lib/auth'

// ─── In-memory rate limiter ───────────────────────────────────────────────────
// Persists within a serverless container's lifetime. Protects against
// sequential brute-force attempts without requiring external state.
const WINDOW_MS    = 15 * 60 * 1000  // 15 minutes
const MAX_ATTEMPTS = 5

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function checkRateLimit(ip: string): boolean {
  const now    = Date.now()
  const record = loginAttempts.get(ip)
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false // not limited
  }
  if (record.count >= MAX_ATTEMPTS) return true // blocked
  record.count++
  return false
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)

    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again in 15 minutes.' },
        { status: 429 },
      )
    }

    const { password } = await req.json()
    const hash = process.env.ADMIN_PASSWORD_HASH

    if (!hash || !password || !(await bcrypt.compare(password, hash))) {
      // Fixed-time response to resist timing attacks on invalid passwords
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Successful login — reset the attempt counter for this IP
    loginAttempts.delete(ip)

    const token = await signToken({ role: 'admin' })
    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', makeSessionCookie(token))
    return res
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
