import { Connection, PublicKey } from "@solana/web3.js";
import { AccountLayout } from "@solana/spl-token";

const conn = new Connection('https://api.devnet.solana.com', 'confirmed');
const VAULT = new PublicKey('2Kasabzr99M6v9bSaqmf7znH5KKfs5uT5XacTzbvu23b');
const GAME3 = new PublicKey('3KgX7awdbT6mqy4cXtcSRMGQBCeJnyGCV24tyfwYWbZu');

async function main() {
  const info = await conn.getAccountInfo(VAULT);
  if (!info) { console.log('vault not found'); return; }
  const decoded = AccountLayout.decode(info.data);
  console.log('vault mint:', new PublicKey(decoded.mint).toBase58());
  console.log('vault owner:', new PublicKey(decoded.owner).toBase58());
  console.log('vault amount:', decoded.amount.toString());
  console.log('game3 PDA:', GAME3.toBase58());
  console.log('owner matches game:', new PublicKey(decoded.owner).toBase58() === GAME3.toBase58());
}

main().catch(e => console.error(e.message));
