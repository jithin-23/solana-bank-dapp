import * as anchor from "@coral-xyz/anchor";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { connection, payer, program } from "./utils/connection";
import {
  getBankPda,
  getBankTokenAccountPda,
  TOKEN_MINT,
} from "./utils/constants";
import { ensureSolBalance } from "./utils/helpers";

async function initializeProgram() {
  console.log("Initializing Bank Program");

  await ensureSolBalance(connection, payer.publicKey);

  const [bankPda, bankBump] = getBankPda();
  const [bankTokenAccountPda, bankTokenAccountBump] = getBankTokenAccountPda();

  try {
    const tx = await program.methods
      .initBank()
      .accounts({
        user: payer.publicKey,
        mint: TOKEN_MINT,
        bank: bankPda,
        bankTokenAccount: bankTokenAccountPda,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      } as any)
      .signers([payer])
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
