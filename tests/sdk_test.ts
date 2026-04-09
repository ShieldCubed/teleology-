import { TeleologyClient } from '../sdk';
import * as anchor from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';

async function main() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const wallet = anchor.AnchorProvider.env().wallet as anchor.Wallet;
  const idl = require('../target/idl/teleology.json');

  const client = new TeleologyClient(connection, wallet, idl as anchor.Idl);
  console.log('TeleologyClient initialized');
  console.log('Authority:', client.authority.toBase58());

  // Fetch GlobalConfig
  const gc = await client.fetchGlobalConfig();
  console.log('GlobalConfig fee:', gc.protocolFeeBps, 'paused:', gc.paused);

  // Fetch Universe
  const u = await client.fetchUniverse('fsp-alpha');
  console.log('Universe porosity:', u.porosity, 'games:', u.gameCount);

  // Get PDAs
  const [globalConfig] = client.pdaGlobalConfig();
  const [universe] = client.pdaUniverse('fsp-alpha');
  console.log('GlobalConfig PDA:', globalConfig.toBase58());
  console.log('Universe PDA:', universe.toBase58());

  // Fetch latest game
  const gameCount = u.gameCount;
  console.log('Total games created:', gameCount);
  for (let i = 0; i < gameCount; i++) {
    const [gamePda] = client.pdaGame(universe, i);
    const game = await client.fetchGame(gamePda);
    console.log('Game', i, '- status:', JSON.stringify(game.status), 'yes:', game.yesAmount.toString(), 'no:', game.noAmount.toString());
  }

  console.log('SDK working!');
}

main().catch(console.error);
