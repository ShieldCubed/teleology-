"use client";
import Link from 'next/link';

export default function WhitepaperPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8"><Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">← Back to Markets</Link></div>
      <div className="mb-10">
        <div className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-3">Whitepaper v0.1</div>
        <h1 className="text-3xl font-bold text-white mb-3">Teleology: A Universal Tokenization Substrate</h1>
        <p className="text-gray-500 text-sm">Aeonic Space — April 2026</p>
      </div>
      <div className="space-y-10 text-gray-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">Abstract</h2>
          <p>Teleology is a protocol for spawning sovereign economic namespaces — pocket universes — on Solana. Each universe is an independently governed on-chain environment capable of containing tokenized assets, prediction markets, digital twins, and financial signal processors.</p>
          <p className="mt-3">MekongDelta is the prediction market layer built natively into every Teleology universe. TIMER is the cosmological simultaneity token governing the root protocol and serving as the native currency for market participation. Together, these three primitives form a complete, internally consistent economic cosmology — one with its own laws of physics.</p>
        </section>
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">1. The Problem</h2>
          <p>Every major DeFi protocol faces a fundamental governance tension: democratic enough to evolve, sovereign enough that operators can build without interference. Most resolve this poorly. Prediction markets face their own structural problem: monolithic platforms where all markets share the same liquidity pool, collateral rules, and oracle infrastructure. The existing model forces convergence where divergence would be more productive.</p>
        </section>
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">2. The Universe Primitive</h2>
          <div className="space-y-3 mt-4">
            {[
              { label: "SOVEREIGNTY", text: "The universe owner controls internal rules. Token holders cannot interfere." },
              { label: "POROSITY", text: "Isolated (no crossings), Porous (full root-layer access), or Selective (allowlisted assets only)." },
              { label: "RATCHET RULE", text: "Porosity can become more restrictive at any time. Becoming more open requires a time-locked governance process." },
              { label: "RECURSION", text: "Universes spawn child universes. Spawning a child does not dilute the parent — it expands it." },
            ].map(item => (
              <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-purple-400 font-mono text-xs mb-1">{item.label}</div>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">3. The Grandfather Universe</h2>
          <p>The root Teleology program. Permanently porous. Governed exclusively by TIMER token holders.</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-green-400 font-mono text-xs mb-2">TIMER CONTROLS</div>
              <ul className="space-y-1 text-xs text-gray-400">
                {["Global credit thresholds","Base spawn fees","Oracle whitelist","Treasury allocation","Root program upgrades"].map(i => <li key={i}>→ {i}</li>)}
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-red-400 font-mono text-xs mb-2">TIMER CANNOT CONTROL</div>
              <ul className="space-y-1 text-xs text-gray-400">
                {["Child universe rules","Child universe porosity","Market resolution","Assets in child universes"].map(i => <li key={i}>✗ {i}</li>)}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-purple-300 font-medium">Democratic at the root, sovereign at the edge.</p>
        </section>
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">4. MekongDelta</h2>
          <p>Markets live as Game PDAs inside universes. Bettors stake 100 TIMER per position. One bet per wallet per market. Winners claim their proportional share of the losing pool after settlement.</p>
          <div className="space-y-2 mt-4">
            {[
              { phase: "Phase 1", label: "Custom Multisig", desc: "Published signers. All identities and history in the Resolution Ledger." },
              { phase: "Phase 2", label: "Pyth", desc: "Price-based markets. Native Solana." },
              { phase: "Phase 3", label: "Chainlink VRF", desc: "Markets requiring verifiable randomness." },
              { phase: "Phase 4", label: "API3 dAPIs", desc: "Real-world event data and parametric insurance." },
            ].map(p => (
              <div key={p.phase} className="flex gap-3 bg-gray-900 border border-gray-800 rounded-lg p-3">
                <div className="text-purple-400 font-mono text-xs w-16 flex-shrink-0 pt-0.5">{p.phase}</div>
                <div><div className="text-white text-xs font-medium">{p.label}</div><div className="text-gray-500 text-xs mt-0.5">{p.desc}</div></div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">5. Universe Types</h2>
          <h3 className="text-white font-medium mt-4 mb-2">5.1 Financial Universes</h3>
          <p>A tokenized hedge fund maps almost perfectly to the universe primitive. NAV = total asset credit. LPs = asset holders. GP = universe owner. A fund of funds is a parent universe whose children are individual fund universes. TIMER creates true cosmological simultaneity for NAV calculation — eliminating oracle lag between universes.</p>
          <h3 className="text-white font-medium mt-6 mb-2">5.2 Digital Twin Universes</h3>
          <p>A digital twin universe contains the full economic state of a physical system. A drone's battery is an asset PDA. MekongDelta parametric insurance markets resolve against live sensor telemetry. The digital twin is also a bidirectional control channel — on-chain authorized commands push to physical actuators in real time via ROS2, MAVLink, CAN bus, or OPC-UA.</p>
          <h3 className="text-white font-medium mt-6 mb-2">5.3 Financial Signal Processors (FSPs)</h3>
          <p>An AGI-controlled pocket universe that generates financial signals. Access models: Purchase (own the FSP PDA permanently), Lease (time-bounded, fixed yield), or Rent (per-signal). Compounding schedules create a yield curve. FSPs operate at the grandfather universe level — signals flow to any universe regardless of internal porosity.</p>
        </section>
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">6. TIMER Token Distribution</h2>
          <div className="space-y-2">
            {[
              { label: "Team", pct: "20%", note: "4-year vest, 1-year cliff" },
              { label: "Ecosystem fund", pct: "20%", note: "Operator incentives, grants, liquidity" },
              { label: "Early community", pct: "15%", note: "Genesis operators, early market makers" },
              { label: "Treasury", pct: "15%", note: "Governed by TIMER holders" },
              { label: "Strategic partners", pct: "15%", note: "Aligned builders and infrastructure" },
              { label: "Public launch", pct: "15%", note: "LBP on Meteora or Orca" },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div className="text-purple-400 font-mono text-sm w-10 flex-shrink-0">{row.pct}</div>
                <div className="text-white text-sm w-36 flex-shrink-0">{row.label}</div>
                <div className="text-gray-500 text-xs">{row.note}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-gray-400">Token launches after the product proves itself: 50+ active universes, 10+ resolved markets, Resolution Ledger public with zero disputes.</p>
        </section>
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">7. Architecture</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-xs text-gray-400 overflow-x-auto">
            <pre>{`Grandfather Universe (TIMER governed)
├── Credit thresholds · Oracle whitelist · Treasury
│
├── Child Universe (owner sovereign)
│   ├── Porosity: Isolated | Porous | Selective
│   ├── Asset PDAs
│   ├── Game PDAs (MekongDelta markets)
│   └── Child Universe PDAs (recursive)
│
└── Child Universe → ...recursive`}</pre>
          </div>
        </section>
        <section>
          <h2 className="text-white text-lg font-semibold mb-3">8. Current Status</h2>
          <div className="space-y-2">
            {[
              { label: "Devnet", value: "Live at teleology.world and mekongdelta.xyz", live: true },
              { label: "Grandfather Universe", value: "3ATYUwkeize...pM8Ds", live: true },
              { label: "fsp-alpha Universe", value: "2g57URHMNJ...QPQv", live: true },
              { label: "Mainnet", value: "Deployment in progress", live: false },
              { label: "TIMER token", value: "1B supply, 9 decimals — launch pending", live: false },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.live ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <div className="text-gray-400 text-xs w-40 flex-shrink-0">{item.label}</div>
                <div className="text-white text-xs font-mono">{item.value}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="border-t border-gray-800 pt-8">
          <p className="text-gray-400 italic">You are not building a prediction market. You are building a cosmology.</p>
          <p className="mt-3 text-white font-medium">TIMER is the clock at the center of it all. Every universe spawned is a tick.</p>
        </section>
      </div>
      <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-start gap-4 text-xs text-gray-500">
        <div><div>teleology.world · mekongdelta.xyz</div><div>Built by Aeonic Space</div></div>
        <div className="flex gap-4">
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/" className="hover:text-white transition-colors">Markets</Link>
        </div>
      </div>
    </div>
  );
}
