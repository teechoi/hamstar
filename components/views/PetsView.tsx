// components/views/PetsView.tsx
'use client'
import { useState } from 'react'
import { T, RaceBar, Tag, useIsMobile } from '../ui'
import { PETS } from '@/config/site'
import type { Pet } from '@/config/site'

export function PetsView() {
  const [selected, setSelected] = useState<Pet>(PETS[0])
  const isMobile = useIsMobile()

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Tag label="🏁 The Lineup" color={T.blue} bg={T.blueSoft} />
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? 28 : 40, fontWeight: 900, color: T.text, marginTop: 10, marginBottom: 8, letterSpacing: -1 }}>
          Meet the Racers
        </h2>
        <p style={{ color: T.textMid, fontSize: isMobile ? 14 : 15, maxWidth: 520 }}>
          Three racers. Three different roads to glory. Only one earns the wheel.
        </p>
      </div>

      {/* Pet selector */}
      <div style={{ display: 'flex', gap: isMobile ? 8 : 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {PETS.map((pet) => (
          <button key={pet.id} onClick={() => setSelected(pet)} style={{
            display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12,
            padding: isMobile ? '8px 14px' : '12px 20px',
            borderRadius: 12, border: `2px solid ${selected.id === pet.id ? pet.color : T.border}`,
            background: selected.id === pet.id ? pet.color + '18' : T.card,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: selected.id === pet.id ? `4px 4px 0px ${pet.color}` : 'none',
            transition: 'all 0.15s',
          }}>
            <div style={{ width: isMobile ? 34 : 44, height: isMobile ? 34 : 44, borderRadius: 10, background: selected.id === pet.id ? pet.color : T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 18 : 24, overflow: 'hidden', transition: 'all 0.15s' }}>
              {pet.image ? <img src={pet.image} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : pet.emoji}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 900, color: selected.id === pet.id ? pet.color : T.text }}>{pet.name}</div>
              <div style={{ fontSize: 10, color: T.textMuted }}>{pet.team} · #{pet.number}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 16 : 24 }}>
        {/* LEFT: Pet card */}
        <div style={{ background: T.card, border: `2px solid ${selected.color}`, borderRadius: 20, overflow: 'hidden', boxShadow: isMobile ? `4px 4px 0px ${selected.color}` : `6px 6px 0px ${selected.color}` }}>
          <div style={{ height: 6, background: selected.color }} />
          <div style={{ padding: isMobile ? 20 : 28 }}>
            {/* Identity */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: isMobile ? 64 : 80, height: isMobile ? 64 : 80, borderRadius: 20, background: selected.color + '18', border: `3px solid ${selected.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? 36 : 46, animation: 'petIdle 3s ease-in-out infinite', overflow: 'hidden' }}>
                  {selected.image ? <img src={selected.image} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selected.emoji}
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, fontStyle: 'italic', marginBottom: 4 }}>{selected.tagline}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: selected.color, letterSpacing: 1, textTransform: 'uppercase' }}>{selected.team}</div>
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>#{selected.number}</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr 1fr' : '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
              {[['Speed', '🏃', selected.speed], ['Chaos', '⚡', selected.chaos], ['Wins', '🏆', selected.wins]].map(([l, icon, v]) => (
                <div key={String(l)} style={{ background: T.bg, border: `2px solid ${T.border}`, borderRadius: 12, padding: isMobile ? '10px 4px' : '12px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: T.text }}>{v}</div>
                  <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Lifestyle bars */}
            <div style={{ background: T.bg, border: `2px solid ${T.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Lifestyle</div>
              {[['🍿 Snack Quality', selected.snackLevel], ['🏠 Cage Comfort', selected.cageLevel]].map(([l, v]) => (
                <div key={String(l)} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: T.textMid }}>{l}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{v}%</span>
                  </div>
                  <RaceBar value={Number(v)} color={selected.color} />
                </div>
              ))}
            </div>

            {/* Bio */}
            <div style={{ background: T.bg, border: `2px solid ${T.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>About {selected.name}</div>
              <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.7, margin: 0 }}>{selected.bio}</p>
            </div>

            {/* Sponsors */}
            {selected.sponsors.length > 0 && (
              <div>
                <div style={{ fontSize: 9, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Team Sponsors</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selected.sponsors.map((s) => (
                    <div key={s.name} style={{ background: selected.color + '18', border: `1.5px solid ${selected.color}`, borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 800, color: selected.color }}>
                      {s.emoji} {s.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Info panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RacerFacts pet={selected} />
          <AllRacersLifestyle selected={selected} onSelect={setSelected} />
        </div>
      </div>
    </div>
  )
}

function RacerFacts({ pet }: { pet: Pet }) {
  const dominantStat = pet.speed > pet.chaos ? 'speed' : 'chaos'
  const facts = [
    { icon: dominantStat === 'speed' ? '⚡' : '🌀', label: dominantStat === 'speed' ? 'Speed demon' : 'Chaos agent', desc: dominantStat === 'speed' ? `${pet.name} clocks the fastest straight-line times of the season.` : `${pet.name} is the most unpredictable racer on the track.` },
    { icon: '🏆', label: `${pet.wins} career win${pet.wins !== 1 ? 's' : ''}`, desc: `${pet.name} has stood on the podium ${pet.wins} time${pet.wins !== 1 ? 's' : ''} — and is hungry for more.` },
    { icon: '🍿', label: `Snack level ${pet.snackLevel}%`, desc: `${pet.snackLevel >= 70 ? 'Living deluxe. Premium nutrition means premium performance.' : pet.snackLevel >= 40 ? 'Solid diet. Room to upgrade.' : 'Budget fuel. Higher donations unlock better snacks.'}` },
    { icon: '🏠', label: `Cage comfort ${pet.cageLevel}%`, desc: `${pet.cageLevel >= 70 ? 'Five-star setup. Fully rested, fully ready.' : pet.cageLevel >= 40 ? 'Decent digs. Could be better.' : 'Basic housing. Comfort upgrades incoming.'}` },
  ]

  return (
    <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 18, padding: 24 }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Racer Profile</div>
      {facts.map(({ icon, label, desc }) => (
        <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ width: 38, height: 38, minWidth: 38, borderRadius: 10, background: pet.color + '18', border: `2px solid ${pet.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.text, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AllRacersLifestyle({ selected, onSelect }: { selected: Pet; onSelect: (p: Pet) => void }) {
  return (
    <div style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 18, padding: 24 }}>
      <div style={{ fontSize: 9, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>All Racers</div>
      {PETS.map((p, i) => (
        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < PETS.length - 1 ? `1px solid ${T.border}` : 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: p.color + '18', border: `2px solid ${p.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden', flexShrink: 0 }}>
            {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>{p.name}</span>
              <span style={{ fontSize: 10, color: T.textMuted }}>🍿{p.snackLevel}% · 🏠{p.cageLevel}%</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ flex: 1 }}><RaceBar value={p.snackLevel} color={p.color} /></div>
              <div style={{ flex: 1 }}><RaceBar value={p.cageLevel} color={p.color} /></div>
            </div>
          </div>
          <button onClick={() => onSelect(p)} style={{ padding: '5px 10px', background: selected.id === p.id ? p.color + '18' : T.bg, border: `1.5px solid ${p.color}`, borderRadius: 6, color: p.color, fontSize: 10, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
            {selected.id === p.id ? '✓' : 'View'}
          </button>
        </div>
      ))}
    </div>
  )
}
