import { useWallet } from "@solana/wallet-adapter-react";
import BankCard from "../../components/bank-card/BankCard";
import BankInteractButtons from "../../components/bank-interact-buttons/BankInteractButtons";
import "./Home.css";
import { useState } from "react";

const HomePage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleActionComplete = () => {
    // increment trigger to cause re-fetch in BankCard
    setRefreshTrigger((prev) => prev + 1);
  };

  const { publicKey } = useWallet();
  return (
    <>
      {publicKey ? (
        <div className="home-div">
          <div className="home__bank-card">
            <BankCard refreshTrigger={refreshTrigger} />
          </div>
          <div className="home__button-grp">
            <BankInteractButtons onActionComplete={handleActionComplete} />
          </div>
        </div>
      ) : (
        <div className="home__connect-ur-wallet-card">
          WALLET NOT CONNECTED <p>Click Select Wallet Button</p>
        </div>
      )}
    </>
  );
};

export default HomePage;
