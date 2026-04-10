'use client';
import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { findUniverse, findGame, findBet } from '../lib/program';
import { RPC_URL, UNIVERSE_NAME, UNIVERSE_AUTHORITY, VAULT_ADDRESS, TIMER_MINT, PROGRAM_ID } from '../lib/constants';
import { IDL } from '../lib/idl';

export default function Home() {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [games, setGames] = useState<any[]>([]);
  const [universe, setUniverse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [betting, setBetting] = useState<string | null>(null);
  const [betResult, setBetResult] = useState<Record<string, string>>({});

  useEffect(() => { loadGames(); }, []);

  async function loadGames() {
    setLoading(true);
    try {
      const conn = new Connection(RPC_URL, 'confirmed');
      const authority = new PublicKey(UNIVERSE_AUTHORITY);
      const dummyWallet = {
        publicKey: authority,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any) => txs,
      };
      const provider = new anchor.AnchorProvider(conn, dummyWallet as any, {});
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

  async function placeBet(gamePda: string, vaultAddr: string, side: 'yes' | 'no') {
    if (!publicKey || !wallet) return;
    const key = gamePda + side;
    setBetting(key);
    setBetResult(r => ({ ...r, [gamePda]: '' }));
    try {
      const provider = new anchor.AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
      const program = new anchor.Program(IDL as anchor.Idl, provider);
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
          vault: new PublicKey(vaultAddr),
          bettor: publicKey,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      setBetResult(r => ({ ...r, [gamePda]: 'Bet placed!' }));
      await loadGames();
    } catch (e: any) {
      setBetResult(r => ({ ...r, [gamePda]: 'Error: ' + (e.message || '').slice(0, 80) }));
    }
    setBetting(null);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map(({ game, pda }, i) => {
          const yes = Number(game.yesAmount) / 1e9;
          const no = Number(game.noAmount) / 1e9;
          const total = yes + no;
          const yesPct = total > 0 ? Math.round((yes / total) * 100) : 50;
          const lockTime = new Date(game.lockTime.toNumber() * 1000);
          const isLocked = new Date() > lockTime;
          const eventId = Buffer.from(game.gameType?.customEvent?.eventId || []).toString('utf8').replace(/\0/g, '');
          const isBetting = betting?.startsWith(pda);
          const result = betResult[pda];

          return (
            <div key={pda} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm font-mono">Game #{i}</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full bg-gray-800 ${isLocked ? 'text-yellow-400' : 'text-green-400'}`}>
                  {isLocked ? 'Locked' : 'Open'}
                </span>
              </div>

              <div className="text-white font-semibold text-lg">{eventId || 'Custom Event'}</div>
              <div className="text-gray-500 text-xs">Locks: {lockTime.toLocaleString()}</div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>YES — {yesPct}% ({yes.toFixed(0)} TIMER)</span>
                  <span>NO — {100 - yesPct}% ({no.toFixed(0)} TIMER)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: yesPct + '%' }} />
                </div>
              </div>

              {/* Bet buttons — show on open games only */}
              {!isLocked && publicKey && (
                <div className="flex gap-2">
                  <button
                    onClick={() => placeBet(pda, VAULT_ADDRESS, 'yes')}
                    disabled={!!betting}
                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {isBetting && betting === pda + 'yes' ? 'Placing...' : 'YES — 100 TIMER'}
                  </button>
                  <button
                    onClick={() => placeBet(pda, VAULT_ADDRESS, 'no')}
                    disabled={!!betting}
                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {isBetting && betting === pda + 'no' ? 'Placing...' : 'NO — 100 TIMER'}
                  </button>
                </div>
              )}

              {isLocked && (
                <div className="text-yellow-500 text-xs text-center py-1 bg-yellow-500/10 rounded-lg">
                  Market locked — betting closed
                </div>
              )}

              {!publicKey && !isLocked && (
                <p className="text-gray-600 text-xs text-center">Connect wallet to bet</p>
              )}

              {result && (
                <p className={result.startsWith('Error') ? 'text-red-400 text-xs' : 'text-green-400 text-xs'}>{result}</p>
              )}

              <div className="text-gray-600 text-xs pt-1 border-t border-gray-800">
                Total pool: {total.toFixed(0)} TIMER
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
