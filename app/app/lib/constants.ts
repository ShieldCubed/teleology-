import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("HpUrEiEnyqKHmhF5daMWygXKjZPPWgtnLMEvi13ZqBPu");
export const TIMER_MINT = new PublicKey("5vzSVRH5qMbwnP8TKNFKQ6ajN1AWh14Zbvu5ffbbtrXp");
export const RPC_URL = "https://api.devnet.solana.com";
export const GRANDFATHER_PDA = new PublicKey("G3dB4c6zxmYpp3eupB6RXs4W7usBqoGqBH9rEEy3kK3G");

// ─── Oracle Feed Registry ─────────────────────────────────────────────────────

// Pyth Hermes feed IDs (fetch prices via https://hermes.pyth.network/v2/updates/price/latest)
export const PYTH_FEED_IDS = {
  "SOL/USD": "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  "BTC/USD": "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
} as const;

// Switchboard On-Demand devnet feed addresses (verified live Apr 2026)
export const SWITCHBOARD_FEEDS = {
  "SOL/USD": {
    address: "ALLUQGiNBPDzcYiEsKRKnV1pX2jBVWfQu1enu9qAA9qx", // SOL/USDC proxy
    label: "SOL/USDC",
  },
  "BTC/USD": {
    address: "9TrAgn8hHYhun7Qy3DHcm3yjam6LjkuVqTo9gaexMjoA",
    label: "BTC/USD",
  },
} as const;

export const SUPPORTED_ASSETS = ["SOL/USD", "BTC/USD"] as const;
export type SupportedAsset = typeof SUPPORTED_ASSETS[number];

// Oracle source identifiers (match Rust oracle_source: u8)
export const ORACLE_SOURCE = {
  PYTH: 0,
  SWITCHBOARD: 1,
} as const;

// Price scale: all prices stored/passed as integer * PRICE_SCALE
// e.g. SOL at $150.25 => 150_250_000
export const PRICE_SCALE = 1_000_000; // 6 decimal places
