import { motion } from "framer-motion";
import { MdAccountBalanceWallet, MdHome } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// Petra Wallet types
interface AptosWindow extends Window {
  aptos?: any;
}

declare const window: AptosWindow;

interface NavbarWalletProps {
  walletConnected: boolean;
  walletAddress: string;
  isWalletConnecting: boolean;
  onWalletConnect: (connected: boolean, address: string) => void;
}

const NavbarWallet = ({
  walletConnected,
  walletAddress,
  isWalletConnecting,
  onWalletConnect,
}: NavbarWalletProps) => {
  const navigate = useNavigate();

  // Check if Petra Wallet is installed
  const isPetraInstalled = () => {
    return typeof window !== "undefined" && !!window.aptos;
  };

  // Connect to Petra Wallet
  const connectWallet = async () => {
    if (!isPetraInstalled()) {
      alert(
        "Petra Wallet is not installed. Please install it from https://petra.app/"
      );
      return;
    }

    try {
      const response = await window.aptos.connect();
      onWalletConnect(true, response.address);
      console.log("Wallet connected:", response.address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (isPetraInstalled()) {
      try {
        await window.aptos.disconnect();
        onWalletConnect(false, "");
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Home Icon */}
          <motion.button
            onClick={() => navigate("/home")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
            title="Go to Home"
          >
            <MdHome size={24} />
            <span className="font-semibold">Home</span>
          </motion.button>

          {/* Center - Logo/Title */}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-gray-800">
              Smart Product Verify
            </h1>
          </div>

          {/* Right side - Wallet Connection */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MdAccountBalanceWallet className="text-xl text-blue-600" />
              <div className="text-sm">
                <p className="font-semibold text-gray-800">Petra Wallet</p>
                <p className="text-gray-600">
                  {walletConnected
                    ? `Connected: ${formatWalletAddress(walletAddress)}`
                    : "Connect your wallet"}
                </p>
              </div>
            </div>
            {!walletConnected ? (
              <motion.button
                onClick={connectWallet}
                disabled={isWalletConnecting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                <MdAccountBalanceWallet size={16} />
                {isWalletConnecting ? "Connecting..." : "Connect"}
              </motion.button>
            ) : (
              <motion.button
                onClick={disconnectWallet}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold flex items-center gap-2 text-sm"
              >
                Disconnect
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarWallet;