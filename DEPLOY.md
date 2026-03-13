# 🐹 HamstarHub — Deployment Guide

> From accounts to live site. Follow these steps in order.

---

## Prerequisites (you already have these)
- ✅ Supabase account
- ✅ Helius account
- ✅ Vercel account
- ✅ GitHub repo
- ✅ 3 Solana wallet addresses (one per pet)

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/YOURUSERNAME/hamstarhub.git
cd hamstarhub
npm install
```

---

## Step 2 — Set Up Supabase

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (name: `hamstarhub`)
3. Go to **Settings → Database → Connection string**
4. Copy both the **pooling** URL (for `DATABASE_URL`) and the **direct** URL (for `DIRECT_URL`)
5. Go to **Settings → API** — copy your `ANON KEY` and `SERVICE ROLE KEY`

---

## Step 3 — Configure Environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Connection pooling |
| `DIRECT_URL` | Supabase → Settings → Database → Direct connection |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `HELIUS_API_KEY` | helius.xyz → Dashboard → API Keys |
| `HELIUS_WEBHOOK_SECRET` | Make up a random string: `openssl rand -hex 32` |
| `HAMMY_WALLET` | Your Phantom wallet address for Hammy |
| `WHISKERS_WALLET` | Your Phantom wallet address for Whiskers |
| `NUGGET_WALLET` | Your Phantom wallet address for Nugget |
| `GENESIS_TIMESTAMP` | `node -e "console.log(new Date('2024-03-01T18:00:00Z').getTime())"` |

---

## Step 4 — Push DB Schema

```bash
npm run db:push
```

This creates all tables in your Supabase PostgreSQL database.

To verify, go to **Supabase → Table Editor** — you should see: `pets`, `races`, `race_entries`, `donations`, `sponsors`, `upgrade_items`, `pet_upgrades`, `media`.

---

## Step 5 — Seed the Database

```bash
npm run seed
```

This creates:
- 🐹 Hammy, 🐭 Whiskers, 🐿️ Nugget
- 8 upgrade items (4 snack tiers + 4 cage tiers)
- Race #1
- Sample media

---

## Step 6 — Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the full site with real data from Supabase.

---

## Step 7 — Deploy to Vercel

### Option A: Vercel CLI
```bash
npx vercel
```
Follow the prompts, then add env variables:
```bash
npx vercel env add DATABASE_URL
# (repeat for each variable)
npx vercel --prod
```

### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Go to **Settings → Environment Variables**
4. Add all variables from `.env.local`
5. Click **Deploy**

Your site will be live at `https://hamstarhub.vercel.app`

---

## Step 8 — Set Up Helius Webhook

Once your Vercel site is live, run:

```bash
npm run setup-helius
```

This registers a webhook with Helius to watch all 3 pet wallets. Every SOL transfer to a pet wallet will automatically trigger `/api/webhook` and be recorded in your database.

**Verify it's working:**
1. Send a tiny amount of SOL (0.001) to a pet wallet
2. Check your Supabase `donations` table — it should appear within seconds

---

## Step 9 — Add Custom Domain

1. In Vercel → Settings → Domains → Add `hamstarhub.xyz`
2. Update your DNS:
   - `A record`: `76.76.21.21`
   - Or `CNAME`: `cname.vercel-dns.com`
3. Update `NEXT_PUBLIC_SITE_URL` env var in Vercel to `https://hamstarhub.xyz`
4. Redeploy

---

## Step 10 — Run Your First Race

**When the race is over** (after 48 hours), run:

```bash
npm run finish-race 1
```

This will:
- Rank racers by total SOL
- Mark positions (1st, 2nd, 3rd)
- Mark Race #1 as FINISHED
- Auto-create Race #2

---

## Daily Operations

| Task | Command |
|---|---|
| Finish a race | `npm run finish-race [number]` |
| Open DB dashboard | `npm run db:studio` |
| Add a sponsor | Insert row in Supabase → `sponsors` table |
| Add media | Insert row in Supabase → `media` table |
| Check webhook logs | Helius dashboard → Webhooks → Recent deliveries |
| View donations | Supabase → Table Editor → `donations` |

---

## Architecture at a Glance

```
Browser ──────────────────────────────────────────────────────────────┐
  │ page.tsx (single page)                                             │
  ├── RaceView (live support bars via Supabase Realtime)              │
  ├── PetsView (upgrade shop)                                          │
  ├── CommunityView (media gallery)                                    │
  ├── ArenasView (roadmap + waitlist)                                  │
  └── SponsorsView                                                     │
                                                                       │
Next.js API Routes ────────────────────────────────────────────────── │
  GET /api/races      → current + past races                          │
  GET /api/pets       → pet stats + upgrades                          │
  GET /api/sponsors   → active sponsors                               │
  GET /api/media      → content gallery                               │
  POST /api/webhook   → Helius webhook receiver                       │
                                                                       │
Supabase (PostgreSQL + Realtime) ──────────────────────────────────── │
  pets / race_entries / donations / sponsors / media                  │
  ↑ Helius sends tx → /api/webhook → writes to DB                    │
  ↑ DB change → Realtime subscription → browser updates live          │
                                                                       │
Solana ──────────────────────────────────────────────────────────────┘
  3 pet wallets → Helius monitors → webhook fires on every SOL tx
```

---

## Troubleshooting

**Webhook not firing?**
- Check Helius dashboard → Webhooks → Recent deliveries
- Verify `HELIUS_WEBHOOK_SECRET` matches in both Helius and `.env`
- Make sure your Vercel URL is correct in `NEXT_PUBLIC_SITE_URL`

**DB connection error?**
- Use pooling URL for `DATABASE_URL` (port 6543)
- Use direct URL for `DIRECT_URL` (port 5432)
- Both should use your Supabase project ref

**Support bars not updating live?**
- Check Supabase → Settings → API → make sure Realtime is enabled
- Check browser console for WebSocket connection errors

**Race entries missing?**
- Make sure you ran `npm run seed`
- Check `/api/races` in your browser — it auto-creates entries if missing
