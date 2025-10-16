import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Program, web3, BN } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { DECIMALS, TOKEN_MINT_ADDRESS } from "./constants";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
  type Account,
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Bank } from "../bank/bank";

// Derive bank PDA - seeds: [user.key().as_ref()]
export function getBankPda(
  publicKey: PublicKey,
  program: Program<Bank>
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [publicKey.toBuffer()],
    program.programId
  );
}

// Derive bank_token_account PDA - seeds: [b"bank", user.key().as_ref()]
export function getBankTokenAccountPda(
  publicKey: PublicKey,
  program: Program<Bank>
): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("bank"), publicKey.toBuffer()],
    program.programId
  );
}

export async function ensureSolBalance(
  connection: Connection,
  publicKey: PublicKey,
  minBalance: number = 1
): Promise<void> {
  const balance = await connection.getBalance(publicKey);

  if (balance < minBalance * 1e9) {
    console.log(`Airdropping SOL to ${publicKey.toString()}`);
    const signature = await connection.requestAirdrop(publicKey, 5 * 1e9);
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });
  }
}

export function formatTokenAmount(amount: number | BN) {
  const num = typeof amount === "number" ? amount : amount.toNumber();
  return num / 10 ** DECIMALS;
}

export async function fetchTokenAccount(
  walletPubkey: PublicKey,
  sendTransaction: ReturnType<typeof useWallet>["sendTransaction"],
  connection: ReturnType<typeof useConnection>["connection"]
) {
  // 1) Derive ATA
  const ataAddress = await getAssociatedTokenAddress(
    TOKEN_MINT_ADDRESS,
    walletPubkey,
    false,
    TOKEN_2022_PROGRAM_ID, // or omit if normal SPL
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // 2) Check if exists
  const ataInfo = await connection.getAccountInfo(ataAddress);

  if (!ataInfo) {
    // 3) Create ATA
    const ix = createAssociatedTokenAccountInstruction(
      walletPubkey, // payer
      ataAddress, // ata
      walletPubkey, // owner
      TOKEN_MINT_ADDRESS,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const tx = new Transaction().add(ix);
    const signature = await sendTransaction(tx, connection);

    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });
  }

  // 4) Return token account info
  return getAccount(connection, ataAddress, undefined, TOKEN_2022_PROGRAM_ID);
}

export async function getUserTokenBalance(
  connection: Connection,
  ata: Account
): Promise<number> {
  const accountInfo = await getAccount(
    connection,
    ata.address,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  const amount = Number(accountInfo.amount);

  return amount;
}
