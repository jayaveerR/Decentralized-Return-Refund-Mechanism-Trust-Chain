"use client";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import img from '../assets/decentralized.png';

declare global {
  interface Window {
    aptos?: any;
  }
}

const Home = () => {
  const [activeTab, setActiveTab] = useState("home");
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
      if (window.aptos) {
        await window.aptos.disconnect();
      }
      
      // Clear local storage
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("walletConnected");
      
      // Reset state
      setWalletAddress("");
      setIsWalletConnected(false);
      setIsDropdownOpen(false);
      
      // Redirect to login page
      navigate("/");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
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
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const handleConnectWalletRedirect = () => {
    // Redirect to login page to connect wallet
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navbar */}
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
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            BlockVerify
          </span>
        </div>

        <div className="flex space-x-8">
          {["Home", "Admin", "Learn", "MyOrders"].map((tab) => (
            <button
              key={tab.toLowerCase()}
              className={`relative py-2 px-1 transition-all duration-300 ${
                activeTab === tab.toLowerCase() 
                  ? "text-orange-600 font-semibold" 
                  : "text-gray-600 hover:text-gray-900"
              } group`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >
              {tab}
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform origin-left transition-transform duration-300 ${
                  activeTab === tab.toLowerCase()
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-50"
                }`}
              ></span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {isWalletConnected ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-white-500 to-white-600 text-black rounded-full hover:from-black-600 hover:to-white-700 transition-all duration-300 cursor-pointer border border-black"
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
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
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Address
                  </button>
                  <button
                    onClick={disconnectWallet}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnectWalletRedirect}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Rest of the Home component remains the same */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-8">
            <div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Decentralized Return & Refund
                <span className="block text-orange-600">Trust Chain</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Blockchain-powered solution for fraud-proof returns and refunds in e-commerce. 
                Secure, transparent, and efficient product verification across all platforms.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">

              <button className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
              onClick={() => navigate('/additem')}
              >
                Add Items
              </button>
              <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                Verify Product
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 flex flex-col items-center">
            <img 
              src={img} 
              alt="Hero Image" 
              className="w-full max-w- rounded-xl shadow-lg" 
            />
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Features section remains the same */}
          {[
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              ),
              title: "Fraud-Proof Protection",
              description: "Eliminate fake returns and refund scams with blockchain verification"
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14v6m-3-3h6M6 10h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4a2 2 0 11-4 0 2 2 0 014 0zM4 6a2 2 0 100 4h16a2 2 0 100-4H4z"
                />
              ),
              title: "Cross-Platform",
              description: "Works across all e-commerce platforms with seamless integration"
            },
            {
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              ),
              title: "QR Verification",
              description: "Unique QR codes for each product ensure complete traceability"
            }
          ].map((feature, index) => (
            <div key={index} className="group">
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-orange-100">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="mt-20 py-12 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">BV</span>
          </div>
          <p className="text-gray-600">© 2024 BlockVerify. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">Building trust in e-commerce, one block at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;