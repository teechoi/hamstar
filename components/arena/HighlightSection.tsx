'use client'
import { useState, useEffect, useRef } from 'react'
import { PETS, type RaceResult } from '@/config/site'
import { useIsMobile } from '@/components/ui/index'

const KANIT = "var(--font-kanit), sans-serif"

declare global {
  interface Window { twttr: any }
}

interface HighlightSectionProps {
  lastResult?: RaceResult
}

function TweetVideoCard({ tweetUrl, title }: { tweetUrl: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const tweetId = tweetUrl.match(/status\/(\d+)/)?.[1]
    if (!tweetId || !containerRef.current) return

    // cancelled flag prevents StrictMode's double-effect from double-embedding
    let cancelled = false

    const embed = () => {
      if (cancelled || !containerRef.current) return
      containerRef.current.innerHTML = ''
      // Width = card width so the iframe never overflows
      const width = cardRef.current?.offsetWidth ?? 280
      window.twttr.widgets.createTweet(tweetId, containerRef.current, {
        theme: 'light',
        conversation: 'none',
        dnt: true,
        width,
      }).then(() => { if (!cancelled) setLoaded(true) })
    }

    if (window.twttr?.widgets) {
      embed()
    } else {
      const existing = document.getElementById('twitter-widget-js')
      if (!existing) {
        const s = document.createElement('script')
        s.id = 'twitter-widget-js'
        s.src = 'https://platform.twitter.com/widgets.js'
        s.async = true
        s.onload = embed
        document.head.appendChild(s)
      } else {
        existing.addEventListener('load', embed)
      }
    }

    return () => {
      cancelled = true
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [tweetUrl])

  return (
    <div ref={cardRef} style={{
      flex: '1 1 200px',
      minWidth: 0,
      borderRadius: 20,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
    }}>
      {/* Loading placeholder until widget renders */}
      {!loaded && (
        <div style={{
          width: '100%', height: 220,
          background: '#D5D5D5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/images/play-button.png" alt="Play" style={{ width: 40, height: 40, opacity: 0.5 }} />
        </div>
      )}
      <div
        ref={containerRef}
        style={{ width: '100%', overflow: 'hidden', minHeight: loaded ? undefined : 0 }}
      />
      <div style={{ padding: '12px 16px 16px' }}>
        <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 600, color: '#000000' }}>
          {title}
        </p>
      </div>
    </div>
  )
}

function VideoCard({ title, index }: { title: string; index: number }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 200px',
        borderRadius: 20,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,0.13)' : '0 4px 16px rgba(0,0,0,0.07)',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: '100%', height: 220,
        background: '#D5D5D5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <img
          src="/images/play-button.png"
          alt="Play"
          style={{
            width: 40, height: 40,
            transform: hov ? 'scale(1.12)' : 'scale(1)',
            transition: 'transform 0.15s',
          }}
        />
      </div>
      <div style={{ padding: '12px 16px 16px' }}>
        <p style={{ fontFamily: KANIT, fontSize: 14, fontWeight: 600, color: '#000000' }}>
          {title}
        </p>
      </div>
    </div>
  )
}

export function HighlightSection({ lastResult }: HighlightSectionProps) {
  const isMobile = useIsMobile()
  const winner = lastResult
    ? PETS.find(p => p.id === lastResult.positions[0])
    : null

  const clips = [
    `Round ${lastResult?.number ?? 1} — Race Start`,
    `Round ${lastResult?.number ?? 1} — Final Lap`,
    `Round ${lastResult?.number ?? 1} — Victory Lap`,
  ]

  return (
    <section style={{
      background: 'transparent',
      position: 'relative',
      paddingTop: 'clamp(60px, 8vw, 100px)',
      paddingBottom: 0,
    }}>

      {/* Ball — absolutely positioned, tracks content left edge (maxWidth 900 → half=450, +24px padding+220px width+20px gap) */}
      {!isMobile && (
        <img
          src="/images/hamster-ball.png"
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            top: 80,
            left: -30,
            width: 'clamp(300px, 28vw, 420px)',
            height: 'auto',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {/* Content — matches arena maxWidth exactly */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 24px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{
            fontFamily: KANIT,
            fontSize: 'clamp(20px, 2.5vw, 24px)',
            fontWeight: 500,
            color: '#000',
            marginBottom: 8,
          }}>
            Hamstar Highlights
          </h2>
          <p style={{
            fontFamily: 'Pretendard, sans-serif',
            fontWeight: 500,
            fontSize: 16,
            color: '#8A8A8A',
          }}>
            Catch the best moments from recent races.
          </p>
        </div>

        {/* Winner bar */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: isMobile ? '16px 20px' : '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#8A8A8A' }}>
            Round {lastResult?.number ?? '—'} Winner
          </span>
          <span style={{ fontFamily: 'Pretendard, sans-serif', fontSize: 14, fontWeight: 500, color: '#000' }}>
            {winner?.name ?? '—'}
          </span>
        </div>

        {/* Video cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <TweetVideoCard tweetUrl="https://x.com/hamstarkun/status/2038862948261880002" title={clips[0]} />
          {clips.slice(1).map((title, i) => (
            <VideoCard key={i} title={title} index={i + 1} />
          ))}
        </div>
      </div>

      {/* Bottom decoration strip */}
      <div style={{
        position: 'relative',
        marginTop: 72,
        // overflow visible so headset can rise above the oats
        overflow: 'visible',
      }}>
        {/* Tiled oats — fill strip top-to-bottom, no yellow above */}
        <div style={{
          width: '100%',
          height: isMobile ? 100 : 175,
          backgroundImage: 'url(/images/oats-pile.png), url(/images/oats-pile.png)',
          backgroundRepeat: 'repeat-x, repeat-x',
          backgroundSize: '380px auto, 380px auto',
          backgroundPosition: '0px -15px, 190px -15px',
        }} />

        {/* Hamster headset — sits on oats, rises above */}
        {!isMobile && (
          <img
            src="/images/hamster-headset.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              top: -100,
              right: 'calc(50% - 599px)',
              width: 189,
              height: 'auto',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
        )}
      </div>
    </section>
  )
}
