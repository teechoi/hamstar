use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{ProgramConfig, Race, CheerPosition, RaceStatus};
use crate::errors::HamstarError;

#[derive(Accounts)]
#[instruction(race_id: u64)]
pub struct ClaimRefund<'info> {
    #[account(
        seeds = [ProgramConfig::SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, ProgramConfig>,

    #[account(
        seeds = [Race::SEED, &race_id.to_le_bytes()],
        bump = race.bump,
        constraint = race.status == RaceStatus::Cancelled @ HamstarError::RaceNotCancelled,
    )]
    pub race: Account<'info, Race>,

    #[account(
        mut,
        seeds = [CheerPosition::SEED, race.key().as_ref(), user.key().as_ref()],
        bump = cheer_position.bump,
        has_one = user,
        constraint = !cheer_position.refunded @ HamstarError::AlreadyRefunded,
    )]
    pub cheer_position: Account<'info, CheerPosition>,

    #[account(
        mut,
        address = race.escrow,
    )]
    pub escrow: Account<'info, TokenAccount>,

    /// CHECK: PDA used as escrow authority
    #[account(
        seeds = [Race::ESCROW_SEED, &race_id.to_le_bytes()],
        bump = race.escrow_bump,
    )]
    pub race_escrow_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = user_token_account.owner == user.key(),
        constraint = user_token_account.mint == config.hamstar_mint @ HamstarError::InvalidMint,
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimRefund>, race_id: u64) -> Result<()> {
    let race = &ctx.accounts.race;
    let cheer = &mut ctx.accounts.cheer_position;
    let refund_amount = cheer.amount;

    let escrow_seeds: &[&[&[u8]]] = &[&[
        Race::ESCROW_SEED,
        &race_id.to_le_bytes(),
        &[race.escrow_bump],
    ]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.race_escrow_authority.to_account_info(),
            },
            escrow_seeds,
        ),
        refund_amount,
    )?;

    cheer.refunded = true;

    msg!("Refund issued: {} HAMSTAR (race {})", refund_amount, race_id);
    Ok(())
}
