import * as anchor from "@coral-xyz/anchor";
import { program } from "./connection";
import { Keypair } from "@solana/web3.js";

export const devnetEndpoint = "https://api.devnet.solana.com";
export const localhostEndpoint = "http://127.0.0.1:8899";

export const TOKEN_MINT = "JPTm3R4yeUhh5qeyU1uSo4Ex13qm2vhzGrkH5VspZxa";

// Derive bank PDA - seeds: [user.key().as_ref()]
export function getBankPda(user: Keypair): [anchor.web3.PublicKey, number] {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [user.publicKey.toBuffer()],
    program.programId
  );
}

// Derive bank_token_account PDA - seeds: [b"bank", user.key().as_ref()]
export function getBankTokenAccountPda(user: Keypair): [anchor.web3.PublicKey, number] {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("bank"), user.publicKey.toBuffer()],
    program.programId
  );
}
