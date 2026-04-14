"use client";
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { IDL } from "../lib/idl";
import { PROGRAM_ID, TIMER_MINT, GRANDFATHER_PDA } from "../lib/constants";

interface Props {
  onSpawned: (universePda: string, name: string) => void;
  onClose: () => void;
}

const STEPS = ["Name", "Strategy", "Confirm"];

export function CreateFSPModal({ onSpawned, onClose }: Props) {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();

  const [step, setStep] = useState(0);
  const [fundName, setFundName] = useState("");
  const [strategy, setStrategy] = useState("funding-rate-arb");
  const [initialCap, setInitialCap] = useState("500");
  const [porosity, setPorosity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const STRATEGIES = [
    { value: "funding-rate-arb", label: "Funding Rate Arb", desc: "Long/short perp funding differentials across Drift, Binance, Hyperliquid" },
    { value: "basis-trade", label: "Basis Trade", desc: "Spot vs perp basis capture with delta-neutral hedging via Jupiter" },
    { value: "vol-surface", label: "Vol Surface Arb", desc: "Options implied vol vs realized vol with Kelly-sized positions" },
  ];

  async function handleCreate() {
    if (!wallet || !publicKey) return;
    setLoading(true);
    setError("");
    try {
      const anchorWallet = {
        publicKey,
        signTransaction: (wallet as any).adapter.signTransaction?.bind((wallet as any).adapter),
        signAllTransactions: (wallet as any).adapter.signAllTransactions?.bind((wallet as any).adapter),
      };
      const provider = new anchor.AnchorProvider(connection, anchorWallet as any, {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
      });
      const program = new anchor.Program(IDL as anchor.Idl, provider);
      const programId = new PublicKey(PROGRAM_ID);

      const [universePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("universe"), publicKey.toBuffer(), Buffer.from(fundName)],
        programId
      );

      const grandfatherPda = new PublicKey(GRANDFATHER_PDA);
      const timerMint = new PublicKey(TIMER_MINT);
      const spawnerTokenAccount = await anchor.utils.token.associatedAddress({
        mint: timerMint,
        owner: publicKey,
      });

      const typeArg = { financial: {} };

      await (program.methods as any)
        .spawnUniverse(typeArg, fundName, porosity)
        .accounts({
          universe: universePda,
          grandfather: grandfatherPda,
          timerMint,
          spawnerTokenAccount,
          spawner: publicKey,
          tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setSuccess(`FSP Fund "${fundName}" created on-chain!`);
      setTimeout(() => {
        onSpawned(universePda.toBase58(), fundName);
        onClose();
      }, 1500);
    } catch (e: any) {
      setError(e?.message?.slice(0, 150) ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  const canNext = step === 0 ? fundName.trim().length > 0 && fundName.length <= 32 : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-purple-800/40 rounded-2xl w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-800">
          <div>
            <h2 className="text-white font-bold text-lg">Launch FSP Fund</h2>
            <p className="text-gray-500 text-xs mt-0.5">Medallion-inspired · Teleology execution layer</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl transition-colors">×</button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full transition-all ${i <= step ? "bg-purple-500" : "bg-gray-700"}`} />
              <p className={`text-xs mt-1 ${i === step ? "text-purple-400 font-medium" : "text-gray-600"}`}>{s}</p>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 min-h-[260px]">

          {/* Step 0 — Name */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="bg-purple-900/20 border border-purple-800/30 rounded-xl p-3 text-xs text-purple-300">
                🚀 Burns 1,000 TIMER · Creates a Financial universe on Solana devnet
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Fund Name <span className="text-gray-600">(max 32 chars)</span></label>
                <input
                  value={fundName}
                  onChange={e => setFundName(e.target.value)}
                  placeholder="e.g. medallion-v1"
                  maxLength={32}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
                <p className="text-gray-600 text-xs mt-1">{fundName.length}/32</p>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">
                  Oracle Porosity: <span className="text-purple-400 font-semibold">{porosity}%</span>
                </label>
                <input
                  type="range" min={0} max={100} value={porosity}
                  onChange={e => setPorosity(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0% — oracle-only</span>
                  <span>100% — fully open</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {porosity === 0 ? "Only you can settle games — recommended for FSP" :
                   porosity < 50 ? "Semi-closed — you control settlement" :
                   "Open — anyone can settle"}
                </p>
              </div>
            </div>
          )}

          {/* Step 1 — Strategy */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <p className="text-gray-400 text-xs">Select your primary alpha source. This is metadata only — it's visible to LPs.</p>
              {STRATEGIES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setStrategy(s.value)}
                  className={`text-left rounded-xl border p-3 transition-all ${
                    strategy === s.value
                      ? "border-purple-500 bg-purple-900/20"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${strategy === s.value ? "bg-purple-400" : "bg-gray-600"}`} />
                    <span className="text-white text-sm font-medium">{s.label}</span>
                  </div>
                  <p className="text-gray-400 text-xs pl-4">{s.desc}</p>
                </button>
              ))}
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Initial Cap Target (USDT)</label>
                <input
                  value={initialCap}
                  onChange={e => setInitialCap(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Step 2 — Confirm */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <div className="bg-gray-800 rounded-xl p-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Fund Name</span>
                  <span className="text-white font-mono">{fundName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type</span>
                  <span className="text-purple-400">Financial (FSP)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Strategy</span>
                  <span className="text-white">{STRATEGIES.find(s => s.value === strategy)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Porosity</span>
                  <span className="text-white">{porosity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cap Target</span>
                  <span className="text-white">${initialCap} USDT</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between">
                  <span className="text-gray-400">Cost</span>
                  <span className="text-yellow-400">1,000 TIMER burned</span>
                </div>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              {success && <p className="text-green-400 text-xs">{success}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < 2 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-sm transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={loading || !publicKey}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-sm transition-colors"
            >
              {loading ? "Launching..." : "🚀 Launch Fund"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
