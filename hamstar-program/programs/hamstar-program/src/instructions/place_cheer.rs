use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{ProgramConfig, Race, CheerPosition, RaceStatus};
use crate::errors::HamstarError;

#[derive(Accounts)]
#[instruction(race_id: u64, hamster_index: u8, amount: u64)]
pub struct PlaceCheer<'info> {
    #[account(
        seeds = [ProgramConfig::SEED],
        bump = config.bump,
    )]
    pub config: Box<Account<'info, ProgramConfig>>,

    #[account(
        mut,
        seeds = [Race::SEED, &race_id.to_le_bytes()],
        bump = race.bump,
        constraint = race.status == RaceStatus::Open @ HamstarError::RaceNotOpen,
    )]
    pub race: Box<Account<'info, Race>>,

    #[account(
        init_if_needed,
        payer = user,
        space = CheerPosition::SIZE,
        seeds = [CheerPosition::SEED, race.key().as_ref(), user.key().as_ref()],
        bump,
    )]
    pub cheer_position: Box<Account<'info, CheerPosition>>,

    /// User's HAMSTAR token account (source of funds)
    #[account(
        mut,
        constraint = user_token_account.mint == config.hamstar_mint @ HamstarError::InvalidMint,
        constraint = user_token_account.owner == user.key(),
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,

    /// Race escrow token account (destination)
    #[account(
        mut,
        address = race.escrow,
    )]
    pub escrow: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<PlaceCheer>,
    race_id: u64,
    hamster_index: u8,
    amount: u64,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let race = &mut ctx.accounts.race;
    let now = Clock::get()?.unix_timestamp;

    // Validate timing
    require!(race.is_window_open(now), HamstarError::WindowClosed);

    // Validate hamster index
    require!(hamster_index < 3, HamstarError::InvalidHamsterIndex);

    // Validate minimum cheer
    require!(amount >= config.min_cheer_amount, HamstarError::BelowMinimum);

    // Validate whale cap — user's new total must not exceed 20% of pool after deposit
    let cheer = &ctx.accounts.cheer_position;
    let existing_amount = if cheer.race == race.key() { cheer.amount } else { 0 };
    let new_user_total = existing_amount.checked_add(amount).ok_or(HamstarError::Overflow)?;
    let new_pool_total = race.total_pool.checked_add(amount).ok_or(HamstarError::Overflow)?;

    if new_pool_total > 0 {
        let user_share_bps = (new_user_total as u128)
            .checked_mul(10_000)
            .ok_or(HamstarError::Overflow)?
            .checked_div(new_pool_total as u128)
            .ok_or(HamstarError::Overflow)? as u16;
        require!(
            user_share_bps <= config.max_pool_share_bps,
            HamstarError::WhaleCapExceeded
        );
    }

    // Calculate time weight
    let weight_bps = race.time_weight_bps(
        now,
        config.time_weight_max_bps,
        config.time_weight_min_bps,
    );

    // weight = amount * weight_bps / 1000
    let weight = (amount as u128)
        .checked_mul(weight_bps as u128)
        .ok_or(HamstarError::Overflow)?
        .checked_div(1_000)
        .ok_or(HamstarError::Overflow)?;

    // Transfer tokens to escrow
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.escrow.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::transfer(cpi_ctx, amount)?;

    // Update race state
    race.total_pool = new_pool_total;
    race.pool_per_hamster[hamster_index as usize] = race.pool_per_hamster[hamster_index as usize]
        .checked_add(amount)
        .ok_or(HamstarError::Overflow)?;
    race.weight_per_hamster[hamster_index as usize] = race.weight_per_hamster[hamster_index as usize]
        .checked_add(weight)
        .ok_or(HamstarError::Overflow)?;

    // Update cheer position
    let cheer = &mut ctx.accounts.cheer_position;
    if !cheer.claimed && cheer.race == race.key() {
        // Top-up existing position (same hamster only — can't change pick)
        require!(cheer.hamster_index == hamster_index, HamstarError::InvalidHamsterIndex);
        cheer.amount = cheer.amount.checked_add(amount).ok_or(HamstarError::Overflow)?;
        cheer.weight = cheer.weight.checked_add(weight).ok_or(HamstarError::Overflow)?;
    } else {
        // New position
        cheer.user = ctx.accounts.user.key();
        cheer.race = race.key();
        cheer.hamster_index = hamster_index;
        cheer.amount = amount;
        cheer.weight = weight;
        cheer.claimed = false;
        cheer.refunded = false;
        cheer.bump = ctx.bumps.cheer_position;
    }

    msg!(
        "Cheer placed: {} HAMSTAR on hamster #{} | weight {} | race {}",
        amount,
        hamster_index,
        weight,
        race_id,
    );
    Ok(())
}
