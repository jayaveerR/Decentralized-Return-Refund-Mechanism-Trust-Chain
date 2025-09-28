"use client";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    aptos?: any;
  }
}

interface NavbarProps {
  activeTab?: string;
}

const Navbar = ({ activeTab = "home" }: NavbarProps) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if wallet is connected on component mount
    const connected = localStorage.getItem("walletConnected");
    const address = localStorage.getItem("walletAddress");
    
    if (connected === "true" && address) {
      setIsWalletConnected(true);
      setWalletAddress(address);
    }
  }, []);

  const disconnectWallet = async () => {
    try {
      if (window.aptos && window.aptos.disconnect) {
        await window.aptos.disconnect();
      }
      
      // Clear local storage
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("walletConnected");
      localStorage.removeItem("walletPublicKey");
      
      // Reset state
      setWalletAddress("");
      setIsWalletConnected(false);
      setIsDropdownOpen(false);
      
      // Redirect to login page (root path)
      navigate("/");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      // Fallback: clear storage and redirect even if disconnect fails
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("walletConnected");
      localStorage.removeItem("walletPublicKey");
      navigate("/");
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
      .then(() => {
        alert("Address copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy address: ", err);
      });
    setIsDropdownOpen(false);
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const handleConnectWalletRedirect = () => {
    // Redirect to login page (root path)
    navigate("/");
  };

  const handleTabClick = (tab: string) => {
    if (tab === "home") {
      navigate('/home');
    } else if (tab === "qrcode") {
      navigate('/qrcode');
    } else if (tab === "myorders") {
      navigate('/myorders');
    } else if (tab === "learn") {
      window.open('https://blockverify.gitbook.io/blockverify/', '_blank');
    } else if (tab === "verify") {
      navigate('/verify');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.wallet-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex justify-between items-center p-6 border-b border-gray-100">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12L11 14L15 10M12 3C13.1819 3 14.3522 3.23279 15.4442 3.68508C16.5361 4.13738 17.5282 4.80031 18.364 5.63604C19.1997 6.47177 19.8626 7.46392 20.3149 8.55585C20.7672 9.64778 21 10.8181 21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/home')}>
          BlockVerify
        </span>
      </div>

      <div className="flex space-x-8">
        {[
          { name: "Home", path: "home" },
          { name: "QR Code Mint", path: "qrcode" },
          { name: "Verify", path: "verify" },
          { name: "MyOrders", path: "myorders" },
          { name: "Learn", path: "learn" }
        ].map((tab) => (
          <button
            key={tab.path}
            className={`relative py-2 px-1 transition-all duration-300 cursor-pointer ${
              activeTab === tab.path 
                ? "text-orange-600 font-semibold" 
                : "text-gray-600 hover:text-gray-900"
            } group`}
            onClick={() => handleTabClick(tab.path)}
          >
            {tab.name}
            <span
              className={`absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform origin-left transition-transform duration-300 ${
                activeTab === tab.path
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-50"
              }`}
            ></span>
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-4 wallet-dropdown-container">
        {isWalletConnected ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-white-500 to-white-600 text-black rounded-full hover:from-white-600 hover:to-white-700 transition-all duration-300 cursor-pointer"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{formatAddress(walletAddress)}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={copyAddress}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Address
                </button>
                <button
                  onClick={disconnectWallet}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleConnectWalletRedirect}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;