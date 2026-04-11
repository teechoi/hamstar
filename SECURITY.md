# HamstarHub Security Notes

This document records all critical security insights, patched vulnerabilities, and
ongoing hardening decisions for the HamstarHub Solana betting platform.

---

## On-Chain Transaction Verification

### CRITICAL (PATCHED) — Fake-Signature Reward Poisoning

**File:** `app/api/user/claim-reward/route.ts`
**Risk:** A malicious user could POST any string as `txSignature` to mark
`rewardPushed = true` without ever calling the on-chain `claim_reward` instruction.
Effect: their cheer record is permanently poisoned — the admin `push_reward` pipeline
skips anyone with `rewardPushed = true`, so the real token reward is never sent.

**Fix applied:** `verifyClaimRewardTx()` fetches the transaction from the RPC, checks:
1. Transaction is confirmed (`meta.err === null`)
2. The claimant's wallet is a signer on the transaction
3. Our program ID (`7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ`) is in `accountKeys`

Requests with unverified or fabricated signatures now return HTTP 422 and the record
is **not** updated.

---

### HIGH (PATCHED) — Cheer TX Only Stores Amount When Verified

**File:** `app/api/user/cheer/route.ts`
`verifyCheerTx()` verifies `place_cheer` transactions before trusting the `amountHamstar`
field. If the signature is missing or invalid the cheer is recorded with `amountHamstar = null`.
This prevents inflating the recorded amount without a real on-chain transfer.

---

## Admin Route Authorization

### HIGH (PATCHED) — Defense-in-Depth Auth on All Mutation Routes

**Files patched:**
- `app/api/admin/race/finish/route.ts`
- `app/api/admin/race/create/route.ts`
- `app/api/admin/race/settle/route.ts`
- `app/api/admin/race/cancel/route.ts`
- `app/api/admin/race/push-rewards/route.ts`
- `app/api/admin/race/status/route.ts`

**Risk:** All admin routes are protected by middleware (`middleware.ts`), but if middleware
configuration changes, misconfigures, or is bypassed (e.g., via a CDN rewrite rule), the
individual route handlers had no secondary auth check.

**Fix applied:** Each mutation route now reads the `admin_session` JWT cookie directly and
calls `verifyToken()`. Unauthenticated requests return 401 immediately, before any DB or
on-chain operations run. This follows defense-in-depth: middleware is first-line, route
handler is second-line.

Routes were also updated from `req: Request` to `NextRequest` so they can read cookies
natively in the Next.js runtime.

---

## Session Cookie Hardening

### LOW (PATCHED) — SameSite=Strict

**File:** `lib/auth.ts`
Changed `SameSite=Lax` → `SameSite=Strict` on both `makeSessionCookie` and
`clearSessionCookie`.

`Lax` allows the session cookie to be sent on top-level cross-site navigations
(e.g., user clicks a link from another site to `/admin`). `Strict` prevents the cookie
from being sent on *any* cross-site request, eliminating a CSRF vector for admin actions
triggered via crafted links.

Note: `Strict` means admin users will lose their session after clicking an external
link to the admin panel and will need to log in again. This is the correct trade-off
for an admin interface.

---

## Input Validation

### LOW (PATCHED) — petId Validated at API Boundary

**File:** `app/api/user/cheer/route.ts`
Previously, an invalid `petId` would cause a foreign-key constraint error deep in Prisma,
returning HTTP 500 with an internal DB error message.

**Fix applied:** Explicit `prisma.pet.findUnique` check before the upsert. Invalid pet IDs
now return HTTP 400 with a clean error message and no DB exception is thrown.

---

## Ongoing / Deployment Hardening

The following are NOT yet patched — they require infrastructure configuration:

### CRITICAL — SETTLER_2_KEYPAIR Must Be a Separate Key in Production
`lib/admin-signer.ts` falls back to the admin keypair if `SETTLER_2_KEYPAIR` is not set.
This effectively makes settlement single-signer in practice, defeating the 2-of-3 consensus
design. Set `SETTLER_2_KEYPAIR` in production before any real funds flow through the escrow.

### HIGH — Rate Limiting on POST /api/user/cheer
No rate limiting is applied to the cheer submission endpoint. A single wallet could spam
cheer requests to inflate `supporters` count in the DB (though `amountHamstar` is not
trusted without a verified tx). Apply middleware-level rate limiting (e.g., Upstash/Redis
or Vercel Edge middleware) before mainnet launch.

### HIGH — ATA Pre-Creation for Reward Recipients
`push_reward` will fail if the winner's Associated Token Account (ATA) for `HAMSTAR_MINT`
does not yet exist. The admin UI should warn before calling push-rewards, or the frontend
claim-reward flow should create the ATA (via `createAssociatedTokenAccountInstruction`)
as part of the `claim_reward` transaction.

### MEDIUM — ADMIN_SESSION_SECRET Rotation
The JWT secret in `ADMIN_SESSION_SECRET` is used to sign admin session tokens. A compromised
secret means all sessions are compromised. Store in a secrets manager (not `.env.local` in
production), and rotate it periodically. Rotation invalidates all active sessions.

### MEDIUM — RPC URL Should Be a Private Endpoint
Public RPC endpoints (`api.devnet.solana.com`) are rate-limited and unauthenticated.
In production, use a private endpoint (Helius, Triton, QuickNode) set via `SOLANA_RPC_URL`
or `HELIUS_API_KEY`. Exposed via `lib/admin-signer.ts:getServerRpcUrl()` and
`app/api/user/cheer/route.ts:getRpcUrl()`.

### LOW — DB Migration Not Yet Run
Schema changes adding `onChainRaceId`, `escrowAddress`, `onChainCreated`, `onChainSettled`
(Race model) and `onChainWeight`, `rewardPushed`, `rewardAmount` (Cheer model) were added
to `prisma/schema.prisma` and `prisma generate` was run, but `prisma migrate dev` has NOT
been run against the live database. Run this before any on-chain feature is used.

---

## Smart Contract Security Notes

### Anchor Program: `7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ`

- **Whale cap enforced on-chain:** Single wallet cannot exceed 20% of pool (`place_cheer`)
- **Settlement is 2-of-3 consensus:** `propose_settlement` + `confirm_settlement` from
  two distinct settler slots. Both votes must agree on the same `hamster_index`.
- **confirm_settlement bug patched:** Contract previously allowed a 3rd settler to vote
  after the race was already `Settled`. Fixed to reject votes when `race.status != Locked`.
- **Escrow is self-custodial PDA:** The escrow token account and its authority share the
  same PDA seeds `["race_escrow", race_id_le]`. Funds can only move via signed CPIs
  inside the program — no admin can drain the escrow unilaterally.
- **Refund path exists:** `cancel_race` + `claim_refund` gives every cheerer a full refund
  if the race is cancelled. Admin cannot cancel a race that is already `onChainSettled`.
- **Discriminator pre-computed:** All instruction discriminators are SHA-256 derived
  (`sha256("global:<ix_name>")[0:8]`). They must be kept in sync with the deployed
  program. If the program is redeployed with different instruction names, update
  `lib/hamstar-program.ts:DISC`.

---

*Last updated: 2026-04-11 — covers all patches applied in the security audit session.*
