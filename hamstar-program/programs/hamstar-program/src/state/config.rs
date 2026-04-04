use anchor_lang::prelude::*;

/// Global program configuration. One instance per deployment.
/// PDA seeds: ["config"]
#[account]
#[derive(Default)]
pub struct ProgramConfig {
    /// Authority that can update config and create/cancel races
    pub admin: Pubkey,
    /// Three settler pubkeys — any 2 of 3 must agree to settle a race
    pub settlers: [Pubkey; 3],
    /// Receives the treasury portion of the fee (2.5%)
    pub treasury: Pubkey,
    /// HAMSTAR SPL token mint — only this mint accepted for cheers
    pub hamstar_mint: Pubkey,
    /// Total fee in basis points (300 = 3.0%)
    pub fee_bps: u16,
    /// Portion of fee that is burned, in basis points (50 = 0.5%)
    pub burn_bps: u16,
    /// Minimum cheer amount in raw token units (e.g. 1000 * 10^9)
    pub min_cheer_amount: u64,
    /// Max time weight multiplier in basis points (1500 = 1.5x)
    pub time_weight_max_bps: u16,
    /// Min time weight multiplier in basis points (1000 = 1.0x)
    pub time_weight_min_bps: u16,
    /// Max share of pool a single wallet can cheer, in basis points (2000 = 20%)
    pub max_pool_share_bps: u16,
    pub bump: u8,
}

impl ProgramConfig {
    pub const SEED: &'static [u8] = b"config";

    pub const SIZE: usize = 8   // discriminator
        + 32                    // admin
        + 32 * 3                // settlers
        + 32                    // treasury
        + 32                    // hamstar_mint
        + 2                     // fee_bps
        + 2                     // burn_bps
        + 8                     // min_cheer_amount
        + 2                     // time_weight_max_bps
        + 2                     // time_weight_min_bps
        + 2                     // max_pool_share_bps
        + 1;                    // bump

    /// Returns the settler index (0, 1, 2) for a given pubkey, or None
    pub fn settler_index(&self, key: &Pubkey) -> Option<usize> {
        self.settlers.iter().position(|s| s == key)
    }

    /// Treasury fee = fee_bps - burn_bps
    pub fn treasury_bps(&self) -> u16 {
        self.fee_bps.saturating_sub(self.burn_bps)
    }
}
