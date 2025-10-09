import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { DECIMALS, TOKEN_MINT } from "./constants";
import {
  Account,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { connection } from "./connection";

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

export function formatTokenAmount(amount: number | anchor.BN) {
  const num = typeof amount === "number" ? amount : amount.toNumber();
  return num / 10 ** DECIMALS;
}

export async function fetchTokenAccount(user: Keypair): Promise<Account> {
  try {
    const account = await getOrCreateAssociatedTokenAccount(
      connection,
      user, // payer
      TOKEN_MINT, // mint
      user.publicKey, // owner
      false, // allow owner off curve (false for normal wallets)
      undefined, // commitment
      undefined, // confirm options
      TOKEN_2022_PROGRAM_ID // token program
    );

    return account;
  } catch (error) {
    console.error(
      `Failed to fetch or create token account for user ${user.publicKey.toString()}`
    );
    console.error(error);
    throw error;
  }
}

export async function getUserTokenBalance(ata: Account): Promise<number> {
  const accountInfo = await getAccount(
    connection,
    ata.address,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );
  const amount = Number(accountInfo.amount);

  return amount;
}
