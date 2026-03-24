import type { CSSProperties } from 'react'

export interface DecoConfig {
  src: string
  label: string
  style: CSSProperties
}

export const DECOS = {
  'about-wheel': {
    src: '/images/hamster-wheel.png',
    label: 'About: Wheel',
    style: { left: 20, top: '50%', transform: 'translateY(-50%)', width: 'clamp(70px, 21vw, 320px)' } as CSSProperties,
  },
  'about-sunflower': {
    src: '/images/sunflower.png',
    label: 'About: Sunflower',
    style: { right: 20, bottom: 0, width: 'clamp(60px, 19vw, 290px)' } as CSSProperties,
  },
  'racers-sunflower': {
    src: '/images/sunflower.png',
    label: 'Racers: Sunflower',
    style: { left: 20, top: 30, width: 'clamp(60px, 16vw, 250px)' } as CSSProperties,
  },
  'racers-oats': {
    src: '/images/oats-pile.png',
    label: 'Racers: Oats',
    style: { left: 20, bottom: -120, width: 'clamp(100px, 31vw, 480px)' } as CSSProperties,
  },
  'racers-turbo': {
    src: '/images/hamster-turbo-pushup.png',
    label: 'Racers: Turbo',
    style: { right: 20, bottom: -50, width: 'clamp(80px, 23vw, 355px)' } as CSSProperties,
  },
  'arena-oats': {
    src: '/images/oats-pile.png',
    label: 'Arena: Oats',
    style: { right: 20, top: 120, width: 'clamp(80px, 22vw, 340px)' } as CSSProperties,
  },
  'arena-trophy': {
    src: '/images/hamster-trophy.png',
    label: 'Arena: Trophy',
    style: { left: 20, bottom: -130, width: 'clamp(70px, 20vw, 305px)' } as CSSProperties,
  },
  'arena-bridge': {
    src: '/images/wood-bridge.png',
    label: 'Arena: Bridge',
    style: { right: 20, bottom: -110, width: 'clamp(80px, 24vw, 370px)' } as CSSProperties,
  },
} satisfies Record<string, DecoConfig>

export type DecoId = keyof typeof DECOS
