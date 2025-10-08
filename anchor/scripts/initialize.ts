import * as anchor from "@coral-xyz/anchor";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { connection, user1, user2, program } from "./utils/connection";
import {
  getBankPda,
  getBankTokenAccountPda,
  TOKEN_MINT,
} from "./utils/constants";
import { ensureSolBalance } from "./utils/helpers";

async function initializeProgram() {
  const user = user1; 

  console.log("Initializing Bank Account for user: ", user.publicKey.toBase58());

  await ensureSolBalance(connection, user.publicKey);

  const [bankPda, bankBump] = getBankPda(user);
  const [bankTokenAccountPda, bankTokenAccountBump] = getBankTokenAccountPda(user);

  try {
    const tx = await program.methods
      .initBank()
      .accounts({
        user: user.publicKey,
        mint: TOKEN_MINT,
        bank: bankPda,
        bankTokenAccount: bankTokenAccountPda,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .signers([user])
      .rpc();

    console.log("Initialize transaction signature:", tx);
  } catch (error) {
    console.error("Error initializing program:", error);
  }
}

if (require.main === module) {
  initializeProgram().catch(console.error);
}

export { initializeProgram };
