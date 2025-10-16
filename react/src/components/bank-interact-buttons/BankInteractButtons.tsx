import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useBankProgram } from "../../hooks/useBankProgram";
import { useAnchorProvider } from "../../hooks/useAnchorProvider";
import { deposit } from "../../solana/instructions/deposit";
import { withdraw } from "../../solana/instructions/withdraw";
import { transfer } from "../../solana/instructions/transfer";
import { useState } from "react";
import InputModal from "../input-modal/InputModal";
import "./BankInteractButtons.css";
import type { SolanaContext } from "../../solana/utils/types";
import { PublicKey } from "@solana/web3.js";

type ModalType = "deposit" | "withdraw" | "transfer" | null;

const BankInteractButtons = ({
  onActionComplete,
}: {
  onActionComplete?: () => void;
}) => {
  const { publicKey, sendTransaction } = useWallet();
  const provider = useAnchorProvider();
  const program = useBankProgram(provider);
  const { connection } = useConnection();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalValues, setModalValues] = useState<string[]>([]);

  if (!publicKey) return null;

  const ctx: SolanaContext = {
    walletPubkey: publicKey,
    connection,
    program,
    sendTransaction,
  };

  const handleDepositSubmit = async () => {
    try {
      const amount = Number(modalValues[0]);

      if (isNaN(amount) || amount <= 0) {
        console.error("Invalid amount");
        return;
      }

      console.log("Calling Deposit instruction.....");
      await deposit(ctx, amount);

      setModalValues([]);
      setActiveModal(null);
      onActionComplete?.();
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleWithdrawSubmit = async () => {
    try {
      const amount = Number(modalValues[0]);

      if (isNaN(amount) || amount <= 0) {
        console.error("Invalid amount");
        return;
      }

      console.log("Calling Withdraw instruction.....");
      await withdraw(ctx, amount);

      setModalValues([]);
      setActiveModal(null);
      onActionComplete?.();
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  const handleTransferSubmit = async () => {
    try {
      const toPubkey = new PublicKey(modalValues[0]);
      const amount = Number(modalValues[1]);

      if (isNaN(amount) || amount <= 0) {
        console.error("Invalid amount");
        return;
      }

      console.log("Calling Transfer instruction.....");
      await transfer(ctx, publicKey, toPubkey, amount);

      setModalValues([]);
      setActiveModal(null);
      onActionComplete?.();
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  const getModalConfig = () => {
    switch (activeModal) {
      case "deposit":
        return {
          inputParams: [{ name: "amount", label: "Amount", type: "number" }],
          instructionName: "Deposit",
          onSubmit: handleDepositSubmit,
        };
      case "withdraw":
        return {
          inputParams: [{ name: "amount", label: "Amount", type: "number" }],
          instructionName: "Withdraw",
          onSubmit: handleWithdrawSubmit,
        };
      case "transfer":
        return {
          inputParams: [
            { name: "to", label: "To Address", type: "PublicKey" },
            { name: "amount", label: "Amount", type: "number" },
          ],
          instructionName: "Transfer",
          onSubmit: handleTransferSubmit,
        };
      default:
        return null;
    }
  };

  const modalConfig = getModalConfig();

  return (
    <>
      <div className="bank-interact-btn-grp">
        <button
          className="deposit-btn"
          onClick={() => setActiveModal("deposit")}
        >
          Deposit
        </button>
        <button
          className="withdraw-btn"
          onClick={() => setActiveModal("withdraw")}
        >
          Withdraw
        </button>
        <button
          className="transfer-btn"
          onClick={() => setActiveModal("transfer")}
        >
          Transfer
        </button>
      </div>

      {activeModal && modalConfig && (
        <InputModal
          setShowModal={(show) => {
            if (!show) {
              setActiveModal(null);
              setModalValues([]);
            }
          }}
          inputParams={modalConfig.inputParams}
          instructionName={modalConfig.instructionName}
          values={modalValues}
          setValues={setModalValues}
          onSubmit={modalConfig.onSubmit}
        />
      )}
    </>
  );
};

export default BankInteractButtons;
