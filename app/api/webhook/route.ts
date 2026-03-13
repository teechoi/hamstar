// Not used in v1 — blockchain integration planned for v2
import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ ok: true, service: 'HamstarHub' })
}
export async function POST() {
  return NextResponse.json({ message: 'Not used in v1' }, { status: 404 })
}
