use anchor_lang::prelude::*;
use crate::constants::*;
use crate::error::TeleologyError;
use crate::state::Universe;

pub fn handler(ctx: Context<SetPorosity>, new_porosity: u8) -> Result<()> {
    require!(new_porosity <= MAX_POROSITY, TeleologyError::PorosityTooHigh);

    let universe = &mut ctx.accounts.universe;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    // Ratchet rule: tighten freely, loosen = time-locked
    if new_porosity > universe.porosity {
        // loosening — check time lock
        require!(
            now >= universe.porosity_locked_until,
            TeleologyError::PorosityTimeLocked
        );
        // set new lock for next loosen attempt
        universe.porosity_locked_until = now + POROSITY_LOCK_DURATION;
    }
    // tightening — always allowed, no lock needed

    universe.porosity = new_porosity;
    Ok(())
}

#[derive(Accounts)]
pub struct SetPorosity<'info> {
    #[account(
        mut,
        seeds = [b"universe", authority.key().as_ref(), universe.name.as_ref()],
        bump = universe.bump,
        has_one = authority @ TeleologyError::Unauthorized,
    )]
    pub universe: Account<'info, Universe>,

    pub authority: Signer<'info>,
}
