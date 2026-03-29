# HamstarHub — Developer Skill Guide

A fast reference for working in this codebase. Start with `config/site.ts` and `prisma/schema.prisma` before touching anything else.

---

## What This Is

Community-driven Solana hamster racing platform. Three hamsters (Hammy, Whiskers, Nugget) race in 48-hour cycles. Users donate SOL to their favorite racer. Races are deterministic — no cron jobs, just math from `GENESIS_TIMESTAMP`.

**Stack:** Next.js 14 App Router · TypeScript · PostgreSQL (Supabase) · Prisma ORM · Helius webhooks · Vercel

---

## Directory Map

```
app/
  page.tsx              # Root UI — tabbed interface (Race | Pets | Community | Arenas | Sponsors)
  layout.tsx            # Root layout
  admin/                # Protected admin panel (login, dashboard, pets, race, sponsors, media, settings)
  api/
    admin/              # Auth-protected CRUD endpoints
    settings/route.ts   # Public settings (cached 30s)
    webhook/route.ts    # ⚠️ NOT YET IMPLEMENTED — Helius POSTs here

components/
  Nav.tsx               # Tab nav + live badge
  HamsterRaceAnimation.tsx  # ASCII race animation
  ui/index.tsx          # Shared UI: RaceBar, Tag, LivePulse, LimeButton, OutlineButton, SolAddress
  views/
    RaceView.tsx         # Main race display, standings, CTAs
    PetsView.tsx         # Pet profiles + stats + upgrades
    CommunityView.tsx    # Media gallery
    ArenasView.tsx       # Arena roadmap
    SponsorsView.tsx     # Sponsor tiers

lib/
  auth.ts               # JWT (jose, edge-safe) — signToken, verifyToken
  prisma.ts             # Prisma singleton
  helius.ts             # Webhook processing — verify, dedup, donations, upgrade unlocks
  race-scheduler.ts     # getCurrentRaceWindow(), getNextRaceWindow() — deterministic from genesis
  supabase.ts           # Supabase client + realtime subscriptions
  pets-config.ts        # Static pet wallet map + UPGRADE_CATALOG
  theme.ts              # Design tokens (T object) + global CSS
  hooks/
    useRace.ts          # Fetch race data + realtime updates
    useCountdown.ts     # Format ms remaining

config/
  site.ts               # ← EDIT THIS for content: pets, sponsors, media, roadmap, social links

prisma/
  schema.prisma         # Full DB schema

scripts/
  seed.ts               # Init DB (pets, upgrades, Race #1)
  finish-race.ts        # Finalize race, set positions, create next
  setup-helius.ts       # Register Helius webhook
  seed-settings.ts      # Init SiteSettings singleton

middleware.ts           # Edge auth guard for /admin and /api/admin
```

---

## Data Flow

```
User donates SOL to pet wallet
  → Helius detects transaction
    → POST /api/webhook
      → lib/helius.ts processHeliusWebhook()
        → Dedup by txSignature
        → Create Donation record
        → Update RaceEntry.totalSol
        → checkAndUnlockUpgrades() — auto-unlock if lifetime SOL ≥ item cost
          → Update Pet.snackLevel / .cageLevel
        → Supabase emits realtime postgres_changes
          → useRace hook updates UI live (support bars animate)
```

---

## Database Models (Quick Reference)

| Model | Key Fields |
|-------|-----------|
| `Pet` | slug, name, number, emoji, color, walletAddress, wins, speedBase, chaosBase, snackLevel, cageLevel |
| `Race` | number, status (UPCOMING\|LIVE\|FINISHED), startsAt, endsAt |
| `RaceEntry` | raceId, petId, position (null until finished), totalSol |
| `Donation` | txSignature (unique), petId, raceId, walletAddress, alias (from memo), amountSol |
| `Sponsor` | name, tier (SILVER\|GOLD\|TITLE), petId, solPerRace |
| `UpgradeItem` | category (SNACK\|CAGE), tier (BASIC\|UPGRADE\|ELITE\|LEGENDARY), costSol |
| `PetUpgrade` | petId, upgradeId — junction table, unique per pair |
| `Media` | type (VIDEO\|PHOTO), title, url, featured |
| `SiteSettings` | singleton (id="singleton"), raceNumber, isLive, streamUrl, genesisTs |

SOL amounts use `Decimal(18, 9)` — never use JS float arithmetic on these.

---

## Environment Variables

```bash
# Supabase / DB
DATABASE_URL              # Pooler connection (port 6543) — runtime
DIRECT_URL                # Direct connection (port 5432) — migrations
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Solana / Helius
HELIUS_API_KEY
HELIUS_WEBHOOK_SECRET     # Verify incoming webhook header
HAMMY_WALLET
WHISKERS_WALLET
NUGGET_WALLET
GENESIS_TIMESTAMP         # Unix ms — when Race #1 starts; all race windows derive from this

# Admin
ADMIN_PASSWORD_HASH       # bcrypt hash — never store raw password
ADMIN_SESSION_SECRET      # 32+ char random string for JWT signing

# Cloudinary (media uploads)
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Deployment
NEXT_PUBLIC_SITE_URL      # e.g. https://hamstarhub.xyz (used in webhook registration)
```

