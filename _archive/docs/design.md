# Hamstar — Design Document

## Current State

The landing page is the only page that exists. It is the established style. Everything built going forward should match it.

---

## Product Vision

Hamstar is a live hamster racing platform built around a simple, irresistible premise: three real hamsters race on a physical track while an internet audience watches live. It's tiny, fast, and unpredictable — just like the hamsters.

The tagline is: **"The smallest sport on the internet."**

The product lives at the intersection of entertainment, community, and crypto. Races are streamed live on Pump.fun. The audience watches, cheers for their favourite racer, and returns to see who won.

---

## Brand Identity

### Voice
- Short, punchy, confident
- Slightly irreverent — this is hamster racing, not Formula 1
- Treats the hamsters like real athletes with real narratives
- Minimal hype, maximum personality

### Color Palette

| Name       | Hex       | Usage |
|------------|-----------|-------|
| Gold       | `#F5D050` | Primary accent — CTA buttons, nav pills, footer background |
| Dark       | `#0D0D14` | Hero background, dark text |
| Light Grey | `#F0F0F0` | Section backgrounds (About, Racers, Arena) |
| White      | `#FFFFFF` | Racer cards, text on dark backgrounds |
| Blue accent| `#3b82f6` | Editor UI only |

### Typography
- **Headlines:** Inter / Helvetica Neue, weight 900, tight letter-spacing (-0.5 to -2)
- **Body:** Inter, weight 500, line-height 1.75
- **Monospace:** used for nav pills, editor UI, countdown timer
- Responsive sizing via `clamp()` throughout — never fixed px for type

### Motion
- Hover states on all interactive elements
- Buttons: `scale(1.04)` + deeper box-shadow on hover
- Racer cards: `translateY(-6px)` lift on hover
- Nav: smooth `background` + `backdrop-filter` fade-in on scroll
- Page scroll: `scroll-behavior: smooth`
- Transition duration: 0.15–0.2s `ease-out` throughout

---

## Page Structure

The landing page is a single-page scroll with 5 sections + footer.

```
[Nav — fixed]
[Hero]
[About]
[Racers]
[Arena]
[Footer]
```

### Nav
- Fixed, full-width, transparent over hero → dark glass on scroll
- Tagline strip above nav row: "The smallest sport on the internet."
- Nav pills: HOME · PET · ARENA · SPONSORS (gold outlined pills)
- "How Hamstar Works" ghost pill (white, softer)
- All items scroll to their section (no page navigation)

---

## Sections

### 1. Hero
- Full-viewport dark section (`#0D0D14`, `min-height: 100vh`)
- Background: `hero-hamsters.png` — a full-bleed image of the three racers
- Top gradient: darkens top 35% so nav text stays readable
- Bottom gradient: fades bottom 20% into the next section
- **Headline:** "Who Will Be The Hamstar?" — 900 weight, `clamp(40px, 6vw, 82px)`, white
- **Subline:** "Three hamsters race. One takes the wheel." — muted white, medium weight
- **CTA:** Gold pill button "Watch Live Race" → opens pump.fun stream in new tab
- CTA is pushed to the bottom of the viewport with a flex spacer

### 2. About
- Background: `#F0F0F0`
- Padding: 80px vertical
- Section heading flanked by two sunflower seed icons (24px, 80% opacity)
- Body copy in centered column, max-width 900px, `clamp(15px, 1.8vw, 18px)`
- Key copy: "Real hamsters. Real races. One tiny champion." (bold)
- **Decorative images:**
  - Left: `hamster-wheel.png` — vertically centered, `clamp(70px, 21vw, 320px)` wide
  - Right: `sunflower.png` — anchored to bottom-right, `clamp(60px, 19vw, 290px)` wide

### 3. Racers
- Background: `#F0F0F0`
- Padding: `80px 24px 160px` (extra bottom creates space for overhanging decos)
- Section heading: "Meet the Racers" with seed icons
- Three racer cards in a centered flex row, each max 280px wide
  - White cards, border `1.5px solid #D8D8D8`, border-radius 20px
  - Hover: lifts `6px`, deeper shadow
  - Racer image: 130×130px, contain
  - Name (900 weight, 20px), tagline (grey, 13px)
- **Decorative images:**
  - Left top: `sunflower.png` — `clamp(60px, 16vw, 250px)` wide, top 30px
  - Left bottom: `oats-pile.png` — extends below section (`bottom: -120px`), `clamp(100px, 31vw, 480px)` wide
  - Right bottom: `hamster-turbo-pushup.png` — extends below section (`bottom: -90px`), `clamp(80px, 23vw, 355px)` wide

### 4. Arena
- Background: `#F0F0F0`
- Padding: `200px 24px 0` (tall top padding to clear images overhanging from Racers section)
- Section heading: "Hamstar Arena" with seed icons
- Subtext: "Hamstar races are streamed live on Pump.fun."
- **Countdown / Live card** (max-width 600px, centered):
  - Background: `arena-bg-blurred.png` full-bleed with `rgba(13,13,20,0.65)` overlay
  - Border-radius 20px, box-shadow
  - When not live: shows countdown timer `HH:MM:SS` in monospace 900 weight
  - When live: shows "LIVE NOW" + pulsing animation
  - Gold CTA button "Watch Live Race"
  - Caption: "Race will be streamed live on Pump.fun"
- **Seed row** at bottom: 14 sunflower seeds at 52px, slightly transparent, full-width centered flex
- **Decorative images:**
  - Right top: `oats-pile.png` — top 10px, `clamp(80px, 22vw, 340px)` wide
  - Left bottom: `hamster-trophy.png` — extends below section (`bottom: -130px`), `clamp(70px, 20vw, 305px)` wide
  - Right bottom: `wood-bridge.png` — extends below section (`bottom: -110px`), `clamp(80px, 24vw, 370px)` wide

