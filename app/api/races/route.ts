// Not used in v1 — data served from config/site.ts
import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ message: 'Not used in v1' }, { status: 404 })
}
