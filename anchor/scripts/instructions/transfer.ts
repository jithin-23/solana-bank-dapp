import * as anchor from "@coral-xyz/anchor";
import { connection, createProgram, user1, user2 } from "../utils/connection";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  fetchTokenAccount,
  formatTokenAmount,
  getUserTokenBalance,
} from "../utils/helpers";
import { Wallet } from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  getBankPda,
  getBankTokenAccountPda,
  TOKEN_MINT,
} from "../utils/constants";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

async function transfer(from: Keypair, to: Keypair, amount: number) {
  const wallet = new Wallet(from);
  const program = createProgram(wallet);

  const [fromBankPda] = getBankPda(from);
  const [toBankPda] = getBankPda(to);

  const fromTokenAccount = await fetchTokenAccount(from);
  const toTokenAccount = await fetchTokenAccount(to);

  console.log(`\n🚀 [TRANSFER] Initiating transfer of ${formatTokenAmount(amount)} JPT from ${from.publicKey.toBase58()} to ${to.publicKey.toBase58()}`);
  console.log("\n=== [TRANSFER] BEFORE TRANSACTION ===");
  await printBalances(wallet, from, to, fromBankPda, toBankPda);

  try {
    const currentUserTokenBalance = await getUserTokenBalance(fromTokenAccount);
    if (currentUserTokenBalance < amount) {
      console.error(
        `❌ ERROR: User balance ${formatTokenAmount(
          currentUserTokenBalance
        )} JPT is less than requested transfer ${formatTokenAmount(amount)} JPT`
      );
      return;
    }

    const fromBankTokenAccount = getBankTokenAccountPda(from)[0];

    const tx = await program.methods
      .transfer(new BN(amount))
      .accounts({
        from: from.publicKey,
        to: to.publicKey,
        mint: TOKEN_MINT,
        fromBank: fromBankPda,
        toBank: toBankPda,
        fromBankTokenAccount: fromBankTokenAccount,
        toTokenAccount: toTokenAccount.address,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .signers([from])
      .rpc();

    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: tx,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    console.log("\n=== [TRANSFER] AFTER TRANSACTION ===");
    await printBalances(wallet, from, to, fromBankPda, toBankPda);

    console.log(`✅ [TRANSFER] Successful! Transferred ${formatTokenAmount(amount)} JPT`);
  } catch (error) {
    console.error("❌ [TRANSFER] Error during transfer:", error);
    throw error;
  }
}

async function printBalances(
  wallet: Wallet,
  from: Keypair,
  to: Keypair,
  fromBankPda: PublicKey,
  toBankPda: PublicKey
) {
  const program = createProgram(wallet);

  const fromBank = await program.account.bank.fetch(fromBankPda);
  const toBank = await program.account.bank.fetch(toBankPda);

  console.log(
    `FROM: ${from.publicKey.toBase58()} | Bank: ${formatTokenAmount(
      fromBank.balance
    )} JPT`
  );
  console.log(
    `TO:   ${to.publicKey.toBase58()} | Bank: ${formatTokenAmount(
      toBank.balance
    )} JPT\n`
  );
}

if (require.main === module) {
  transfer(user1, user2, 1_000_000).catch(console.error);
}

export { transfer };
