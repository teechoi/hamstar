import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

const PUBLIC_PATHS = ['/admin/login', '/api/admin/login']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow login page and login API through without auth
  if (PUBLIC_PATHS.some(p => pathname === p)) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE_NAME)?.value
  const payload = token ? await verifyToken(token) : null

  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
