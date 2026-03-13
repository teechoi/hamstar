# V2 Integration Guide

This document covers everything needed to upgrade from the static v1 (config-file driven) to the full live platform — real-time donation tracking, Solana wallet integration, and a database-backed CMS.

The v1 site is fully functional and deployable as-is. All the v2 code is already written and stubbed out in the repo — it just needs to be wired up.

---

## What v2 adds

| Feature | v1 | v2 |
|---|---|---|
| Pet profiles | Edited in `config/site.ts` | Live from database |
| Race results | Edited in `config/site.ts` | Auto-updated via script |
| Support bars | Not shown | Live SOL totals per racer |
| Donations | Not tracked | Indexed from Solana via Helius |
| Upgrade unlocking | Static display | Auto-unlocks on donation milestones |
| Media / sponsors | Edited in `config/site.ts` | Live from database |
| Race countdown | Not shown | Real-time countdown from race schedule |

---

## Services to set up

### 1. Supabase (database + realtime)

- Create a project at [supabase.com](https://supabase.com)
- Grab these values from **Project Settings → API**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Grab these from **Project Settings → Database → Connection string**:
  - `DATABASE_URL` — use the **pooling** connection string (port 6543)
  - `DIRECT_URL` — use the **direct** connection string (port 5432)

### 2. Helius (Solana indexer)

- Create an account at [helius.dev](https://helius.dev)
- Create a new API key → copy as `HELIUS_API_KEY`
- Pick a random secret string for `HELIUS_WEBHOOK_SECRET` (used to verify webhook calls)
- The webhook endpoint is already built at `/api/webhook`

### 3. Solana wallets

- Create a dedicated Solana wallet for each racer (Phantom, Solflare, etc.)
- Copy each public address into the env:
  - `HAMMY_WALLET`
  - `WHISKERS_WALLET`
  - `NUGGET_WALLET`

---

## Environment variables

Create `.env.local` in the project root (copy from `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://..."        # Supabase pooling URL (port 6543)
DIRECT_URL="postgresql://..."          # Supabase direct URL (port 5432)

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Helius (Solana indexer)
HELIUS_API_KEY="your-helius-api-key"
HELIUS_WEBHOOK_SECRET="any-random-secret-string"

# Pet wallets (Solana public addresses)
HAMMY_WALLET="SolanaPublicKeyHere"
WHISKERS_WALLET="SolanaPublicKeyHere"
NUGGET_WALLET="SolanaPublicKeyHere"

# Deployment
NEXT_PUBLIC_SITE_URL="https://your-domain.com"   # Used to register Helius webhook
GENESIS_TIMESTAMP="1709316000000"                # Unix ms — when Race #1 starts
```

---

## Setup steps (in order)

```bash
# 1. Install dependencies (adds back prisma + supabase)
npm install @prisma/client prisma @supabase/supabase-js tsx

# 2. Push the schema to Supabase
npm run db:push

# 3. Seed the database with pets, upgrades, and Race #1
npm run seed

# 4. Register the Helius webhook (do this after deploying to Vercel)
npm run setup-helius
```

---

## Files to restore

All v2 code is already written. These files were stubbed to `export {}` for v1. Restore them from git history or rewrite from the stubs below.

### `lib/prisma.ts`
Singleton Prisma client. Restore the original content — it's straightforward boilerplate.

### `lib/supabase.ts`
Supabase browser + admin clients, plus two realtime helpers:
- `subscribeToRaceUpdates(raceId, callback)` — listens for `race_entries` UPDATE events
- `subscribeToDonations(raceId, callback)` — listens for `donations` INSERT events

### `lib/helius.ts`
Webhook processor. Key functions:
- `verifyHeliusWebhook(authHeader)` — validates the secret header
- `processHeliusWebhook(payload[])` — parses native SOL transfers, creates `Donation` records, increments `RaceEntry.totalSol`, triggers upgrade unlocking

### `lib/race-scheduler.ts`
Deterministic race timing — no cron needed.
- `getCurrentRaceWindow()` — returns current race number, start/end times, and status based on `GENESIS_TIMESTAMP`
- Race #1 = genesis to genesis + 48h. Race #2 = next 48h. Etc.
- First 2 hours of each window = `LIVE`. Rest = `UPCOMING`.

### `lib/hooks/useRace.ts`
React hook that:
- Fetches `/api/races` on mount and every 30s
- Subscribes to Supabase realtime for live race entry updates
- Returns `{ currentRace, pastRaces, totalSol, loading }`

### `lib/hooks/useCountdown.ts`
Simple countdown hook — takes a target timestamp in ms, returns `{ h, m, s }`.

### `app/api/races/route.ts`
- Upserts the current race record based on race scheduler
- Auto-creates `RaceEntry` rows for all active pets
- Returns current race (with entries sorted by `totalSol`), past 8 finished races, total SOL

### `app/api/pets/route.ts`
- Returns all active pets with sponsors, upgrades, win counts, and lifetime SOL

### `app/api/sponsors/route.ts`
- Returns active sponsors sorted by tier and SOL/race

### `app/api/media/route.ts`
- Returns media sorted by featured + publishedAt, with optional `?type=VIDEO|PHOTO` filter

### `app/api/webhook/route.ts`
- Already partially restored — needs `verifyHeliusWebhook` and `processHeliusWebhook` wired back in from `lib/helius.ts`

---

## View components to update

Once the API routes are live, swap the static data sources in each view:

| Component | v1 data source | v2 data source |
|---|---|---|
| `RaceView.tsx` | `PETS`, `RACE_HISTORY` from config | `useRace()` hook |
| `PetsView.tsx` | `PETS` from config | `fetch('/api/pets')` |
| `CommunityView.tsx` | `MEDIA` from config | `fetch('/api/media')` |
| `SponsorsView.tsx` | `SPONSORS` from config | `fetch('/api/sponsors')` |

Also restore in `RaceView.tsx`:
- **`SupportPanel`** component — live SOL bar showing each racer's % of total donations
- **`CountdownCard`** — real countdown using `useCountdown()` wired to `currentRace.endsAt`
- **`PetRaceCard`** — add `SolAddress` copy button back for each pet's wallet

`SolAddress` component is still in `components/ui/index.tsx` — it was never removed.

---

## Operational scripts

These run from the command line, not the browser.

### `npm run seed`
Populates the database for the first time:
- Creates 3 pets (Hammy, Whiskers, Nugget) with wallets from env vars
- Creates 8 upgrade items (4 snack tiers + 4 cage tiers)
- Grants all pets the free Basic Cage upgrade
- Creates Race #1 with entries for all pets
- Creates sample media items

Run once, before the first race.

### `npm run finish-race [number]`
Call this after each race ends:
- Ranks `RaceEntry` rows by `totalSol` descending
- Sets `position` (1, 2, 3) on each entry
- Marks the race as `FINISHED`
- Auto-creates the next race with a 48h window

```bash
npm run finish-race      # uses current race number
npm run finish-race 3    # explicitly finish race #3
```

### `npm run setup-helius`
Registers the webhook with Helius. Run once after first deploy:
- Reads pet wallet addresses from the database
- POSTs to Helius API with your site URL + wallet list
- Helius will now ping `/api/webhook` on every SOL transfer to any pet wallet

Re-run if you add new pet wallets or change your domain.

---

## Database schema (already in `prisma/schema.prisma`)

Key models and their purpose:

| Model | Purpose |
|---|---|
| `Pet` | Racer profiles — wallets, stats, upgrade levels |
| `Race` | One record per 48h race window — status, start/end times |
| `RaceEntry` | Junction: Pet × Race — tracks `totalSol` per racer per race |
| `Donation` | Every indexed SOL transfer — deduped by `txSignature` |
| `UpgradeItem` | Catalog of snacks + cage upgrades with SOL thresholds |
| `PetUpgrade` | Junction: Pet × UpgradeItem — which upgrades each pet has unlocked |
| `Sponsor` | Sponsor records with tier, SOL/race, and optional pet association |
| `Media` | Video and photo records for the Community gallery |

---

## Migrating content from v1 config

When switching to v2, the content in `config/site.ts` needs to be seeded into the database. The seed script handles pets, upgrades, and Race #1 automatically.

For media and sponsors added during v1, manually insert them via **Supabase Table Editor** (the dashboard has a spreadsheet-style UI) or add them to `scripts/seed.ts` before running it.

---

## Vercel environment variables

Add all env vars from the list above in **Vercel → Project → Settings → Environment Variables**. Required for the deployed app to connect to Supabase and process webhooks.

After adding them, redeploy — then run `npm run setup-helius` to register the webhook against the live URL.

---

## package.json scripts to add back

```json
"db:push": "prisma db push",
"db:migrate": "prisma migrate dev",
"db:studio": "prisma studio",
"db:generate": "prisma generate",
"seed": "npx tsx scripts/seed.ts",
"finish-race": "npx tsx scripts/finish-race.ts",
"setup-helius": "npx tsx scripts/setup-helius.ts"
```
