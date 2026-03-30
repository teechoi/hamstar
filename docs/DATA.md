# HamstarHub — Data Architecture

*Last updated: March 2026*

---

## Short Answer

**Three data stores run in parallel:**

| Store | What lives there | Who controls it |
|---|---|---|
| **Privy** | User identities, emails, OAuth, embedded Solana wallets | Privy (MPC infrastructure) |
| **Supabase / PostgreSQL** | Donations, races, pets, sponsors, settings | Us (via Prisma) |
| **Browser localStorage** | Cheering history per wallet | User's device only |

---

## 1. Privy — User Identity Backend

Yes — Privy **is** our user backend. We don't need to build one.

When a user signs in via email, Google, or Apple, Privy:
- Creates a **unique user ID** (`did:privy:...`) tied to their identity
- Issues a **signed JWT** the app can verify server-side
- Creates a **self-custodial Solana wallet** (MPC — no seed phrase, keys split between Privy's servers and the user's device)
- Stores their linked accounts: email, Google, Apple, connected external wallets

**What Privy stores on their end:**
- Email addresses / OAuth identities
- Embedded wallet key shares (MPC — Privy alone cannot sign)
- User session tokens

**What we never receive from Privy:**
- Passwords (Privy uses OTP / OAuth — no passwords)
- Private keys (MPC means the full key never exists in one place)

**Privy dashboard:** `dashboard.privy.io` — view all users, linked accounts, wallets.

**To verify a Privy JWT server-side** (for future protected API routes):
```typescript
import { PrivyClient } from '@privy-io/server-auth'
const privy = new PrivyClient(process.env.NEXT_PUBLIC_PRIVY_APP_ID!, process.env.PRIVY_APP_SECRET!)
const claims = await privy.verifyAuthToken(token)
// claims.userId = 'did:privy:...'
```

---

## 2. Supabase / PostgreSQL — Race & Donation Data

Managed via Prisma ORM. Schema: `prisma/schema.prisma`.

### Tables

| Table | Contents | Notes |
|---|---|---|
| `Pet` | name, emoji, color, walletAddress, snackLevel, cageLevel, lifetimeSol | 3 pets (Hammy, Whiskers, Nugget) |
| `Race` | status (UPCOMING/OPEN/LIVE/FINISHED), round number, startTime, endTime | One active race at a time |
| `RaceEntry` | petId, raceId, totalSol, supporterCount, position | One row per pet per race |
| `Donation` | walletAddress, alias, amountSol, txSignature, petId, raceId, confirmedAt | Written by Helius webhook |
| `Sponsor` | name, logoUrl, websiteUrl, tagline, tier, active | Admin-managed |
| `UpgradeItem` | name, description, cost, type (SNACK/CAGE) | Seeded once |
| `PetUpgrade` | petId, itemId, unlockedAt | Auto-unlocked by donation milestones |
| `Media` | title, videoUrl, thumbnailUrl, type (RACE/HIGHLIGHT) | Admin-uploaded |
| `SiteSettings` | Single row — all configurable text (hero copy, nav, footer, etc.) | Admin-editable |

### Supabase Realtime (browser subscriptions)

Two public channels power live UI updates:

- **`race_entries` UPDATE** → pushes `{ petId, totalSol }` → Arena support bars update live
- **`donations` INSERT** → pushes `{ alias, amountSol, petId }` → Live donation feed

Both use the public anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) — safe to expose in-browser.

### Helius Webhook → Donation Pipeline

```
Fan sends SOL to pet wallet
  → Helius detects on-chain tx
  → POST /api/webhook with tx payload
  → lib/helius.ts processHeliusWebhook()
  → Creates Donation row in DB
  → Updates RaceEntry.totalSol
  → Checks pet upgrade thresholds
  → Supabase Realtime broadcasts update to all browsers
```

---

## 3. Browser localStorage — Cheering History

`lib/cheer-history.ts` stores cheering records client-side only:

```
Key: hamstar_cheers_{walletAddress}
Value: CheerEntry[] (max 20 entries)
  - round, petId, petName, petEmoji, petColor
  - won: boolean | null (null = pending)
  - timestamp
```

**Limitation:** Not synced to the server. If the user clears their browser data or switches devices, history is lost.

**Future upgrade:** Save cheers to a `Cheer` table in Supabase, keyed by `walletAddress + raceId`. This would enable persistent history and cross-device sync.

---

## 4. Data Flow Diagram

```
User (browser)
  │
  ├── Privy sign-in ──────────────────────────────► Privy servers
  │     email / Google / Apple                       (user identity,
  │     creates embedded Solana wallet               embedded wallet)
  │
  ├── Wallet connect (Phantom/Backpack/etc.)
  │     MWA on Android / Wallet Standard on desktop
  │
  ├── Cheer/Support pet ──► SOL tx ──► Pet's wallet
  │                              │
  │                         Helius monitors
  │                              │
  │                         POST /api/webhook
  │                              │
  │                         processHeliusWebhook()
  │                              │
  │                    ┌─────────┴──────────┐
  │                    │   PostgreSQL        │
  │                    │   (Supabase)        │
  │                    │   Donation row      │
  │                    │   RaceEntry update  │
  │                    └─────────┬──────────┘
  │                              │
  │                    Supabase Realtime
  │                              │
  └──────────────────────────────┘
       All browsers see live update
```

---

## 5. Privacy & Data Minimisation

- **We never store passwords** — Privy handles auth via OTP/OAuth
- **We never store private keys** — MPC wallets mean keys are never whole
- **Donor wallet addresses** are stored in the `Donation` table (on-chain data — public by nature)
- **Emails** stay in Privy — we never receive or store them
- **Cheering history** is device-local — we don't know which user cheered for which pet server-side

---

## 6. Security Status

### Protected
- Admin panel login: bcrypt password hash + JWT cookie (`ADMIN_SESSION_SECRET`)
- Helius webhook: verified by `HELIUS_WEBHOOK_SECRET` header
- Supabase service role key: server-side only, never exposed to browser
- Privy app secret: server-side only

### Pending / To Do
- [ ] **Admin API routes need auth middleware** — currently `/api/admin/*` routes do not verify the JWT cookie server-side. The middleware at `middleware.ts` needs to call `verifyToken()` from `lib/auth.ts` and reject unauthorized requests
- [ ] **Cheering history → Supabase** — move from localStorage to a `cheers` table for persistence and cross-device sync
- [ ] **Rate limiting** on webhook and admin endpoints — add via Vercel Edge Config or `@upstash/ratelimit`
- [ ] **Privy server-side JWT verification** — install `@privy-io/server-auth` for future user-gated API routes

### Scale Characteristics
- **Supabase free tier:** 500MB database, 2GB bandwidth, 50K realtime messages/month — fine for launch
- **Privy free tier:** 100 monthly active wallets — upgrade to Growth plan at scale
- **Helius free tier:** 100K credits/month — watch for high-volume donation events

---

## 7. Environment Variables Reference

| Variable | Used by | Sensitivity |
|---|---|---|
| `DATABASE_URL` | Prisma (pooling) | Private |
| `DIRECT_URL` | Prisma (migrations) | Private |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser client | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser realtime | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server API routes | Private — never expose |
| `HELIUS_API_KEY` | Helius webhook setup | Private |
| `HELIUS_WEBHOOK_SECRET` | Webhook verification | Private |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy provider | Public |
| `PRIVY_APP_SECRET` | Server-side Privy JWT verify | Private |
| `ADMIN_SESSION_SECRET` | JWT signing for admin cookies | Private |
| `CLOUDINARY_*` | Media uploads | Private |
