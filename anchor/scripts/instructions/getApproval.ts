import * as anchor from "@coral-xyz/anchor";
import {
  TOKEN_2022_PROGRAM_ID,
  approve,
} from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { connection, createProgram, user1, user2 } from "../utils/connection";
import { fetchTokenAccount, formatTokenAmount } from "../utils/helpers";
import { TOKEN_MINT } from "../utils/constants";

/**
 * Sets a spender (delegate) for a user's SPL token account, allowing the spender
 * to transfer up to the specified amount of tokens on behalf of the user.
 *
 * @param user - The keypair of the token owner
 * @param spender - The public key of the spender/delegate
 * @param amount - The amount of tokens to approve (in smallest units)
 */
async function getApproval(user: Keypair, spender: PublicKey, amount: number) {
  console.log(
    `\n✅ [GET APPROVAL] Setting ${spender.toBase58()} as delegate for ${formatTokenAmount(amount)} JPT`
  );
  console.log(`User: ${user.publicKey.toBase58()}`);

  try {
    // Get or create the user's associated token account
    const userTokenAccount = await fetchTokenAccount(user);
    console.log(`User token account: ${userTokenAccount.address.toBase58()}`);

    // Approve the spender as a delegate
    const tx = await approve(
      connection,
      user, // payer
      userTokenAccount.address, // token account to approve
      spender, // delegate/spender
      user.publicKey, // owner
      amount, // amount to approve
      [], // multiSigners (empty for single signer)
      undefined, // confirmOptions
      TOKEN_2022_PROGRAM_ID // tokenProgram
    );

    console.log("\nApproval transaction signature:", tx);

    // Wait for confirmation
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: tx,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    console.log(`✅ [GET APPROVAL] Successfully set ${spender.toBase58()} as delegate with allowance of ${formatTokenAmount(amount)} JPT`);
  } catch (error) {
    console.error("❌ [GET APPROVAL] Error setting approval:", error);
    throw error;
  }
}

if (require.main === module) {
  // Example: user1 approves user2 to spend 1,000,000 tokens (1 JPT with 6 decimals)
  getApproval(user1, user2.publicKey, 1_000_000).catch(console.error);
}

export { getApproval };
