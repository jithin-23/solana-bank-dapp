import { Connection, Keypair } from "@solana/web3.js";
import { readFileSync } from "fs";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import idl from "../../target/idl/bank.json";
import { Bank } from "../../target/types/bank";

export const devnetEndpoint = "https://api.devnet.solana.com";
export const localhostEndpoint = `http://127.0.0.1:8899`;

// Connection
export const connection = new Connection(devnetEndpoint, "confirmed");

// Load keypairs
export function loadKeypair(path: string): Keypair {
  const keypairData = JSON.parse(readFileSync(path, "utf8"));
  return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

// Program setup
export function createProgram(wallet: Wallet): Program<Bank> {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });

  return new Program(idl as Bank, provider);
}

// User keypairs
export const user1 = loadKeypair(
  "./keypairs/jitgabCEJMy37dfkGpY1fRPCiovsvNiUivKTiqwpazn.json"
);
export const user2 = loadKeypair(
  "./keypairs/dyuVd64Z4nNqFmrcQKhMnfzwssQDSHcoipvVa9UvzpM.json"
);

// Legacy exports for backward compatibility
export const mintAuthority = user1; // For simplicity, same as user1

// Wallets for each user
export const wallet1 = new Wallet(user1);
export const wallet2 = new Wallet(user2);

// Default wallet (user1)
export const wallet = wallet1;

// Programs for each user
export const program1 = createProgram(wallet1);
export const program2 = createProgram(wallet2);

// Default program (user1's program)
export const program = program1;
