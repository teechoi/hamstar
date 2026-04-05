// config/site.ts
// ─────────────────────────────────────────────────────────────────────────────
// HAMSTARHUB — SITE CONFIGURATION
// This is the only file you need to edit to update the site content.
// ─────────────────────────────────────────────────────────────────────────────

// ─── SITE & STREAM ────────────────────────────────────────────────────────────
export const SITE = {
  name: 'Hamstar',
  tagline: 'Who will be the Hamstar?',

  stream: {
    // Set isLive: true when a race is actively streaming (forces Arena → LIVE state)
    isLive: false,
    // Your pump.fun stream URL (opens in new tab when clicked)
    url: 'https://pump.fun',
    // Optional: link to last race replay (YouTube, etc.)
    replayUrl: '',
    // Current race number
    raceNumber: 1,
  },

  // ─── SOCIAL LINKS ──────────────────────────────────────────────────────────
  // Leave as empty string '' to hide the button
  socials: {
    twitter: 'https://twitter.com/hamstar',
    tiktok: 'https://tiktok.com/@hamstar',
    instagram: 'https://instagram.com/hamstar',
    youtube: 'https://youtube.com/@hamstar',
  },

  // Contact email for sponsorship inquiries
  sponsorEmail: 'sponsors@hamstar.gg',

  // ─── DEMO / PREVIEW ────────────────────────────────────────────────────────
  // Forces the Arena to show a specific state so all UI is visible.
  // Set to null (and deploy) to use the real race scheduler.
  //   'PREPARING' → gray "Opens Soon" buttons, countdown
  //   'OPEN'      → purple "Cheer" buttons, pool bar, cheering summary
  //   'LIVE'      → gray "Closed" buttons, race in progress
  //   'FINISHED'  → gold winner glow, champion row, View Full Result enabled
  demo: {
    arenaState: null as 'PREPARING' | 'OPEN' | 'LIVE' | 'FINISHED' | null,
  },
}

// ─── PETS ─────────────────────────────────────────────────────────────────────
// Edit these to update racer profiles.
//
// For 'image': put a photo file in /public/pets/ and reference as '/pets/dash.jpg'
// Or use any external image URL (Cloudinary, etc.)
// Leave image as '' to show the emoji instead.
// ─────────────────────────────────────────────────────────────────────────────
export interface Pet {
  id: string
  name: string
  number: number
  emoji: string
  team: string
  tagline: string
  bio: string
  color: string
  speed: number      // 1–100 display stat
  chaos: number      // 1–100 display stat
  wins: number
  snackLevel: number // 0–100 lifestyle display
  cageLevel: number  // 0–100 lifestyle display
  image?: string     // Optional pet photo URL
  sponsors: { name: string; emoji: string; url?: string }[]
}

export const PETS: Pet[] = [
  {
    id: 'dash',
    name: 'Dash',
    number: 1,
    emoji: '🐹',
    team: 'Team Dash',
    tagline: "Always ready. Always fast.",
    bio: "The people's champion. Dash runs on pure heart, crowd energy, and sunflower seeds. Three podiums deep and still hungry. The wheel belongs to him — at least, that's what he thinks.",
    color: '#FF3B3B',
    speed: 78,
    chaos: 45,
    wins: 3,
    snackLevel: 65,
    cageLevel: 70,
    image: '',
    sponsors: [],
  },
  {
    id: 'flash',
    name: 'Flash',
    number: 2,
    emoji: '🐿️',
    team: 'Team Flash',
    tagline: 'Chaos energy. Anything can happen.',
    bio: "Nobody knows what Flash will do next — not even Flash. Last place one lap, podium the next. Built different. Wired wrong. The most entertaining racer on the wheel and the most dangerous bet you'll ever make.",
    color: '#FF00CC',
    speed: 83,
    chaos: 91,
    wins: 2,
    snackLevel: 45,
    cageLevel: 90,
    image: '',
    sponsors: [],
  },
  {
    id: 'turbo',
    name: 'Turbo',
    number: 3,
    emoji: '🐭',
    team: 'Team Turbo',
    tagline: 'Fast. Focused. Never the same twice.',
    bio: "Don't let the calm fool you. Turbo clocks every corner, memorizes every split, and executes with surgical precision. Quiet. Cold. Dangerous. The dark horse who always shows up when it counts.",
    color: '#00D4FF',
    speed: 71,
    chaos: 62,
    wins: 1,
    snackLevel: 80,
    cageLevel: 55,
    image: '',
    sponsors: [],
  },
]

