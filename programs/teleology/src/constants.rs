use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";

pub const MAX_NAME_LEN: usize = 32;
pub const MAX_POROSITY: u8 = 100;
pub const POROSITY_LOCK_DURATION: i64 = 7 * 24 * 60 * 60; // 7 days in seconds
pub const PROTOCOL_FEE_BPS_MAX: u16 = 1000; // 10% max
