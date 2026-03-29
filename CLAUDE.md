# HamstarHub — Design System & Codebase Rules

## Styling Approach

**All styling uses inline `React.CSSProperties` objects.** There is no Tailwind, no CSS Modules, no Styled Components, no shadcn/ui, no external component library.

```tsx
// ✅ Correct pattern
<div style={{ display: 'flex', gap: 16, padding: '24px 32px', borderRadius: 16 }}>

// ❌ Never use Tailwind classes
<div className="flex gap-4 p-6 rounded-2xl">
```

Hover states are handled with `useState`:
```tsx
const [hovered, setHovered] = useState(false);
<button
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
  style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'all 0.15s ease-out' }}
/>
```

---

## Design Tokens

**Source of truth:** `/lib/theme.ts`

```typescript
export const T = {
  // Base
  bg: '#F8F9FA',         // Page background
  card: '#FFFFFF',       // Card / modal background
  cardAlt: '#F8F9FA',    // Alternate card background
  text: '#000000',       // Primary text (on white)
  textMid: '#8A8A8A',    // Secondary / muted text
  textMuted: '#8A8A8A',  // Placeholder text
  border: '#E9E9E9',     // Divider lines
  borderDark: '#D5D5D5', // Emphasized border

  // Brand
  yellow: '#FFE790',     // Main accent — nav, footer, primary buttons
  purple: '#735DFF',     // Secondary accent — CTAs, announcement bar
  sub2: '#503F00',       // Text on yellow backgrounds

  // Semantic aliases (used by existing components)
  lime: '#FFE790',       // → yellow (primary button bg)
  limeDark: '#F5D850',   // → yellow hover
  limeText: '#000000',   // → text on yellow
  blue: '#735DFF',       // → purple (outline button)
  coral: '#FF3B5C',      // Error / danger (unchanged)
  coralSoft: '#FFF0F3',  // Soft error bg (unchanged)
  green: '#735DFF',      // → purple (live indicator)
  greenSoft: 'rgba(115,93,255,0.1)', // → purple soft bg
};
```

Always import and use `colors` from `/lib/theme.ts` — never hardcode hex values for these tokens.

**Landing page / nav exception:** `#0D0D14` is used only as a near-black overlay background for the scrolled nav and mobile menu — do not use it as a text color.

---

## Typography

**Two fonts only — never use others:**
- **Kanit** — headings (h1–h4), nav pills, display text. Loaded via `next/font/google` in `/lib/fonts.ts` as CSS variable `--font-kanit`.
- **Pretendard** — all body/paragraph text, links, labels. Loaded from CDN in `/app/layout.tsx`.

```tsx
const KANIT = "var(--font-kanit), sans-serif"
const PRETENDARD = "Pretendard, sans-serif"

<h1 style={{ fontFamily: KANIT, fontWeight: 700, fontSize: 40 }} />
<p style={{ fontFamily: PRETENDARD, fontWeight: 500, fontSize: 16 }} />
```

**Body default:** `fontFamily: 'Pretendard', sans-serif` is set on `<body>` — text without explicit fontFamily inherits Pretendard automatically.

**Monospace** (Solana addresses, timers): `fontFamily: 'monospace'`

---

## Components

**Location:** `/components/ui/index.tsx`

Available core components:
- `LimeButton` — Primary CTA (lime background, dark text, scale hover)
- `OutlineButton` — Secondary action (border, fills on hover)
- `Tag` — Badge with customizable `bg`, `color`, `border` props
- `RaceBar` — Horizontal progress bar with `pct`, `color`, `label` props
- `LivePulse` — Animated pulsing "LIVE" dot indicator
- `CheckerBar` — Decorative checkerboard divider
- `SolAddress` — Displays + copies Solana wallet address
- `useIsMobile` — Hook, returns `true` if viewport ≤ 768px

When generating code from Figma designs, map Figma components to these first before creating new ones.

---

## Responsive Design

Single breakpoint: **768px** (mobile)

```tsx
const isMobile = useIsMobile(); // from /components/ui/index.tsx
<div style={{ padding: isMobile ? '16px' : '32px 48px' }} />
```

Use `clamp()` for fluid typography/spacing:
```tsx
fontSize: 'clamp(20px, 3vw, 36px)'
padding: 'clamp(16px, 4vw, 48px)'
```

---

## Icons

**No icon library.** Use emoji characters directly in JSX:
- `🐹` Hamster logo
- `✓` Checkmark
- `◎` Solana symbol
- `×` Close/dismiss

---

## Assets

- **Images:** `/public/images/*.png` — 29 active PNGs (see list below)
- **Reference via:** `/images/filename.png` (no optimization — `unoptimized` in next.config.js)
- **CDN:** Cloudinary (`**.cloudinary.com`) for admin-uploaded media
- **Archive:** Unused images moved to `/_archive/images/` — do not use those

**Active images:**
```
arena-bg-blurred, arena-bridge, arena-oats, arena-trophy-hamster
carousel-champion, carousel-join-race, carousel-pick-hamster, carousel-watch-race
cheese-hideout, hamster-arena-left, hamster-ball, hamster-dash, hamster-entry
hamster-flash-flex, hamster-flash, hamster-headset, hamster-pet-right
hamster-turbo-pushup, hamster-turbo, hamster-wheel-empty, hamster-wheel
hero-hamsters, oats-pile-a, oats-pile-b, oats-pile, play-button
sunflower-seed, sunflower, video-thumbnail
```

