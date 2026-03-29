// components/views/CommunityView.tsx
'use client'
import { useState } from 'react'
import { T, Tag, useIsMobile } from '../ui'
import { SITE, MEDIA } from '@/config/site'
import type { MediaItem } from '@/config/site'

type Filter = 'ALL' | 'VIDEO' | 'PHOTO'

export function CommunityView() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const isMobile = useIsMobile()

  const filtered = filter === 'ALL' ? MEDIA : MEDIA.filter((m) => m.type === filter)
  const sorted = [...filtered].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  const { socials } = SITE
  const socialLinks = [
    { label: 'TikTok', icon: '🎵', color: T.coral, url: socials.tiktok },
    { label: 'Instagram', icon: '📷', color: T.violet, url: socials.instagram },
    { label: 'X / Twitter', icon: '𝕏', color: T.blue, url: socials.twitter },
    { label: 'YouTube', icon: '▶', color: '#FF0000', url: socials.youtube },
  ].filter((s) => s.url)

  const columns = isMobile ? 1 : 4

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 28px' }}>
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'flex-end', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
        <div>
          <Tag label="🎬 Content" color={T.blue} bg={T.blueSoft} />
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? 26 : 'clamp(32px, 2.8vw, 48px)', color: T.text, marginTop: 10, marginBottom: 6, letterSpacing: -0.5, fontWeight: 900 }}>
            Hamstar TV
          </h2>
          <p style={{ color: T.textMuted, fontSize: 14 }}>Race highlights, real hamsters, and behind-the-scenes content.</p>
        </div>
        <div style={{ display: 'flex', gap: 0, border: `2px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
          {(['ALL', 'VIDEO', 'PHOTO'] as const).map((f, i) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: isMobile ? '8px 14px' : '8px 18px', background: filter === f ? T.text : 'transparent',
              color: filter === f ? T.lime : T.textMid, border: 'none',
              borderLeft: i > 0 ? `1px solid ${T.border}` : 'none',
              fontSize: 12, fontWeight: 800, cursor: 'pointer',
              letterSpacing: 0.8, fontFamily: 'inherit', textTransform: 'uppercase',
            }}>{f === 'ALL' ? 'All' : f === 'VIDEO' ? 'Video' : 'Photo'}</button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyMedia filter={filter} />
      ) : (
        <div style={{ columns, columnGap: 16 }}>
          {sorted.map((item) => <MediaCard key={item.id} item={item} />)}
        </div>
      )}

      {/* Social follow bar */}
      {socialLinks.length > 0 && (
        <div style={{ marginTop: 28, background: T.text, borderRadius: 16, padding: isMobile ? '20px 20px' : '24px 28px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.lime, marginBottom: 4 }}>Follow @Hamstar</div>
            <div style={{ fontSize: 13, color: '#8892BB' }}>Race drops, pet moments, arena announcements.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {socialLinks.map(({ label, icon, color, url }) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                style={{ padding: '9px 14px', background: 'transparent', border: `2px solid ${color}`, borderRadius: 8, color, fontWeight: 800, fontSize: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {icon} {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MediaCard({ item }: { item: MediaItem }) {
  const [hov, setHov] = useState(false)
  const accentColors = [T.coral, T.blue, T.violet, T.yellow]
  const color = accentColors[item.id.charCodeAt(0) % accentColors.length]

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{ breakInside: 'avoid', marginBottom: 16, background: T.card, border: `2px solid ${hov ? color : T.border}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s ease-out', transform: hov ? 'translateY(-3px) scale(1.01)' : 'none', boxShadow: hov ? `4px 4px 0px ${color}44` : 'none' }}>
        {/* Thumbnail */}
        <div style={{ background: `linear-gradient(135deg,${color}18,${color}06)`, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: `2px solid ${color}22` }}>
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          ) : item.type === 'PHOTO' && item.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
            <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          ) : (
            <div style={{ fontSize: 44, opacity: 0.35 }}>{item.type === 'VIDEO' ? '🎥' : '📸'}</div>
          )}
          {item.type === 'VIDEO' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: T.card, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color }}>▶</div>
            </div>
          )}
          {item.duration && (
            <div style={{ position: 'absolute', bottom: 8, right: 8, background: T.text, borderRadius: 4, padding: '2px 7px', fontSize: 10, color: T.card, fontWeight: 800 }}>{item.duration}</div>
          )}
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <Tag label={item.type === 'VIDEO' ? '▶ Video' : '📷 Photo'} color={color} bg={color + '18'} border={color + '44'} />
          </div>
          {item.featured && (
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <Tag label="⭐ Featured" color={T.yellow} bg={T.yellow + '22'} border={T.yellow} />
            </div>
          )}
        </div>
        <div style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 3 }}>{item.title}</div>
          {item.description && <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5, marginBottom: 6 }}>{item.description}</div>}
          <div style={{ fontSize: 10, color: T.textMuted }}>
            {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </a>
  )
}

function EmptyMedia({ filter }: { filter: Filter }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>{filter === 'PHOTO' ? '📸' : '🎬'}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: T.text, marginBottom: 8 }}>Content coming soon</div>
      <div style={{ fontSize: 14, color: T.textMuted, maxWidth: 400, margin: '0 auto' }}>
        {filter === 'ALL'
          ? 'Race highlights and behind-the-scenes content will appear here. Add media in config/site.ts to get started.'
          : `No ${filter.toLowerCase()}s yet. Add some in config/site.ts.`}
      </div>
    </div>
  )
}
