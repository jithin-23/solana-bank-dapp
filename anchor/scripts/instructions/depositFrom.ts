import * as anchor from "@coral-xyz/anchor";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";
import {
  getBankPda,
  getBankTokenAccountPda,
  TOKEN_MINT,
} from "../utils/constants";
import { Wallet } from "@coral-xyz/anchor";
import { connection, createProgram, user1, user2 } from "../utils/connection";
import { fetchTokenAccount, formatTokenAmount } from "../utils/helpers";

async function depositFrom(user: Keypair, from: Keypair, amount: number) {
  const [bankPda] = getBankPda(user);
  const [bankTokenAccountPda] = getBankTokenAccountPda(user);

  console.log(
    `\n💰 [DEPOSIT] Initiating deposit of ${formatTokenAmount(
      amount
    )} JPT for user: ${user.publicKey.toBase58()}`
  );
  console.log(`Bank PDA: ${bankPda.toBase58()}`);

  try {
    const wallet = new Wallet(user);
    const program = createProgram(wallet);

    const fromTokenAccount = await fetchTokenAccount(from);

    // Fetch and log balance BEFORE deposit
    const bankAccountBefore = await program.account.bank.fetch(bankPda);
    console.log("\n=== [DEPOSIT] BEFORE TRANSACTION ===");
    console.log(
      `Bank balance: ${formatTokenAmount(bankAccountBefore.balance)}`
    );
    console.log(`Bank owner: ${bankAccountBefore.owner.toBase58()}`);
    console.log(`Bank mint: ${bankAccountBefore.mintAddress.toBase58()}`);

    // Execute deposit transaction
    const tx = await program.methods
      .depositFrom(new anchor.BN(amount))
      .accounts({
        user: user.publicKey,
        mint: TOKEN_MINT,
        bank: bankPda,
        bankTokenAccount: bankTokenAccountPda,
        fromUser: from.publicKey,
        fromTokenAccount: fromTokenAccount.address,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .signers([user])
      .rpc();

    console.log("\nDeposit transaction signature:", tx);

    // Wait for confirmation using the newer API
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: tx,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    // Fetch and log balance AFTER deposit
    const bankAccountAfter = await program.account.bank.fetch(bankPda);
    console.log("\n=== [DEPOSIT] AFTER TRANSACTION ===");
    console.log(`Bank balance: ${formatTokenAmount(bankAccountAfter.balance)}`);
    console.log(
      `✅ [DEPOSIT] Successful! Balance increased by ${formatTokenAmount(
        amount
      )} JPT`
    );
  } catch (error) {
    console.error("❌ [DEPOSIT] Error depositing to bank:", error);
    throw error;
  }
}

if (require.main === module) {
  depositFrom(user2, user1, 1000000).catch(console.error); // 1 token with 6 decimals
}

export { depositFrom };
