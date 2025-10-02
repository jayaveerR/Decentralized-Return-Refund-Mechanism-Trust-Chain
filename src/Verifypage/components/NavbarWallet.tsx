import { motion } from "framer-motion";
import { MdAccountBalanceWallet, MdHome, MdMenu, MdClose } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

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
      setIsMobileMenuOpen(false);
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
        setIsMobileMenuOpen(false);
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  };

  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleHomeClick = () => {
    navigate("/home");
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Home Icon */}
            <motion.button
              onClick={handleHomeClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50 flex-shrink-0"
              title="Go to Home"
            >
              <MdHome size={24} className="sm:w-6 sm:h-6" />
              <span className="font-semibold hidden xs:inline">Home</span>
            </motion.button>

            {/* Center - Logo/Title */}
            <div className="flex-1 text-center px-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                Smart Product Verify
              </h1>
            </div>

            {/* Desktop - Wallet Connection */}
            <div className="hidden md:flex items-center gap-4">
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

            {/* Mobile - Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              {/* Mobile Wallet Status Indicator */}
              {walletConnected && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-800">
                    {formatWalletAddress(walletAddress)}
                  </span>
                </div>
              )}
              
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-16">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-16 right-0 bottom-0 w-80 max-w-full bg-white shadow-xl"
          >
            <div className="p-6 h-full overflow-y-auto">
              {/* Wallet Status Section */}
              <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <MdAccountBalanceWallet className="text-2xl text-blue-600" />
                  <div>
                    <h3 className="font-bold text-gray-800">Petra Wallet</h3>
                    <p className="text-sm text-gray-600">
                      {walletConnected ? "Connected" : "Not Connected"}
                    </p>
                  </div>
                </div>
                
                {walletConnected && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                    <p className="text-sm font-mono text-gray-800 break-all">
                      {walletAddress}
                    </p>
                  </div>
                )}
              </div>

              {/* Connection Buttons */}
              <div className="space-y-4">
                {!walletConnected ? (
                  <motion.button
                    onClick={connectWallet}
                    disabled={isWalletConnecting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-3 text-base"
                  >
                    <MdAccountBalanceWallet size={20} />
                    {isWalletConnecting ? "Connecting..." : "Connect Wallet"}
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={disconnectWallet}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-3 text-base"
                  >
                    Disconnect Wallet
                  </motion.button>
                )}

                {/* Additional Mobile Actions */}
                <motion.button
                  onClick={handleHomeClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold flex items-center justify-center gap-3 text-base border border-gray-300"
                >
                  <MdHome size={20} />
                  Go to Home
                </motion.button>
              </div>

              {/* Wallet Info for Mobile */}
              {!isPetraInstalled() && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800 text-center">
                    Petra Wallet not installed.{" "}
                    <a 
                      href="https://petra.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline font-semibold"
                    >
                      Get it here
                    </a>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Spacer to prevent content from being hidden behind fixed navbar */}
      <div className="h-16 md:h-20"></div>
    </>
  );
};

export default NavbarWallet;