Import images with plain `<img>` tag:
```tsx
<img src="/images/hamster-dash.png" alt="Dash" style={{ width: 120, height: 'auto' }} />
```

---

## Project Structure

```
app/
  layout.tsx              # Root layout — fonts, body styles
  page.tsx                # → HomeLanding (landing page)
  arena/page.tsx          # → ArenaClient (race arena)
  pet/page.tsx            # → PetPageClient (hamster profiles)
  sponsors/page.tsx       # → SponsorsPageClient
  highlights/page.tsx     # → HighlightPageClient
  admin/                  # Password-protected admin panel
  api/                    # API routes (admin + public /api/settings)

components/
  ui/index.tsx            # Core UI: LimeButton, OutlineButton, Tag, RaceBar, LivePulse, CheckerBar, SolAddress, useIsMobile
  landing/                # Landing page sections + all modals
  arena/                  # ArenaClient, HamsterCard, HighlightSection, HighlightPageClient
  pet/                    # PetPageClient
  sponsors/               # SponsorsPageClient
  editor/                 # Decoration layer editor (admin-only)

lib/
  theme.ts                # Design tokens (T object) + globalStyles
  fonts.ts                # Kanit font loader
  race-scheduler.ts       # Deterministic 48h race schedule
  helius.ts               # Solana webhook processor
  auth.ts                 # JWT session (jose, edge-safe)
  prisma.ts               # PrismaClient singleton
  supabase.ts             # Realtime client
  hooks/useRace.ts        # Race data hook + Supabase realtime + 30s polling fallback
  hooks/useCountdown.ts   # Countdown timer hook

config/
  site.ts                 # PETS array, SITE config, RACE_HISTORY
  decorations.ts          # Decorative image layer config

public/images/            # 29 active PNG assets
_archive/                 # Old code/docs/images — do not import from here
prisma/schema.prisma      # Database schema
scripts/                  # Seed + setup scripts
types/index.ts            # Shared TypeScript types
```

Path alias: `@/` maps to project root.

**Content widths by page:**
- Landing: `maxWidth: 1280`
- Arena + Highlights: `maxWidth: 900`
- Pet: `maxWidth: 960`
- Admin: unstyled

---

## Global Styles

Minimal global CSS injected as a string in `/lib/theme.ts` (`globalStyles`) and via inline `<style>` tags:
- CSS reset: `box-sizing: border-box; margin: 0; padding: 0`
- Body: `background: #F8F9FA; color: #000000; font-family: Pretendard`
- Keyframes: `pulse`, `petIdle`, `raceBounce`
- Scrollbar: 6px width, thumb `#D5D5D5`
- Selection highlight: `rgba(115,93,255,0.2)` (purple tint)

Do not add new global CSS files. Inject additional keyframes via `<style>` tags when needed.

---

## Decorative Image Positioning Patterns

Two established patterns for absolutely-positioned decorative images:

**1. "Always peek from wall"** — fixed negative offset from viewport edge
```tsx
// Ball always peeks from left wall regardless of viewport width
style={{ position: 'absolute', top: 80, left: -30, width: 'clamp(300px, 28vw, 420px)' }}
```

**2. "Track content center"** — anchored to content, floats beside it
```tsx
// Hamster tracks right edge of maxWidth: 900 content column
style={{ position: 'absolute', top: 220, left: 'calc(50% + 420px)', width: 'clamp(300px, 28vw, 440px)' }}
// Must wrap in a section with overflow: hidden to clip on narrow viewports
```

**Glow blobs** — never use negative offsets (causes viewport clipping):
```tsx
// Gold blob — bottom-left corner
<div style={{ position: 'absolute', bottom: 0, left: 0, width: 700, height: 700,
  borderRadius: '50%', background: 'rgba(252,212,0,0.22)', filter: 'blur(100px)',
  pointerEvents: 'none', zIndex: 0 }} />
// Purple blob — top-right corner
<div style={{ position: 'absolute', top: 200, right: 0, width: 600, height: 600,
  borderRadius: '50%', background: 'rgba(115,93,255,0.14)', filter: 'blur(100px)',
  pointerEvents: 'none', zIndex: 0 }} />
```
On tall pages (arena), use `top: '55vh'` instead of `bottom: 0` for gold blob so it stays in viewport.
Parent `<main>` must NOT have `overflow: hidden` or blobs will be clipped.

---

## Figma → Code Checklist

When translating a Figma design to code:
1. Map colors to tokens in `/lib/theme.ts` (see T object above)
2. Use inline `React.CSSProperties` — no class names
3. Reuse components from `/components/ui/index.tsx` where applicable
4. Use `useIsMobile()` for responsive behavior
5. Headings/nav → Kanit (`var(--font-kanit), sans-serif`), body text → Pretendard (`Pretendard, sans-serif`)
6. All pill buttons → `borderRadius: 48.5`
7. Max content width → `maxWidth: 1280`, centered with `margin: '0 auto'`
8. Reference existing `/public/images/` assets where possible
9. Hover states via `useState` + `onMouseEnter`/`onMouseLeave`
