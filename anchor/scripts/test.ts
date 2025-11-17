import { Keypair } from "@solana/web3.js";
import { initializeProgram } from "./instructions/initialize";
import { deposit } from "./instructions/deposit";
import { withdraw } from "./instructions/withdraw";
import { transfer } from "./instructions/transfer";
import { connection, user1, user2 } from "./utils/connection";
import { deployToken } from "./create-token";
import { getApproval } from "./instructions/getApproval";
import { depositFrom } from "./instructions/depositFrom";

async function runAllTests() {
  console.log("---Deploying JPT Token contract---");
  await deployToken(); // Ensure deployment completes before proceeding

  console.log("\n=== Starting Comprehensive Test ===");

  // Step 1: Initialize bank accounts for both users
  console.log("\n--- Initializing Bank Accounts ---");
  await initializeProgram(user1);
  await initializeProgram(user2);

  // Step 2: Deposit tokens into user1's bank account
  console.log("\n--- Depositing Tokens for User1 ---");
  await deposit(user1, 2_000_000); // Deposit 2 tokens (6 decimals)

  // Step 3: Withdraw tokens from user1's bank account
  console.log("\n--- Withdrawing Tokens for User1 ---");
  await withdraw(user1, 500_000); // Withdraw 0.5 tokens (6 decimals)

  // Step 4: Transfer tokens from user1 to user2
  console.log("\n--- Transferring Tokens from User1 to User2 ---");
  await transfer(user1, user2, 1_000_000); // Transfer 1 token (6 decimals)

  // Step 5: Approve user2 to spend token of user1
  console.log("\n--- Approve User2 to spend token of  User1---");
  await getApproval(user1, user2.publicKey, 1_000_000); // Transfer 1 token (6 decimals)

  // Step 5: Deposit tokens from user1 to user2's account
  console.log("\n--- DepositFrom Tokens from User1 to User2's bank---");
  await depositFrom(user2, user1, 1_000_000); // Transfer 1 token (6 decimals)

  console.log("\n=== Comprehensive Test Completed ===");
}

if (require.main === module) {
  runAllTests().catch(console.error);
}
