import * as anchor from "@coral-xyz/anchor";
import { program } from "./connection";
import { Keypair, PublicKey } from "@solana/web3.js";

export const TOKEN_MINT = new PublicKey(`JPTm3R4yeUhh5qeyU1uSo4Ex13qm2vhzGrkH5VspZxa`);
export const DECIMALS = 6;

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
