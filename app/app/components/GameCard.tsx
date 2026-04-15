"use client";
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getProgram, findBet } from '../lib/program';
import { TIMER_MINT, SUPPORTED_ASSETS, SupportedAsset } from '../lib/constants';
import OraclePriceBadge from './OraclePriceBadge';

interface GameCardProps {
  game: any;
  gamePda: string;
  index: number;
  vaultAddress: string;
}

export function GameCard({ game, gamePda, index, vaultAddress }: GameCardProps) {
  const { wallet, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const totalPool = (Number(game.yesAmount) + Number(game.noAmount)) / 1e9;
  const yesPool = Number(game.yesAmount) / 1e9;
  const noPool = Number(game.noAmount) / 1e9;
  const yesPercent = totalPool > 0 ? Math.round((yesPool / totalPool) * 100) : 50;
  const lockTime = new Date(game.lockTime.toNumber() * 1000);
  const isOpen = JSON.stringify(game.status) === JSON.stringify({ open: {} });
  const isLocked = new Date() > lockTime;

  function getGameTitle() {
    const gt = game.gameType;
    if (gt?.assetPrice) {
      const sym = Buffer.from(gt.assetPrice.assetSymbol).toString('utf8').replace(/\0/g, '');
      const dir = gt.assetPrice.direction?.above !== undefined ? 'Above' : 'Below';
      const price = (gt.assetPrice.targetPrice.toNumber() / 1e9).toFixed(2);
      return sym.trim() + '/USD ' + dir + ' $' + price;
    }
    if (gt?.customEvent) {
      return Buffer.from(gt.customEvent.eventId).toString('utf8').replace(/\0/g, '');
    }
    return 'Prediction Market';
  }
  function getAssetSymbol(game: any): SupportedAsset | null {
    const gt = game.gameType;
    if (gt?.assetPrice) {
      const sym = Buffer.from(gt.assetPrice.assetSymbol).toString('utf8').replace(/\0/g, '').trim();
      if (SUPPORTED_ASSETS.includes(sym as SupportedAsset)) return sym as SupportedAsset;
    }
    return null;
  }

  function getStrikePrice(game: any): number | undefined {
    const gt = game.gameType;
    if (gt?.assetPrice) return gt.assetPrice.targetPrice.toNumber() / 1e9;
    return undefined;
  }

  async function placeBet(side: 'yes' | 'no') {
    if (!wallet || !publicKey) return;
    setLoading(true);
    setResult('');
    try {
      const program = getProgram(wallet as any);
      const gamePubkey = new PublicKey(gamePda);
      const [bet] = findBet(gamePubkey, publicKey);
      const bettorTokenAccount = await anchor.utils.token.associatedAddress({
        mint: new PublicKey(TIMER_MINT),
        owner: publicKey,
      });

      await program.methods
        .placeBet(side === 'yes' ? { yes: {} } : { no: {} }, new anchor.BN(100 * 1e9))
        .accounts({
          bet,
          game: gamePubkey,
          tokenMint: new PublicKey(TIMER_MINT),
          bettorTokenAccount,
          vault: new PublicKey(vaultAddress),
          bettor: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        })
        .rpc();
      setResult('✅ Bet placed!');
    } catch (e: any) {
      setResult('❌ ' + (e.message || String(e)));
    } finally {
      setLoading(false);
    }
  }

  const statusLabel = !isOpen
    ? 'Settled'
    : isLocked
    ? 'Locked'
    : 'Open';

  const statusColor = !isOpen
    ? 'text-gray-400'
    : isLocked
    ? 'text-yellow-400'
    : 'text-green-400';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {getAssetSymbol(game) && (
        <div className="mb-2">
          <OraclePriceBadge asset={getAssetSymbol(game)!} strikePrice={getStrikePrice(game)} />
        </div>
      )}
      <h3 className="text-white font-semibold text-sm">{getGameTitle()}</h3>
        <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
      </div>

      <div className="flex gap-2 h-2 rounded-full overflow-hidden bg-gray-700">
        <div className="bg-green-500 transition-all" style={{ width: `${yesPercent}%` }} />
        <div className="bg-red-500 transition-all" style={{ width: `${100 - yesPercent}%` }} />
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>YES {yesPercent}% — {yesPool.toFixed(0)} TIMER</span>
        <span>NO {100 - yesPercent}% — {noPool.toFixed(0)} TIMER</span>
      </div>

      <div className="text-gray-600 text-xs">Total pool: {totalPool.toFixed(0)} TIMER</div>

      {isOpen && !isLocked && publicKey && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => placeBet('yes')}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            YES
          </button>
          <button
            onClick={() => placeBet('no')}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            NO
          </button>
        </div>
      )}

      {result && <p className="text-xs mt-1">{result}</p>}

      <div className="text-gray-600 text-xs">
        Locks: {lockTime.toLocaleString()}
      </div>
    </div>
  );
}
