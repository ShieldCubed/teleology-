use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use crate::state::Grandfather;

pub fn handler(
    ctx: Context<InitializeGrandfather>,
    spawn_fee: u64,
    stake_duration: i64,
) -> Result<()> {
    let gf = &mut ctx.accounts.grandfather;
    gf.authority = ctx.accounts.authority.key();
    gf.treasury = ctx.accounts.treasury.key();
    gf.timer_mint = ctx.accounts.timer_mint.key();
    gf.spawn_fee = spawn_fee;
    gf.stake_duration = stake_duration;
    gf.universe_count = 0;
    gf.bump = ctx.bumps.grandfather;
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeGrandfather<'info> {
    #[account(
        init,
        payer = authority,
        space = Grandfather::LEN,
        seeds = [b"grandfather"],
        bump,
    )]
    pub grandfather: Account<'info, Grandfather>,

    /// CHECK: treasury is a SOL destination, no data needed
    pub treasury: UncheckedAccount<'info>,

    pub timer_mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
