// hooks/useBankProgram.ts
import { useMemo } from "react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import type { Bank } from "../solana/bank/bank";
import { IDL } from "../solana/utils/constants";

export const useBankProgram = (provider: AnchorProvider) : Program<Bank> => {
  return useMemo(() => new Program(IDL, provider), [provider]);
};
