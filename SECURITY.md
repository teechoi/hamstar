# HamstarHub — Security Notes

This document records all patched vulnerabilities, active hardening, and known remaining risks.

*Last updated: April 12, 2026*

---

## Applied Patches

### CRITICAL — Transaction Replay Attack (PATCHED)

**File:** `app/api/user/cheer/route.ts`, `prisma/schema.prisma`

**Risk:** The same `place_cheer` transaction signature could be submitted to `POST /api/user/cheer` multiple times, recording duplicate cheers or overwriting legitimate records.

**Fix:**
1. `Cheer.txSignature` is now `@unique` in the schema — the DB enforces one record per signature at the constraint level.
2. A pre-check looks up the txSignature before the upsert and returns HTTP 409 if already recorded.
3. **Note:** Run `prisma migrate dev --name add_cheer_txsig_unique` inside `hamstarhub/` to apply the schema change to the live database.

---

### CRITICAL — Cheer Upsert Race Condition (PATCHED)

**File:** `app/api/user/cheer/route.ts`

**Risk:** Two concurrent POST requests for the same wallet+race could both pass the `verifyCheerTx` check and then race to write. One could overwrite the other's signature/amount with stale data.

**Fix:** The `user.upsert` and `cheer.upsert` are now wrapped in a single `prisma.$transaction()`. The txSignature uniqueness constraint also catches any residual duplicates at the DB level.

---

### CRITICAL — Helius Webhook Auth Bypass (PATCHED)

**File:** `lib/helius.ts`

**Risk:** When `HELIUS_WEBHOOK_SECRET` was not set in the environment, `verifyHeliusWebhook()` returned `true` in development mode. If deployed without the secret set, any POST to the webhook could inject arbitrary transaction records.

**Fix:** The function now always returns `false` when the secret is unset, regardless of `NODE_ENV`. An error is logged to make the misconfiguration visible.

---

### CRITICAL — No Webhook Route Existed (PATCHED)

**File (new):** `app/api/webhook/route.ts`

**Risk:** The README described registering a Helius webhook at `/api/webhook`, but the route didn't exist. Helius would have received 404s; donations would never have been indexed.

**Fix:** Route created. Reads `authorization` or `x-helius-webhook-secret` header, verifies via `verifyHeliusWebhook()`, parses the JSON body, and calls `processHeliusWebhook()`.

---

### HIGH — Deep place_cheer TX Verification (PATCHED)

**File:** `app/api/user/cheer/route.ts`

**Risk:** The original verification only checked that the wallet signed a transaction that referenced the program. A user could submit any valid program transaction (e.g., for a different race or hamster) and have it accepted.

**Fix:** `parsePlaceCheerInstruction()` decodes the instruction bytes using the known `place_cheer` discriminator (`sha256("global:place_cheer")[0:8]`), then verifies `raceId`, `hamsterIndex`, and `amount` all match the submitted values. Tolerance on amount: ±1 raw unit.

---

### HIGH — Fake-Signature Reward Poisoning (PATCHED)

**File:** `app/api/user/claim-reward/route.ts`

**Risk:** A malicious user could POST any string as `txSignature` to mark `rewardPushed = true` without an actual on-chain transaction. The admin push-reward pipeline skips `rewardPushed = true` records, permanently losing their reward.

**Fix:** `verifyClaimRewardTx()` fetches the transaction from RPC and checks: (1) confirmed, (2) wallet is a signer, (3) our program ID is in accountKeys. HTTP 422 on failure.

---

### HIGH — Admin Settings PATCH Had No Handler-Level Auth (PATCHED)

**File:** `app/api/admin/settings/route.ts`

**Risk:** The PATCH handler relied solely on `middleware.ts` for auth. If middleware is misconfigured (e.g., during a Next.js upgrade or CDN rewrite), the settings endpoint could accept unauthenticated writes.

**Fix:** Defense-in-depth — the handler now reads the `admin_session` JWT cookie directly and calls `verifyToken()` before any DB write.

---

### HIGH — Admin Mutation Routes Defense-in-Depth (PATCHED)

**Files:** `app/api/admin/race/finish/route.ts`, `create/route.ts`, `settle/route.ts`, `cancel/route.ts`, `push-rewards/route.ts`, `status/route.ts`

All mutation routes read the JWT cookie directly in addition to relying on middleware.

---

### HIGH — Missing Security Headers (PATCHED)

**File:** `next.config.js`

