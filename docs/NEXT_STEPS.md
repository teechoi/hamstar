# HamstarHub — Next Steps

*Last updated: April 12, 2026*

This document is a complete handoff. Everything here is sequenced — start at the top and work down. Each item notes which repo it lives in and whether a redeploy is needed.

---

## STOP — Do These Before Anything Else

### 1. Rotate compromised credentials (manual, 15 min)

The DB password `Hamchee888!` was stored in `.claude/settings.local.json` (not in git, but it existed on disk). Rotate all of the following at their respective dashboards:

| Credential | Where to rotate |
|---|---|
| Supabase DB password | supabase.com → Project → Settings → Database → Reset password |
| Supabase service role key | supabase.com → Project → Settings → API → Regenerate |
| Helius API key | dev.helius.xyz → API Keys → Regenerate |
| Privy app secret (if used server-side) | dashboard.privy.io → App → API Keys |

After rotating, update `.env.local` locally and re-sync all env vars in Vercel:
`vercel env pull` to pull current, edit, then re-add changed ones via `vercel env add`.

### 2. Run the DB migration (`hamstarhub/`, 2 min)

The Prisma schema added `@unique` to `Cheer.txSignature` (replay attack prevention) but the live database hasn't been migrated yet.

```bash
cd ~/Desktop/hamstar/hamstarhub
npx prisma migrate dev --name add_cheer_txsig_unique
```

This will fail if run from the parent `hamstar/` directory — must be inside `hamstarhub/`.

---

## Launch Blockers (required before real money flows)

### 3. Deploy Anchor program upgrade (`hamstar-program/`)

The program has new code committed (settler rotation + upset_reserve guard) but hasn't been rebuilt and deployed yet. You need the full Solana/Anchor toolchain for this.

```bash
cd ~/Desktop/hamstar/hamstar-program
avm use 0.30.1
anchor build

# Test on devnet first
anchor upgrade --provider.cluster devnet \
  --program-id 7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ \
  target/deploy/hamstar_program.so

# When confident, mainnet
anchor upgrade --provider.cluster mainnet-beta \
  --program-id 7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ \
  target/deploy/hamstar_program.so
```

After mainnet upgrade, immediately call `create_upset_reserve` via the admin panel (Program tab) so the `push_reward` guard doesn't block reward distribution.

### 4. Set production keypair env vars (Vercel dashboard)

These are not yet set in production:

| Variable | Description |
|---|---|
| `ADMIN_KEYPAIR` | Base58 secret key of admin wallet (signs create_race, push_reward, etc.) |
| `TREASURY_WALLET` | Base58 public key of treasury wallet |
| `SETTLER_2_KEYPAIR` | Base58 secret key of second settler. **Must be different from ADMIN_KEYPAIR** or settlement degrades to single-signer. |
| `NEXT_PUBLIC_PROGRAM_ID` | `7VumdroGjCGoY8skLuATZY6U7uMJeiE6fRaewdXLSVwQ` |

### 5. Launch $HAMSTAR SPL token

1. Deploy SPL token (e.g., via `spl-token create-token` or Metaplex)
2. Update `HAMSTAR_MINT` in `lib/hamstar-token.ts` with the real mint address
3. Update `hamstarMint` in admin → Settings → $HAMSTAR Mint

This single change exits pre-launch mode instantly — CheerModal switches to real on-chain transactions, balance checks activate, swap widget goes live.

### 6. Wire `place_cheer` on-chain in CheerModal

**File:** `components/arena/CheerModal.tsx`

Currently the submit handler calls `buildCheerTransaction()` from `lib/hamstar-program.ts` which returns `null` when `HAMSTAR_MINT` is a placeholder (pre-launch). Once the token is live, this will return a real transaction. But the modal also needs to:
- Call `sendTransaction(tx, connection)` from `useWallet()`
- POST the resulting signature to `/api/user/cheer`
- Handle wallet rejection / RPC timeout gracefully

The pre-launch banner in the modal will disappear automatically once both the mint and `onChainRaceId` are non-null.

### 7. Register Helius webhook on production

In the Helius dashboard:
- Endpoint: `https://hamstarhub.xyz/api/webhook`
- Account addresses: treasury wallet + all three pet wallet addresses
- Auth header key: `x-helius-webhook-secret`
- Auth header value: `HELIUS_WEBHOOK_SECRET` from your env

The `/api/webhook` route now exists and is verified.

---

## After First Live Race

### 8. Add rate limiting to `/api/user/cheer`

File: `app/api/user/cheer/route.ts`

A single wallet can currently spam this endpoint (though amounts aren't trusted without a verified tx, it inflates supporter counts). Add Upstash Redis rate limiting or an in-memory per-wallet map similar to the one on `/api/admin/login`.

### 9. ATA pre-creation for reward recipients

`push_reward` (on-chain) will fail if a winner's HAMSTAR Associated Token Account doesn't exist yet. Two options:
- Add an ATA creation step to the `claim_reward` client flow (winner creates their own ATA before claiming)
- Add a check in the admin push-rewards UI that warns if any winner's ATA is missing, with a one-click creation button

Check with: `getAssociatedTokenAddress(HAMSTAR_MINT, winnerWallet)` then `connection.getAccountInfo()` — if null, ATA needs creating.

---

## Nice to Have

### Real screenshots for PWA manifest

`public/screenshots/` contains placeholder images. Replace with 3 real device captures (1080×1920 portrait):
1. Arena page with live race
2. CheerModal open
3. Win overlay

Update `public/manifest.json` `screenshots` array with the new filenames.

### Solana Mobile / dApp Store

Full guide at `docs/SEEKER.md`. Short version:
1. Fix screenshots (above)
2. Generate signing keystore + create `public/.well-known/assetlinks.json`
3. `bubblewrap init --manifest https://hamstarhub.xyz/manifest.json`
4. `bubblewrap build` → sign APK
5. Submit via `dapp-store` CLI

### Minor code cleanup

- `ArenaClient.tsx` ~line 87: dead ternary — `effectiveResult` evaluates to same value both branches
- `/api/user/cheer`: add Zod input validation (max string lengths) before the PublicKey check

---

## Current State Summary

| Area | State |
|---|---|
| Web app | Live at hamstarhub.xyz, fully deployed on Vercel |
| Pre-launch mode | ON — all cheers recorded off-chain |
| DB migration (txSig unique) | **PENDING** — run step 2 above |
| Anchor program | New code committed, **not yet deployed** — run step 3 |
| $HAMSTAR token | Not launched |
| Credentials | **ROTATE NOW** — see step 1 |
| Helius webhook | Route exists, env vars set, not registered in dashboard |
| Admin panel | Fully operational |
| Security headers | Applied |
| JWT audience | Applied |
| Replay protection | Applied (pending DB migration) |
| Settler rotation | Instruction added (pending anchor deploy) |
