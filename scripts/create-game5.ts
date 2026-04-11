import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import { RPC_URL, TIMER_MINT } from "../app/lib/constants";

const idlJson = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/teleology.json`, "utf8"));

async function main() {
  const keypairPath = os.homedir() + "/.config/solana/id.json";
  const raw = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
  const authority = Keypair.fromSecretKey(Uint8Array.from(raw));
  const conn = new Connection(RPC_URL, "confirmed");
  const wallet = new anchor.Wallet(authority);
  const provider = new anchor.AnchorProvider(conn, wallet, { commitment: "confirmed" });
  const program = new anchor.Program(idlJson, provider);

  const UNIVERSE_PDA = new PublicKey('87g4cgFaCopAufWwZ8ucyGsyJZCjLJLXrJ7a6q7j3kgq');
  const universe = await (program.account as any).universe.fetch(UNIVERSE_PDA);
  const gameIndex = universe.gameCount;

  const [gamePda] = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), UNIVERSE_PDA.toBuffer(), Buffer.from(new Uint8Array(new Uint32Array([gameIndex]).buffer))],
    program.programId
  );
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), gamePda.toBuffer()],
    program.programId
  );

  console.log('Game PDA:', gamePda.toBase58());
  console.log('Vault PDA:', vaultPda.toBase58());

  // Lock time: 2 minutes from now, settle: 4 minutes from now
  const now = Math.floor(Date.now() / 1000);
  const lockTime = now + 120;
  const settleTime = now + 240;

  await program.methods
    .createGame({ assetPrice: { assetSymbol: Array.from(Buffer.from('sol\0\0\0\0\0')), targetPrice: new anchor.BN(200), direction: { above: {} } } }, new anchor.BN(lockTime), new anchor.BN(settleTime))
    .accounts({
      game: gamePda,
      universe: UNIVERSE_PDA,
      oracle: authority.publicKey,
      tokenMint: new PublicKey(TIMER_MINT),
      vault: vaultPda,
      authority: authority.publicKey,
      tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  console.log('Game #5 created! Lock in 2 minutes.');
  console.log('Game PDA:', gamePda.toBase58());
  console.log('Vault PDA:', vaultPda.toBase58());
  console.log('Lock time:', new Date(lockTime * 1000).toLocaleString());
}

main().catch(e => { console.error("Error:", e.message); process.exit(1); });
