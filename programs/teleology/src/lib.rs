pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;
use state::{BetSide, GameType, UniverseType};

declare_id!("HpUrEiEnyqKHmhF5daMWygXKjZPPWgtnLMEvi13ZqBPu");

#[program]
pub mod teleology {
    use super::*;

    pub fn initialize_global(
        ctx: Context<InitializeGlobal>,
        protocol_fee_bps: u16,
    ) -> Result<()> {
        initialize_global::handler(ctx, protocol_fee_bps)
    }

    pub fn initialize_grandfather(
        ctx: Context<InitializeGrandfather>,
        spawn_fee: u64,
        stake_duration: i64,
    ) -> Result<()> {
        initialize_grandfather::handler(ctx, spawn_fee, stake_duration)
    }

    pub fn create_universe(
        ctx: Context<CreateUniverse>,
        universe_type: UniverseType,
        name: String,
        initial_porosity: u8,
    ) -> Result<()> {
        create_universe::handler(ctx, universe_type, name, initial_porosity)
    }

    pub fn set_porosity(ctx: Context<SetPorosity>, new_porosity: u8) -> Result<()> {
        set_porosity::handler(ctx, new_porosity)
    }

    pub fn create_game(
        ctx: Context<CreateGame>,
        game_type: GameType,
        lock_time: i64,
        settle_time: i64,
    ) -> Result<()> {
        create_game::handler(ctx, game_type, lock_time, settle_time)
    }

    pub fn place_bet(ctx: Context<PlaceBet>, side: BetSide, amount: u64) -> Result<()> {
        place_bet::handler(ctx, side, amount)
    }

    pub fn settle_game(ctx: Context<SettleGame>, outcome: bool) -> Result<()> {
        settle_game::handler(ctx, outcome)
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        claim_winnings::handler(ctx)
    }
}
