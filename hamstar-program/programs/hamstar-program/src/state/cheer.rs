use anchor_lang::prelude::*;

/// Per-user per-race cheer position.
/// PDA seeds: ["cheer", race_pubkey, user_pubkey]
#[account]
#[derive(Default)]
pub struct CheerPosition {
    pub user: Pubkey,
    pub race: Pubkey,
    /// Which hamster (0–2) this user cheered for
    pub hamster_index: u8,
    /// Raw HAMSTAR tokens staked
    pub amount: u64,
    /// Weighted stake = amount × time_weight_bps / 1000
    /// Stored as u128 to prevent overflow in distribution math
    pub weight: u128,
    pub claimed: bool,
    pub refunded: bool,
    pub bump: u8,
}

impl CheerPosition {
    pub const SEED: &'static [u8] = b"cheer";

    pub const SIZE: usize = 8   // discriminator
        + 32                    // user
        + 32                    // race
        + 1                     // hamster_index
        + 8                     // amount
        + 16                    // weight
        + 1                     // claimed
        + 1                     // refunded
        + 1;                    // bump
}
