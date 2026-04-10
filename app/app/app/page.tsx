"use client";
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getProgram, findUniverse, findGame } from '../lib/program';
import { RPC_URL, UNIVERSE_NAME } from '../lib/constants';
import { GameCard } from '../components/GameCard';
import { IDL } from '../lib/idl';
import { PROGRAM_ID } from '../lib/constants';

const VAULT_ADDRESS = '2Kasabzr99M6v9bSaqmf7znH5KKfs5uT5XacTzbvu23b';
const UNIVERSE_AUTHORITY = 'BqK3dgmbWx7itxhm84kcSbcRymSeMTBEc25FeKZV2zAK';

export default function Home() {
  const { wallet, publicKey } = useWallet();
  const [games, setGames] = useState<any[]>([]);
  const [universe, setUniverse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGames();
  }, [wallet]);

  async function loadGames() {
    setLoading(true);
    try {
      const connection = new Connection(RPC_URL, 'confirmed');
      const dummyWallet = {
        publicKey: new PublicKey(UNIVERSE_AUTHORITY),
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any) => txs,
      };
      const provider = new anchor.AnchorProvider(connection, dummyWallet as any, {});
      const program = new anchor.Program(IDL as anchor.Idl, provider);

      const authority = new PublicKey(UNIVERSE_AUTHORITY);
      const [universePda] = findUniverse(authority, UNIVERSE_NAME);
      const u = await (program.account as any).universe.fetch(universePda);
      setUniverse(u);

      const loadedGames = [];
      for (let i = 0; i < u.gameCount; i++) {
        const [gamePda] = findGame(universePda, i);
        const g = await (program.account as any).game.fetch(gamePda);
        loadedGames.push({ game: g, pda: gamePda.toBase58() });
      }
      setGames(loadedGames);
    } catch (e: any) {
      console.error('Load error:', e.message);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">MekongDelta</h1>
        <p className="text-gray-400">Prediction markets inside FSP universes</p>
      </div>

      {universe && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-6">
          <div>
            <div className="text-gray-500 text-xs">Universe</div>
            <div className="text-white font-medium">{UNIVERSE_NAME}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Porosity</div>
            <div className="text-purple-400 font-medium">{universe.porosity}%</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Games</div>
            <div className="text-white font-medium">{universe.gameCount}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Type</div>
            <div className="text-cyan-400 font-medium">FSP</div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Active Games</h2>
        <button
          onClick={loadGames}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-gray-500 text-center py-12">Loading games...</div>
      )}

      {!loading && games.length === 0 && (
        <div className="text-gray-600 text-center py-12">No games found</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map(({ game, pda }, i) => (
          <GameCard
            key={pda}
            game={game}
            gamePda={pda}
            index={i}
            vaultAddress={VAULT_ADDRESS}
          />
        ))}
      </div>

      {!publicKey && (
        <div className="text-center text-gray-500 text-sm mt-4">
          Connect your wallet to place bets
        </div>
      )}
    </div>
  );
}
