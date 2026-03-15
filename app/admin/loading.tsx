import { T } from '@/lib/theme'

export default function AdminLoading() {
  return (
    <div className="admin-page" style={{ maxWidth: 900 }}>
      <div style={{ height: 28, width: 200, background: T.border, borderRadius: 8, marginBottom: 8, opacity: 0.6 }} />
      <div style={{ height: 16, width: 280, background: T.border, borderRadius: 6, marginBottom: 32, opacity: 0.4 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 90, background: T.border, borderRadius: 14, opacity: 0.5 }} />
        ))}
      </div>
      <div className="admin-2col">
        <div style={{ height: 240, background: T.border, borderRadius: 14, opacity: 0.4 }} />
        <div style={{ height: 240, background: T.border, borderRadius: 14, opacity: 0.4 }} />
      </div>
    </div>
  )
}
