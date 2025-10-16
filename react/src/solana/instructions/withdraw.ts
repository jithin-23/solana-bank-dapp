import { BN } from "@coral-xyz/anchor";
import {
  fetchTokenAccount,
  formatTokenAmount,
  getBankPda,
  getBankTokenAccountPda,
  getUserTokenBalance,
} from "../utils/helpers";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { TOKEN_MINT_ADDRESS } from "../utils/constants";
import type { SolanaContext } from "../utils/types";

export async function withdraw(ctx: SolanaContext, amount: number) {
  const { walletPubkey, connection, program, sendTransaction } = ctx;

  try {
    const [bankPda] = getBankPda(walletPubkey, program);
    const [bankTokenAccountPda] = getBankTokenAccountPda(walletPubkey, program);

    const userTokenAccount = await fetchTokenAccount(
      walletPubkey,
      sendTransaction,
      connection
    );
    console.log(
      `Token Account for user ${walletPubkey} is: ${userTokenAccount.address}`
    );

    // Check if user has enough balance in bank
    const currentUserBankBalance = await getUserTokenBalance(
      connection,
      userTokenAccount
    );
    if (currentUserBankBalance < amount) {
      console.error(
        `❌ ERROR: User balance ${formatTokenAmount(
          currentUserBankBalance
        )} JPT is less than requested withdrawal ${formatTokenAmount(
          amount
        )} JPT`
      );
      return; // Stop execution
    }

    const tx = await program.methods
      .withdrawFromBank(new BN(amount))
      .accounts({
        user: walletPubkey,
        mint: TOKEN_MINT_ADDRESS,
        bank: bankPda,
        bankTokenAccount: bankTokenAccountPda,
        userTokenAccount: userTokenAccount.address,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      } as any)
      .transaction();

    const signature = await sendTransaction(tx, connection);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });

    console.log(
      `[WITHDRAW] ✅ Withdraw ${amount} for user: ${walletPubkey.toBase58()} \n txHash: ${signature}`
    );
  } catch (error) {
    console.error("[WITHDRAW] ❌ Error Withdraw:", error);
  }
}
