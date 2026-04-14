"use client";
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { IDL } from "../lib/idl";
import { PROGRAM_ID, TIMER_MINT, GRANDFATHER_PDA } from "../lib/constants";

const UNIVERSE_TYPES = [
  { label: "Financial", value: "financial" },
  { label: "MachineTwin", value: "machineTwin" },
  { label: "FSP", value: "fsp" },
];

interface Props {
  onSpawned: (universePda: string, name: string) => void;
  onClose: () => void;
}

export function SpawnUniverseModal({ onSpawned, onClose }: Props) {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();
  const [name, setName] = useState("");
  const [universeType, setUniverseType] = useState("financial");
  const [porosity, setPorosity] = useState(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSpawn() {
    if (!wallet || !publicKey || !name.trim()) return;
    if (name.length > 32) { setError("Name max 32 chars"); return; }
    if (porosity < 0 || porosity > 100) { setError("Porosity 0-100"); return; }

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
        [Buffer.from("universe"), publicKey.toBuffer(), Buffer.from(name)],
        programId
      );
      const grandfatherPda = new PublicKey(GRANDFATHER_PDA);
      const timerMint = new PublicKey(TIMER_MINT);

      const spawnerTokenAccount = await anchor.utils.token.associatedAddress({
        mint: timerMint,
        owner: publicKey,
      });

      const typeArg = { [universeType]: {} };

      await (program.methods as any)
        .spawnUniverse(typeArg, name, porosity)
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

      onSpawned(universePda.toBase58(), name);
    } catch (e: any) {
      setError(e?.message?.slice(0, 120) || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Spawn Child Universe</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>

        <div className="text-xs text-yellow-400/80 bg-yellow-400/10 rounded-lg px-3 py-2">
          Burns 1,000 TIMER from your wallet
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Universe Name (max 32 chars)</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. alpha-2"
              maxLength={32}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">Universe Type</label>
            <select
              value={universeType}
              onChange={e => setUniverseType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
            >
              {UNIVERSE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-400 text-xs mb-1 block">
              Initial Porosity: <span className="text-purple-400 font-semibold">{porosity}%</span>
            </label>
            <input
              type="range" min={0} max={100} value={porosity}
              onChange={e => setPorosity(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0% closed</span><span>100% open</span>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex gap-3 mt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSpawn}
            disabled={loading || !name.trim() || !publicKey}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-sm transition-colors"
          >
            {loading ? "Spawning..." : "Spawn Universe"}
          </button>
        </div>
      </div>
    </div>
  );
}
