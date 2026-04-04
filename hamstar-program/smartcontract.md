# HamstarHub — Smart Contract Plan

**Program:** `hamstar-program`
**Framework:** Anchor 0.30.1 (Rust)
**Network:** Solana (devnet → mainnet)
**Status:** Program written and compiling — 414KB `.so` artifact ✅
**Last updated:** April 3, 2026

---

## What This Contract Does

Users stake HAMSTAR tokens on a hamster before a race. After the race, the entire pool is distributed to those who picked the winner — weighted by how early they cheered. The contract is the neutral escrow and settlement layer. No one touches funds except through its instructions.

---

## Core Mechanic — Time-Weighted Pari-Mutuel

All tokens from all cheerers go into one pool. The pool minus a 3% fee is distributed to winning cheerers only. Your share of the winnings is proportional to your **weight**, not just your raw token amount.

```
pick_weight = tokens_staked × time_multiplier

time_multiplier:
  → 1500 / 1000  (1.5x) at window open
  → 1000 / 1000  (1.0x) at pick lock
  → decays linearly between open and close

All math uses u128 fixed-point integers. No floats.
```

**Example:**
```
Total pool:       1,000,000 HAMSTAR
Platform fee:        30,000 HAMSTAR → treasury (2.5%) + burn (0.5%)
Distributable:      970,000 HAMSTAR → split among winning cheerers

User A cheered 10,000 at 1.5x → weight 15,000
User B cheered 10,000 at 1.2x → weight 12,000
User C cheered 10,000 at 1.0x → weight 10,000
Total winning weight: 37,000

User A reward: (15,000 / 37,000) × 970,000 = ~393,243 HAMSTAR
User B reward: (12,000 / 37,000) × 970,000 = ~314,594 HAMSTAR
User C reward: (10,000 / 37,000) × 970,000 = ~262,162 HAMSTAR
```

---

## Settlement — 2-of-3 Multisig

Race outcomes are live-streamed and undisputed. The settlement flow:

```
Race finishes on stream
      ↓
Settler #1 calls propose_settlement(race_id, winner_index)
      ↓
Settler #2 calls confirm_settlement(race_id)
      ↓
Contract marks race settled, unlocks reward claims
      ↓
Admin server auto-pushes rewards to all winning wallets
      ↓
Fallback: users can claim manually (7-day window)
```

Three settler pubkeys are stored in ProgramConfig. Any 2 of 3 must agree on the same winner. If they disagree, neither goes through — requires a third signature to break the tie.

---

## Token

- **HAMSTAR** — SPL token on Solana
- Not yet deployed (planned pump.fun live-stream launch)
- Devnet: use a locally minted test SPL token during development
- Contract stores the authorized mint pubkey in ProgramConfig — only that mint is accepted

---

## Accounts

### ProgramConfig (PDA: `["config"]`)
Global settings. Set once at deploy, updatable by admin.

```
admin: Pubkey                  ← upgrade/config authority
settlers: [Pubkey; 3]          ← 3 keys for 2-of-3 race settlement
treasury: Pubkey               ← receives 2.5% fee
burn_mint: Pubkey              ← HAMSTAR mint for burn (0.5%)
hamstar_mint: Pubkey           ← authorized payment token mint
fee_bps: u16                   ← 300 (3.0%)
burn_bps: u16                  ← 50  (0.5%)
min_cheer_amount: u64          ← 1_000 × 10^decimals (configurable)
time_weight_max_bps: u16       ← 1500 (1.5x)
time_weight_min_bps: u16       ← 1000 (1.0x)
max_pool_share_bps: u16        ← 2000 (20% per wallet cap)
```

### Race (PDA: `["race", race_id.to_le_bytes()]`)
One account per race.

```
race_id: u64
hamster_count: u8              ← always 3
status: RaceStatus             ← Open | Locked | Settled | Cancelled
winner_index: Option<u8>
pick_window_open: i64          ← unix timestamp
pick_window_close: i64         ← unix timestamp
total_pool: u64                ← raw tokens in escrow
pool_per_hamster: [u64; 3]     ← raw tokens per hamster
weight_per_hamster: [u128; 3]  ← weighted totals per hamster
settlement_votes: [Option<u8>; 3]  ← each settler's vote
settlement_vote_count: u8
escrow: Pubkey                 ← PDA-owned ATA holding tokens
bump: u8
```

### CheerPosition (PDA: `["cheer", race_pubkey, user_pubkey]`)
One account per user per race.

