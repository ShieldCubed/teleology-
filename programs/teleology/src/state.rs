use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
#[derive(Debug)]
pub enum UniverseType {
    Financial,    // hedge funds
    MachineTwin,  // drones, robots, vehicles
    Fsp,          // AGI signal processors
}

#[account]
pub struct GlobalConfig {
    pub authority: Pubkey,       // upgrade authority
    pub treasury: Pubkey,        // fee destination
    pub protocol_fee_bps: u16,   // basis points
    pub paused: bool,
    pub bump: u8,
    pub vault_bump: u8,
}

impl GlobalConfig {
    pub const LEN: usize = 8   // discriminator
        + 32   // authority
        + 32   // treasury
        + 2    // protocol_fee_bps
        + 1    // paused
        + 1   // bump
        + 1;   // vault_bump
}

#[account]
pub struct Universe {
    pub authority: Pubkey,
    pub universe_type: UniverseType,
    pub name: [u8; 32],
    pub porosity: u8,              // 0-100
    pub porosity_locked_until: i64, // unix ts, loosen time-lock
    pub game_count: u32,
    pub bump: u8,
}

impl Universe {
    pub const LEN: usize = 8   // discriminator
        + 32   // authority
        + 1    // universe_type enum
        + 32   // name
        + 1    // porosity
        + 8    // porosity_locked_until
        + 4    // game_count
        + 1   // bump
        + 1;   // vault_bump
}

#[account]
pub struct PorosityConfig {
    pub universe: Pubkey,
    pub current_porosity: u8,
    pub locked_until: i64,
    pub bump: u8,
}

impl PorosityConfig {
    pub const LEN: usize = 8   // discriminator
        + 32   // universe
        + 1    // current_porosity
        + 8    // locked_until
        + 1   // bump
        + 1;   // vault_bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameType {
    AssetPrice {
        asset_symbol: [u8; 8],  // e.g. b"SOL/USD\0"
        target_price: u64,      // in lamports or smallest unit
        direction: PriceDirection,
    },
    CustomEvent {
        event_id: [u8; 32],     // FSP-defined event identifier
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PriceDirection {
    Above,
    Below,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameStatus {
    Open,
    Locked,     // betting closed, awaiting settlement
    Settled,
    Cancelled,
}

#[account]
pub struct Game {
    pub universe: Pubkey,
    pub oracle: Pubkey,         // designated settler
    pub token_mint: Pubkey,     // any SPL token
    pub vault: Pubkey,          // token account holding bets
    pub game_type: GameType,
    pub status: GameStatus,
    pub yes_amount: u64,        // total bet YES
    pub no_amount: u64,         // total bet NO
    pub outcome: Option<bool>,  // Some(true)=YES won, Some(false)=NO won
    pub lock_time: i64,         // unix ts — no new bets after this
    pub settle_time: i64,       // unix ts — oracle must settle by this
    pub game_index: u32,        // incrementing index within universe
    pub bump: u8,
    pub vault_bump: u8,
}

impl Game {
    pub const LEN: usize = 8    // discriminator
        + 32   // universe
        + 32   // oracle
        + 32   // token_mint
        + 32   // vault
        + 1 + 8 + 8 + 1 + 32   // game_type (worst case CustomEvent)
        + 1    // status
        + 8    // yes_amount
        + 8    // no_amount
        + 1 + 1 // outcome (Option<bool>)
        + 8    // lock_time
        + 8    // settle_time
        + 4    // game_index
        + 1    // bump
        + 1    // vault_bump
        + 64;  // padding
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BetSide {
    Yes,
    No,
}

#[account]
pub struct Bet {
    pub game: Pubkey,
    pub bettor: Pubkey,
    pub side: BetSide,
    pub amount: u64,
    pub claimed: bool,
    pub bump: u8,
}

impl Bet {
    pub const LEN: usize = 8   // discriminator
        + 32   // game
        + 32   // bettor
        + 1    // side
        + 8    // amount
        + 1    // claimed
        + 1   // bump
        + 1;   // vault_bump
}

#[account]
pub struct Grandfather {
    pub authority: Pubkey,        // upgrade authority (your wallet)
    pub treasury: Pubkey,         // where spawn fees accumulate (SOL)
    pub timer_mint: Pubkey,       // TIMER token mint
    pub spawn_fee: u64,           // TIMER to burn when spawning a child universe
    pub stake_duration: i64,      // reserved for future time-lock logic
    pub universe_count: u32,      // total child universes spawned
    pub bump: u8,
}

impl Grandfather {
    pub const LEN: usize = 8      // discriminator
        + 32   // authority
        + 32   // treasury
        + 32   // timer_mint
        + 8    // spawn_fee
        + 8    // stake_duration
        + 4    // universe_count
        + 1    // bump
        + 32;  // padding
}
