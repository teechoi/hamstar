'use client'
import { useEffect, useState } from 'react'
import { A } from '../theme'

const KANIT = "var(--font-kanit), sans-serif"

interface MediaItem {
  id: string; type: 'VIDEO' | 'PHOTO'; title: string; description?: string
  url: string; thumbnail?: string; duration?: string; featured: boolean
  publishedAt: string
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, outline: 'none', background: '#fff', width: '100%' }} />
    </div>
  )
}

function MediaCard({ item, onDelete, onToggleFeatured }: { item: MediaItem; onDelete: (id: string) => void; onToggleFeatured: (id: string, v: boolean) => void }) {
  const [deleting, setDeleting] = useState(false)

  const del = async () => {
    if (!confirm(`Delete "${item.title}"?`)) return
    setDeleting(true)
    await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' })
    onDelete(item.id)
  }

  const toggleFeatured = async () => {
    await fetch(`/api/admin/media/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !item.featured }),
    })
    onToggleFeatured(item.id, !item.featured)
  }

  return (
    <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, overflow: 'hidden' }}>
      <div style={{ height: 140, background: '#eee', position: 'relative', overflow: 'hidden' }}>
        {(item.thumbnail || item.url) && (
          <img src={item.thumbnail ?? item.url} alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: item.type === 'VIDEO' ? A.purple : A.green, color: '#fff' }}>
          {item.type}
        </span>
        {item.featured && (
          <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: A.yellow, color: A.yellowText }}>
            Featured
          </span>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: A.text, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
        <p style={{ fontSize: 12, color: A.textMuted, marginBottom: 12 }}>{new Date(item.publishedAt).toLocaleDateString()}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleFeatured} style={{
            flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${A.borderMid}`,
            fontSize: 12, fontWeight: 600, color: item.featured ? A.yellowDark : A.textMid,
            background: item.featured ? A.yellowSoft : 'transparent', cursor: 'pointer',
          }}>
            {item.featured ? '★ Featured' : '☆ Feature'}
          </button>
          <button onClick={del} disabled={deleting} style={{
            padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${A.redSoft}`,
            fontSize: 12, fontWeight: 600, color: A.red, background: 'transparent', cursor: 'pointer',
          }}>
            {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

const EMPTY = { type: 'VIDEO' as const, title: '', url: '', thumbnail: '', description: '', duration: '', featured: false }

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/admin/media')
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setItems(d) : setErr(d.error))
      .finally(() => setLoading(false))
  }, [])

  const set = (k: keyof typeof form) => (v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    const res = await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      const item = await res.json()
      setItems(prev => [item, ...prev])
      setForm({ ...EMPTY })
      setAdding(false)
    } else {
      setErr('Failed to add')
    }
  }

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12 }}>
        <h1 style={{ fontFamily: KANIT, fontSize: 26, fontWeight: 700, color: A.text }}>Media</h1>
        <button onClick={() => setAdding(a => !a)} style={{
          padding: '10px 20px', borderRadius: 48.5, background: A.yellow, border: 'none',
          fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: A.yellowText, cursor: 'pointer',
        }}>
          {adding ? 'Cancel' : '+ Add Media'}
        </button>
      </div>

      {err && <div style={{ padding: '12px 16px', background: A.redSoft, border: `1px solid ${A.red}`, borderRadius: 10, color: A.red, fontSize: 14, marginBottom: 20 }}>{err}</div>}

      {adding && (
        <div style={{ background: A.card, borderRadius: 16, border: `1.5px solid ${A.border}`, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontFamily: KANIT, fontSize: 16, fontWeight: 700, color: A.text, marginBottom: 20 }}>New Media Item</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: A.textMid, textTransform: 'uppercase', letterSpacing: 0.6 }}>Type</label>
              <select value={form.type} onChange={e => set('type')(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${A.borderMid}`, fontSize: 14, color: A.text, background: '#fff' }}>
                <option value="VIDEO">Video</option>
                <option value="PHOTO">Photo</option>
              </select>
            </div>
            <div className="admin-2col">
              <Input label="Title" value={form.title} onChange={set('title')} />
              <Input label="Duration (e.g. 1:24)" value={form.duration} onChange={set('duration')} />
            </div>
            <Input label="URL" value={form.url} onChange={set('url')} placeholder="https://..." />
            <Input label="Thumbnail URL" value={form.thumbnail} onChange={set('thumbnail')} placeholder="https://..." />
            <Input label="Description" value={form.description} onChange={set('description')} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured')(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: A.purple }} />
              <label htmlFor="featured" style={{ fontSize: 14, color: A.text, cursor: 'pointer' }}>Featured</label>
            </div>
            <button onClick={save} disabled={saving || !form.title || !form.url} style={{
              alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 48.5, background: A.purple, border: 'none',
              fontFamily: KANIT, fontSize: 14, fontWeight: 700, color: '#fff',
              cursor: (saving || !form.title || !form.url) ? 'not-allowed' : 'pointer', opacity: (saving || !form.title || !form.url) ? 0.6 : 1,
            }}>
              {saving ? 'Adding…' : 'Add Item'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 260, borderRadius: 16, background: A.border, animation: 'pulse 1.4s ease-in-out infinite' }} />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: A.textMuted, fontSize: 14 }}>No media yet. Add your first item above.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {items.map(item => (
            <MediaCard
              key={item.id} item={item}
              onDelete={id => setItems(prev => prev.filter(i => i.id !== id))}
              onToggleFeatured={(id, v) => setItems(prev => prev.map(i => i.id === id ? { ...i, featured: v } : i))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
