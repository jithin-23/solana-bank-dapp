import type { PublicKey } from "@solana/web3.js";
import type { SolanaContext } from "../utils/types";
import { BN } from "@coral-xyz/anchor";
import { TOKEN_MINT_ADDRESS } from "../utils/constants";
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

export async function transfer(
  ctx: SolanaContext,
  from: PublicKey,
  to: PublicKey,
  amount: number
) {
  const { connection, program, sendTransaction } = ctx;

  const [fromBankPda] = getBankPda(from, program);
  const [toBankPda] = getBankPda(to, program);

  const fromTokenAccount = await fetchTokenAccount(
    from,
    sendTransaction,
    connection
  );
  const toTokenAccount = await fetchTokenAccount(
    to,
    sendTransaction,
    connection
  );

  console.log(
    `\n🚀 [TRANSFER] Initiating transfer of ${formatTokenAmount(
      amount
    )} JPT from ${from.toBase58()} to ${to.toBase58()}`
  );

  try {
    const currentUserTokenBalance = await getUserTokenBalance(
      connection,
      fromTokenAccount
    );
    if (currentUserTokenBalance < amount) {
      console.error(
        `❌ ERROR: User balance ${formatTokenAmount(
          currentUserTokenBalance
        )} JPT is less than requested transfer ${formatTokenAmount(amount)} JPT`
      );
      return;
    }

    const fromBankTokenAccount = getBankTokenAccountPda(from, program)[0];

    const tx = await program.methods
      .transfer(new BN(amount))
      .accounts({
        from: from,
        to: to,
        mint: TOKEN_MINT_ADDRESS,
        fromBank: fromBankPda,
        toBank: toBankPda,
        fromBankTokenAccount: fromBankTokenAccount,
        toTokenAccount: toTokenAccount.address,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
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
      `✅ [TRANSFER] Successful! Transferred ${formatTokenAmount(
        amount
      )} JPT \n txHash: ${signature}`
    );
  } catch (error) {
    console.error("❌ [TRANSFER] Error during transfer:", error);
    throw error;
  }
}
