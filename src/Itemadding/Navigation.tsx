import React from "react";
import { useNavigate } from "react-router-dom";

const NETWORK = import.meta.env.VITE_APP_NETWORK || "Testnet";

interface NavigationProps {
  checkProvider: () => boolean;
  connected: boolean;
  address: string | null;
  showWalletOptions: boolean;
  setShowWalletOptions: (show: boolean) => void;
  copied: boolean;
  setCopied: (copied: boolean) => void;
  disconnectWallet: () => void;
  maskAddress: (addr?: string | null) => string;
  connectWallet: () => Promise<void>; // Added connectWallet prop
  connecting: boolean; // Added connecting state
}

export const Navigation: React.FC<NavigationProps> = ({
  checkProvider,
  connected,
  address,
  showWalletOptions,
  setShowWalletOptions,
  copied,
  setCopied,
  disconnectWallet,
  maskAddress,
  connectWallet, // Added connectWallet
  connecting, // Added connecting state
}) => {
  const navigate = useNavigate();

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const navigateToMyOrders = () => {
    navigate("/myorders");
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BlockVerify</span>
          </div>

          <div 
            className="w-20 h-10 hover:bg-yellow-100 cursor-pointer rounded-lg flex items-center justify-center" 
            onClick={() => navigate('/home')}
          >
            <span className="text-gray-600">Home</span>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-gray-500">Network:</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
              {NETWORK}
            </span>
          </div>

          <div className="hidden md:flex space-x-8">
            {["Home", "Admin", "MyOrders", "Learn"].map((item) => (
              <button
                onClick={() => {
                  if (item === "Home") navigate("/home");
                  else if (item === "Admin") navigate("/itemadd");
                  else if (item === "MyOrders") navigate("/myorders");
                }}
                key={item}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {!checkProvider() ? (
              <a
                href="https://petra.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Install Petra
              </a>
            ) : connected ? (
              <div className="relative">
                <button
                  onClick={() => setShowWalletOptions(!showWalletOptions)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>{maskAddress(address)}</span>
                </button>

                {showWalletOptions && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600">Connected Wallet</p>
                      <p className="text-sm font-mono text-gray-900 truncate">
                        {maskAddress(address)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Network: {NETWORK}
                      </p>
                    </div>
                    <button
                      onClick={copyAddress}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {copied ? "Copied!" : "Copy Address"}
                    </button>
                    <button
                      onClick={navigateToMyOrders}
                      className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      View My Orders
                    </button>
                    <button
                      onClick={disconnectWallet}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={connecting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {connecting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};