### 5. Footer
- Background: Gold (`#F5D050`)
- `padding-top: 160px` — clears the arena decorative images that hang below
- Left column: "Hamstar" brand name + tagline + Social links (X, YouTube, Instagram, TikTok) + Learn links
- Right column: "Real hamsters. Real races. One tiny champion." tagline + Contact email
- Dashed divider
- Legal bar: Terms of Use · Risk Disclosure · Animal Welfare · Privacy Policy

---

## The Racers

Three real hamsters. Each with a distinct personality and color identity.

### Dash — #1
- **Color:** Red `#FF3B3B`
- **Tagline:** "Dash doesn't lose. Until he does."
- **Bio:** The people's champion. Runs on pure heart, crowd energy, and sunflower seeds. Three podiums deep. The wheel belongs to him — at least, that's what he thinks.
- **Stats:** Speed 78 · Chaos 45 · Wins 3

### Turbo — #2
- **Color:** Cyan `#00D4FF`
- **Tagline:** "Turbo is studying your favorite."
- **Bio:** Don't let the calm fool you. Clocks every corner, memorizes every split, executes with surgical precision. Quiet. Cold. Dangerous.
- **Stats:** Speed 71 · Chaos 62 · Wins 1

### Flash — #3
- **Color:** Hot pink `#FF00CC`
- **Tagline:** "Flash is unpredictable. That is the point."
- **Bio:** Nobody knows what Flash will do next — not even Flash. Last place one lap, podium the next. The most entertaining racer and the most dangerous bet.
- **Stats:** Speed 83 · Chaos 91 · Wins 2

---

## Arena Roadmap

Arenas are physical tracks that get built over time. The roadmap gives the project an ongoing story arc.

| Arena | Name | Status |
|-------|------|--------|
| 1 | The Basic Track | CURRENT |
| 2 | Crumble Cove | PLANNED — grass terrain, pebbles, water feature, hidden shortcuts |
| 3 | Neon Drift Circuit | VISION — night track, neon walls, fog machines |
| 4 | Community Choice | MYSTERY — community submits blueprints and votes |

---

## Decorative Image System

Decorative images are the personality of the page. They sit at section edges, overlap section boundaries, and give the page depth and character.

### Design Rules
- Images are absolutely positioned within their parent section using `position: absolute`
- They participate in the **root stacking context** at `zIndex: 50` — sections have no explicit `zIndex` so they do not create isolated stacking contexts that would trap the images
- Cross-boundary images use negative `bottom` values (e.g. `bottom: -120px`) to physically extend below their section
- All sizes use `clamp(minPx, vw%, maxPx)` for responsive scaling — hides on mobile (`max-width: 640px`)
- Images never have `overflow: hidden` on their section — they must be free to overflow

### Current Decos

| ID | Image | Position | Width |
|----|-------|----------|-------|
| about-wheel | hamster-wheel.png | Left, vertically centered | clamp(70px, 21vw, 320px) |
| about-sunflower | sunflower.png | Right, bottom | clamp(60px, 19vw, 290px) |
| racers-sunflower | sunflower.png | Left, top 30px | clamp(60px, 16vw, 250px) |
| racers-oats | oats-pile.png | Left, bottom -120px | clamp(100px, 31vw, 480px) |
| racers-turbo | hamster-turbo-pushup.png | Right, bottom -90px | clamp(80px, 23vw, 355px) |
| arena-oats | oats-pile.png | Right, top 10px | clamp(80px, 22vw, 340px) |
| arena-trophy | hamster-trophy.png | Left, bottom -130px | clamp(70px, 20vw, 305px) |
| arena-bridge | wood-bridge.png | Right, bottom -110px | clamp(80px, 24vw, 370px) |

### Deco Editor
A built-in visual editor (accessible via the "Edit Images" button at bottom-right) allows drag, resize, hide, duplicate, and upload of decorative images without touching code. Positions are saved to `localStorage`. The "Copy Config" button exports a TypeScript snippet to paste into `config/decorations.ts`.

---

## Future Pages

These pages don't exist yet. When they are built, they must match the landing page style exactly — same colors, typography, motion, and decorative image approach.

### `/pet/[id]` — Racer Profile
- Full bio, stats, win record, sponsor section
- Uses the racer's color identity from `config/site.ts`

### `/arena` — Arena Page
- Full roadmap display, current arena details, upcoming teasers

### `/sponsors` — Sponsor Page
- Sponsor tiers, what's included, contact CTA

### `/admin` — Admin Panel (private)
- Race results entry, live toggle, media management

---

## Technical Stack

- **Framework:** Next.js 14 App Router
- **Styling:** Inline CSS (style props) — no CSS framework
- **Database:** Supabase (PostgreSQL) via Prisma ORM
- **Blockchain:** Solana — Helius webhook for on-chain race data
- **Media:** Cloudinary for hosted images / `public/images/` for local assets
- **Deployment:** Vercel

### Key Architecture Notes
- Server components handle data fetching (race timing, etc.)
- Client components handle interactivity (`'use client'` directive)
- Race timing computed server-side in `page.tsx`, passed as props to avoid client clock issues
- `config/site.ts` is the single source of truth for all content (racers, sponsors, race history, social links)
- `config/decorations.ts` defines all hardcoded deco image positions
- Editor state (positions, custom decos, hidden state) lives in `localStorage` — exported to code via Copy Config
