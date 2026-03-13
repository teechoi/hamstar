// components/views/SponsorsView.tsx
'use client'
import { T, Tag, LimeButton } from '../ui'
import { SITE, SPONSORS, PETS } from '@/config/site'

const TIERS = [
  {
    key: 'TITLE' as const,
    name: 'Title Sponsor',
    range: 'Premium placement',
    icon: '👑',
    color: T.coral,
    bg: T.coralSoft,
    perks: ['Logo on racing suit', 'Arena naming rights', 'Every broadcast mention', 'Homepage banner'],
  },
  {
    key: 'GOLD' as const,
    name: 'Gold Sponsor',
    range: 'Featured placement',
    icon: '⭐',
    color: T.blue,
    bg: T.blueSoft,
    perks: ['Logo on pet card', 'Leaderboard badge', 'Social shoutout every race'],
  },
  {
    key: 'SILVER' as const,
    name: 'Silver Sponsor',
    range: 'Standard placement',
    icon: '✨',
    color: T.violet,
    bg: T.violetSoft,
    perks: ['Race credits mention', 'Sponsors page listing', 'Community shoutout'],
  },
]

export function SponsorsView() {
  const sponsorEmail = SITE.sponsorEmail

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 28px' }}>
      <Tag label="🏎️ Sponsorships" color={T.blue} bg={T.blueSoft} />
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 40, color: T.text, marginTop: 10, marginBottom: 8, letterSpacing: -1, fontWeight: 900 }}>
        Sponsor a Racer
      </h2>
      <p style={{ color: T.textMid, fontSize: 15, maxWidth: 520, marginBottom: 36 }}>
        Back a racer. Put your name on the fastest hamsters the internet has ever seen. Pick a tier, pick a side.
      </p>

      {/* Tier cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        {TIERS.map((tier) => (
          <div key={tier.key} style={{ background: tier.bg, border: `2px solid ${tier.color}`, borderRadius: 20, padding: 28, boxShadow: `6px 6px 0px ${tier.color}44`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: tier.color }} />
            <div style={{ fontSize: 36, marginBottom: 12, marginTop: 6 }}>{tier.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text, marginBottom: 4 }}>{tier.name}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: tier.color, marginBottom: 20 }}>{tier.range}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {tier.perks.map((p) => (
                <div key={p} style={{ fontSize: 13, color: T.textMid, display: 'flex', gap: 8 }}>
                  <span style={{ color: tier.color, flexShrink: 0 }}>✓</span>{p}
                </div>
              ))}
            </div>
            <a href={`mailto:${sponsorEmail}?subject=${encodeURIComponent(`${tier.name} Sponsorship Inquiry`)}`}
              style={{ textDecoration: 'none', display: 'block' }}>
              <LimeButton fullWidth>Get in Touch →</LimeButton>
            </a>
          </div>
        ))}
      </div>

      {/* Current sponsors */}
      <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 16, padding: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>
          Current Sponsors
        </div>

        {SPONSORS.length === 0 ? (
          <EmptySponsors email={sponsorEmail} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 12 }}>
            {SPONSORS.map((s) => {
              const tierColor = s.tier === 'TITLE' ? T.coral : s.tier === 'GOLD' ? T.yellow : T.violet
              const sponsoredPet = s.petId ? PETS.find((p) => p.id === s.petId) : null
              const card = (
                <div style={{ background: T.bg, border: `2px solid ${tierColor}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: `3px 3px 0px ${tierColor}44`, cursor: s.url ? 'pointer' : 'default', textDecoration: 'none' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: tierColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{s.emoji}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: tierColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.tier}</div>
                    {sponsoredPet && <div style={{ fontSize: 10, color: T.textMuted }}>→ {sponsoredPet.name}</div>}
                  </div>
                </div>
              )
              return s.url ? (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{card}</a>
              ) : (
                <div key={s.id}>{card}</div>
              )
            })}
            {/* Open slot */}
            <a href={`mailto:${sponsorEmail}?subject=Sponsorship Inquiry`} style={{ textDecoration: 'none' }}>
              <div style={{ border: `2px dashed ${T.borderDark}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 72, transition: 'all 0.15s' }}>
                <span style={{ fontSize: 20, color: T.textMuted }}>+</span>
                <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 700 }}>Your brand here</span>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptySponsors({ email }: { email: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🏎️</div>
      <div style={{ fontSize: 16, fontWeight: 900, color: T.text, marginBottom: 8 }}>No sponsors yet — be the first</div>
      <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>Your brand on the fastest hamsters on the internet.</div>
      <a href={`mailto:${email}?subject=Founding Sponsor Inquiry`} style={{ textDecoration: 'none' }}>
        <LimeButton>Become Founding Sponsor →</LimeButton>
      </a>
    </div>
  )
}
