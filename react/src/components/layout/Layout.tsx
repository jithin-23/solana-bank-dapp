import { Outlet, useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "./Layout.css";

function Layout() {
  const navigator = useNavigate();

  return (
    <>
      <div className="navbar">
        <div className="nav-items">
        <button className="nav-item-btn" onClick={() => {navigator("/")}}> My Bank </button>
        <button className="nav-item-btn" onClick={() => {navigator("/")}}> Approval </button>
        </div>
        <div className="nav-wallet-btn">
          <WalletMultiButton />
        </div>
      </div>
      <div className="page-content">
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
