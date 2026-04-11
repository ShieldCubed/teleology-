import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

const conn = new Connection('https://api.devnet.solana.com', 'confirmed');
const TIMER_MINT = new PublicKey('5vzSVRH5qMbwnP8TKNFKQ6ajN1AWh14Zbvu5ffbbtrXp');
const PHANTOM = new PublicKey('AF1gUfqNi3o2kA555iuqTToaAkCoMD8pb1auZFLGXnLe');

async function main() {
  const ata = await anchor.utils.token.associatedAddress({ mint: TIMER_MINT, owner: PHANTOM });
  console.log('Winner ATA:', ata.toBase58());
  const info = await conn.getAccountInfo(ata);
  console.log('ATA exists:', !!info);
  console.log('ATA lamports:', info?.lamports);
}

main().catch(e => console.error(e.message));
