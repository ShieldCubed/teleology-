"use client";
import { useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useSetPorosity } from "../lib/useSetPorosity";

interface Props {
  universePda: string;
  currentPorosity: number;
  isAuthority: boolean;
  lockedUntil: number; // unix ts
  onSuccess?: () => void;
}

function porosityLabel(p: number): string {
  if (p === 0) return "Closed — no games allowed";
  if (p < 50) return "Authority only — only you can create games";
  if (p < 100) return "Semi-open — anyone can create, only you can settle";
  return "Fully open — anyone can create and settle";
}

function porosityColor(p: number): string {
  if (p === 0) return "text-red-400";
  if (p < 50) return "text-orange-400";
  if (p < 100) return "text-yellow-400";
  return "text-green-400";
}

export default function PorositySlider({ universePda, currentPorosity, isAuthority, lockedUntil, onSuccess }: Props) {
  const [value, setValue] = useState(currentPorosity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setPorosity } = useSetPorosity();

  const now = Math.floor(Date.now() / 1000);
  const isTimeLocked = value > currentPorosity && now < lockedUntil;
  const lockDate = new Date(lockedUntil * 1000).toLocaleString();

  const handleSet = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      const sig = await setPorosity(new PublicKey(universePda), value);
      setSuccess("Porosity updated! " + sig.slice(0, 8) + "...");
      onSuccess?.();
    } catch (e: any) {
      setError(e.message ?? "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-300">Universe Porosity</span>
        <span className={"text-lg font-bold font-mono " + porosityColor(value)}>{value}</span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => setValue(Number(e.target.value))}
        className="w-full accent-purple-500 mb-2"
      />
      <p className={"text-xs mb-3 " + porosityColor(value)}>{porosityLabel(value)}</p>
      {isTimeLocked && (
        <p className="text-xs text-yellow-400 mb-2">
          Time-locked until {lockDate} — cannot increase porosity yet
        </p>
      )}
      {value !== currentPorosity && (
        <button
          onClick={handleSet}
          disabled={loading || isTimeLocked || !isAuthority}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
        >
          {loading ? "Setting..." : "Set Porosity"}
        </button>
      )}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      {success && <p className="text-xs text-green-400 mt-2">{success}</p>}
    </div>
  );
}
