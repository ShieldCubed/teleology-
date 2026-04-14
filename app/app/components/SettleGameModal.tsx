"use client";
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { IDL } from "../lib/idl";
import { PROGRAM_ID } from "../lib/constants";

interface Props {
  gamePda: string;
  universePda: string;
  eventId: string;
  gameIndex: number;
  onSettled: () => void;
  onClose: () => void;
}

export function SettleGameModal({
  gamePda,
  universePda,
  eventId,
  gameIndex,
  onSettled,
  onClose,
}: Props) {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();

  const [outcome, setOutcome] = useState<"yes" | "no" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSettle() {
    if (!publicKey || !wallet) return;
    if (outcome === null) { setError("Select an outcome first."); return; }

    setError("");
    setSuccess("");
    setLoading(true);

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

      const gamePubkey = new PublicKey(gamePda);

      // Re-derive universe PDA with zero-trimmed name (fixed-size byte array on-chain)
      const universeAcctPubkey = new PublicKey(universePda);
      const universeAcct = await (program.account as any).universe.fetch(universeAcctPubkey);
      const nameArr = Array.isArray(universeAcct.name) ? universeAcct.name : Array.from(Object.values(universeAcct.name) as number[]);
      let end = nameArr.length;
      while (end > 0 && nameArr[end - 1] === 0) end--;
      const trimmedName = Buffer.from(nameArr.slice(0, end));
      const [derivedUniversePda] = PublicKey.findProgramAddressSync([Buffer.from("universe"), universeAcct.authority.toBuffer(), trimmedName], PROGRAM_ID);
      const [universePubkey] = PublicKey.findProgramAddressSync(
        [Buffer.from('universe'), universeAcct.authority.toBuffer(), trimmedName],
        PROGRAM_ID
      );

      // For CustomEvent: resolved_price = 1 means YES wins, 0 means NO wins
      const resolvedPrice = outcome === "yes" ? new anchor.BN(1) : new anchor.BN(2); // NO = 2 (must be >0 but !=1)
      const priceTimestamp = new anchor.BN(Math.floor(Date.now() / 1000));
      const oracleSource = 0; // manual / PYTH placeholder

      await program.methods
        .settleGame(resolvedPrice, priceTimestamp, oracleSource)
        .accounts({
          game: gamePubkey,
          universe: universePubkey,
          oracle: publicKey,
        })
        .rpc();

      setSuccess(`Game settled — ${outcome.toUpperCase()} wins!`);
      setTimeout(() => {
        onSettled();
        onClose();
      }, 1500);
    } catch (e: any) {
      const msg: string = e?.message ?? String(e);
      if (msg.includes("NotOracle")) setError("Only the game oracle can settle.");
      else if (msg.includes("NotSettleTime")) setError("Settle time has not been reached yet.");
      else if (msg.includes("AlreadySettled")) setError("Game is already settled.");
      else setError(msg.slice(0, 120));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Settle Game</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none transition-colors">×</button>
        </div>

        {!publicKey ? (
          <p className="text-gray-400 text-sm text-center py-4">Connect your wallet to settle.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Event info */}
            <div className="bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400">
              <span className="text-gray-500">Game #{gameIndex} — </span>
              <span className="text-white font-medium">{eventId || "Custom Event"}</span>
            </div>

            {/* Outcome selector */}
            <p className="text-gray-400 text-xs">Select the winning outcome:</p>
            <div className="flex gap-3">
              <button
                onClick={() => setOutcome("yes")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  outcome === "yes"
                    ? "bg-green-500 text-white ring-2 ring-green-400"
                    : "bg-gray-800 text-gray-400 hover:bg-green-500/20 hover:text-green-400"
                }`}
              >
                ✓ YES wins
              </button>
              <button
                onClick={() => setOutcome("no")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  outcome === "no"
                    ? "bg-red-500 text-white ring-2 ring-red-400"
                    : "bg-gray-800 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                }`}
              >
                ✗ NO wins
              </button>
            </div>

            {/* Warning */}
            <p className="text-yellow-500/80 text-xs">
              ⚠ This is irreversible. Only settle once the outcome is confirmed.
            </p>

            {error && <p className="text-red-400 text-xs">{error}</p>}
            {success && <p className="text-green-400 text-xs">{success}</p>}

            <button
              onClick={handleSettle}
              disabled={loading || outcome === null}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Settling..." : "Confirm Settlement"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
