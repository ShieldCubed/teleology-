import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, findGlobalConfig, findUniverse, findGame, findBet } from './pda';
import { initializeGlobal, fetchGlobalConfig } from './instructions/global';
import { createUniverse, setPorosity, fetchUniverse } from './instructions/universe';
import { createGame, settleGame, fetchGame } from './instructions/game';
import { placeBet, claimWinnings, fetchBet } from './instructions/bet';
import { CreateUniverseParams, CreateGameParams, PlaceBetParams, BetSide } from './types';
import BN from 'bn.js';

export class TeleologyClient {
  program: anchor.Program;
  provider: anchor.AnchorProvider;

  constructor(connection: Connection, wallet: anchor.Wallet, idl: anchor.Idl) {
    this.provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    anchor.setProvider(this.provider);
    this.program = new anchor.Program(idl, this.provider);
  }

  get authority(): PublicKey {
    return this.provider.wallet.publicKey;
  }

  // Global
  initializeGlobal(treasury: PublicKey, feeBps: number) {
    return initializeGlobal(this.program, this.authority, treasury, feeBps);
  }
  fetchGlobalConfig() { return fetchGlobalConfig(this.program); }

  // Universe
  createUniverse(params: CreateUniverseParams) {
    return createUniverse(this.program, this.authority, params);
  }
  setPorosity(universeName: string, porosity: number) {
    return setPorosity(this.program, this.authority, universeName, porosity);
  }
  fetchUniverse(name: string) {
    return fetchUniverse(this.program, this.authority, name);
  }

  // Game
  createGame(universeName: string, params: CreateGameParams) {
    return createGame(this.program, this.authority, universeName, params);
  }
  settleGame(game: PublicKey, outcome: boolean) {
    return settleGame(this.program, this.authority, game, outcome);
  }
  fetchGame(game: PublicKey) { return fetchGame(this.program, game); }

  // Bet
  placeBet(params: PlaceBetParams) {
    return placeBet(this.program, this.authority, params);
  }
  claimWinnings(bettor: PublicKey, game: PublicKey, vault: PublicKey, winnerTokenAccount: PublicKey) {
    return claimWinnings(this.program, this.authority, bettor, game, vault, winnerTokenAccount);
  }
  fetchBet(game: PublicKey, bettor: PublicKey) {
    return fetchBet(this.program, game, bettor);
  }

  // PDA helpers
  pdaGlobalConfig() { return findGlobalConfig(); }
  pdaUniverse(name: string) { return findUniverse(this.authority, name); }
  pdaGame(universe: PublicKey, index: number) { return findGame(universe, index); }
  pdaBet(game: PublicKey, bettor: PublicKey) { return findBet(game, bettor); }
}
