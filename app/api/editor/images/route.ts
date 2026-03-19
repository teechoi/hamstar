import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'images')
    const files = await readdir(dir)
    const images = files.filter(f => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f))
    return NextResponse.json(images.map(f => `/images/${f}`))
  } catch {
    return NextResponse.json([])
  }
}
