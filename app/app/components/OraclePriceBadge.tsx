"use client";
import { usePythPrice } from "../lib/usePythPrice";
import { SupportedAsset } from "../lib/constants";

interface Props {
  asset: SupportedAsset;
  strikePrice?: number; // human-readable USD
}

export default function OraclePriceBadge({ asset, strikePrice }: Props) {
  const oracle = usePythPrice(asset);

  if (!oracle) {
    return (
      <span className="text-xs text-gray-400 animate-pulse">
        Loading {asset}...
      </span>
    );
  }

  const sourceLabel = oracle.source === 0 ? "Pyth" : "SB";
  const isStale = oracle.status === "stale";
  const delta = strikePrice ? ((oracle.price - strikePrice) / strikePrice) * 100 : null;
  const above = delta !== null && delta >= 0;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className={`font-mono font-bold text-sm ${isStale ? "text-yellow-400" : "text-green-400"}`}>
          ${oracle.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
        </span>
        <span className="text-xs text-gray-500">{sourceLabel} · {oracle.age}s ago</span>
        {isStale && <span className="text-xs text-yellow-500 font-bold">STALE</span>}
      </div>
      {strikePrice !== undefined && delta !== null && (
        <div className="flex items-center gap-1 text-xs">
          <span className="text-gray-400">Strike ${strikePrice.toLocaleString()}</span>
          <span className={above ? "text-green-400" : "text-red-400"}>
            {above ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}
