'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { loadCustomDecos, saveCustomDecos, type CustomDeco } from '@/lib/customDecos'
import { EDIT_KEY } from '@/lib/editorKeys'

function CustomDecoItem({
  deco, isEdit, onUpdate, onDelete
}: {
  deco: CustomDeco
  isEdit: boolean
  onUpdate: (d: CustomDeco) => void
  onDelete: (id: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  const startDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEdit) return
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startL = deco.left
    const startT = deco.top
    const onMove = (ev: MouseEvent) => {
      onUpdate({ ...deco, left: Math.round(startL + ev.clientX - startX), top: Math.round(startT + ev.clientY - startY) })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [isEdit, deco, onUpdate])

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = deco.width
    const onMove = (ev: MouseEvent) => {
      onUpdate({ ...deco, width: Math.max(40, Math.round(startW + ev.clientX - startX)) })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [deco, onUpdate])

  if (!isEdit) {
    return (
      <img
        ref={ref}
        src={deco.src}
        alt=""
        className="section-deco"
        style={{
          position: 'absolute',
          left: deco.left,
          top: deco.top,
          width: deco.width,
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />
    )
  }

  return (
    <div
      onMouseDown={startDrag}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        left: deco.left,
        top: deco.top,
        width: deco.width,
        zIndex: 200,
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <img
        ref={ref}
        src={deco.src}
        alt=""
        style={{
          width: '100%',
          display: 'block',
          outline: hovered ? '2px solid #f59e0b' : '1.5px dashed #fcd34d',
          borderRadius: 4,
        }}
      />
      {/* Label */}
      <div style={{
        position: 'absolute', top: -22, left: 0,
        background: '#92400e', color: '#fef3c7',
        fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
        padding: '2px 6px', borderRadius: 3, whiteSpace: 'nowrap', pointerEvents: 'none', lineHeight: '14px',
      }}>
        {deco.label} | x:{deco.left} y:{deco.top} w:{deco.width}px
      </div>
      {/* Delete button */}
      <button
        type="button"
        onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
        onClick={e => { e.stopPropagation(); onDelete(deco.id) }}
        style={{
          position: 'absolute', top: -10, right: -10,
          width: 20, height: 20, borderRadius: '50%',
          background: '#ef4444', color: '#fff', border: '2px solid #fff',
          cursor: 'pointer', fontSize: 12, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 201, pointerEvents: 'auto', lineHeight: 1,
          padding: 0,
        }}
      >×</button>
      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        style={{
          position: 'absolute', bottom: -7, right: -7,
          width: 14, height: 14, background: '#f59e0b',
          border: '2px solid #fff', borderRadius: 3,
          cursor: 'se-resize', zIndex: 201,
        }}
      />
    </div>
  )
}

export function CustomDecoLayer() {
  const [decos, setDecos] = useState<CustomDeco[]>([])
  const [isEdit, setIsEdit] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsEdit(localStorage.getItem(EDIT_KEY) === '1')
    setDecos(loadCustomDecos())
    const onCustom = () => setDecos(loadCustomDecos())
    const onEdit = () => setIsEdit(localStorage.getItem(EDIT_KEY) === '1')
    window.addEventListener('hstar-custom', onCustom)
    window.addEventListener('hstar-edit', onEdit)
    return () => {
      window.removeEventListener('hstar-custom', onCustom)
      window.removeEventListener('hstar-edit', onEdit)
    }
  }, [])

  const handleUpdate = useCallback((updated: CustomDeco) => {
    setDecos(prev => {
      const next = prev.map(d => d.id === updated.id ? updated : d)
      saveCustomDecos(next)
      return next
    })
  }, [])

  const handleDelete = useCallback((id: string) => {
    setDecos(prev => {
      const next = prev.filter(d => d.id !== id)
      saveCustomDecos(next)
      return next
    })
  }, [])

  if (!mounted) return null

  return (
    <>
      {decos.map(d => (
        <CustomDecoItem
          key={d.id}
          deco={d}
          isEdit={isEdit}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </>
  )
}
