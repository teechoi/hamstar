use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::state::{ProgramConfig, Race, RaceStatus};
use crate::errors::HamstarError;

#[derive(Accounts)]
#[instruction(race_id: u64)]
pub struct CreateRace<'info> {
    #[account(
        seeds = [ProgramConfig::SEED],
        bump = config.bump,
        has_one = admin,
        has_one = hamstar_mint,
    )]
    pub config: Box<Account<'info, ProgramConfig>>,

    #[account(
        init,
        payer = admin,
        space = Race::SIZE,
        seeds = [Race::SEED, &race_id.to_le_bytes()],
        bump,
    )]
    pub race: Box<Account<'info, Race>>,

    /// PDA-owned token account that holds escrowed HAMSTAR tokens for this race
    #[account(
        init,
        payer = admin,
        token::mint = hamstar_mint,
        token::authority = race_escrow_authority,
        seeds = [Race::ESCROW_SEED, &race_id.to_le_bytes()],
        bump,
    )]
    pub escrow: Box<Account<'info, TokenAccount>>,

    /// CHECK: PDA used as token authority for the escrow account
    #[account(
        seeds = [Race::ESCROW_SEED, &race_id.to_le_bytes()],
        bump,
    )]
    pub race_escrow_authority: UncheckedAccount<'info>,

    pub hamstar_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<CreateRace>,
    race_id: u64,
    pick_window_open: i64,
    pick_window_close: i64,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    require!(pick_window_open >= now, HamstarError::InvalidTimestamps);
    require!(pick_window_close > pick_window_open, HamstarError::InvalidTimestamps);
    require!(
        pick_window_close - pick_window_open >= 60,
        HamstarError::WindowTooShort
    );

    let race = &mut ctx.accounts.race;
    race.race_id = race_id;
    race.status = RaceStatus::Open;
    race.winner_index = None;
    race.pick_window_open = pick_window_open;
    race.pick_window_close = pick_window_close;
    race.total_pool = 0;
    race.pool_per_hamster = [0u64; 3];
    race.weight_per_hamster = [0u128; 3];
    race.settlement_votes = [None; 3];
    race.settlement_vote_count = 0;
    race.escrow = ctx.accounts.escrow.key();
    race.bump = ctx.bumps.race;
    race.escrow_bump = ctx.bumps.escrow;

    msg!("Race {} created. Window: {} → {}", race_id, pick_window_open, pick_window_close);
    Ok(())
}
