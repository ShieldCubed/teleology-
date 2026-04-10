"use client";
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { findUniverse, findGame } from '../lib/program';
import { RPC_URL, UNIVERSE_NAME, UNIVERSE_AUTHORITY, VAULT_ADDRESS } from '../lib/constants';
import { IDL } from '../lib/idl';

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [universe, setUniverse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGames(); }, []);

  async function loadGames() {
    setLoading(true);
    try {
      const connection = new Connection(RPC_URL, 'confirmed');
      const authority = new PublicKey(UNIVERSE_AUTHORITY);
      const dummyWallet = {
        publicKey: authority,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any) => txs,
      };
      const provider = new anchor.AnchorProvider(connection, dummyWallet as any, {});
      const program = new anchor.Program(IDL as anchor.Idl, provider);
      const [universePda] = findUniverse(authority, UNIVERSE_NAME);
      const u = await (program.account as any).universe.fetch(universePda);
      setUniverse(u);
      const loaded = [];
      for (let i = 0; i < u.gameCount; i++) {
        const [gamePda] = findGame(universePda, i);
        const g = await (program.account as any).game.fetch(gamePda);
        loaded.push({ game: g, pda: gamePda.toBase58() });
      }
      setGames(loaded);
    } catch (e: any) {
      console.error(e.message);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">MekongDelta</h1>
        <p className="text-gray-400">Prediction markets inside FSP universes on Solana</p>
      </div>
      {universe && (
        <div className="grid grid-cols-4 gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div><div className="text-gray-500 text-xs mb-1">Universe</div><div className="text-white font-semibold">{UNIVERSE_NAME}</div></div>
          <div><div className="text-gray-500 text-xs mb-1">Type</div><div className="text-cyan-400 font-semibold">FSP</div></div>
          <div><div className="text-gray-500 text-xs mb-1">Porosity</div><div className="text-purple-400 font-semibold">{universe.porosity}%</div></div>
          <div><div className="text-gray-500 text-xs mb-1">Games</div><div className="text-white font-semibold">{universe.gameCount}</div></div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Games</h2>
        <button onClick={loadGames} className="text-sm text-gray-500 hover:text-white border border-gray-800 hover:border-gray-600 px-3 py-1 rounded-lg transition-colors">
          Refresh
        </button>
      </div>
      {loading && <div className="text-gray-500 text-center py-16">Loading from devnet...</div>}
      {!loading && games.length === 0 && <div className="text-gray-600 text-center py-16">No games found</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map(({ game, pda }, i) => (
          <div key={pda} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Game #{i}</span>
              <span className="text-green-400 text-sm font-medium px-2 py-0.5 rounded-full bg-gray-800">Open</span>
            </div>
            <div className="text-white font-semibold">
              {Buffer.from(game.gameType?.customEvent?.eventId || []).toString('utf8').replace(/\0/g, '') || 'Custom Event'}
            </div>
            <div className="text-gray-500 text-xs">
              Locks: {new Date(game.lockTime.toNumber() * 1000).toLocaleString()}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>YES — {(Number(game.yesAmount) / 1e9).toFixed(0)} TIMER</span>
                <span>NO — {(Number(game.noAmount) / 1e9).toFixed(0)} TIMER</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
            <div className="text-gray-600 text-xs">Total: {((Number(game.yesAmount) + Number(game.noAmount)) / 1e9).toFixed(0)} TIMER</div>
          </div>
        ))}
      </div>
    </div>
  );
}
