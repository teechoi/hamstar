import { NextResponse, type NextRequest } from 'next/server'

// Auth disabled — all admin routes are open
export async function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/((?!login$).*)', '/api/admin/:path*'],
}
