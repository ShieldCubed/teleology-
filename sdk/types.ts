import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export type UniverseType = { financial: {} } | { machineTwin: {} } | { fsp: {} };
export type GameStatus = { open: {} } | { locked: {} } | { settled: {} } | { cancelled: {} };
export type BetSide = { yes: {} } | { no: {} };

export interface GlobalConfigAccount {
  authority: PublicKey;
  treasury: PublicKey;
  protocolFeeBps: number;
  paused: boolean;
  bump: number;
}

export interface UniverseAccount {
  authority: PublicKey;
  universeType: UniverseType;
  name: number[];
  porosity: number;
  porosityLockedUntil: BN;
  gameCount: number;
  bump: number;
}

export interface GameAccount {
  universe: PublicKey;
  oracle: PublicKey;
  tokenMint: PublicKey;
  vault: PublicKey;
  status: GameStatus;
  yesAmount: BN;
  noAmount: BN;
  outcome: boolean | null;
  lockTime: BN;
  settleTime: BN;
  gameIndex: number;
  bump: number;
}

export interface BetAccount {
  game: PublicKey;
  bettor: PublicKey;
  side: BetSide;
  amount: BN;
  claimed: boolean;
  bump: number;
}

export interface CreateUniverseParams {
  universeType: UniverseType;
  name: string;
  initialPorosity: number;
}

export interface CreateGameParams {
  oracle: PublicKey;
  tokenMint: PublicKey;
  vault: PublicKey;
  eventId: string;
  lockTime: number;
  settleTime: number;
}

export interface PlaceBetParams {
  game: PublicKey;
  bettorTokenAccount: PublicKey;
  vault: PublicKey;
  side: BetSide;
  amount: BN;
}
