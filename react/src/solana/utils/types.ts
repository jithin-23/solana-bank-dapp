import type { PublicKey, Connection, TransactionSignature } from "@solana/web3.js";
import type { AnchorProvider, Program } from "@coral-xyz/anchor";
import type { Bank } from "../bank/bank";

export type SolanaContext = {
  walletPubkey: PublicKey;
  connection: Connection;
  provider?: AnchorProvider;
  program: Program<Bank>;
  sendTransaction: (tx: any, connection: Connection) => Promise<TransactionSignature>;
};