// ─── RACE HISTORY ─────────────────────────────────────────────────────────────
// Add completed races here after each event.
// positions: pet IDs in finishing order [1st, 2nd, 3rd]
export interface RaceResult {
  number: number
  date: string       // e.g. '2025-03-01'
  positions: string[] // e.g. ['dash', 'flash', 'turbo']
}

export const RACE_HISTORY: RaceResult[] = [
  { number: 1, date: '2026-01-15', positions: ['flash', 'dash',  'turbo'] },
  { number: 2, date: '2026-02-05', positions: ['turbo', 'flash', 'dash']  },
  { number: 3, date: '2026-03-10', positions: ['dash',  'turbo', 'flash'] },
]

// ─── MEDIA ────────────────────────────────────────────────────────────────────
// Add videos and photos to the Community gallery here.
//
// HOW TO HOST YOUR MEDIA:
// ─────────────────────────────────────────────────────────────────────────────
// IMAGES:
//   Option A (simple) — Put image files in /public/media/ folder
//     then reference as: url: '/media/my-photo.jpg'
//
//   Option B (recommended) — Cloudinary (free tier, great CDN)
//     Sign up at cloudinary.com → upload → copy URL
//
// VIDEOS:
//   YouTube — upload → copy watch URL for 'url', get thumbnail:
//     https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
//   TikTok — copy the post URL for 'url'
//   pump.fun replay — copy the replay URL for 'url'
//
// For VIDEO cards, clicking opens the url in a new tab.
// For PHOTO cards, clicking opens the image url in a new tab.
// ─────────────────────────────────────────────────────────────────────────────
export interface MediaItem {
  id: string
  type: 'VIDEO' | 'PHOTO'
  title: string
  description?: string
  url: string         // Link to video or full-size image
  thumbnail?: string  // Preview image URL (especially important for videos)
  duration?: string   // e.g. '2:34' — show on video cards
  featured: boolean   // Featured items appear first
  publishedAt: string // e.g. '2025-03-01'
}

export const MEDIA: MediaItem[] = [
  // Video example:
  // {
  //   id: 'race1-highlight',
  //   type: 'VIDEO',
  //   title: 'Race #1 Highlights',
  //   description: 'The moment Dash took the lead in the final stretch.',
  //   url: 'https://youtube.com/watch?v=YOUR_VIDEO_ID',
  //   thumbnail: 'https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg',
  //   duration: '2:14',
  //   featured: true,
  //   publishedAt: '2025-03-01',
  // },
  // Photo example:
  // {
  //   id: 'turbo-cage',
  //   type: 'PHOTO',
  //   title: "Turbo in the new deluxe cage",
  //   url: '/media/turbo-cage.jpg', // put file at /public/media/turbo-cage.jpg
  //   featured: false,
  //   publishedAt: '2025-03-01',
  // },
]

// ─── SPONSORS ─────────────────────────────────────────────────────────────────
export interface Sponsor {
  id: string
  name: string
  emoji: string
  tier: 'TITLE' | 'GOLD' | 'SILVER'
  petId?: string  // Which pet they sponsor ('dash' | 'turbo' | 'flash')
  url?: string    // Sponsor's website — makes their card clickable
}

export const SPONSORS: Sponsor[] = [
  // { id: 's1', name: 'AcmeCorp', emoji: '🚀', tier: 'GOLD', url: 'https://acme.com' },
]

// ─── ARENAS ROADMAP ───────────────────────────────────────────────────────────
export const ROADMAP = [
  {
    icon: '🏁',
    title: 'Arena 1 — The Basic Track',
    desc: 'Where it all starts. Clean, no-frills setup. The foundation of every legend.',
    status: 'CURRENT' as const,
  },
  {
    icon: '🌿',
    title: 'Arena 2 — Crumble Cove',
    desc: 'Nature-themed maze. Grass terrain, pebbles, tiny water feature, hidden shortcuts.',
    status: 'PLANNED' as const,
  },
  {
    icon: '⚡',
    title: 'Arena 3 — Neon Drift Circuit',
    desc: 'Night track. Neon walls, fog machines, electric atmosphere, boss-level vibes.',
    status: 'VISION' as const,
  },
  {
    icon: '❓',
    title: 'Arena 4 — Community Choice',
    desc: 'You submit blueprints. You vote. The winner gets built. Your name on it forever.',
    status: 'MYSTERY' as const,
  },
]
