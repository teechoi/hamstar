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
    // Figma 25:404 — left=-147, top=48, w=387, rotation=0.4585rad (26.3°)
    style: { left: -147, top: 48, width: 387, height: 399, transform: 'rotate(26.3deg)', transformOrigin: '50% 50%' } as CSSProperties,
  },
  'racers-oats': {
    src: '/images/oats-pile-a.png',
    label: 'Racers: Oats A',
    // Figma 25:403 — left=80 at 1280px → calc(50% - 560px) to track card centering
    style: { left: 'calc(50% - 560px)', top: 426, width: 266 } as CSSProperties,
  },
  'racers-oats-2': {
    src: '/images/oats-pile-b.png',
    label: 'Racers: Oats B',
    // Figma 25:372 — left=213 at 1280px → calc(50% - 427px)
    style: { left: 'calc(50% - 427px)', top: 455, width: 256 } as CSSProperties,
  },
  'racers-turbo': {
    src: '/images/hamster-turbo-pushup.png',
    label: 'Racers: Turbo',
    // Figma 25:543 — left=962 at 1280px → calc(50% + 322px) to track card centering; zIndex 70 to render above cards
    style: { left: 'calc(50% + 322px)', top: 447, width: 306, zIndex: 70 } as CSSProperties,
  },
  'arena-oats': {
    src: '/images/arena-oats.png',
    label: 'Arena: Oats',
    // Figma 25:675 — frame-relative left=1055, top=140, w=348; inside 1280px canvas div
    style: { left: 1055, top: 140, width: 348 } as CSSProperties,
  },
  'arena-trophy': {
    src: '/images/arena-trophy-hamster.png',
    label: 'Arena: Trophy Hamster',
    // Figma 25:410 — left=-152 at 1280px frame; min() caps at -150px so it stays at left edge on wide monitors
    style: { left: 'min(calc(50% - 870px), -150px)', top: 349, width: 448, height: 444, transform: 'rotate(17.63deg)', transformOrigin: '50% 50%' } as CSSProperties,
  },
  'arena-bridge': {
    src: '/images/arena-bridge.png',
    label: 'Arena: Bridge',
    // Figma 25:434 — frame-relative left=819, top=495, w=404; inside 1280px canvas div
    style: { left: 819, top: 495, width: 404 } as CSSProperties,
  },
} satisfies Record<string, DecoConfig>

export type DecoId = keyof typeof DECOS
