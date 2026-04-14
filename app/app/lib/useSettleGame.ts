import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, Transaction } from "@solana/web3.js";
import idl from "./teleology.json";
import { PROGRAM_ID, ORACLE_SOURCE, SupportedAsset } from "./constants";
import { fetchOraclePrice } from "./usePythPrice";

export function useSettleGame() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const settleGame = async (gamePda: PublicKey, asset: SupportedAsset | null) => {
    if (!wallet.publicKey || !wallet.signTransaction) throw new Error("Wallet not connected");

    const provider = new AnchorProvider(connection, wallet as any, {});
    const program = new Program(idl as any, provider);

    // ── Fetch oracle price ──────────────────────────────────────────────────
    let resolvedPrice: bigint;
    let priceTimestamp: number;
    let oracleSource: number;

    if (asset) {
      const oracle = await fetchOraclePrice(asset);
      if (!oracle) throw new Error("Oracle unavailable: could not fetch price");
      if (oracle.status === "stale") throw new Error(`Oracle price stale (${oracle.age}s old)`);

      resolvedPrice = oracle.priceScaled;
      priceTimestamp = oracle.timestamp;
      oracleSource = oracle.source;
    } else {
      // Non-AssetPrice game: pass 1 = YES won (manual settlement)
      resolvedPrice = BigInt(1);
      priceTimestamp = Math.floor(Date.now() / 1000);
      oracleSource = ORACLE_SOURCE.PYTH;
    }

    // ── Build and send ix ───────────────────────────────────────────────────
    const tx = await program.methods
      .settleGame(
        new BN(resolvedPrice.toString()),
        new BN(priceTimestamp),
        oracleSource
      )
      .accounts({
        game: gamePda,
        oracle: wallet.publicKey,
      })
      .transaction();

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;

    const signed = await wallet.signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  };

  return { settleGame };
}
