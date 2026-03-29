# HamstarHub — Site Summary & Build Status

## What Is This

HamstarHub is a live hamster racing platform where users cheer for real hamsters competing in races streamed on Pump.fun. Users connect a Solana wallet, pick a hamster to support, and send SOL to that hamster's wallet address. Supporters of the winning hamster share the reward pool. Races run on a deterministic 48-hour schedule.

---

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomeLanding` | Landing page — hero, racers section, arena countdown, about, footer |
| `/arena` | `ArenaClient` | Main race page — hamster cards, pool bar, cheer buttons, highlights |
| `/pet` | `PetPageClient` | Hamster profiles — stats, bio, selector tabs |
| `/sponsors` | `SponsorsPageClient` | Sponsor showcase with tier badges |
| `/highlights` | `HighlightPageClient` | Media gallery — race videos and photos |
| `/admin/*` | Admin panel | Race management, pets, sponsors, media, settings, content |

---

## Components

### Landing (`components/landing/`)
- **`HomeLanding`** — Root landing container; manages all modal state and auth state
- **`LandingNav`** — Sticky nav with tagline strip, logo, pills, auth buttons, mobile menu
- **`HeroSection`** — Full-viewport hero with headline, hamsters image, Watch Live CTA
- **`RacersSection`** — 3-hamster display cards with hover "Cheer Me!" badge
- **`AboutSection`** — Static info about how races work
- **`ArenaSection`** — Live countdown card with timer and stream badge
- **`LandingFooter`** — Links, tagline, social icons
- **`LoginModal`** — Auth options: X, Discord, Telegram, Phantom
- **`DepositModal`** — QR placeholder + wallet address copy
- **`AccountModal`** — Wallet display, balance, deposit/disconnect actions
- **`HowItWorksModal`** — 4-step carousel: Pick → Join → Watch → Collect
- **`TermsModal`** — Accept terms gate before login

### Arena (`components/arena/`)
- **`ArenaClient`** — Full arena page; state machine (PREPARING → OPEN → LIVE → FINISHED), mock support data, modal management
- **`HamsterCard`** — Per-hamster card: image, stats, support bar, cheer button (state-aware)
- **`HighlightSection`** — Video highlight cards with oats strip + headset hamster decorative

### Pet (`components/pet/`)
- **`PetPageClient`** — Selector tabs + profile card (photo panel + stats)

### Sponsors (`components/sponsors/`)
- **`SponsorsPageClient`** — Tier cards (TITLE/GOLD/SILVER), placeholder cards when no sponsors

### Highlights (`components/arena/`)
- **`HighlightPageClient`** — Media gallery grid, featured items first, opens URL on click

### UI (`components/ui/index.tsx`)
- `LimeButton`, `OutlineButton`, `Tag`, `RaceBar`, `LivePulse`, `CheckerBar`, `SolAddress`
- `useIsMobile()` hook (breakpoint: 768px)

---

## Database Schema (Prisma / Postgres)

| Table | Purpose |
|-------|---------|
| `Pet` | Hamster profiles: name, slug, walletAddress, stats, wins, upgrade levels |
| `Race` | Race instances: number, status (UPCOMING/LIVE/FINISHED), timestamps |
| `RaceEntry` | Per-pet per-race: position (1/2/3), totalSol accumulated |
| `Donation` | Solana tx records: txSignature, walletAddress, amountSol, type, alias |
| `Sponsor` | Sponsor cards: name, tier, petId, solPerRace, websiteUrl |
| `UpgradeItem` | Snack/cage upgrade catalog: tier, cost in SOL |
| `PetUpgrade` | Join table: which pets have unlocked which upgrades |
| `Media` | Videos/photos: url, thumbnail, featured flag |
| `SiteSettings` | Singleton: raceNumber, isLive, streamUrl, all content/social fields |

---

## API Routes

### Public
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/settings` | Fetch site settings |

### Admin (cookie-protected)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/login` | Set session cookie ⚠️ stub — no validation |
| POST | `/api/admin/logout` | Clear session cookie |
| GET | `/api/admin/dashboard` | Stats: SOL totals, race number, recent donations |
| GET/PATCH | `/api/admin/settings` | Read/update all site settings |
| GET/PATCH | `/api/admin/pets/[id]` | Read/update pet stats and content |
| GET/POST | `/api/admin/sponsors` | List/create sponsors |
| PATCH/DELETE | `/api/admin/sponsors/[id]` | Toggle active / delete |
| GET/POST | `/api/admin/media` | List/create media |
| PATCH/DELETE | `/api/admin/media/[id]` | Toggle featured / delete |
| GET | `/api/admin/race/current` | Fetch active race |
| POST | `/api/admin/race/finish` | Record positions, increment wins |
| POST | `/api/admin/upload` | File upload |

---

## Key Libraries (`lib/`)

| File | Purpose |
|------|---------|
| `race-scheduler.ts` | Deterministic 48h race windows, countdown math, no cron needed |
| `helius.ts` | Solana webhook processor — parses transfers, creates Donation records, unlocks upgrades |
| `auth.ts` | JWT session signing/verification (jose, edge-safe) |
| `prisma.ts` | PrismaClient singleton |
| `supabase.ts` | Realtime subscription client |
| `hooks/useRace.ts` | React hook — fetches race data, Supabase realtime + 30s polling fallback |
| `theme.ts` | Design tokens (T object), global styles, keyframes |
| `fonts.ts` | Kanit font loading |

---

## Mock Data (to be replaced with real data)

All located in `components/arena/ArenaClient.tsx`:

```ts
const MOCK_SUPPORT = {
  dash:  { pct: 42, supporters: 12, sol: 4.1 },
  flash: { pct: 31, supporters: 9,  sol: 3.0 },
  turbo: { pct: 27, supporters: 7,  sol: 2.6 },
}
const MOCK_TOTAL_SOL   = 9.7
const MOCK_POOL_TARGET = 20
```

Also: `RACE_HISTORY` in `config/site.ts` has 3 hardcoded past race results.

---

## All Buttons — Wired vs. Placeholder

### ✅ Fully Working
- All navigation links (Home, Arena, Pet, Sponsors)
- "How Hamstar Works" modal carousel (all 4 steps)
- Terms modal accept → login modal flow
- "Watch Live Race" → opens `SITE.stream.url`
- Copy wallet address in deposit modal
- Account modal deposit / disconnect (local state)
- Arena state machine display (PREPARING / OPEN / LIVE / FINISHED)
- All admin panel buttons (race toggle, finish race, pet editor, sponsor manager, media, settings, content)

### ⚠️ Partially Working (UI exists, not connected)
- "Log In" / "Sign Up" — opens modal but `onLogin()` is a stub; sets `authed=true` with no real auth
- "Cheer [Hamster]" — triggers login check, but no donation flow after auth
- "Deposit Funds" — shows modal with QR placeholder, no real QR or payment processing
- "Disconnect" — clears local React state only, no server-side session invalidation

### ❌ Not Implemented
| Button / Feature | Location | Notes |
|-----------------|----------|-------|
| Login with X | `LoginModal` | No OAuth endpoint |
| Login with Discord | `LoginModal` | No OAuth endpoint |
| Login with Telegram | `LoginModal` | No OAuth endpoint |
| Login with Phantom (sign-in) | `LoginModal` | No wallet auth |
| Connect Phantom Wallet | `DepositModal`, `AccountModal` | No `@solana/wallet-adapter` integration |
| QR code generation | `DepositModal` | Gray placeholder box |
| Cheer → send SOL | `HamsterCard` | No transaction construction |
| Realtime support % updates | `ArenaClient` | Using MOCK_SUPPORT; `useRace` hook exists but not wired to UI |
| Admin login security | `/api/admin/login` | Sets cookie with no password check |

---

## Dev-Only Items to Remove Before Launch

1. **Arena state preview bar** — `ArenaClient.tsx` lines ~136–165 (PRE / LIVE / FINISHED buttons)
2. **`SITE.demo.arenaState`** — force-override in `config/site.ts`
3. **`MOCK_SUPPORT` / `MOCK_TOTAL_SOL`** — replace with real `useRace()` data

---

## Architecture Notes

- **Styling**: 100% inline `React.CSSProperties`. No Tailwind, no CSS Modules.
- **Fonts**: Kanit (headings/CTAs), Pretendard (body). Single breakpoint at 768px via `useIsMobile()`.
- **Design tokens**: `/lib/theme.ts` — T object. Key: `yellow: #FFE790`, `purple: #735DFF`.
- **Images**: `/public/images/*.png` — 29 active PNGs, unoptimized. Cloudinary for admin-uploaded media.
- **Race timing**: Deterministic schedule from `GENESIS_TIMESTAMP` env var. No cron jobs.
- **Donations**: Helius webhook → `lib/helius.ts` → creates `Donation` + updates `RaceEntry.totalSol`.
- **Realtime**: Supabase Realtime subscription in `useRace` hook; 30s polling fallback.
- **Content widths**: Landing `maxWidth: 1280`, Arena + Highlights `maxWidth: 900`, Pet `maxWidth: 960`.

## Archived Files

Old code and assets have been moved to `/_archive/` — do not import from there.

| Archive path | What it was |
|---|---|
| `_archive/components/views/` | Old tab-view architecture (RaceView, PetsView, ArenasView, CommunityView, SponsorsView) — replaced by individual routes |
| `_archive/components/Nav.tsx` | Old navigation — replaced by `LandingNav` |
| `_archive/components/HamsterRaceAnimation.tsx` | Animation used only by old views |
| `_archive/components/app-tab-page.tsx` | Old `app/app/page.tsx` single-page tab app |
| `_archive/components/pets-config.ts` | Old pets config (Hammy/Whiskers) — replaced by `config/site.ts` (Dash/Flash/Turbo) |
| `_archive/docs/design.md` | Pre-v2 design notes |
| `_archive/docs/IMPROVEMENTS.md` | v1 UX improvement plan |
| `_archive/docs/INTEGRATION.md` | v1→v2 integration guide |
| `_archive/docs/skill.md` | Old developer reference (superseded by CLAUDE.md + SUMMARY.md) |
| `_archive/images/` | 14 unused PNGs + design reference screenshots |

---

## Next Phase: Missing Functionality Checklist

### Phase 1 — Wallet & Auth
- [ ] Integrate `@solana/wallet-adapter-react` for Phantom wallet connection
- [ ] Replace login stubs with real wallet sign-in (sign a message to prove ownership)
- [ ] Store session server-side (JWT with wallet address as subject)
- [ ] Secure admin login with real password / environment variable check

### Phase 2 — Cheer / Donation Flow
- [ ] Replace MOCK_SUPPORT with real data from `useRace()` hook → `RaceEntry.totalSol`
- [ ] Wire "Cheer" button → construct Solana SOL transfer to pet's `walletAddress`
- [ ] Show transaction confirmation / pending state on HamsterCard
- [ ] Confirm tx via Helius webhook → update DB → broadcast via Supabase Realtime
- [ ] Show realtime support % and SOL updates in ArenaClient

### Phase 3 — Deposit / QR
- [ ] Generate real QR code for deposit wallet address (`qrcode.react` or similar)
- [ ] Show current SOL balance in AccountModal (fetch from RPC)

### Phase 4 — Race Settlement
- [ ] Auto or admin-triggered race finish after LIVE window closes
- [ ] Calculate winner pool distribution
- [ ] Trigger payout transactions to winning supporters (or display claim button)

### Phase 5 — Smart Contract (Solana)
- [ ] Define program architecture: escrow per race, or direct-to-pet-wallet + backend tracking
- [ ] Option A (simpler): Direct SOL transfers to pet wallets, Helius webhook tracks everything off-chain
- [ ] Option B (trustless): Anchor program with race escrow, winner distribution on-chain
- [ ] Decide on token: native SOL vs SPL token

---

## Environment Variables Needed

```env
DATABASE_URL=
GENESIS_TIMESTAMP=        # Unix ms timestamp of Race #1 start
ADMIN_SECRET=             # Password for admin login
JWT_SECRET=               # For session signing
HELIUS_API_KEY=           # Webhook authentication
HELIUS_WEBHOOK_SECRET=    # Webhook signature verification
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_RPC_URL=      # Solana RPC endpoint
```
