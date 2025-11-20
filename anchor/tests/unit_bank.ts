import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";

// Reuse existing high-level scripts and helpers
import { deployToken } from "../scripts/create-token";
import { initializeProgram } from "../scripts/instructions/initialize";
import { deposit } from "../scripts/instructions/deposit";
import { withdraw } from "../scripts/instructions/withdraw";
import { transfer } from "../scripts/instructions/transfer";
import { user1, user2, program } from "../scripts/utils/connection";
import { getBankPda } from "../scripts/utils/constants";

describe("unit: bank - multiple scenarios", function () {
  // Allow longer network timeouts (these tests interact with the network/mint)
  this.timeout(10 * 60 * 1000); // 10 minutes

  before(async () => {
    // Ensure provider is set from environment (anchor test or local env)
    anchor.setProvider(anchor.AnchorProvider.env());

    // Deploy the token mint we'll use in tests (uses keypairs/JPT...)
    console.log("[test setup] Deploying token mint used by tests...");
    await deployToken();
  });

  it("initializes bank accounts for two users", async () => {
    // Initialize both users' bank accounts
    await initializeProgram(user1);
    await initializeProgram(user2);

    const [bank1Pda] = getBankPda(user1);
    const [bank2Pda] = getBankPda(user2);

    const bank1 = await program.account.bank.fetch(bank1Pda);
    const bank2 = await program.account.bank.fetch(bank2Pda);

    expect(bank1.owner.toString()).to.equal(user1.publicKey.toString());
    expect(bank1.balance.toNumber()).to.equal(0);

    expect(bank2.owner.toString()).to.equal(user2.publicKey.toString());
    expect(bank2.balance.toNumber()).to.equal(0);
  });

  it("handles deposit -> withdraw -> transfer flow", async function () {
    // Deposit 2 tokens (6 decimals) => 2_000_000 base units
    const depositAmount = 2_000_000; // 2 JPT
    await deposit(user1, depositAmount);

    const [bank1Pda] = getBankPda(user1);
    let bank1 = await program.account.bank.fetch(bank1Pda);
    expect(bank1.balance.toNumber()).to.equal(depositAmount);

    // Withdraw 0.5 tokens (500_000)
    const withdrawAmount = 500_000;
    await withdraw(user1, withdrawAmount);

    bank1 = await program.account.bank.fetch(bank1Pda);
    expect(bank1.balance.toNumber()).to.equal(depositAmount - withdrawAmount);

    // Transfer 1 token from user1 to user2
    const transferAmount = 1_000_000;
    await transfer(user1, user2, transferAmount);

    bank1 = await program.account.bank.fetch(bank1Pda);
    const [bank2Pda] = getBankPda(user2);
    const bank2 = await program.account.bank.fetch(bank2Pda);

    expect(bank1.balance.toNumber()).to.equal(depositAmount - withdrawAmount - transferAmount);
    expect(bank2.balance.toNumber()).to.equal(transferAmount);
  });

  it("fails deposit when user has insufficient token balance", async () => {
    // Attempt to deposit a ridiculously large amount from user2 (who doesn't have enough)
    const hugeAmount = 1_000_000_000_000; // impossibly large
    let threw = false;
    try {
      await deposit(user2, hugeAmount);
    } catch (err) {
      threw = true;
      // Basic sanity - ensure this is an RPC / program error
      expect(err).to.exist;
    }
    if (!threw) throw new Error("Expected deposit to fail due to insufficient balance");
  });
});
