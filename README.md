cat > ~/projects/teleology/teleology/README.md << 'EOF'
# Teleology

> A sovereign prediction market protocol on Solana. Spawn your own universe. Set your own rules.

🌐 [teleology.world](https://teleology.world) | 📊 [mekongdelta.xyz](https://mekongdelta.xyz)

---

## What is Teleology?

Teleology is an on-chain infrastructure protocol that lets anyone spawn a **pocket universe** — a sovereign prediction market environment on Solana with its own rules, participants, and financial instruments.

Unlike monolithic prediction markets where everyone plays by the same rules, Teleology gives operators full sovereignty over their universe while the root protocol remains governed by the **TIMER** token.

---

## Architecture

\`\`\`
Grandfather Universe (Root — TIMER governed)
├── Child Universe (Financial — e.g. hedge fund, fund of funds)
│   ├── MekongDelta Markets (binary outcome, oracle-resolved)
│   ├── FSP — AGI Signal Processors (daily/monthly/quarterly yield)
│   └── Child Universe (sub-fund, sub-strategy)
├── Child Universe (Machine Twin — drone, vehicle, robot fleet)
│   ├── Parametric Insurance Markets (sensor telemetry resolved)
│   ├── Component PDAs (battery, lidar, firmware state)
│   └── Bidirectional control bridge
└── Child Universe (Custom — any operator-defined ruleset)
\`\`\`

### Key Concepts

- **Universe** — A sovereign on-chain namespace. Owner-controlled porosity, asset allowlists, and spawn rights.
- **Porosity** — Controls who can interact across universe boundaries: Isolated, Porous, or Selective.
- **MekongDelta** — The prediction market engine inside every universe. Binary markets, oracle-resolved.
- **TIMER** — The SPL token governing the root protocol. Controls spawn thresholds, oracle whitelists, and treasury. Cannot interfere with child universe rules.
- **FSP** — AGI-controlled Financial Signal Processors. Purchasable, leasable, or rentable yield instruments.

---

## Tech Stack

- **Blockchain:** Solana (Anchor framework)
- **Frontend:** Next.js 16, Tailwind CSS
- **Wallet:** Solana Wallet Adapter
- **Oracles:** Pyth, Chainlink, API3, custom multisig
- **Token:** TIMER SPL (1B supply, 9 decimals)

---

## Program Accounts

| Account | Description |
|---|---|
| GlobalConfig | Root protocol config — governed by TIMER |
| Universe | Sovereign namespace with porosity config |
| Game | MekongDelta prediction market |
| Bet | User position in a market |
| FSP | AGI signal processor universe |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Rust + Solana CLI
- Anchor CLI 0.32.x
- Yarn

### Install

\`\`\`bash
git clone https://github.com/ShieldCubed/teleology-.git
cd teleology-/teleology
yarn install
\`\`\`

### Run Frontend (devnet)

\`\`\`bash
cd app
yarn dev
\`\`\`

Open http://localhost:3000

### Build & Deploy Program

\`\`\`bash
anchor build
anchor deploy --provider.cluster devnet
\`\`\`

---

## Universe Porosity

| Mode | Description |
|---|---|
| Isolated | Nothing crosses boundaries — full sovereignty |
| Porous | Everything crosses — root liquidity accessible |
| Selective | Only allowlisted mints cross |

**Ratchet rule:** Porosity can be tightened freely. Loosening requires a time-locked governance process.

---

## TIMER Token

TIMER governs the grandfather universe only. Token holders control:

- Global credit thresholds for universe spawning
- Base fee structure at the root level
- Oracle provider whitelist for MekongDelta
- Protocol treasury allocation
- Root program upgrades

> "Token holders set the laws of physics. Universe operators set the laws of their world."

---

## Live Deployments

| Network | Program ID |
|---|---|
| Devnet | 3ATYUwkeizeqxbjhiMFNYFps34L7aXUp3VcdfK2pM8Ds |
| Mainnet | Coming soon |

---

## License

ISC
EOF
