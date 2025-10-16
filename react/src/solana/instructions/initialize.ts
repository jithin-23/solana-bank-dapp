import { web3 } from "@coral-xyz/anchor";
import { getBankPda, getBankTokenAccountPda } from "../utils/helpers";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { TOKEN_MINT_ADDRESS } from "../utils/constants";
import type { SolanaContext } from "../utils/types";

export async function initialize(ctx: SolanaContext) {
  const { walletPubkey, connection, program, sendTransaction } = ctx;

  try {
    const [bankPda] = getBankPda(walletPubkey, program);
    const [bankTokenAccountPda] = getBankTokenAccountPda(walletPubkey, program);

    const tx = await program.methods
      .initBank()
      .accounts({
        user: walletPubkey,
        mint: TOKEN_MINT_ADDRESS,
        bank: bankPda,
        bankTokenAccount: bankTokenAccountPda,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .transaction();

    const signature = await sendTransaction(tx, connection);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });

    console.log(
      `[INITIALIZE] ✅ Bank account initialized successfully for user: ${walletPubkey.toBase58()} \n txHash: ${signature}`
    );
  } catch (error) {
    console.error("[INITIALIZE] ❌ Error initializing program:", error);
  }
}
