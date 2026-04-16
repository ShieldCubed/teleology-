"use client";
import Link from 'next/link';

export default function WhitepaperPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">← Back to Markets</Link>
      </div>

      <div className="mb-10">
        <div className="text-xs font-mono text-purple-400 uppercase tracking-widest mb-3">Whitepaper v0.1</div>
        <h1 className="text-3xl font-bold text-white mb-3">Teleology: A Universal Tokenization Substrate</h1>
        <p className="text-gray-500 text-sm">Aeonic Space — April 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-10 text-gray-300 text-sm leading-relaxed">

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">Abstract</h2>
          <p>Teleology is a protocol for spawning sovereign economic namespaces — "pocket universes" — on Solana. Each universe is an independently governed on-chain environment capable of containing tokenized assets, prediction markets, digital twins, and financial signal processors. Universes nest recursively, controlled at the edge by their owners and governed at the root by the TIMER token.</p>
          <p className="mt-3">MekongDelta is the prediction market layer built natively into every Teleology universe. TIMER is the cosmological simultaneity token that governs the root protocol and serves as the native currency for market participation.</p>
          <p className="mt-3">Together, these three primitives form a complete, internally consistent economic cosmology — one with its own laws of physics.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">1. The Problem</h2>
          <p>Every major DeFi protocol faces a fundamental governance tension: democratic enough to evolve, sovereign enough that operators can build without interference. Most resolve this poorly — either through token holder overreach that destroys operator sovereignty, or ossified immutability that prevents necessary upgrades.</p>
          <p className="mt-3">Prediction markets face their own structural problem: monolithic platforms where all markets share the same liquidity pool, collateral rules, and oracle infrastructure. A parametric insurance market for drone battery failure should not share infrastructure with a speculative market on BTC price. The existing model forces convergence where divergence would be more productive.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">2. The Universe Primitive</h2>
          <p>A Teleology Universe is a Program Derived Address (PDA) on Solana with four core properties:</p>
          <div className="mt-4 space-y-3">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-purple-400 font-mono text-xs mb-1">SOVEREIGNTY</div>
              <p>The universe owner controls internal rules. Token holders cannot interfere.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-purple-400 font-mono text-xs mb-1">POROSITY</div>
              <p>The owner sets boundary permeability at spawn time: Isolated (no crossings), Porous (full root-layer access), or Selective (allowlisted assets only).</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-purple-400 font-mono text-xs mb-1">RATCHET RULE</div>
              <p>Porosity can become more restrictive at any time. Becoming more open requires a time-locked governance process. This protects asset launchers.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-purple-400 font-mono text-xs mb-1">RECURSION</div>
              <p>Universes spawn child universes. Spawning a child does not dilute the parent — it expands it. The Banach-Tarski principle on-chain.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">3. The Grandfather Universe</h2>
          <p>The root Teleology program. Permanently porous. Governed exclusively by TIMER token holders.</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-green-400 font-mono text-xs mb-2">TIMER CONTROLS</div>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>→ Global credit thresholds</li>
                <li>→ Base spawn fees</li>
                <li>→ Oracle whitelist</li>
                <li>→ Treasury allocation</li>
                <li>→ Root program upgrades</li>
              </ul>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-red-400 font-mono text-xs mb-2">TIMER CANNOT CONTROL</div>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>✗ Child universe rules</li>
                <li>✗ Child universe porosity</li>
                <li>✗ Market resolution</li>
                <li>✗ Assets in child universes</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-purple-300 font-medium">Democratic at the root, sovereign at the edge. Token holders set the laws of physics. Universe operators set the laws of their world.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">4. MekongDelta — The Prediction Market Layer</h2>
          <p>MekongDelta markets live as Game PDAs inside universes. Any operator can create a YES/NO prediction market on any event with a resolvable oracle. Bettors stake 100 TIMER per position. One bet per wallet per market. Winners claim their proportional share of the losing pool after settlement.</p>

          <h3 className="text-white font-medium mt-6 mb-3">Oracle Migration Path</h3>
          <div className="space-y-2">
            {[
              { phase: "Phase 1", label: "Custom Multisig", desc: "Published signers. All identities and resolution history publicly visible in the Resolution Ledger." },
              { phase: "Phase 2", label: "Pyth", desc: "Price-based markets. Native Solana, fast, battle-tested." },
              { phase: "Phase 3", label: "Chainlink VRF", desc: "Markets requiring verifiable randomness." },
              { phase: "Phase 4", label: "API3 dAPIs", desc: "Real-world event data and parametric insurance markets." },
            ].map((p) => (
              <div key={p.phase} className="flex gap-3 bg-gray-900 border border-gray-800 rounded-lg p-3">
                <div className="text-purple-400 font-mono text-xs w-16 flex-shrink-0 pt-0.5">{p.phase}</div>
                <div>
                  <div className="text-white text-xs font-medium">{p.label}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">5. Universe Types</h2>

          <h3 className="text-white font-medium mt-4 mb-2">5.1 Financial Universes</h3>
          <p>A tokenized hedge fund maps almost perfectly to the universe primitive. NAV = total asset credit. LPs = asset holders. GP = universe owner. Mandate = porosity + asset allowlist. A fund of funds is a parent universe whose children are individual fund universes.</p>
          <p className="mt-2">TIMER creates true cosmological simultaneity for NAV calculation — all fund universes price assets at the same temporal reference, eliminating oracle lag between universes.</p>

          <h3 className="text-white font-medium mt-6 mb-2">5.2 Digital Twin Universes</h3>
          <p>A digital twin universe contains the full economic state of a physical system. A drone's battery is an asset PDA. Its flight hours are volume credits. Its maintenance history spawns child universes.</p>
          <p className="mt-2">MekongDelta parametric insurance markets resolve against live sensor telemetry. The digital twin is also a bidirectional control channel — on-chain authorized commands push to physical actuators in real time via bridge layers (ROS2, MAVLink, CAN bus, OPC-UA).</p>

          <h3 className="text-white font-medium mt-6 mb-2">5.3 Financial Signal Processors (FSPs)</h3>
          <p>An AGI-controlled pocket universe that generates financial signals. AGI inference runs off-chain; authorization and state live on-chain. Access models: Purchase (own the FSP PDA permanently), Lease (time-bounded, fixed yield), or Rent (per-signal, pay-as-you-go).</p>
          <p className="mt-2">Compounding schedules create a yield curve. MekongDelta markets on FSP performance create a meta-market on AGI financial intelligence. FSPs operate at the grandfather universe level — their signals flow to any universe regardless of internal porosity.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">6. The TIMER Token</h2>
          <p>TIMER — Teleological Intelligence for Multiversal Economic Reality. In cosmology, cosmological time is the clock of the cosmos itself. The Grandfather Universe sets the temporal reference frame for all child universes. TIMER is literally what the grandfather universe is. Every universe spawned is a tick.</p>

          <h3 className="text-white font-medium mt-6 mb-3">Token Distribution</h3>
          <div className="space-y-2">
            {[
              { label: "Team", pct: "20%", note: "4-year vest, 1-year cliff" },
              { label: "Ecosystem fund", pct: "20%", note: "Operator incentives, builder grants, liquidity" },
              { label: "Early community", pct: "15%", note: "Genesis operators, early market makers" },
              { label: "Treasury", pct: "15%", note: "Governed by TIMER holders" },
              { label: "Strategic partners", pct: "15%", note: "Aligned builders and infrastructure" },
              { label: "Public launch", pct: "15%", note: "Liquidity Bootstrapping Pool (Meteora or Orca)" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div className="text-purple-400 font-mono text-sm w-10 flex-shrink-0">{row.pct}</div>
                <div className="text-white text-sm flex-shrink-0 w-36">{row.label}</div>
                <div className="text-gray-500 text-xs">{row.note}</div>
              </div>
            ))}
          </div>

          <h3 className="text-white font-medium mt-6 mb-2">Launch Sequencing</h3>
          <p>The token launches after the product proves itself. Milestones before token launch: 50+ active universes on mainnet, 10+ resolved MekongDelta markets with clean resolution track records, Resolution Ledger public with zero disputes. The token launch becomes a celebration of proven traction, not a promise of future value.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">7. On-Chain Architecture</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-xs text-gray-400 leading-relaxed overflow-x-auto">
            <pre>{`Grandfather Universe (TIMER governed)
├── Global credit thresholds
├── Oracle whitelist
├── Spawn fees → Treasury
│
├── Child Universe (owner sovereign)
│   ├── Porosity: Isolated | Porous | Selective
│   ├── Asset PDAs
│   ├── Game PDAs (MekongDelta markets)
│   └── Child Universe PDAs (recursive)
│
└── Child Universe → ...recursive`}</pre>
          </div>
          <p className="mt-4">The ratchet rule is enforced on-chain — tightening is immediate, loosening requires waiting out the time lock. This is not a social convention. It is a protocol constraint.</p>
        </section>

        <section>
          <h2 className="text-white text-lg font-semibold mb-3">8. Current Status</h2>
          <div className="space-y-2">
            {[
              { label: "Devnet", value: "Live at teleology.world and mekongdelta.xyz", status: "green" },
              { label: "Grandfather Universe", value: "3ATYUwkeize...pM8Ds", status: "green" },
              { label: "fsp-alpha Universe", value: "2g57URHMNJ...QPQv", status: "green" },
              { label: "Mainnet", value: "Deployment in progress", status: "yellow" },
              { label: "TIMER token", value: "1B supply, 9 decimals, freeze disabled — launch pending", status: "yellow" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'green' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <div className="text-gray-400 text-xs w-40 flex-shrink-0">{item.label}</div>
                <div className="text-white text-xs font-mono">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-800 pt-8">
          <p className="text-gray-400 italic">You are not building a prediction market. You are building a cosmology.</p>
          <p className="mt-3 text-gray-400 italic">Every design decision, every governance choice, every oracle integration reinforces a single coherent vision: a complete, internally consistent economic universe with its own laws of physics. Token holders govern the cosmos. Operators govern their worlds. Markets resolve against reality itself.</p>
          <p className="mt-3 text-white font-medium">TIMER is the clock at the center of it all. Every universe spawned is a tick.</p>
        </section>

      </div>

      <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-start gap-4 text-xs text-gray-500">
        <div>
          <div>teleology.world · mekongdelta.xyz</div>
          <div>Built by Aeonic Space</div>
        </div>
        <div className="flex gap-4">
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/" className="hover:text-white transition-colors">Markets</Link>
        </div>
      </div>
    </div>
  );
}