```
user: Pubkey
race: Pubkey
hamster_index: u8
amount: u64                    ← raw tokens staked
weight: u128                   ← amount × time_multiplier at cheer time
claimed: bool
refunded: bool
bump: u8
```

---

## Instructions

| # | Instruction | Signer | Description |
|---|---|---|---|
| 1 | `initialize` | Admin | Deploy ProgramConfig with all global settings |
| 2 | `create_race` | Admin | Open a race: hamsters, window timestamps |
| 3 | `place_cheer` | User | Stake tokens on a hamster. Tokens → escrow. Weight calculated. |
| 4 | `lock_race` | Anyone | Close pick window once `pick_window_close` has passed |
| 5 | `propose_settlement` | Settler | First settler votes for winning hamster |
| 6 | `confirm_settlement` | Settler | Second settler confirms. If match → race settled. |
| 7 | `push_reward` | Admin | Server pushes payout to a single winning cheer account |
| 8 | `claim_reward` | User | User pulls their own reward (fallback) |
| 9 | `cancel_race` | Admin | Cancel race, enable refunds |
| 10 | `claim_refund` | User | User pulls full refund if race cancelled |

---

## Security Constraints (Enforced On-Chain)

| Constraint | Where enforced |
|---|---|
| Only HAMSTAR mint accepted | `place_cheer` — validates token mint |
| Pick window timing | `place_cheer` — rejects if `now > pick_window_close` |
| Whale cap (20% of pool) | `place_cheer` — rejects if stake would exceed cap |
| Min cheer amount | `place_cheer` — rejects if below threshold |
| 2-of-3 settlement | `confirm_settlement` — requires matching votes from 2 different settlers |
| No double claim | `claim_reward` / `push_reward` — rejects if `claimed == true` |
| No claim before settlement | `claim_reward` — rejects if `status != Settled` |
| Refund only if cancelled | `claim_refund` — rejects if `status != Cancelled` |
| Integer overflow protection | All arithmetic uses `checked_add`, `checked_mul` |

---

## Fee Flow

```
Total pool (100%)
    ↓
Burn (0.5%)  ──────────────────→ sent to burn address
Treasury (2.5%)  ──────────────→ ProgramConfig.treasury ATA
Distributable (97%)  ──────────→ split among winning cheer weights
```

---

## File Structure

```
hamstar-program/
  programs/
    hamstar-program/
      src/
        lib.rs                    ← program entry, declare_id!, module declarations
        errors.rs                 ← HamstarError enum
        state/
          mod.rs
          config.rs               ← ProgramConfig account + impl
          race.rs                 ← Race account + RaceStatus enum + impl
          cheer.rs                ← CheerPosition account + impl
        instructions/
          mod.rs
          initialize.rs
          create_race.rs
          place_cheer.rs
          lock_race.rs
          propose_settlement.rs
          confirm_settlement.rs
          push_reward.rs
          claim_reward.rs
          cancel_race.rs
          claim_refund.rs
      Cargo.toml
  tests/
    hamstar-program.ts            ← full TypeScript integration test suite
  Anchor.toml
  Cargo.toml
```

---

## Build Order

| Step | Task | Status |
|---|---|---|
| 1 | Scaffold — anchor init, Cargo deps, error types, state structs | ✅ Done |
| 2 | `initialize` — ProgramConfig PDA, global settings | ✅ Done |
| 3 | `create_race` — race account + escrow ATA init | ✅ Done |
| 4 | `place_cheer` — token transfer, weight calc, whale cap | ✅ Done |
| 5 | `lock_race` — status transition, timestamp enforcement | ✅ Done |
| 6 | `propose_settlement` + `confirm_settlement` — 2-of-3 vote | ✅ Done |
| 7 | `push_reward` — distribution, fee split | ✅ Done |
| 8 | `claim_reward` — user fallback pull | ✅ Done |
| 9 | `cancel_race` + `claim_refund` — full refund path | ✅ Done |
| 10 | Program compiles clean — 414KB `.so`, zero stack errors | ✅ Done |
| 11 | TypeScript test suite — full race lifecycle on localnet | ⬜ Next |
| 12 | Devnet deploy + end-to-end smoke test | ⬜ |
| 13 | Admin panel integration — create race, settle, push rewards buttons | ⬜ |
| 14 | Arena UI integration — cheer button, pick confirmation, reward display | ⬜ |
| 15 | Backend automation — race scheduler → contract sync, auto-push | ⬜ |
| 16 | Treasury multisig setup — Squads Protocol 2-of-3 | ⬜ |
| 17 | External security audit — OtterSec / Sec3 (engage now, queue early) | ⬜ |
| 18 | Audit fixes + mainnet deploy | ⬜ |

