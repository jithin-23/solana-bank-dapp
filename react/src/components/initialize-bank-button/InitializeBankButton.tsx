import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import "./InitializeBankButton.css";
import { useAnchorProvider } from "../../hooks/useAnchorProvider";
import { initialize } from "../../solana/instructions/initialize";
import { useBankProgram } from "../../hooks/useBankProgram";

const InitializeBankButton = ({
  onActionComplete,
}: {
  onActionComplete?: () => void;
}) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const provider = useAnchorProvider();
  const program = useBankProgram(provider);

  const handleInit = async () => {
    if (!publicKey) {
      alert("Please connect wallet");
      return;
    }
    console.log("Calling InitBank instruction.....");
    await initialize({
      walletPubkey: publicKey,
      connection,
      program,
      sendTransaction,
    });
    onActionComplete?.();
  };
  return (
    <>
      <button className="create-bank-btn" onClick={handleInit}>
        Create Bank
      </button>
    </>
  );
};

export default InitializeBankButton;
