use anchor_lang::prelude::*;

#[error_code]
pub enum HamstarError {
    #[msg("Pick window has not opened yet")]
    WindowNotOpen,
    #[msg("Pick window is closed")]
    WindowClosed,
    #[msg("Pick window is still open")]
    WindowStillOpen,
    #[msg("Race is not in Open status")]
    RaceNotOpen,
    #[msg("Race is not in Locked status")]
    RaceNotLocked,
    #[msg("Race is not settled")]
    RaceNotSettled,
    #[msg("Race is not cancelled")]
    RaceNotCancelled,
    #[msg("Race is already settled or cancelled")]
    RaceAlreadyFinal,
    #[msg("Invalid hamster index")]
    InvalidHamsterIndex,
    #[msg("Cheer amount is below minimum")]
    BelowMinimum,
    #[msg("Cheer would exceed whale cap (20% of pool)")]
    WhaleCapExceeded,
    #[msg("Invalid token mint — only HAMSTAR accepted")]
    InvalidMint,
    #[msg("Reward already claimed")]
    AlreadyClaimed,
    #[msg("Refund already processed")]
    AlreadyRefunded,
    #[msg("User did not pick the winning hamster")]
    NotAWinner,
    #[msg("Settler has already voted")]
    AlreadyVoted,
    #[msg("Not an authorized settler")]
    UnauthorizedSettler,
    #[msg("Settlement votes do not agree")]
    SettlementDisagreement,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Invalid timestamp configuration")]
    InvalidTimestamps,
    #[msg("Window duration too short (minimum 60 seconds)")]
    WindowTooShort,
}
