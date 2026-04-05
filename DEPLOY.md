# HamstarHub — Deployment Guide

> From accounts to live site. Follow these steps in order.

---

## Prerequisites
- Supabase account (free tier works)
- Helius account (free tier works)
- Vercel account
- GitHub repo
- 3 Solana wallet addresses (one per hamster — Dash, Flash, Turbo)

---

## Step 1 — Clone & Install

```bash
git clone https://github.com/YOURUSERNAME/hamstarhub.git
cd hamstarhub
npm install
```

---

## Step 2 — Set Up Supabase

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → New project
2. **Settings → Database → Connection string** → copy pooling URL (port 6543) and direct URL (port 5432)
3. **Settings → API** → copy Anon Key and Service Role Key

---

## Step 3 — Configure Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Pooling connection (port 6543) |
| `DIRECT_URL` | Supabase → Settings → Database → Direct connection (port 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `HELIUS_API_KEY` | dev.helius.xyz → Dashboard → API Keys |
| `HELIUS_WEBHOOK_SECRET` | Generate: `openssl rand -hex 32` |
| `DASH_WALLET` | Phantom wallet address for Dash |
| `FLASH_WALLET` | Phantom wallet address for Flash |
| `TURBO_WALLET` | Phantom wallet address for Turbo |
| `GENESIS_TIMESTAMP` | `node -e "console.log(new Date('2025-04-01T18:00:00Z').getTime())"` |
| `ADMIN_PASSWORD_HASH` | `node -e "const b=require('bcryptjs'); b.hash('yourpassword',10).then(console.log)"` |
| `ADMIN_SESSION_SECRET` | Generate: `openssl rand -hex 32` |

---

## Step 4 — Push DB Schema

```bash
npm run db:push
```

Verify in Supabase → Table Editor: you should see `pets`, `races`, `race_entries`, `donations`, `sponsors`, `media`, `users`, `cheers`, `site_settings`.

---

## Step 5 — Seed the Database

```bash
npm run seed
```

Creates: Dash 🐹, Flash 🐹, Turbo 🐹, 8 upgrade items, initial site settings.

Then update the hamster wallet addresses via the admin panel:
- Go to `/admin/pets` and paste in each pet's real Solana wallet address.

---

## Step 6 — Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Step 7 — Deploy to Vercel

### Via CLI
```bash
npx vercel --prod
```

### Via Dashboard
1. Vercel → New Project → Import GitHub repo
2. Settings → Environment Variables → add all variables from `.env.local`
3. Deploy

Live at `https://hamstarhub.vercel.app` (or your custom domain).

---

## Step 8 — Set Up Helius Webhook

Once your Vercel site is live:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com npm run setup-helius
```

This registers a Helius webhook watching all 3 hamster wallets. Every SOL transfer triggers `/api/webhook` which records the donation in Supabase and updates the race pool in real time.

**Verify:** Send 0.001 SOL to a hamster wallet → check Supabase `donations` table — it should appear within seconds.

---

## Step 9 — Create Your First Race

Go to `/admin/race` → **Create New Race**:
1. Set start and end datetime
2. Click Create — entries for all 3 hamsters are auto-created
3. When the race goes live, click **Mark LIVE**
4. After the race, use the position dropdowns → **Finish Race**

No CLI scripts needed. Everything is managed from the admin panel.

---

## Step 10 — Custom Domain

1. Vercel → Settings → Domains → add your domain
2. Update DNS: `A record → 76.76.21.21` or `CNAME → cname.vercel-dns.com`
3. Update `NEXT_PUBLIC_SITE_URL` env var in Vercel → Redeploy

---

## Step 11 — Re-Enable Admin Auth

The admin panel is currently open (no password). Before going public, re-enable auth:

In `middleware.ts`, restore the auth check:
```typescript
import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const payload = token ? await verifyToken(token) : null

  if (!payload) {
    if (req.nextUrl.pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/((?!login$).*)', '/api/admin/:path*'],
}
```

Set a strong password:
```bash
node -e "const b=require('bcryptjs'); b.hash('yourStrongPassword',10).then(console.log)"
```
Paste the hash into `ADMIN_PASSWORD_HASH` in Vercel env vars → redeploy.

---

## Daily Operations

| Task | How |
|---|---|
| Create a race | `/admin/race` → Create New Race |
| Mark race LIVE | `/admin/race` → Mark LIVE button |
| Finish a race | `/admin/race` → Set positions → Finish Race |
| Add a recap | `/admin/race` or `/admin/history` → Edit Recap |
| Edit site content | `/admin/content` |
| Upload media/videos | `/admin/media` (shows on Highlights page) |
| View SOL balances | `/admin/wallet` |
| See users/fans | `/admin/users` |
| Manage sponsors | `/admin/sponsors` |
| View all donations | Supabase → Table Editor → donations |
| Check webhook logs | Helius dashboard → Webhooks → Recent deliveries |

---

## Troubleshooting

**Webhook not firing?**
- Helius dashboard → Webhooks → Recent deliveries
- Verify `HELIUS_WEBHOOK_SECRET` matches in Helius and `.env`
- Confirm `NEXT_PUBLIC_SITE_URL` is set to your live domain

**DB connection error?**
- `DATABASE_URL` must use pooling URL (port 6543)
- `DIRECT_URL` must use direct connection (port 5432)

**Support bars not updating live?**
- Supabase → Settings → API → confirm Realtime is enabled
- Check browser console for WebSocket errors

**Arena stuck in wrong state?**
- Check `config/site.ts` → `demo.arenaState` should be `null` in production
- Check DB: is there an active (non-FINISHED) race? Create one via `/admin/race`

**Admin login not working?**
- Verify `ADMIN_PASSWORD_HASH` is set in Vercel env vars (not just `.env.local`)
- Redeploy after updating env vars — Vercel requires a redeploy to pick up changes

---

## Architecture

```
hamstar.io (Vercel)
├── Next.js 14 App Router
│   ├── / (landing)
│   ├── /arena (live race)
│   ├── /highlights (results + media)
│   ├── /pet (hamster profiles)
│   └── /admin/* (admin panel)
│
├── API Routes
│   ├── /api/races → current race + pool data
│   ├── /api/settings → public site config
│   ├── /api/highlights → race history + media
│   ├── /api/pets/[id]/form → W/L history
│   ├── /api/pets/[id]/stats → win rate
│   ├── /api/webhook → Helius SOL tracker
│   └── /api/admin/* → admin operations
│
├── Supabase (PostgreSQL + Realtime)
│   └── pets / races / donations / media / users / cheers / site_settings
│
├── Helius
│   └── Watches hamster wallets → fires webhook → records in DB → Realtime pushes to browser
│
└── Solana (hamstar-program)
    └── Anchor program — PDA escrow, dark horse bonus, streak multiplier
```