---

## API Routes

### Public
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/settings` | Site settings (cached 30s, falls back to static config) |
| GET | `/api/races` | ⚠️ Missing — referenced in useRace.ts but route not found |
| POST | `/api/webhook` | ⚠️ Missing — Helius sends here; call `processHeliusWebhook()` |

### Admin (all require JWT cookie)
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/admin/login` | Verify password (bcrypt), set cookie (300ms delay) |
| POST | `/api/admin/logout` | Clear cookie |
| GET | `/api/admin/dashboard` | Stats: current race, last 10 donations, totals |
| GET/PATCH | `/api/admin/pets/[id]` | Read / update pet (walletAddress excluded from PATCH) |
| GET | `/api/admin/race/current` | Current non-finished race with entries sorted by SOL |
| POST | `/api/admin/race/finish` | Finish race → set positions → create next → update settings |
| GET/POST | `/api/admin/sponsors` | List / create sponsors |
| GET/POST/DELETE | `/api/admin/media` | List / create / delete media |
| GET/PATCH | `/api/admin/settings` | Site settings singleton |
| POST | `/api/admin/upload` | Get Cloudinary pre-signed URL (client uploads directly) |

---

## Auth

- JWT signed with `jose` (edge-compatible, no Node.js crypto)
- Stored in HttpOnly cookie (`COOKIE_NAME` from `lib/auth.ts`)
- `middleware.ts` protects all `/admin*` and `/api/admin*` routes
- Admin password stored as bcrypt hash in `ADMIN_PASSWORD_HASH`

---

## Race Timing

`lib/race-scheduler.ts` — deterministic, no cron:

```
raceNumber = Math.floor((now - GENESIS_TIMESTAMP) / 48h) + 1
raceStart  = GENESIS_TIMESTAMP + (raceNumber - 1) * 48h
raceEnd    = raceStart + 48h
isLive     = now < raceStart + 2h   // first 2 hours = LIVE window
```

To advance: `npm run finish-race [raceNumber]` or `POST /api/admin/race/finish`

---

## Upgrade System

Upgrades are auto-unlocked in `lib/helius.ts → checkAndUnlockUpgrades()`:

1. Sum all-time SOL donated to pet
2. Compare against `UpgradeItem.costSol` (ascending order)
3. Unlock all items where lifetime SOL ≥ cost
4. Recompute `snackLevel` and `cageLevel` from TIER_BOOST map:

```ts
BASIC=20 | UPGRADE=45 | ELITE=70 | LEGENDARY=95
```

Highest unlocked tier for each category sets the pet's lifestyle level.

---

## Realtime

`lib/supabase.ts` subscribes to Supabase `postgres_changes`:
- `race_entries` table updates → refresh support bar percentages
- `donations` table inserts → show new donation in live feed

`useRace.ts` initializes subscriptions on mount, cleans up on unmount. Falls back to 30s polling if realtime fails.

---

## Styling Conventions

- **No Tailwind, no CSS files** — all inline styles
- Design tokens live in `lib/theme.ts` as the `T` object (colors, spacing, etc.)
- Global animations (pulse, petIdle, raceBounce) injected via `globalStyles` in `theme.ts`
- Responsive via `useIsMobile()` hook (breakpoint: 768px)
- All content/copy lives in `config/site.ts` — do not hardcode strings in components

---

## Common Tasks

### Change pet stats / bio / image
Edit `config/site.ts` → PETS array. For DB sync: `npm run seed` (idempotent upsert).

### Add a sponsor
Admin panel → Sponsors, or `POST /api/admin/sponsors` with `{ name, tier, petId?, websiteUrl? }`.

### Upload media
1. `POST /api/admin/upload` → get Cloudinary signature
2. Client uploads directly to Cloudinary
3. `POST /api/admin/media` with `{ type, title, url, thumbnail? }`

### Run a new race cycle
```bash
npm run finish-race 1    # finalize race #1, auto-creates race #2
```
Or via admin: Race section → Finish Race.

### Reset / init fresh DB
```bash
npm run seed             # creates pets, upgrades, Race #1
npm run seed-settings    # creates SiteSettings singleton
```

### Register Helius webhook
```bash
npm run setup-helius     # registers /api/webhook for all pet wallets
```
Requires `HELIUS_API_KEY`, `NEXT_PUBLIC_SITE_URL`, and real wallet addresses (not placeholders).

---

## Known Missing Implementations

| Gap | File needed | What it should do |
|-----|------------|-------------------|
| Helius webhook receiver | `app/api/webhook/route.ts` | Verify header, call `processHeliusWebhook()` |
| Public races endpoint | `app/api/races/route.ts` | Current race + past races + timing metadata |

---

## Onboarding Order

1. `config/site.ts` — all site content
2. `prisma/schema.prisma` — data model
3. `.env.example` — required secrets
4. `lib/race-scheduler.ts` — race timing logic
5. `lib/helius.ts` — donation + upgrade processing
6. `middleware.ts` — auth protection
7. `app/page.tsx` → `components/views/RaceView.tsx` — main UI
8. `app/api/admin/race/finish/route.ts` — race completion flow
