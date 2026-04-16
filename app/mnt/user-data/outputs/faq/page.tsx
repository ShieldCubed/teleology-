"use client";
import Link from 'next/link';
import { useState } from 'react';

const faqs = [
  {
    category: "The Basics",
    items: [
      {
        q: "What is Teleology?",
        a: "Teleology is a universal tokenization substrate on Solana. It lets anyone spawn a sovereign \"pocket universe\" — an on-chain economic namespace with its own rules, assets, and prediction markets. Each universe is independently governed by its owner, while all universes share the same root protocol layer."
      },
      {
        q: "What is MekongDelta?",
        a: "MekongDelta is the prediction market layer that lives inside Teleology universes. Universe operators can create YES/NO markets on any real-world or on-chain event — price movements, governance votes, protocol exploits, sports outcomes, machine performance, and more."
      },
      {
        q: "What is the TIMER token?",
        a: "TIMER is the cosmological simultaneity token. It governs the Grandfather Universe — the root layer of the entire Teleology protocol. TIMER is also the native currency for placing bets (100 TIMER per bet) and receiving winnings. TIMER holders set the laws of physics for the entire system: spawn fees, credit thresholds, oracle whitelists, and protocol upgrades."
      },
      {
        q: "What is a Universe?",
        a: "A Universe is a sovereign on-chain namespace — a Program Derived Address (PDA) that can contain assets, prediction markets, and child universes. Think of it as a pocket dimension with its own economic rules. You spawn one, you own it, you set its porosity. The protocol enforces the rules, but you govern your world."
      },
    ]
  },
  {
    category: "Prediction Markets",
    items: [
      {
        q: "How do I bet on a market?",
        a: "Connect your Solana wallet, browse open games in a universe, and click YES or NO. Each bet costs 100 TIMER tokens. You can only place one bet per market — your position is locked in until the market settles."
      },
      {
        q: "How are markets resolved?",
        a: "Markets resolve through a configurable oracle stack. Early markets use a trusted multisig (signers are published publicly). As the protocol matures, markets migrate to Pyth (price feeds), Chainlink VRF (randomness), and API3 dAPIs (real-world data). The resolver type is visible on every market card before you bet."
      },
      {
        q: "What happens when I win?",
        a: "Click \"Claim Winnings\" on the settled market card. Your share of the losing pool is transferred to your wallet automatically. One claim per winning position."
      },
      {
        q: "Can a market be cancelled?",
        a: "Yes — if a market cannot be resolved (oracle failure, event didn't happen, etc.), the universe authority can cancel it. Cancelled markets return all bets."
      },
      {
        q: "What is the total pool shown on a game card?",
        a: "The combined TIMER staked by all YES and NO bettors. Winners split the entire pool proportional to their stake. Higher pools = higher potential winnings."
      },
    ]
  },
  {
    category: "Universes & Porosity",
    items: [
      {
        q: "What does porosity mean?",
        a: "Porosity controls whether assets and liquidity can cross universe boundaries. Isolated: nothing crosses — your universe is fully sovereign. Porous: everything crosses — your markets can draw liquidity from the root layer. Selective: only allowlisted asset mints cross the boundary."
      },
      {
        q: "Can I change my universe's porosity after spawning?",
        a: "You can make your universe more restrictive at any time (Porous → Selective → Isolated). Making it more open requires a time-locked governance process. This protects asset launchers who chose your universe based on its original porosity setting."
      },
      {
        q: "What is the Grandfather Universe?",
        a: "The root Teleology program itself. All child universes spawn from it. It is governed by TIMER token holders and sets the global rules — spawn fees, oracle whitelist, credit thresholds — that all child universes inherit. It cannot interfere with any child universe's internal rules."
      },
      {
        q: "What is an FSP (Financial Signal Processor)?",
        a: "An AGI-controlled universe that generates financial signals — buy/sell triggers, yield optimization routes, rebalancing instructions. FSPs can be purchased outright, leased for a fixed term, or rented per-signal. Their compounding schedules create a yield curve across the FSP ecosystem."
      },
    ]
  },
  {
    category: "TIMER Token",
    items: [
      {
        q: "What does TIMER govern?",
        a: "TIMER controls: global credit thresholds for universe spawning rights, base spawn fees at the root level, whitelisted oracle providers for MekongDelta markets, protocol treasury allocation, and upgrades to the root Teleology program."
      },
      {
        q: "What does TIMER NOT govern?",
        a: "TIMER cannot control: any child universe's internal rules, any child universe's porosity settings, any MekongDelta market's resolution once created, or any asset launched within a child universe. The protocol is democratic at the root, sovereign at the edge."
      },
      {
        q: "Why is it called TIMER?",
        a: "In cosmology, \"cosmological time\" is the preferred time coordinate in an expanding universe — the clock of the cosmos itself. The Grandfather Universe sets the temporal reference frame for all child universes. TIMER is literally what the grandfather universe is. Every universe spawned is a tick of the TIMER."
      },
      {
        q: "Do I need TIMER to use MekongDelta?",
        a: "Yes, TIMER is the native currency for placing bets (100 TIMER per bet) and receiving winnings. Markets may also support other SPL tokens and SOL as collateral in future universe configurations."
      },
    ]
  },
  {
    category: "Technical",
    items: [
      {
        q: "What network is Teleology on?",
        a: "Currently on Solana Devnet. Mainnet deployment is in progress."
      },
      {
        q: "What wallets are supported?",
        a: "Any Solana wallet adapter compatible wallet — Phantom, Backpack, Solflare, and others."
      },
      {
        q: "Is the code open source?",
        a: "The Anchor program (on-chain Rust code) is publicly visible. Frontend is open source on GitHub at github.com/ShieldCubed/teleology-."
      },
    ]
  }
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-4 text-left gap-4"
      >
        <span className="text-white font-medium text-sm">{q}</span>
        <span className={`text-gray-500 text-lg flex-shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="pb-4 text-gray-400 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">← Back to Markets</Link>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-400">Everything you need to know about Teleology, MekongDelta, and the TIMER token.</p>
      </div>

      <div className="space-y-8">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-4">{section.category}</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-5">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-gray-800 pt-8 text-center">
        <p className="text-gray-500 text-sm">Still have questions?</p>
        <a href="mailto:hello@teleology.world" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">hello@teleology.world</a>
      </div>
    </div>
  );
}
