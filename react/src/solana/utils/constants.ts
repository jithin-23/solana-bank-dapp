import { PublicKey } from "@solana/web3.js";
import idl from "../bank/bank.json";
import type { Bank } from "../bank/bank";

export const BANK_CONTRACT_ADDRESS = new PublicKey(
  import.meta.env.VITE_BANK_CONTRACT_ADDRESS
);
export const TOKEN_MINT_ADDRESS = new PublicKey(
  import.meta.env.VITE_JPT_MINT_ADDRESS
);
export const DECIMALS = 6;

export const IDL = idl as Bank;
