# Teleology

A Solana prediction market protocol with universe-based isolation and porosity-controlled access.

## Overview

Teleology enables permissionless prediction markets organized inside **Universes** - containers that represent different domains of intelligence:

- **FSP** (AGI Signal Processors) - AI-driven signal markets
- **Financial** - Hedge fund and asset price markets
- **MachineTwin** - Drone, robot, and vehicle outcome markets

## On-chain Addresses (Devnet)

| Account | Address |
|---|---|
| Program ID | `YbHTUaJk2tQfX5VUY4iMv2bqd2oDHoS3MaerF6VKvgk` |
| GlobalConfig | `HoBNV2HRMTLiD5h96XE7Q8vat5Y53Jr3CBDXHm41KkRu` |
| FSP Universe fsp-alpha | `87g4cgFaCopAufWwZ8ucyGsyJZCjLJLXrJ7a6q7j3kgq` |
| TIMER Token Mint | `5vzSVRH5qMbwnP8TKNFKQ6ajN1AWh14Zbvu5ffbbtrXp` |

## Porosity Ratchet Rule

Each Universe has a porosity value (0-100). The ratchet rule enforces:
- **Tighten** (reduce porosity): always allowed, instant
- **Loosen** (increase porosity): time-locked, must wait 7 days after last loosen

## Instructions

| Instruction | Description |
|---|---|
| initialize_global | Bootstrap protocol |
| create_universe | Create FSP/Financial/MachineTwin universe |
| set_porosity | Adjust porosity with ratchet enforcement |
| create_game | Open a prediction market |
| place_bet | Deposit SPL tokens, pick YES or NO |
| settle_game | Oracle resolves outcome |
| claim_winnings | Winners withdraw proportional payout |

## SDK Usage

See sdk/ directory for the MekongDelta TypeScript SDK.

## Token: TIMER

Teleological Intelligence for Multiversal Economic Reality

- Mint: `5vzSVRH5qMbwnP8TKNFKQ6ajN1AWh14Zbvu5ffbbtrXp`
- Decimals: 9
- Network: Solana Devnet