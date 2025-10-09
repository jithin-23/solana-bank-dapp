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
import { connection, createProgram, user1 } from "../utils/connection";
import { fetchTokenAccount, formatTokenAmount, getUserTokenBalance } from "../utils/helpers";

async function withdraw(user: Keypair, amount: number) {
  const [bankPda] = getBankPda(user);
  const [bankTokenAccountPda] = getBankTokenAccountPda(user);

  console.log(`\n💸 [WITHDRAW] Initiating withdrawal of ${formatTokenAmount(amount)} JPT for user: ${user.publicKey.toBase58()}`);
  console.log(`Bank PDA: ${bankPda.toBase58()}`);

  try {
    const wallet = new Wallet(user);
    const program = createProgram(wallet);

    // Get or create user's associated token account
    const userTokenAccount = await fetchTokenAccount(user);

    // Fetch and log bank balance BEFORE withdrawal
    const bankAccountBefore = await program.account.bank.fetch(bankPda);
    console.log("\n=== [WITHDRAW] BEFORE TRANSACTION ===");
    console.log(`Bank balance: ${formatTokenAmount(bankAccountBefore.balance)} JPT`);
    console.log(`Bank owner: ${bankAccountBefore.owner.toBase58()}`);
    console.log(`Bank mint: ${bankAccountBefore.mintAddress.toBase58()}`);

    // Check if user has enough balance in bank
    const currentUserBankBalance = await getUserTokenBalance(userTokenAccount);
    if (currentUserBankBalance < amount) {
      console.error(`❌ ERROR: User balance ${formatTokenAmount(currentUserBankBalance)} JPT is less than requested withdrawal ${formatTokenAmount(amount)} JPT`);
      return; // Stop execution
    }

    // Execute withdrawal transaction
    const tx = await program.methods
      .withdrawFromBank(new anchor.BN(amount))
      .accounts({
        user: user.publicKey,
        mint: TOKEN_MINT,
        bank: bankPda,
        bankTokenAccount: bankTokenAccountPda,
        userTokenAccount: userTokenAccount.address,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .signers([user])
      .rpc();

    console.log("\nWithdraw transaction signature:", tx);

    // Wait for confirmation
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: tx,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    // Fetch and log bank balance AFTER withdrawal
    const bankAccountAfter = await program.account.bank.fetch(bankPda);
    console.log("\n=== [WITHDRAW] AFTER TRANSACTION ===");
    console.log(`Bank balance: ${formatTokenAmount(bankAccountAfter.balance)} JPT`);
    console.log(`✅ [WITHDRAW] Successful! Balance decreased by ${formatTokenAmount(amount)} JPT`);
  } catch (error) {
    console.error("❌ [WITHDRAW] Error withdrawing from bank:", error);
    throw error;
  }
}

if (require.main === module) {
  withdraw(user1, 1_000_000).catch(console.error); // 1 token with 6 decimals
}

export { withdraw };
