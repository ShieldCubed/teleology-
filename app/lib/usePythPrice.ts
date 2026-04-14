"use client";
import { useEffect, useState } from 'react';
import { SupportedAsset } from './constants';

interface OracleData {
  price: number;
  source: number; // 0 = Pyth, 1 = SB
  status: 'live' | 'stale';
  age: number; // seconds
}

const PRICE_FEEDS: Record<SupportedAsset, string> = {
  SOL: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
  USDC: 'Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD',
};

export function usePythPrice(asset: SupportedAsset): OracleData | null {
  const [data, setData] = useState<OracleData | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPrice() {
      try {
        const feedId = PRICE_FEEDS[asset];
        const res = await fetch(
          `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${feedId}`
        );
        const json = await res.json();
        const parsed = json?.parsed?.[0];
        if (!parsed || cancelled) return;
        const price = Number(parsed.price.price) * Math.pow(10, parsed.price.expo);
        const publishTime = parsed.price.publish_time;
        const age = Math.floor(Date.now() / 1000) - publishTime;
        setData({ price, source: 0, status: age > 60 ? 'stale' : 'live', age });
      } catch {
        setData(null);
      }
    }
    fetchPrice();
    const interval = setInterval(fetchPrice, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [asset]);

  return data;
}
