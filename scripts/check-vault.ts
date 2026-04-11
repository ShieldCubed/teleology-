import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import * as fs from "fs";

const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));
const conn = new Connection('https://api.devnet.solana.com', 'confirmed');
const provider = new anchor.AnchorProvider(conn, new anchor.Wallet(anchor.web3.Keypair.generate()), {});
const program = new anchor.Program(idlJson, provider);
const GAME3 = new PublicKey('3KgX7awdbT6mqy4cXtcSRMGQBCeJnyGCV24tyfwYWbZu');

async function main() {
  const game = await (program.account as any).game.fetch(GAME3);
  console.log('game.vault:', game.vault.toBase58());
  console.log('game.yesAmount:', game.yesAmount.toString());
  console.log('game.noAmount:', game.noAmount.toString());
  const vaultInfo = await conn.getAccountInfo(game.vault);
  console.log('vault exists:', !!vaultInfo);
  console.log('vault lamports:', vaultInfo?.lamports);
  console.log('vault data length:', vaultInfo?.data.length);
}

main().catch(e => console.error(e.message));
