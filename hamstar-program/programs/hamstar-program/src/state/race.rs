use anchor_lang::prelude::*;

pub const MAX_HAMSTERS: usize = 3;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum RaceStatus {
    Open,
    Locked,
    Settled,
    Cancelled,
}

impl Default for RaceStatus {
    fn default() -> Self {
        RaceStatus::Open
    }
}

/// Per-race account.
/// PDA seeds: ["race", race_id.to_le_bytes()]
#[account]
#[derive(Default)]
pub struct Race {
    /// Unique monotonic race identifier
    pub race_id: u64,
    pub status: RaceStatus,
    /// Winning hamster index (0–2), set on settlement
    pub winner_index: Option<u8>,
    /// Unix timestamp: when the cheer window opens
    pub pick_window_open: i64,
    /// Unix timestamp: when the cheer window closes (pick lock)
    pub pick_window_close: i64,
    /// Total raw HAMSTAR tokens in escrow across all hamsters
    pub total_pool: u64,
    /// Raw token totals per hamster
    pub pool_per_hamster: [u64; MAX_HAMSTERS],
    /// Weighted totals per hamster (used for reward distribution)
    pub weight_per_hamster: [u128; MAX_HAMSTERS],
    /// Settlement votes: each element is the hamster index voted by that settler slot
    /// None = not yet voted
    pub settlement_votes: [Option<u8>; 3],
    /// How many settlers have voted
    pub settlement_vote_count: u8,
    /// PDA-owned escrow token account holding all cheered tokens
    pub escrow: Pubkey,
    pub bump: u8,
    pub escrow_bump: u8,
}

impl Race {
    pub const SEED: &'static [u8] = b"race";
    pub const ESCROW_SEED: &'static [u8] = b"race_escrow";

    pub const SIZE: usize = 8           // discriminator
        + 8                             // race_id
        + 1 + 1                         // status (enum tag) + padding
        + 1 + 1                         // winner_index (Option<u8>)
        + 8                             // pick_window_open
        + 8                             // pick_window_close
        + 8                             // total_pool
        + 8 * MAX_HAMSTERS              // pool_per_hamster
        + 16 * MAX_HAMSTERS             // weight_per_hamster
        + (1 + 1) * 3                   // settlement_votes (Option<u8> × 3)
        + 1                             // settlement_vote_count
        + 32                            // escrow
        + 1                             // bump
        + 1                             // escrow_bump
        + 32;                           // padding

    pub fn is_window_open(&self, now: i64) -> bool {
        now >= self.pick_window_open && now < self.pick_window_close
    }

    /// Compute time weight (in basis points) for a cheer placed at `now`.
    /// Decays linearly from max_bps at open → min_bps at close.
    pub fn time_weight_bps(&self, now: i64, max_bps: u16, min_bps: u16) -> u16 {
        let duration = self.pick_window_close - self.pick_window_open;
        if duration <= 0 {
            return min_bps;
        }
        let elapsed = (now - self.pick_window_open).max(0);
        let range = max_bps.saturating_sub(min_bps) as i64;
        let decay = (range * elapsed) / duration;
        (max_bps as i64 - decay).max(min_bps as i64) as u16
    }

    /// Record a settler's vote. Returns true if we now have 2 matching votes.
    pub fn record_vote(&mut self, settler_slot: usize, hamster_index: u8) -> bool {
        self.settlement_votes[settler_slot] = Some(hamster_index);
        self.settlement_vote_count += 1;

        // Check if any 2 votes match
        let votes: Vec<u8> = self.settlement_votes.iter()
            .filter_map(|v| *v)
            .collect();

        for i in 0..votes.len() {
            for j in (i + 1)..votes.len() {
                if votes[i] == votes[j] {
                    return true;
                }
            }
        }
        false
    }

    /// Returns the agreed winner if 2+ votes match
    pub fn agreed_winner(&self) -> Option<u8> {
        let votes: Vec<u8> = self.settlement_votes.iter()
            .filter_map(|v| *v)
            .collect();

        for i in 0..votes.len() {
            for j in (i + 1)..votes.len() {
                if votes[i] == votes[j] {
                    return Some(votes[i]);
                }
            }
        }
        None
    }
}
