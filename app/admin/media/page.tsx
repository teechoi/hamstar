'use client'
import { useState, useEffect, useRef } from 'react'
import { A } from '../theme'

type MediaItem = { id: string; type: 'VIDEO' | 'PHOTO'; title: string; description: string | null; url: string; thumbnail: string | null; duration: string | null; featured: boolean; publishedAt: string }
type NewItem   = { type: 'VIDEO' | 'PHOTO'; title: string; description: string; url: string; thumbnail: string; duration: string; featured: boolean }

const EMPTY: NewItem = { type: 'PHOTO', title: '', description: '', url: '', thumbnail: '', duration: '', featured: false }

function extractYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function MediaPage() {
  const [items,     setItems]     = useState<MediaItem[]>([])
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState<NewItem>(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [editId,    setEditId]    = useState<string | null>(null)
  const [deleteId,  setDeleteId]  = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => fetch('/api/admin/media').then(r => r.json()).then(setItems)
  useEffect(() => { load() }, [])

  const upd = (patch: Partial<NewItem>) => setForm(f => ({ ...f, ...patch }))

  const onVideoUrl = (url: string) => {
    upd({ url, type: 'VIDEO' })
    const id = extractYouTubeId(url)
    if (id) upd({ thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` })
  }

  const uploadFile = async (file: File) => {
    setUploading(true); setProgress(0)
    try {
      const sig = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: 'hamstar/media' }) })
      const { signature, timestamp, apiKey, folder, uploadUrl } = await sig.json()
      const fd = new FormData()
      fd.append('file', file); fd.append('api_key', apiKey)
      fd.append('timestamp', timestamp); fd.append('signature', signature); fd.append('folder', folder)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100)) }
        xhr.onload = () => {
          const data = JSON.parse(xhr.responseText)
          if (data.secure_url) {
            const isVid = file.type.startsWith('video/')
            upd({ url: data.secure_url, thumbnail: data.eager?.[0]?.secure_url ?? (isVid ? '' : data.secure_url), type: isVid ? 'VIDEO' : 'PHOTO' })
          }
          resolve()
        }
        xhr.onerror = reject
        xhr.open('POST', uploadUrl); xhr.send(fd)
      })
    } finally { setUploading(false) }
  }

  const saveItem = async () => {
    if (!form.title || !form.url) return
    setSaving(true)
    if (editId) {
      await fetch(`/api/admin/media/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/admin/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false); setShowForm(false); setEditId(null); setForm(EMPTY); load()
  }

  const toggleFeatured = async (item: MediaItem) => {
    await fetch(`/api/admin/media/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: !item.featured }) })
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, featured: !i.featured } : i))
  }

  const deleteItem = async (id: string) => {
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id)); setDeleteId(null)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 16px',
    background: A.inputBg, border: `1.5px solid ${A.borderMid}`,
    borderRadius: 12, fontSize: 13, color: A.text, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div className="admin-page" style={{ maxWidth: 1020 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: A.text }}>Media Library</div>
          <div style={{ fontSize: 14, color: A.textMuted, marginTop: 4 }}>
            {items.length} items · {items.filter(i => i.featured).length} featured
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }}
          style={{ padding: '12px 24px', background: A.yellow, border: 'none', borderRadius: 9999, color: A.yellowText, fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(255,231,144,0.3)' }}
        >
          + Add Media
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { uploadFile(f); setShowForm(true) } }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${A.borderMid}`, borderRadius: 24, padding: '36px',
          textAlign: 'center', cursor: 'pointer', marginBottom: 24,
          background: A.card, boxShadow: '0 4px 20px rgba(77,67,83,0.04)',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 10 }}>{uploading ? '⏳' : '📁'}</div>
        {uploading ? (
          <>
            <div style={{ fontSize: 14, color: A.textMuted, marginBottom: 10 }}>Uploading... {progress}%</div>
            <div style={{ height: 6, background: A.pageBg, borderRadius: 99, overflow: 'hidden', maxWidth: 300, margin: '0 auto' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: A.yellow, borderRadius: 99, transition: 'width 0.3s' }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, color: A.textMid }}>Drag & drop a photo or video, or click to browse</div>
            <div style={{ fontSize: 12, color: A.textMuted, marginTop: 4 }}>JPG, PNG, WEBP, MP4, MOV — up to 200MB</div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) { uploadFile(f); setShowForm(true) } }} />

      {/* Add/Edit form */}
      {showForm && (
        <div style={{
          background: A.card, border: `1.5px solid ${A.yellow}55`,
          borderRadius: 24, padding: '28px 32px', marginBottom: 28,
          boxShadow: '0 4px 20px rgba(77,67,83,0.06)',
        }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: A.text, marginBottom: 20 }}>
            {editId ? 'Edit Item' : 'New Media Item'}
          </div>
          <div className="admin-2col" style={{ gap: 24 }}>
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['PHOTO', 'VIDEO'] as const).map(t => (
                    <button key={t} onClick={() => upd({ type: t })} style={{
                      padding: '9px 20px', border: `2px solid ${form.type === t ? A.yellow : A.border}`,
                      borderRadius: 9999, background: form.type === t ? A.yellowSoft : A.pageBg,
                      fontSize: 13, fontWeight: 800, cursor: 'pointer',
                      color: form.type === t ? A.yellowText : A.textMuted, fontFamily: 'inherit',
                    }}>
                      {t === 'PHOTO' ? '📷 Photo' : '🎥 Video'}
                    </button>
                  ))}
                </div>
              </div>
              {(['title', 'description', 'url', 'thumbnail', 'duration'] as const).map(field => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{field}</label>
                  <input
                    value={form[field] as string}
                    onChange={e => {
                      if (field === 'url' && form.type === 'VIDEO') onVideoUrl(e.target.value)
                      else upd({ [field]: e.target.value })
                    }}
                    placeholder={field === 'url' && form.type === 'VIDEO' ? 'YouTube / Cloudinary URL' : ''}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div>
              {form.thumbnail && (
                <img src={form.thumbnail} alt="preview" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 16, marginBottom: 16, border: `1px solid ${A.border}` }} />
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 8 }}>
                <input type="checkbox" checked={form.featured} onChange={e => upd({ featured: e.target.checked })} />
                <span style={{ fontSize: 14, color: A.textMid, fontWeight: 600 }}>Featured (shows first)</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ padding: '11px 22px', background: 'transparent', border: `1.5px solid ${A.borderMid}`, borderRadius: 9999, color: A.textMid, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={saveItem} disabled={saving} style={{ padding: '11px 28px', background: A.yellow, border: 'none', borderRadius: 9999, color: A.yellowText, fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16 }}>
        {items.map(item => (
          <div key={item.id} style={{
            background: A.card, border: `1px solid ${A.border}`,
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(77,67,83,0.05)',
          }}>
            <div style={{ height: 140, background: A.pageBg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.thumbnail
                ? <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                : <span style={{ fontSize: 40, opacity: 0.2 }}>{item.type === 'VIDEO' ? '🎥' : '📷'}</span>
              }
              <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(13,13,20,0.75)', borderRadius: 9999, padding: '3px 10px', fontSize: 10, fontWeight: 800, color: '#fff' }}>
                {item.type}
              </div>
              <button onClick={() => toggleFeatured(item)} style={{
                position: 'absolute', top: 8, right: 8,
                background: item.featured ? A.yellow : 'rgba(13,13,20,0.6)',
                border: 'none', borderRadius: 9999, padding: '3px 10px',
                fontSize: 10, fontWeight: 800, cursor: 'pointer',
                color: item.featured ? A.yellowText : '#fff',
              }}>
                {item.featured ? '⭐' : '☆'}
              </button>
            </div>
            <div style={{ padding: '14px 14px 12px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: A.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: A.textMuted, marginBottom: 12 }}>
                {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setEditId(item.id); setForm({ type: item.type, title: item.title, description: item.description ?? '', url: item.url, thumbnail: item.thumbnail ?? '', duration: item.duration ?? '', featured: item.featured }); setShowForm(true) }}
                  style={{ flex: 1, padding: '7px', background: A.pageBg, border: `1px solid ${A.border}`, borderRadius: 9999, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: A.textMid, fontFamily: 'inherit' }}>
                  ✏️ Edit
                </button>
                <button onClick={() => setDeleteId(item.id)}
                  style={{ flex: 1, padding: '7px', background: A.redSoft, border: `1px solid ${A.red}44`, borderRadius: 9999, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: A.red, fontFamily: 'inherit' }}>
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,13,20,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: A.card, borderRadius: 32, padding: 32, maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: A.text, marginBottom: 8 }}>Delete this item?</div>
            <div style={{ fontSize: 14, color: A.textMuted, marginBottom: 28 }}>This removes it from the DB only. Delete from Cloudinary separately if needed.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1.5px solid ${A.borderMid}`, borderRadius: 9999, color: A.textMid, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => deleteItem(deleteId)} style={{ flex: 1, padding: '12px', background: A.red, border: 'none', borderRadius: 9999, color: '#fff', fontWeight: 900, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
