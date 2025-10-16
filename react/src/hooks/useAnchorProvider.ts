// hooks/useAnchorProvider.ts
import { AnchorProvider } from "@coral-xyz/anchor";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return new AnchorProvider(
    connection,
    wallet as any, // cast to AnchorWallet
    { preflightCommitment: "processed" }
  );
}
