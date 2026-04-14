use anchor_lang::prelude::*;
use crate::error::TeleologyError;
use crate::state::{Game, GameStatus, GameType, PriceDirection, Universe};

const MAX_PYTH_AGE_SECS: i64 = 60;
const MAX_SB_AGE_SECS: i64 = 120;

pub fn handler(
    ctx: Context<SettleGame>,
    resolved_price: i64,
    price_timestamp: i64,
    oracle_source: u8,
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let universe = &ctx.accounts.universe;
    let clock = Clock::get()?;

    require!(
        game.status == GameStatus::Open || game.status == GameStatus::Locked,
        TeleologyError::GameAlreadySettled
    );
    require!(
        clock.unix_timestamp >= game.lock_time,
        TeleologyError::GameNotLocked
    );

    if universe.porosity < 100 {
        require!(
            ctx.accounts.oracle.key() == game.oracle,
            TeleologyError::Unauthorized
        );
    }

    require!(resolved_price > 0, TeleologyError::OracleInvalidPrice);
    let max_age = if oracle_source == 0 { MAX_PYTH_AGE_SECS } else { MAX_SB_AGE_SECS };
    let age = clock.unix_timestamp.saturating_sub(price_timestamp);
    require!(age <= max_age, TeleologyError::OracleStale);

    let outcome = match &game.game_type {
        GameType::AssetPrice { target_price, direction, .. } => {
            let strike = *target_price as i64;
            match direction {
                PriceDirection::Above => resolved_price >= strike,
                PriceDirection::Below => resolved_price < strike,
            }
        }
        _ => resolved_price == 1,
    };

    game.status = GameStatus::Settled;
    game.outcome = Some(outcome);

    emit!(GameSettled {
        game: ctx.accounts.game.key(),
        outcome,
        resolved_price,
        oracle_source,
        settled_at: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct GameSettled {
    pub game: Pubkey,
    pub outcome: bool,
    pub resolved_price: i64,
    pub oracle_source: u8,
    pub settled_at: i64,
}

#[derive(Accounts)]
pub struct SettleGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.universe.as_ref(), &game.game_index.to_le_bytes()],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
        constraint = universe.key() == game.universe @ TeleologyError::Unauthorized,
    )]
    pub universe: Account<'info, Universe>,

    pub oracle: Signer<'info>,
}
