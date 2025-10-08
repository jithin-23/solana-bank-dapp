import { Connection, PublicKey } from "@solana/web3.js";

export async function ensureSolBalance(
  connection: Connection,
  publicKey: PublicKey,
  minBalance: number = 1
): Promise<void> {
  const balance = await connection.getBalance(publicKey);

  if (balance < minBalance * 1e9) {
    console.log(`Airdropping SOL to ${publicKey.toString()}`);
    const signature = await connection.requestAirdrop(publicKey, 5 * 1e9);
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });
  }
}