---

## Audit Notes (from pre-dev QA review)

Addressed in this design:
- ✅ 2-of-3 multisig settlement (not single admin key)
- ✅ Treasury multisig — Squads Protocol (separate from contract, infra step)
- ✅ Integer math only (u128, no floats)
- ✅ Whale cap (20% of pool per wallet)
- ✅ Time multiplier reduced to 1.5x max (was 2.0x)
- ✅ Batched push + manual fallback claim (DoS protection)
- ✅ Upgradeable loader + timelock (upgrade authority)
- ✅ Min cheer amount enforced on-chain

Deferred to post-launch:
- Burn mechanism (0.5% allocated, burn address TBD at token deploy)
- Parlay/accumulator mechanic (V2)
- Dark horse bonus pool (V2)
- External audit — OtterSec / Sec3 (before mainnet)

---

## Next Steps (Immediate)

### Step 11 — TypeScript Test Suite
Write `tests/hamstar-program.ts` covering the full race lifecycle on localnet:

```
Test cases to cover:
  ✦ initialize — config deploys correctly, PDA verifiable
  ✦ create_race — race account created, escrow ATA funded
  ✦ place_cheer — tokens transfer to escrow, weight calculated correctly
  ✦ place_cheer — rejects below minimum amount
  ✦ place_cheer — rejects whale cap violation (>20% of pool)
  ✦ place_cheer — rejects after pick window closes
  ✦ lock_race — transitions to Locked status
  ✦ lock_race — rejects if window still open
  ✦ propose_settlement — first vote recorded
  ✦ confirm_settlement — second matching vote settles race
  ✦ confirm_settlement — disagreeing votes do not settle
  ✦ push_reward — correct payout math (time-weighted share)
  ✦ push_reward — fee split to treasury
  ✦ push_reward — rejects double claim
  ✦ claim_reward — user fallback works identically
  ✦ cancel_race — transitions to Cancelled
  ✦ claim_refund — full amount returned, no fee
  ✦ claim_refund — rejects double refund
  ✦ Full happy path: open → cheer × 3 → lock → settle → push all rewards
```

### Step 12 — Devnet Deploy

```bash
# Generate a program keypair
solana-keygen new -o target/deploy/hamstar-program-keypair.json

# Deploy to devnet
solana program deploy \
  --program-id target/deploy/hamstar-program-keypair.json \
  target/deploy/hamstar_program.so \
  --url devnet

# Run smoke test against devnet
anchor test --provider.cluster devnet
```

### Step 13 — Admin Panel Integration
Add three new admin panel sections:

- **Create Race** — form: race_id, pick_window_open, pick_window_close → calls `create_race`
- **Settle Race** — live race cards with "Settle" button, hamster selector → calls `propose_settlement` / `confirm_settlement`
- **Push Rewards** — post-settlement: query all winning CheerPositions, batch `push_reward` txs

### Step 14 — Arena UI Integration
Wire the cheer mechanic into the existing arena page:

- Cheer button on each hamster card (opens pick confirmation modal)
- Pick confirmation: shows amount input, current multiplier, expected payout range
- Live odds display: updates as cheers come in (from on-chain pool state)
- Post-race: show reward claimed / pending status per user

### Step 16 — Treasury Multisig
Set up Squads Protocol before mainnet:
- Create 2-of-3 multisig at squads.so
- Assign treasury wallet as the Squads vault
- Assign upgrade authority to the Squads multisig with 48hr timelock

---

## Timeline

| Phase | Target | Deliverable |
|---|---|---|
| ✅ Program written | April 3, 2026 | All instructions compiling, `.so` artifact |
| Test suite | Week of April 7 | Full localnet coverage, all edge cases |
| Devnet deploy | Week of April 14 | Live on devnet, smoke tested |
| Admin + Arena UI | Week of April 21 | Wired up end-to-end on devnet |
| Squads multisig | Week of April 21 | Treasury + upgrade authority secured |
| Audit engagement | ASAP | Contact OtterSec / Sec3 now — they have waitlists |
| Audit | ~6 weeks from engagement | External review complete |
| Mainnet | Post-audit | Live with real HAMSTAR token |

---

*This is a living document. Update as decisions change.*
