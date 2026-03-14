'use client'
import { useState, useEffect, useRef } from 'react'
import { T, LimeButton, OutlineButton, Tag } from '@/components/ui'

type MediaItem = { id: string; type: 'VIDEO' | 'PHOTO'; title: string; description: string | null; url: string; thumbnail: string | null; duration: string | null; featured: boolean; publishedAt: string }

type NewItem = { type: 'VIDEO' | 'PHOTO'; title: string; description: string; url: string; thumbnail: string; duration: string; featured: boolean }

const EMPTY_NEW: NewItem = { type: 'PHOTO', title: '', description: '', url: '', thumbnail: '', duration: '', featured: false }

function extractYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewItem>(EMPTY_NEW)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => fetch('/api/admin/media').then((r) => r.json()).then(setItems)
  useEffect(() => { load() }, [])

  const updateForm = (patch: Partial<NewItem>) => setForm((f) => ({ ...f, ...patch }))

  const handleYouTubeUrl = (url: string) => {
    updateForm({ url, type: 'VIDEO' })
    const id = extractYouTubeId(url)
    if (id) updateForm({ thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` })
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)
    try {
      const sigRes = await fetch('/api/admin/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'hamstar/media' }),
      })
      const { signature, timestamp, apiKey, cloudName, folder, uploadUrl } = await sigRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100)) }
        xhr.onload = () => {
          const data = JSON.parse(xhr.responseText)
          if (data.secure_url) {
            const isVideo = file.type.startsWith('video/')
            updateForm({
              url: data.secure_url,
              thumbnail: data.eager?.[0]?.secure_url ?? (isVideo ? '' : data.secure_url),
              type: isVideo ? 'VIDEO' : 'PHOTO',
            })
          }
          resolve()
        }
        xhr.onerror = reject
        xhr.open('POST', uploadUrl)
        xhr.send(formData)
      })
    } finally {
      setUploading(false)
    }
  }

  const saveItem = async () => {
    if (!form.title || !form.url) return
    setSaving(true)
    if (editId) {
      await fetch(`/api/admin/media/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/admin/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false)
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_NEW)
    load()
  }

  const toggleFeatured = async (item: MediaItem) => {
    await fetch(`/api/admin/media/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: !item.featured }) })
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, featured: !i.featured } : i))
  }

  const deleteItem = async (id: string) => {
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => i.id !== id))
    setDeleteId(null)
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.text }}>Media Library</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{items.length} items · {items.filter((i) => i.featured).length} featured</div>
        </div>
        <LimeButton onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_NEW) }}>+ Add Media</LimeButton>
      </div>

      {/* Upload drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) uploadFile(f) }}
        onClick={() => fileRef.current?.click()}
        style={{ border: `2px dashed ${T.border}`, borderRadius: 12, padding: '24px', textAlign: 'center', cursor: 'pointer', marginBottom: 24, background: T.card }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{uploading ? '⏳' : '📁'}</div>
        {uploading
          ? <div style={{ fontSize: 13, color: T.textMuted }}>Uploading... {uploadProgress}%
              <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: 'hidden', marginTop: 8, maxWidth: 300, margin: '8px auto 0' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: T.lime, borderRadius: 99, transition: 'width 0.3s' }} />
              </div>
            </div>
          : <div style={{ fontSize: 13, color: T.textMuted }}>Drag & drop a photo or video here, or click to browse<br /><span style={{ fontSize: 11 }}>JPG, PNG, WEBP, GIF, MP4, MOV — up to 200MB</span></div>
        }
      </div>
      <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { uploadFile(f); setShowForm(true) } }} />

      {/* Add/Edit form */}
      {showForm && (
        <div style={{ background: T.card, border: `2px solid ${T.blue}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 16 }}>{editId ? 'Edit Media' : 'New Media Item'}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Type</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {(['PHOTO', 'VIDEO'] as const).map((t) => (
                  <button key={t} onClick={() => updateForm({ type: t })} style={{ padding: '8px 16px', border: `2px solid ${form.type === t ? T.blue : T.border}`, borderRadius: 8, background: form.type === t ? T.blueSoft : T.bg, fontSize: 12, fontWeight: 800, cursor: 'pointer', color: form.type === t ? T.blue : T.textMid }}>
                    {t === 'PHOTO' ? '📷 Photo' : '🎥 Video'}
                  </button>
                ))}
              </div>
              {['title', 'description', 'url', 'thumbnail', 'duration'].map((field) => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{field}</label>
                  <input
                    value={(form as unknown as Record<string, string>)[field]}
                    onChange={(e) => {
                      if (field === 'url' && form.type === 'VIDEO') handleYouTubeUrl(e.target.value)
                      else updateForm({ [field]: e.target.value } as Partial<NewItem>)
                    }}
                    placeholder={field === 'url' && form.type === 'VIDEO' ? 'YouTube or Cloudinary URL' : ''}
                    style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, color: T.text, fontFamily: 'inherit', outline: 'none', background: T.bg }}
                  />
                </div>
              ))}
            </div>
            <div>
              {form.thumbnail && <img src={form.thumbnail} alt="preview" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 10, marginBottom: 12, border: `1.5px solid ${T.border}` }} />}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 16 }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => updateForm({ featured: e.target.checked })} />
                <span style={{ fontSize: 13, color: T.text }}>Featured (appears first)</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <OutlineButton onClick={() => { setShowForm(false); setEditId(null) }}>Cancel</OutlineButton>
            <LimeButton onClick={saveItem}>{saving ? 'Saving...' : 'Save'}</LimeButton>
          </div>
        </div>
      )}

      {/* Media grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {items.map((item) => (
          <div key={item.id} style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 130, background: T.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.thumbnail
                ? <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                : <span style={{ fontSize: 36, opacity: 0.3 }}>{item.type === 'VIDEO' ? '🎥' : '📷'}</span>
              }
              <div style={{ position: 'absolute', top: 6, left: 6 }}>
                <Tag label={item.type} color={item.type === 'VIDEO' ? T.blue : T.violet} bg={item.type === 'VIDEO' ? T.blueSoft : T.violetSoft} />
              </div>
              <button onClick={() => toggleFeatured(item)} style={{ position: 'absolute', top: 6, right: 6, background: item.featured ? T.lime : '#FFFFFF44', border: 'none', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 800, cursor: 'pointer', color: item.featured ? T.limeText : T.text }}>
                {item.featured ? '⭐ Featured' : 'Feature'}
              </button>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>
                {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setEditId(item.id); setForm({ type: item.type, title: item.title, description: item.description ?? '', url: item.url, thumbnail: item.thumbnail ?? '', duration: item.duration ?? '', featured: item.featured }); setShowForm(true) }}
                  style={{ flex: 1, padding: '6px', background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: T.textMid }}>
                  ✏️ Edit
                </button>
                <button onClick={() => setDeleteId(item.id)} style={{ flex: 1, padding: '6px', background: T.bg, border: `1.5px solid ${T.coral}44`, borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: T.coral }}>
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.card, borderRadius: 16, padding: 28, maxWidth: 360, width: '90%', border: `2px solid ${T.border}` }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.text, marginBottom: 8 }}>Delete this media item?</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>This removes it from the DB. If it was uploaded to Cloudinary, remove it there too.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <OutlineButton onClick={() => setDeleteId(null)} fullWidth>Cancel</OutlineButton>
              <button onClick={() => deleteItem(deleteId)} style={{ flex: 1, padding: '12px', background: T.coral, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 900, fontSize: 13, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
