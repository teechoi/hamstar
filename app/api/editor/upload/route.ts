import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
    const uploadDir = path.join(process.cwd(), 'public', 'images')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)
    return NextResponse.json({ path: `/images/${filename}` })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
