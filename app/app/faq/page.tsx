"use client";
import Link from 'next/link';
import { useState } from 'react';

const faqs = [
  { category: "The Basics", items: [
    { q: "What is Teleology?", a: "Teleology is a universal tokenization substrate on Solana. It lets anyone spawn a sovereign pocket universe — an on-chain economic namespace with its own rules, assets, and prediction markets. Each universe is independently governed by its owner, while all universes share the same root protocol layer." },
    { q: "What is MekongDelta?", a: "MekongDelta is the prediction market layer that lives inside Teleology universes. Universe operators can create YES/NO markets on any real-world or on-chain event — price movements, governance votes, protocol exploits, sports outcomes, machine performance, and more." },
    { q: "What is the TIMER token?", a: "TIMER is the cosmological simultaneity token. It governs the Grandfather Universe — the root layer of the entire Teleology protocol. TIMER is also the native currency for placing bets (100 TIMER per bet) and receiving winnings. TIMER holders set the laws of physics for the entire system." },
    { q: "What is a Universe?", a: "A Universe is a sovereign on-chain namespace — a Program Derived Address (PDA) that can contain assets, prediction markets, and child universes. You spawn one, you own it, you set its porosity. The protocol enforces the rules, but you govern your world." },
  ]},
  { category: "Prediction Markets", items: [
    { q: "How do I bet on a market?", a: "Connect your Solana wallet, browse open games in a universe, and click YES or NO. Each bet costs 100 TIMER tokens. You can only place one bet per market — your position is locked in until the market settles." },
    { q: "How are markets resolved?", a: "Markets resolve through a configurable oracle stack. Early markets use a trusted multisig with published signers. As the protocol matures, markets migrate to Pyth (price feeds), Chainlink VRF (randomness), and API3 dAPIs (real-world data)." },
    { q: "What happens when I win?", a: "Click Claim Winnings on the settled market card. Your share of the losing pool is transferred to your wallet automatically. One claim per winning position." },
    { q: "What is the total pool shown on a game card?", a: "The combined TIMER staked by all YES and NO bettors. Winners split the entire pool proportional to their stake. Higher pools = higher potential winnings." },
  ]},
  { category: "Universes & Porosity", items: [
    { q: "What does porosity mean?", a: "Porosity controls whether assets and liquidity can cross universe boundaries. Isolated: nothing crosses. Porous: everything crosses — markets draw from the root liquidity layer. Selective: only allowlisted assets cross the boundary." },
    { q: "Can I change my universe's porosity after spawning?", a: "You can make your universe more restrictive at any time. Making it more open requires a time-locked governance process. This protects asset launchers who chose your universe based on its original porosity setting." },
    { q: "What is the Grandfather Universe?", a: "The root Teleology program. All child universes spawn from it. Governed by TIMER token holders, it sets global rules that all child universes inherit — but cannot interfere with any child universe's internal rules." },
  ]},
  { category: "TIMER Token", items: [
    { q: "What does TIMER govern?", a: "Global credit thresholds, base spawn fees, whitelisted oracle providers, protocol treasury allocation, and upgrades to the root Teleology program." },
    { q: "What does TIMER NOT govern?", a: "Any child universe's internal rules, porosity settings, market resolutions once created, or assets launched within child universes. Democratic at the root, sovereign at the edge." },
    { q: "Why is it called TIMER?", a: "In cosmology, cosmological time is the preferred time coordinate in an expanding universe — the clock of the cosmos itself. The Grandfather Universe sets the temporal reference frame for all child universes. TIMER is literally what the grandfather universe is. Every universe spawned is a tick." },
  ]},
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-800 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-4 text-left gap-4">
        <span className="text-white font-medium text-sm">{q}</span>
        <span className={`text-gray-500 text-lg flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && <div className="pb-4 text-gray-400 text-sm leading-relaxed">{a}</div>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8"><Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">← Back to Markets</Link></div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-400">Everything you need to know about Teleology, MekongDelta, and the TIMER token.</p>
      </div>
      <div className="space-y-8">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-4">{section.category}</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-5">
              {section.items.map((item) => <FAQItem key={item.q} q={item.q} a={item.a} />)}
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
