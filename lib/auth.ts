// lib/auth.ts
// Edge-safe auth helpers (jose only — no Node.js APIs, no Prisma)
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export const COOKIE_NAME = 'admin_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not set')
  return new TextEncoder().encode(secret)
}

const AUDIENCE = 'hamstarhub-admin'

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setAudience(AUDIENCE)
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { audience: AUDIENCE })
    return payload
  } catch {
    return null
  }
}

export function makeSessionCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production'
  return [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${SESSION_DURATION_SECONDS}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    isProduction ? 'Secure' : '',
  ].filter(Boolean).join('; ')
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`
}
