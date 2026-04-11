"use client";
import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { IDL } from '../lib/idl';
import { RPC_URL, TIMER_MINT, PROGRAM_ID, VAULT_ADDRESS } from '../lib/constants';

const UNIVERSE_PDA = '87g4cgFaCopAufWwZ8ucyGsyJZCjLJLXrJ7a6q7j3kgq';
const UNIVERSE_NAME = 'fsp-alpha';

function findGamePda(universeKey: PublicKey, index: number): PublicKey {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(index, 0);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), universeKey.toBuffer(), buf],
    new PublicKey(PROGRAM_ID)
  );
  return pda;
}

function findBetPda(gameKey: PublicKey, bettor: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), gameKey.toBuffer(), bettor.toBuffer()],
    new PublicKey(PROGRAM_ID)
  );
  return pda;
}

// Derives winner ATA using Anchor's util
async function getATA(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
  return anchor.utils.token.associatedAddress({ mint, owner });
}

export default function Home() {
  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [games, setGames] = useState<any[]>([]);
  const [universe, setUniverse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [betting, setBetting] = useState<string | null>(null);
  const [betResult, setBetResult] = useState<Record<string, string>>({});
  // Map of gamePda -> { side: 'Yes'|'No', amount: number, claimed: boolean } | null
  const [positions, setPositions] = useState<Record<string, { side: 'Yes' | 'No'; amount: number; claimed: boolean } | null>>({});
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<Record<string, string>>({});

  useEffect(() => { loadGames(); }, []);

  // Re-fetch bet positions whenever wallet or games change
  useEffect(() => {
    if (publicKey && games.length > 0) {
      loadPositions();
    } else {
      setPositions({});
    }
  }, [publicKey, games.length]);

  async function loadGames() {
    setLoading(true);
    try {
      const conn = new Connection(RPC_URL, 'confirmed');
      const universePda = new PublicKey(UNIVERSE_PDA);
      const dummyWallet = {
        publicKey: new PublicKey(UNIVERSE_PDA),
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any) => txs,
      };
      const provider = new anchor.AnchorProvider(conn, dummyWallet as any, {});
      const program = new anchor.Program(IDL as anchor.Idl, provider);
      const u = await (program.account as any).universe.fetch(universePda);
      setUniverse(u);
      const loaded = [];
      for (let i = 0; i < u.gameCount; i++) {
        const gamePda = findGamePda(universePda, i);
        const g = await (program.account as any).game.fetch(gamePda);console.log(`[Game ${i}] status:`, JSON.stringify(g.status), 'outcome:', JSON.stringify(g.outcome));
        loaded.push({ game: g, pda: gamePda.toBase58() });
        if (i === 3) console.log('[Game3] vault:', g.vault.toBase58());
      }
      setGames(loaded);
    } catch (e: any) {
      console.error(e.message);
    }
    setLoading(false);
  }

  async function loadPositions() {
    if (!publicKey) return;
    try {
      const conn = new Connection(RPC_URL, 'confirmed');
      const dummyWallet = {
        publicKey,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any) => txs,
      };
      const provider = new anchor.AnchorProvider(conn, dummyWallet as any, {});
      const program = new anchor.Program(IDL as anchor.Idl, provider);
      const next: Record<string, any> = {};
      for (const { pda } of games) {
        const gamePubkey = new PublicKey(pda);
        const betPda = findBetPda(gamePubkey, publicKey);
        try {
          const bet = await (program.account as any).bet.fetch(betPda);
console.log(`[Game ${pda.slice(0,8)}] side:`, JSON.stringify(bet.side), 'status will be checked in loadGames');
          const side: 'Yes' | 'No' = bet.side?.yes !== undefined ? 'Yes' : 'No';
          next[pda] = {
            side,
            amount: bet.amount.toNumber() / 1e9,
            claimed: bet.claimed,
          };
        } catch {
          next[pda] = null; // no bet placed
        }
      }
      setPositions(next);
    } catch (e: any) {
      console.error('loadPositions error:', e.message);
    }
  }

  async function placeBet(gamePda: string, vaultAddr: string, side: 'yes' | 'no') {
    if (!publicKey || !wallet) return;
    const key = gamePda + side;
    setBetting(key);
    setBetResult(r => ({ ...r, [gamePda]: '' }));
    try {
      const anchorWallet = {
        publicKey,
        signTransaction: (wallet as any).adapter.signTransaction?.bind((wallet as any).adapter),
        signAllTransactions: (wallet as any).adapter.signAllTransactions?.bind((wallet as any).adapter),
      };
      const provider = new anchor.AnchorProvider(connection, anchorWallet as any, { commitment: 'confirmed', preflightCommitment: 'confirmed' });
      const program = new anchor.Program(IDL as anchor.Idl, provider);
      const gamePubkey = new PublicKey(gamePda);
      const bet = findBetPda(gamePubkey, publicKey);
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
          vault: PublicKey.findProgramAddressSync([Buffer.from("vault"), gamePubkey.toBuffer()], new PublicKey(PROGRAM_ID))[0],
          bettor: publicKey,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      setBetResult(r => ({ ...r, [gamePda]: 'Bet placed!' }));
      await loadGames();
    } catch (e: any) {
      setBetResult(r => ({ ...r, [gamePda]: 'Error: ' + (e.message || '').slice(0, 100) }));
    }
    setBetting(null);
  }

  async function claimWinnings(gamePda: string, vaultAddr: string) {
    if (!publicKey || !wallet) return;
    setClaiming(gamePda);
    setClaimResult(r => ({ ...r, [gamePda]: '' }));
    try {
      const anchorWallet = {
        publicKey,
        signTransaction: (wallet as any).adapter.signTransaction?.bind((wallet as any).adapter),
        signAllTransactions: (wallet as any).adapter.signAllTransactions?.bind((wallet as any).adapter),
      };
      const provider = new anchor.AnchorProvider(connection, anchorWallet as any, { commitment: 'confirmed', preflightCommitment: 'confirmed' });
      const program = new anchor.Program(IDL as anchor.Idl, provider);
      const gamePubkey = new PublicKey(gamePda);
      const betPda = findBetPda(gamePubkey, publicKey);
      const winnerTokenAccount = await getATA(new PublicKey(TIMER_MINT), publicKey);
      await program.methods
        .claimWinnings()
        .accounts({
          game: gamePubkey,
          bet: betPda,
          vault: new PublicKey(vaultAddr),
          winnerTokenAccount,
          winner: publicKey,
          bettor: publicKey,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        })
        .rpc();
      setClaimResult(r => ({ ...r, [gamePda]: 'Claimed!' }));
      // Refresh positions so badge updates to claimed
      await loadPositions();
    } catch (e: any) {
      const msg: string = e?.message ?? String(e);
      if (msg.includes('DidNotWin')) setClaimResult(r => ({ ...r, [gamePda]: 'This bet did not win.' }));
      else if (msg.includes('AlreadyClaimed')) setClaimResult(r => ({ ...r, [gamePda]: 'Already claimed.' }));
      else setClaimResult(r => ({ ...r, [gamePda]: 'Error: ' + msg.slice(0, 80) }));
    }
    setClaiming(null);
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
          const isSettled = game.status?.settled !== undefined;
          const isCancelled = game.status?.cancelled !== undefined;
          const outcome: boolean | null = game.outcome ?? null; // Option<bool>
          const eventId = Buffer.from(game.gameType?.customEvent?.eventId || []).toString('utf8').replace(/\0/g, '');
          const isBetting = betting?.startsWith(pda);
          const result = betResult[pda];
          const vaultAddr = game.vault.toBase58();

          // This wallet's bet position for this game
          const pos = positions[pda];
          const wonBet =
            isSettled && pos && outcome !== null
              ? (pos.side === 'Yes' && outcome === true) || (pos.side === 'No' && outcome === false)
              : null;

          // Status label + color
          const statusLabel = isSettled ? 'Settled' : isCancelled ? 'Cancelled' : isLocked ? 'Locked' : 'Open';
          const statusColor = isSettled
            ? 'text-blue-400'
            : isCancelled
            ? 'text-red-400'
            : isLocked
            ? 'text-yellow-400'
            : 'text-green-400';

          return (
            <div key={pda} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-colors">

              {/* Header */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm font-mono">Game #{i}</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full bg-gray-800 ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>

              {/* Event title */}
              <div className="text-white font-semibold text-lg">{eventId || 'Custom Event'}</div>
              <div className="text-gray-500 text-xs">Locks: {lockTime.toLocaleString()}</div>

              {/* YES/NO bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>YES — {yesPct}% ({yes.toFixed(0)} TIMER)</span>
                  <span>NO — {100 - yesPct}% ({no.toFixed(0)} TIMER)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: yesPct + '%' }}
                  />
                </div>
              </div>

              {/* Outcome banner (settled) */}
              {isSettled && outcome !== null && (
                <div className={`text-xs text-center py-1 rounded-lg font-semibold ${outcome ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  Outcome: {outcome ? 'YES wins' : 'NO wins'}
                </div>
              )}

              {/* ── Bet position badge ── */}
              {pos && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold
                    ${pos.side === 'Yes'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/25'}
                    ${wonBet === true && !pos.claimed ? 'ring-1 ring-yellow-400/60 shadow-[0_0_8px_rgba(250,204,21,0.3)]' : ''}
                  `}>
                    <span className={`h-1.5 w-1.5 rounded-full ${pos.side === 'Yes' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    Your bet: {pos.side} · {pos.amount.toFixed(0)} TIMER
                    {wonBet === true && !pos.claimed && <span className="ml-1">🏆</span>}
                    {wonBet === false && <span className="ml-1 opacity-40">✗</span>}
                  </span>

                  {/* Claim button */}
                  {wonBet === true && !pos.claimed && claimResult[pda] !== 'Claimed!' && (
                    <button
                      onClick={() => claimWinnings(pda, vaultAddr)}
                      disabled={claiming === pda}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold transition-all active:scale-95
                        ${claiming === pda
                          ? 'cursor-wait bg-yellow-500/20 text-yellow-300'
                          : 'cursor-pointer bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.35)]'}
                      `}
                    >
                      {claiming === pda ? 'Claiming…' : 'Claim Winnings'}
                    </button>
                  )}

                  {/* Already claimed */}
                  {(pos.claimed || claimResult[pda] === 'Claimed!') && wonBet === true && (
                    <span className="text-xs text-yellow-400/60 font-medium">Claimed ✓</span>
                  )}

                  {/* Claim error */}
                  {claimResult[pda] && claimResult[pda] !== 'Claimed!' && (
                    <span className="text-xs text-rose-400">{claimResult[pda]}</span>
                  )}
                </div>
              )}

              {/* Bet buttons (open + unlocked) */}
              {!isLocked && !isSettled && !isCancelled && publicKey && !pos && (
                <div className="flex gap-2">
                  <button
                    onClick={() => placeBet(pda, vaultAddr, 'yes')}
                    disabled={!!betting}
                    className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {isBetting && betting === pda + 'yes' ? 'Placing...' : 'YES — 100 TIMER'}
                  </button>
                  <button
                    onClick={() => placeBet(pda, vaultAddr, 'no')}
                    disabled={!!betting}
                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {isBetting && betting === pda + 'no' ? 'Placing...' : 'NO — 100 TIMER'}
                  </button>
                </div>
              )}

              {/* Already bet — no buttons */}
              {!isLocked && !isSettled && !isCancelled && publicKey && pos && (
                <div className="text-xs text-gray-500 text-center">One bet per game — position locked in</div>
              )}

              {isLocked && !isSettled && (
                <div className="text-yellow-500 text-xs text-center py-1 bg-yellow-500/10 rounded-lg">
                  Market locked — betting closed
                </div>
              )}

              {!publicKey && !isLocked && !isSettled && (
                <p className="text-gray-600 text-xs text-center">Connect wallet to bet</p>
              )}

              {result && (
                <p className={`text-xs ${result.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{result}</p>
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