Added via `headers()`:
- `X-Frame-Options: DENY` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` — legacy XSS filter (defense-in-depth)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production only)

---

### HIGH — JWT Missing Audience Claim (PATCHED)

**File:** `lib/auth.ts`

Tokens now include `aud: "hamstarhub-admin"` on sign and require it on verify. Prevents tokens issued by a different system from being accepted.

---

### HIGH — Admin Login Rate Limiting (PATCHED)

**File:** `app/api/admin/login/route.ts`

In-memory rate limiter: 5 attempts per IP per 15-minute window. Returns HTTP 429 on breach. Resets counter on successful login.

---

### MEDIUM — SameSite=Strict Session Cookie (PATCHED)

**File:** `lib/auth.ts`

Changed from `SameSite=Lax` → `SameSite=Strict`. Prevents session cookie from being sent on any cross-site request, eliminating CSRF via crafted links.

---

### MEDIUM — Credential Exposure in Claude Settings (PATCHED)

**File:** `.claude/settings.local.json`

Two allowed-command entries contained the live DB password `Hamchee888!` as inline env vars. These entries have been removed. `.claude/` has been added to `.gitignore` to prevent future commits.

**Action required:** Rotate the Supabase DB password, service role key, and Helius API key. They were never in git, but existed on disk in plain text.

---

### MEDIUM — Pet ID Validated at API Boundary (PATCHED)

**File:** `app/api/user/cheer/route.ts`

Invalid `petId` now returns HTTP 400 before any DB write. Previously caused a Prisma foreign-key error leaking internal DB structure in the 500 response.

---

### Anchor: Settler Rotation Without Redeployment (ADDED — pending deploy)

**File:** `hamstar-program/…/instructions/update_settlers.rs`

Previously, a compromised settler key required a full program redeployment. The new `update_settlers` instruction allows the admin to rotate any or all settler pubkeys in a single transaction. Duplicate settler check enforced on-chain.

**Pending:** Anchor program upgrade not yet deployed — see `docs/NEXT_STEPS.md` step 3.

---

### Anchor: `upset_reserve` Guard in `push_reward` (ADDED — pending deploy)

**File:** `hamstar-program/…/instructions/push_reward.rs`

If `create_upset_reserve` hasn't been called yet, `config.upset_reserve` is `Pubkey::default()`. Previously `push_reward` would fail with a confusing deserialization error. Now rejects immediately with `UpsetReserveNotInitialized`.

**Pending:** Anchor program upgrade not yet deployed.

---

## Active Risks (Not Yet Fixed)

### CRITICAL — Credentials Require Rotation

The Supabase DB password and service role key must be rotated (see above). Until they are, anyone with access to the local `.claude/settings.local.json` history can authenticate to the production database.

### HIGH — DB Migration Not Run

The `Cheer.txSignature @unique` constraint is in the schema but not yet applied to the live database. Transaction replay attacks are partially mitigated by the application-level 409 check, but the DB-level constraint is the authoritative guard. Run `npx prisma migrate dev --name add_cheer_txsig_unique` from inside `hamstarhub/`.

### HIGH — Anchor Program Upgrade Pending

`update_settlers` and `upset_reserve` guard changes are committed but not deployed. Until deployed, settler keys cannot be rotated and `push_reward` gives confusing errors if reserve is not initialized.

### HIGH — `SETTLER_2_KEYPAIR` Must Be a Separate Key

`lib/admin-signer.ts` falls back to the admin keypair if `SETTLER_2_KEYPAIR` is not set. This makes settlement effectively single-signer, defeating the 2-of-3 consensus design. Set a distinct keypair before any real funds flow through escrow.

### HIGH — No Rate Limiting on `/api/user/cheer`

A single wallet can spam cheer submissions (amounts aren't trusted without a verified tx, but supporter counts inflate). Add per-wallet rate limiting before mainnet.

### HIGH — ATA Pre-Creation for Reward Recipients

`push_reward` fails if a winner's HAMSTAR ATA doesn't exist. Add an ATA existence check + creation step to the admin push-rewards flow or the user's `claim_reward` transaction.

### MEDIUM — Helius API Key in RPC URL Logs

The Helius RPC URL is constructed as `https://mainnet.helius-rpc.com/?api-key=<key>`. This URL may appear in server error logs. Use `SOLANA_RPC_URL` set to the full URL so the key isn't reconstructed inline in application code.

### MEDIUM — Integer Division Dust in Escrow

`push_reward` uses integer division when computing each winner's share. Fractional remainder (at most ~1 raw token per winner per calculation) accumulates in the escrow permanently. At 9 decimal places this is < 0.000000001 HAMSTAR per race — negligible until scale is large.

---

## Smart Contract Security Properties

| Property | Status |
|---|---|
| 2-of-3 settlement consensus | ✅ Enforced on-chain |
| AlreadyVoted constraint | ✅ Each settler slot can only vote once |
| Escrow self-custody | ✅ PDA authority — no admin can drain unilaterally |
| Whale cap | ✅ Single wallet capped at 20% of pool |
| Refund path | ✅ `cancel_race` + `claim_refund` for full refunds |
| Settler rotation | ⏳ `update_settlers` instruction added, pending deploy |
| Reserve guard | ⏳ `upset_reserve` init check added, pending deploy |
| Discriminator verified server-side | ✅ `place_cheer` discriminator + args verified |
| Settlement double-vote | ✅ Patched — rejects vote if race already Settled |
