import { Connection, Keypair } from "@solana/web3.js";
import { localhostEndpoint } from "./constants";
import { readFileSync } from "fs";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import idl from '../../target/idl/bank.json'
import {Bank} from '../../target/types/bank'

// Connection
export const connection = new Connection(localhostEndpoint, 'confirmed');

// Load keypairs
export function loadKeypair(path: string): Keypair {
  const keypairData = JSON.parse(readFileSync(path, 'utf8'));
  return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

// Program setup
export function createProgram(wallet: Wallet): Program<Bank> {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  });
  
  return new Program(idl as Bank, provider);
}

// Default keypairs
export const payer = loadKeypair('./keypairs/jitgabCEJMy37dfkGpY1fRPCiovsvNiUivKTiqwpazn.json');
export const mintAuthority = payer; // For simplicity, same as payer
export const wallet = new Wallet(payer);
export const program = createProgram(wallet);