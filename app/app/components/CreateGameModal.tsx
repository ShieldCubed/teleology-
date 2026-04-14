"use client";
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { IDL } from "../lib/idl";
import { PROGRAM_ID, TIMER_MINT } from "../lib/constants";

interface Props {
  universePda: string;
  universePorosity: number;
  isAuthority: boolean;
  onCreated: () => void;
  onClose: () => void;
}

export function CreateGameModal({
  universePda,
  universePorosity,
  isAuthority,
  onCreated,
  onClose,
}: Props) {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();

  // Form state
  const [eventId, setEventId] = useState("");
  const [lockDatetime, setLockDatetime] = useState("");
  const [settleDatetime, setSettleDatetime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Porosity gate: authority always allowed; others need porosity >= 50
  const canCreate = isAuthority || universePorosity >= 50;

  async function handleCreate() {
    if (!publicKey || !wallet) return;
    if (!eventId.trim()) { setError("Event description is required."); return; }
    if (!lockDatetime) { setError("Lock time is required."); return; }
    if (!settleDatetime) { setError("Settle time is required."); return; }

    const lockTs = Math.floor(new Date(lockDatetime).getTime() / 1000);
    const settleTs = Math.floor(new Date(settleDatetime).getTime() / 1000);
    const nowTs = Math.floor(Date.now() / 1000);

    if (lockTs <= nowTs) { setError("Lock time must be in the future."); return; }
    if (settleTs <= lockTs) { setError("Settle time must be after lock time."); return; }

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

      const universePubkey = new PublicKey(universePda);

      // Derive game PDA using universe.game_count — fetch it first
      const u = await (program.account as any).universe.fetch(universePubkey);
      const gameIndex = u.gameCount;

      const buf = Buffer.alloc(4);
      buf.writeUInt32LE(gameIndex, 0);
      const [gamePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("game"), universePubkey.toBuffer(), buf],
        new PublicKey(PROGRAM_ID)
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), gamePda.toBuffer()],
        new PublicKey(PROGRAM_ID)
      );

      // Encode eventId as padded bytes (32 bytes, null-terminated)
      const eventIdBytes = Buffer.alloc(32);
      Buffer.from(eventId.trim(), "utf8").copy(eventIdBytes);

      const gameType = { customEvent: { eventId: Array.from(eventIdBytes) } };

      await program.methods
        .createGame(gameType, new anchor.BN(lockTs), new anchor.BN(settleTs))
        .accounts({
          game: gamePda,
          universe: universePubkey,
          oracle: publicKey,
          tokenMint: new PublicKey(TIMER_MINT),
          vault: vaultPda,
          authority: publicKey,
          tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      setSuccess("Game created!");
      setTimeout(() => {
        onCreated();
        onClose();
      }, 1200);
    } catch (e: any) {
      const msg: string = e?.message ?? String(e);
      if (msg.includes("Porosity")) setError("Universe porosity too low to create games.");
      else if (msg.includes("NotAuthority")) setError("Only the universe authority can create games here.");
      else setError(msg.slice(0, 120));
    } finally {
      setLoading(false);
    }
  }

  // Default lock to +1h, settle to +2h for convenience
  function prefillTimes() {
    const now = Date.now();
    const toLocal = (ms: number) => new Date(ms - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    if (!lockDatetime) setLockDatetime(toLocal(now + 60 * 60 * 1000));
    if (!settleDatetime) setSettleDatetime(toLocal(now + 2 * 60 * 60 * 1000));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Create Game</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {!canCreate ? (
          <div className="text-center py-6">
            <p className="text-orange-400 text-sm font-medium mb-1">Porosity too low</p>
            <p className="text-gray-500 text-xs">
              This universe requires porosity ≥ 50 for open game creation.
              Current porosity: {universePorosity}.
            </p>
          </div>
        ) : !publicKey ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">Connect your wallet to create a game.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Event description */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Event Description</label>
              <input
                type="text"
                value={eventId}
                onChange={e => setEventId(e.target.value)}
                onFocus={prefillTimes}
                maxLength={31}
                placeholder="e.g. BTC above 100k on Apr 20?"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-gray-600 text-xs mt-0.5">{eventId.length}/31 chars</p>
            </div>

            {/* Lock time */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Lock Time (betting closes)</label>
              <input
                type="datetime-local"
                value={lockDatetime}
                onChange={e => setLockDatetime(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Settle time */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Settle Time (outcome can be set)</label>
              <input
                type="datetime-local"
                value={settleDatetime}
                onChange={e => setSettleDatetime(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Info row */}
            <div className="bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-400 flex flex-col gap-0.5">
              <span>Initial odds: <span className="text-white">50% YES / 50% NO</span></span>
              <span>Min bet: <span className="text-white">100 TIMER</span></span>
              <span>Creator: <span className="text-purple-400">{publicKey.toBase58().slice(0, 8)}...</span></span>
            </div>

            {/* Error / success */}
            {error && <p className="text-red-400 text-xs">{error}</p>}
            {success && <p className="text-green-400 text-xs">{success}</p>}

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Creating..." : "Create Game"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
