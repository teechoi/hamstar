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

function TypeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 18px', border: `2px solid ${active ? A.gold : A.border}`,
      borderRadius: 8, background: active ? A.goldSoft : A.inputBg,
      fontSize: 12, fontWeight: 800, cursor: 'pointer',
      color: active ? A.gold : A.textMuted, fontFamily: 'inherit',
    }}>{children}</button>
  )
}

export default function MediaPage() {
  const [items,    setItems]    = useState<MediaItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState<NewItem>(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [uploading,setUploading]= useState(false)
  const [progress, setProgress] = useState(0)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
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
      const sig  = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: 'hamstar/media' }) })
      const { signature, timestamp, apiKey, folder, uploadUrl } = await sig.json()
      const fd = new FormData()
      fd.append('file', file); fd.append('api_key', apiKey)
      fd.append('timestamp', timestamp); fd.append('signature', signature); fd.append('folder', folder)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(e.loaded/e.total*100)) }
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

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: A.inputBg, border: `1px solid ${A.border}`, borderRadius: 8, fontSize: 13, color: A.text, outline: 'none', fontFamily: 'inherit' }

  return (
    <div className="admin-page" style={{ maxWidth: 1020 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: A.text }}>Media Library</div>
          <div style={{ fontSize: 13, color: A.textMuted, marginTop: 4 }}>
            {items.length} items · {items.filter(i => i.featured).length} featured
          </div>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }} style={{ padding: '10px 20px', background: A.gold, border: 'none', borderRadius: 10, color: A.goldText, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Add Media
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { uploadFile(f); setShowForm(true) } }}
        onClick={() => fileRef.current?.click()}
        style={{ border: `2px dashed ${A.border}`, borderRadius: 14, padding: '28px', textAlign: 'center', cursor: 'pointer', marginBottom: 24, background: A.card }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>{uploading ? '⏳' : '📁'}</div>
        {uploading
          ? <>
              <div style={{ fontSize: 13, color: A.textMuted, marginBottom: 8 }}>Uploading... {progress}%</div>
              <div style={{ height: 5, background: A.border, borderRadius: 99, overflow: 'hidden', maxWidth: 280, margin: '0 auto' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: A.gold, borderRadius: 99, transition: 'width 0.3s' }} />
              </div>
            </>
          : <>
              <div style={{ fontSize: 13, color: A.textMuted }}>Drag & drop a photo or video, or click to browse</div>
              <div style={{ fontSize: 11, color: A.textMuted, marginTop: 4 }}>JPG, PNG, WEBP, MP4, MOV — up to 200MB</div>
            </>
        }
      </div>
      <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) { uploadFile(f); setShowForm(true) } }} />

      {/* Add/Edit form */}
      {showForm && (
        <div style={{ background: A.card, border: `1px solid ${A.gold}44`, borderRadius: 16, padding: 24, marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: A.text, marginBottom: 20 }}>
            {editId ? 'Edit Item' : 'New Media Item'}
          </div>
          <div className="admin-2col" style={{ gap: 20 }}>
            <div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <TypeBtn active={form.type === 'PHOTO'} onClick={() => upd({ type: 'PHOTO' })}>📷 Photo</TypeBtn>
                  <TypeBtn active={form.type === 'VIDEO'} onClick={() => upd({ type: 'VIDEO' })}>🎥 Video</TypeBtn>
                </div>
              </div>
              {(['title', 'description', 'url', 'thumbnail', 'duration'] as const).map(field => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: A.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>{field}</label>
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
                <img src={form.thumbnail} alt="preview" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 10, marginBottom: 14, border: `1px solid ${A.border}` }} />
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.featured} onChange={e => upd({ featured: e.target.checked })} />
                <span style={{ fontSize: 13, color: A.textMid }}>Featured (shows first)</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={() => { setShowForm(false); setEditId(null) }} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${A.border}`, borderRadius: 8, color: A.textMid, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={saveItem} disabled={saving} style={{ padding: '10px 24px', background: A.gold, border: 'none', borderRadius: 8, color: A.goldText, fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 16 }}>
        {items.map(item => (
          <div key={item.id} style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 130, background: A.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.thumbnail
                ? <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                : <span style={{ fontSize: 36, opacity: 0.25 }}>{item.type === 'VIDEO' ? '🎥' : '📷'}</span>
              }
              <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.7)', borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 800, color: '#fff' }}>
                {item.type}
              </div>
              <button onClick={() => toggleFeatured(item)} style={{ position: 'absolute', top: 6, right: 6, background: item.featured ? A.gold : 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 800, cursor: 'pointer', color: item.featured ? A.goldText : '#fff' }}>
                {item.featured ? '⭐' : '☆'}
              </button>
            </div>
            <div style={{ padding: '12px 12px 10px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: A.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: A.textMuted, marginBottom: 10 }}>
                {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setEditId(item.id); setForm({ type: item.type, title: item.title, description: item.description ?? '', url: item.url, thumbnail: item.thumbnail ?? '', duration: item.duration ?? '', featured: item.featured }); setShowForm(true) }}
                  style={{ flex: 1, padding: '6px', background: A.inputBg, border: `1px solid ${A.border}`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: A.textMid, fontFamily: 'inherit' }}>
                  ✏️
                </button>
                <button onClick={() => setDeleteId(item.id)}
                  style={{ flex: 1, padding: '6px', background: A.redSoft, border: `1px solid ${A.red}44`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: A.red, fontFamily: 'inherit' }}>
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: A.card, borderRadius: 20, padding: 28, maxWidth: 360, width: '100%', border: `1px solid ${A.borderMid}` }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: A.text, marginBottom: 8 }}>Delete this item?</div>
            <div style={{ fontSize: 13, color: A.textMuted, marginBottom: 24 }}>This removes it from the DB only. Delete from Cloudinary separately if needed.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '11px', background: 'transparent', border: `1px solid ${A.border}`, borderRadius: 8, color: A.textMid, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => deleteItem(deleteId)} style={{ flex: 1, padding: '11px', background: A.red, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 900, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
