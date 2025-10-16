import InitializeBankButton from "../initialize-bank-button/InitializeBankButton";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import "./BankCard.css";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { getBankPda } from "../../solana/utils/helpers";
import { useAnchorProvider } from "../../hooks/useAnchorProvider";
import { useBankProgram } from "../../hooks/useBankProgram";

const BankCard = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const provider = useAnchorProvider();
  const program = useBankProgram(provider);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [bankInitialized, setBankInitialized] = useState<boolean>(false);
  const [bankAddress, setBankAddress] = useState<PublicKey>();
  const [bankBalance, setBankBalance] = useState<number>(0);
  if (!publicKey) return null;

  useEffect(() => {
    fetchData();
  }, [connection, publicKey, refreshTrigger]);

  const fetchData = async () => {
    const lamports = await connection.getBalance(publicKey);
    setSolBalance(lamports / 1e9);

    const [bankPda] = getBankPda(publicKey, program);
    const accountInfo = await connection.getAccountInfo(bankPda);

    if (!accountInfo) {
      setBankInitialized(false);
      setBankAddress(undefined);
    } else {
      const bankAccount = await program.account.bank.fetch(bankPda);
      setBankAddress(bankPda);
      setBankInitialized(true);
      setBankBalance(bankAccount.balance.toNumber());
    }
  };

  return (
    <>
      <div className="bank-card">
        <div className="card-text">
          <p>User Address: {publicKey.toString()}</p>
          <p>User Balance: {solBalance} SOL</p>
          {bankInitialized ? (
            <p>Bank Address: {bankAddress?.toString()}</p>
          ) : (
            <>
              <p></p>
              <p>---BANK NOT FOUND---</p>
              <p>---Click on Initialize Bank button---</p>
            </>
          )}
        </div>
        <div className="balance-box">
          {bankInitialized ? (
            <p>{bankBalance} JPT</p>
          ) : (
            <div className="initialize-box">
              <InitializeBankButton onActionComplete={fetchData} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BankCard;
