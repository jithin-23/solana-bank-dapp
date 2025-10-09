import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  createAssociatedTokenAccount,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import {
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { readFileSync } from "fs";
import { connection, mintAuthority } from "./utils/connection";

export class TokenCreator {
  constructor(private connection: Connection, private mintAuthority: Keypair) {}

  async createToken(
    name: string,
    symbol: string,
    decimals: number = 6,
    supply: number = 1000
  ) {
    console.log("Creating Token-2022 with metadata...");

    const mintKeypairData = JSON.parse(
      readFileSync(
        "./keypairs/JPTm3R4yeUhh5qeyU1uSo4Ex13qm2vhzGrkH5VspZxa.json",
        "utf8"
      )
    );
    const mint = Keypair.fromSecretKey(new Uint8Array(mintKeypairData));
    // const mint = Keypair.generate();
    console.log("Token Mint Address: ", mint.publicKey.toString());

    //Define extensions
    const extensions = [ExtensionType.MetadataPointer];

    // Calculate space and rent
    const metadataLen =
      TYPE_SIZE +
      LENGTH_SIZE +
      pack({
        mint: mint.publicKey,
        name,
        symbol,
        uri: "",
        additionalMetadata: [],
      }).length;
    const mintLen = getMintLen(extensions);
    const lamports = await this.connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );

    //Create transaction
    const transaction = new Transaction();

    //Create Account transaction
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: this.mintAuthority.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    );

    //Add initialize metada pointer instruction
    transaction.add(
      createInitializeMetadataPointerInstruction(
        mint.publicKey,
        this.mintAuthority.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    // Add initilize mint instruction
    transaction.add(
      createInitializeMintInstruction(
        mint.publicKey,
        decimals,
        this.mintAuthority.publicKey,
        this.mintAuthority.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );

    //Add initialize metadata instruction
    transaction.add(
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mint.publicKey,
        metadata: mint.publicKey,
        name,
        symbol,
        uri: "",
        mintAuthority: this.mintAuthority.publicKey,
        updateAuthority: this.mintAuthority.publicKey,
      })
    );

    //Send transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.mintAuthority, mint]
    );

    console.log("Token Created! Signature: ", signature);

    // Create a associated token account and mint initial supply
    const associatedTokenAccount = await createAssociatedTokenAccount(
      this.connection,
      this.mintAuthority,
      mint.publicKey,
      this.mintAuthority.publicKey,
      {},
      TOKEN_2022_PROGRAM_ID
    );
    console.log(
      "Associated Token Account: ",
      associatedTokenAccount.toString()
    );

    await mintTo(
      this.connection,
      this.mintAuthority,
      mint.publicKey,
      associatedTokenAccount,
      this.mintAuthority.publicKey,
      supply * Math.pow(10, decimals),
      [],
      {},
      TOKEN_2022_PROGRAM_ID
    );

    console.log(`Minted ${supply} ${symbol} tokens`);

    return {
      mintAddress: mint.publicKey,
      tokenAccount: associatedTokenAccount,
      signature,
    };
  }
}

async function deployToken() {
  //Airdrop some SOL for testing
  const airdropSignature = await connection.requestAirdrop(
    mintAuthority.publicKey,
    2 * 1e9
  );
  const latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignature,
  });

  const tokenCreator = new TokenCreator(connection, mintAuthority);

  await tokenCreator.createToken("JPToken", "JPT", 6, 1000);
}

if (require.main === module) {
  deployToken().catch(console.error);
}

export { deployToken };
