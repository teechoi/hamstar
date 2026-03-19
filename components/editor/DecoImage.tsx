'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { DECOS, type DecoId } from '@/config/decorations'
import { EDIT_KEY, decoKey, type SavedPos } from '@/lib/editorKeys'

const LS_CUSTOM = 'hstar_custom_decos'
const LS_HIDDEN = 'hstar_hidden_decos'

function loadPos(id: string): SavedPos | null {
  try {
    const v = localStorage.getItem(decoKey(id))
    return v ? JSON.parse(v) : null
  } catch { return null }
}

function savePos(id: string, p: SavedPos) {
  localStorage.setItem(decoKey(id), JSON.stringify(p))
  window.dispatchEvent(new Event('hstar-pos'))
}

function isHidden(id: string): boolean {
  try {
    const v = localStorage.getItem(LS_HIDDEN)
    return v ? JSON.parse(v).includes(id) : false
  } catch { return false }
}

function setHidden(id: string, hide: boolean) {
  try {
    const v = localStorage.getItem(LS_HIDDEN)
    const list: string[] = v ? JSON.parse(v) : []
    const next = hide ? [...list.filter(x => x !== id), id] : list.filter(x => x !== id)
    localStorage.setItem(LS_HIDDEN, JSON.stringify(next))
    window.dispatchEvent(new Event('hstar-hidden'))
  } catch {}
}

export function DecoImage({ id, className }: { id: DecoId; className?: string }) {
  const cfg = DECOS[id]
  const imgRef = useRef<HTMLImageElement>(null)
  const [mounted, setMounted] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [pos, setPos] = useState<SavedPos | null>(null)
  const [hovered, setHovered] = useState(false)
  const [hidden, setHiddenState] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsEdit(localStorage.getItem(EDIT_KEY) === '1')
    setHiddenState(isHidden(id))
    const saved = loadPos(id)
    if (saved) setPos(saved)
    const onToggle = () => setIsEdit(localStorage.getItem(EDIT_KEY) === '1')
    const onHidden = () => setHiddenState(isHidden(id))
    window.addEventListener('hstar-edit', onToggle)
    window.addEventListener('hstar-hidden', onHidden)
    return () => {
      window.removeEventListener('hstar-edit', onToggle)
      window.removeEventListener('hstar-hidden', onHidden)
    }
  }, [id])

  // When entering edit mode with no saved pos, compute from DOM
  useEffect(() => {
    if (!isEdit || pos !== null) return
    const el = imgRef.current
    if (!el) return
    const section = el.closest('section')
    if (!section) return
    const sr = section.getBoundingClientRect()
    const ir = el.getBoundingClientRect()
    setPos({
      left: Math.round(ir.left - sr.left),
      top: Math.round(ir.top - sr.top),
      width: Math.round(ir.width),
    })
  }, [isEdit, pos])

  const startDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEdit) return
    e.preventDefault()
    e.stopPropagation()
    const el = imgRef.current
    if (!el) return
    const section = el.closest('section')
    if (!section) return
    const sr = section.getBoundingClientRect()
    const ir = el.getBoundingClientRect()
    const startL = ir.left - sr.left
    const startT = ir.top - sr.top
    const startX = e.clientX
    const startY = e.clientY
    const onMove = (ev: MouseEvent) => {
      const np: SavedPos = {
        left: Math.round(startL + ev.clientX - startX),
        top: Math.round(startT + ev.clientY - startY),
        width: Math.round(ir.width),
      }
      setPos(np)
      savePos(id, np)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [isEdit, id])

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const el = imgRef.current
    if (!el || !pos) return
    const section = el.closest('section')
    if (!section) return
    const sr = section.getBoundingClientRect()
    const ir = el.getBoundingClientRect()
    const startX = e.clientX
    const startW = ir.width
    const curL = ir.left - sr.left
    const curT = ir.top - sr.top
    const onMove = (ev: MouseEvent) => {
      const np: SavedPos = { left: Math.round(curL), top: Math.round(curT), width: Math.max(40, Math.round(startW + ev.clientX - startX)) }
      setPos(np)
      savePos(id, np)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [id, pos])

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 50,
    ...cfg.style,
  }

  if (!mounted) return <img ref={imgRef} src={cfg.src} alt="" className={className} style={baseStyle} />

  // Hidden and not in edit mode → invisible
  if (hidden && !isEdit) return null

  if (!isEdit) {
    return <img ref={imgRef} src={cfg.src} alt="" className={className} style={baseStyle} />
  }

  const editPos = pos ?? { left: 0, top: 0, width: 200 }

  return (
    <div
      onMouseDown={startDrag}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: editPos.left,
        top: editPos.top,
        width: editPos.width,
        zIndex: 200,
        cursor: 'grab',
        userSelect: 'none',
        opacity: hidden ? 0.35 : 1,
      }}
    >
      <img
        ref={imgRef}
        src={cfg.src}
        alt=""
        style={{
          width: '100%',
          display: 'block',
          outline: hidden ? '2px dashed #ef4444' : hovered ? '2px solid #3b82f6' : '1.5px dashed #93c5fd',
          borderRadius: 4,
        }}
      />
      {/* Label */}
      <div style={{
        position: 'absolute', top: -22, left: 0,
        background: hidden ? '#7f1d1d' : '#1d4ed8',
        color: '#fff', fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
        padding: '2px 6px', borderRadius: 3, whiteSpace: 'nowrap', pointerEvents: 'none', lineHeight: '14px',
      }}>
        {hidden ? '🗑 ' : ''}{cfg.label} | x:{editPos.left} y:{editPos.top} w:{editPos.width}px
      </div>
      {/* Delete / Restore button */}
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
        onClick={e => { e.stopPropagation(); setHidden(id, !hidden) }}
        style={{
          position: 'absolute', top: -10, right: -10,
          width: 20, height: 20, borderRadius: '50%',
          background: hidden ? '#22c55e' : '#ef4444',
          color: '#fff', border: '2px solid #fff',
          cursor: 'pointer', fontSize: 12, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 201, pointerEvents: 'auto', lineHeight: 1, padding: 0,
        }}
      >{hidden ? '↩' : '×'}</button>
      {/* Duplicate button */}
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
        onClick={e => {
          e.stopPropagation()
          try {
            const existing = JSON.parse(localStorage.getItem(LS_CUSTOM) || '[]')
            localStorage.setItem(LS_CUSTOM, JSON.stringify([...existing, {
              id: Date.now().toString(),
              src: cfg.src,
              label: cfg.label + ' copy',
              left: editPos.left + 40,
              top: editPos.top + 40,
              width: editPos.width,
            }]))
            window.dispatchEvent(new Event('hstar-custom'))
          } catch {}
        }}
        style={{
          position: 'absolute', top: -10, left: -10,
          width: 20, height: 20, borderRadius: '50%',
          background: '#22c55e', color: '#fff', border: '2px solid #fff',
          cursor: 'pointer', fontSize: 14, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 201, pointerEvents: 'auto', lineHeight: 1, padding: 0,
        }}
      >+</button>
      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        style={{
          position: 'absolute', bottom: -7, right: -7,
          width: 14, height: 14, background: '#3b82f6',
          border: '2px solid #fff', borderRadius: 3, cursor: 'se-resize', zIndex: 201,
        }}
      />
    </div>
  )
}
