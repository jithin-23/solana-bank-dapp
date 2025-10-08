import { Keypair } from '@solana/web3.js';
import { writeFileSync } from 'fs';

const bs58 = require('bs58');

const PRIVATE_KEY = "YOUR_BASE58_PRIVATE_KEY_FROM_PHANTOM";

// Decode base58 to byte array
const secret = bs58.decode(PRIVATE_KEY);

// Convert to array format
const keyArray = Array.from(secret);

// Save to JSON file
writeFileSync('phantom-keypair.json', JSON.stringify(keyArray));

console.log('Keypair saved to phantom-keypair.json');
console.log('Public key:', Keypair.fromSecretKey(secret).publicKey.toBase58());
