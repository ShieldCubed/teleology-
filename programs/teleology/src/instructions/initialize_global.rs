use anchor_lang::prelude::*;
use crate::constants::*;
use crate::error::TeleologyError;
use crate::state::GlobalConfig;

pub fn handler(
    ctx: Context<InitializeGlobal>,
    protocol_fee_bps: u16,
) -> Result<()> {
    require!(
        protocol_fee_bps <= PROTOCOL_FEE_BPS_MAX,
        TeleologyError::FeeTooHigh
    );

    let config = &mut ctx.accounts.global_config;
    config.authority = ctx.accounts.authority.key();
    config.treasury = ctx.accounts.treasury.key();
    config.protocol_fee_bps = protocol_fee_bps;
    config.paused = false;
    config.bump = ctx.bumps.global_config;
    config.vault_bump = 0;

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeGlobal<'info> {
    #[account(
        init,
        payer = authority,
        space = GlobalConfig::LEN,
        seeds = [b"global-config-v2", authority.key().as_ref()],
        bump,
    )]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: just a pubkey for receiving fees
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
