use anchor_lang::prelude::*;
use crate::constants::*;
use crate::error::TeleologyError;
use crate::state::{GlobalConfig, Universe, UniverseType};

pub fn handler(
    ctx: Context<CreateUniverse>,
    universe_type: UniverseType,
    name: String,
    initial_porosity: u8,
) -> Result<()> {
    let config = &ctx.accounts.global_config;
    require!(!config.paused, TeleologyError::ProgramPaused);
    require!(name.len() <= MAX_NAME_LEN, TeleologyError::NameTooLong);
    require!(initial_porosity <= MAX_POROSITY, TeleologyError::PorosityTooHigh);

    let universe = &mut ctx.accounts.universe;
    universe.authority = ctx.accounts.authority.key();
    universe.universe_type = universe_type;
    universe.porosity = initial_porosity;
    universe.porosity_locked_until = 0;
    universe.game_count = 0;
    universe.bump = ctx.bumps.universe;

    // pack name into fixed [u8; 32]
    let mut name_bytes = [0u8; 32];
    let bytes = name.as_bytes();
    name_bytes[..bytes.len()].copy_from_slice(bytes);
    universe.name = name_bytes;

    Ok(())
}

#[derive(Accounts)]
#[instruction(universe_type: UniverseType, name: String)]
pub struct CreateUniverse<'info> {
    #[account(
        init,
        payer = authority,
        space = Universe::LEN,
        seeds = [b"universe", authority.key().as_ref(), name.as_bytes()],
        bump,
    )]
    pub universe: Account<'info, Universe>,

    #[account(seeds = [b"global-config-v2", authority.key().as_ref()], bump = global_config.bump)]
    pub global_config: Account<'info, GlobalConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
