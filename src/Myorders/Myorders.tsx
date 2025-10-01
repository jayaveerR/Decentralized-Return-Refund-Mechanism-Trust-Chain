

import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar'; // Import the Navbar component

const TRANSACTION_HASHES_STORAGE_KEY = "blockverify_transaction_hashes";

interface PetraWallet {
  connect: () => Promise<{ address: string; publicKey: string }>;
  disconnect: () => Promise<void>;
  isConnected: () => Promise<boolean>;
  account: () => Promise<{ address: string }>;
  onAccountChange?: (
    listener: (newAddress: { address: string }) => void
  ) => void;
}

declare global {
  interface Window {
    apto?: PetraWallet;
  }
}

interface TransactionHashItem {
  hash: string;
  timestamp: number;
}

const MyOrders: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [, setLoading] = useState<boolean>(false);
  const [isPetraInstalled, setIsPetraInstalled] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [transactionHashes, setTransactionHashes] = useState<TransactionHashItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    checkPetraInstallation();
    checkConnection();

    if (window.aptos && window.aptos.onAccountChange) {
      try {
        window.aptos.onAccountChange((newAddress: { address: string }) => {
          if (newAddress && newAddress.address) {
            setWalletAddress(newAddress.address);
            loadTransactionHashes(newAddress.address);
            setIsConnected(true);
          } else {
            setWalletAddress("");
            setIsConnected(false);
            setTransactionHashes([]);
          }
        });
      } catch (error) {
        console.error("Error setting up account change listener:", error);
      }
    }
  }, []);

  // Show toast message
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const checkPetraInstallation = () => {
    setIsPetraInstalled(!!window.aptos);
  };

  const checkConnection = async () => {
    if (window.aptos) {
      try {
        const connected = await window.aptos.isConnected();
        if (connected) {
          const account = await window.aptos.account();
          setWalletAddress(account.address);
          setIsConnected(true);
          loadTransactionHashes(account.address);
        }
      } catch (error: any) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!isPetraInstalled) {
      setShowWalletModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await window.aptos!.connect();
      setWalletAddress(response.address);
      setIsConnected(true);
      loadTransactionHashes(response.address);
      showToastMessage("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      showToastMessage("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  

  // Load only transaction hashes from localStorage
  const loadTransactionHashes = (address: string) => {
    if (!address) {
      setTransactionHashes([]);
      return;
    }

    setRefreshing(true);
    try {
      const storedHashes = JSON.parse(
        localStorage.getItem(TRANSACTION_HASHES_STORAGE_KEY) || "{}"
      );

      const walletHashes: string[] = storedHashes[address] || [];

      // Convert to TransactionHashItem format with timestamps
      const hashItems: TransactionHashItem[] = walletHashes.map(
        (hash, index) => ({
          hash,
          timestamp: Date.now() - index * 60000, // 1 minute apart for display
        })
      );

      setTransactionHashes(hashItems);
    } catch (error) {
      console.error("Error loading transaction hashes:", error);
      setTransactionHashes([]);
    } finally {
      setRefreshing(false);
    }
  };

  const shortenHash = (hash: string) =>
    hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : "";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    showToastMessage("Transaction hash copied to clipboard!");
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const openInExplorer = (hash: string) => {
    window.open(
      `https://explorer.aptoslabs.com/txn/${hash}?network=testnet`,
      "_blank"
    );
  };

  const getHashColor = (hash: string) => {
    const colors = [
      "bg-blue-50 border-blue-200",
      "bg-green-50 border-green-200",
      "bg-yellow-50 border-yellow-200",
      "bg-purple-50 border-purple-200",
      "bg-pink-50 border-pink-200",
      "bg-indigo-50 border-indigo-200",
      "bg-teal-50 border-teal-200",
      "bg-orange-50 border-orange-200",
      "bg-cyan-50 border-cyan-200",
      "bg-lime-50 border-lime-200",
    ];
    let sum = 0;
    for (let i = 0; i < Math.min(hash.length, 10); i++)
      sum += hash.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Clear all transaction hashes for current wallet
  const clearTransactionHashes = () => {
    if (!walletAddress) return;

    try {
      const storedHashes = JSON.parse(
        localStorage.getItem(TRANSACTION_HASHES_STORAGE_KEY) || "{}"
      );

      delete storedHashes[walletAddress];
      localStorage.setItem(
        TRANSACTION_HASHES_STORAGE_KEY,
        JSON.stringify(storedHashes)
      );
      setTransactionHashes([]);
      setShowClearConfirmation(false);
      showToastMessage("All transaction hashes cleared successfully!");
    } catch (error) {
      console.error("Error clearing transaction hashes:", error);
      showToastMessage("Failed to clear transaction hashes");
    }
  };

  const handleClearClick = () => {
    setShowClearConfirmation(true);
  };

  const handleCancelClear = () => {
    setShowClearConfirmation(false);
    showToastMessage("Clear operation cancelled");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Use the imported Navbar component */}
      <Navbar activeTab="myorders" />
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
      
      <main className="max-w-6xl mx-auto p-6 min-h-screen">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Transaction Hashes
              </h1>
              <p className="text-gray-600 mt-2">
                View all your stored transaction hashes
              </p>
            </div>

            {isConnected && transactionHashes.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => loadTransactionHashes(walletAddress)}
                  disabled={refreshing}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition-colors duration-200 disabled:opacity-50 shadow-md"
                >
                  {refreshing ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>Refresh</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleClearClick}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl transition-colors duration-200 shadow-md"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          {!isConnected ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-gray-500 mb-8">
                Connect your Petra wallet to view your transaction hashes
              </p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              >
                Connect Wallet
              </button>
            </div>
          ) : transactionHashes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Transaction Hashes Found
              </h3>
              <p className="text-gray-500 mb-4">
                You haven't stored any transaction hashes yet.
              </p>
              <p className="text-sm text-gray-400">
                Transaction hashes will appear here after successful blockchain
                operations
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transactionHashes.map((item, index) => (
                  <div
                    key={`${item.hash}-${index}`}
                    className={`border-2 rounded-xl p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${getHashColor(
                      item.hash
                    )}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border">
                          <span className="text-sm font-bold text-gray-700">
                            #{index + 1}
                          </span>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Stored
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Transaction Hash
                      </p>
                      <div className="bg-white p-3 rounded-lg border shadow-sm">
                        <p className="font-mono text-xs text-gray-900 break-all leading-relaxed">
                          {item.hash}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Short:{" "}
                          <span className="font-mono font-medium">
                            {shortenHash(item.hash)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2 mb-4">
                      <button
                        onClick={() => copyToClipboard(item.hash)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-sm font-medium"
                      >
                        {copiedHash === item.hash ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                              />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openInExplorer(item.hash)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-sm font-medium"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        <span>View</span>
                      </button>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Length: {item.hash.length} chars</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full font-medium">
                          Hash Only
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <p className="text-lg font-semibold text-gray-900">
                    {transactionHashes.length} Transaction Hash
                    {transactionHashes.length !== 1 ? "es" : ""} Stored
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Only transaction hashes are stored locally for privacy and
                    efficiency
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Clear Confirmation Modal */}
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Clear All Transaction Hashes?
              </h3>
              <p className="text-gray-600 mb-6">
                This action will permanently delete all {transactionHashes.length} transaction hashes for your wallet. This cannot be undone.
              </p>
              <div className="space-y-3">
                <button
                  onClick={clearTransactionHashes}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-semibold transition-all duration-200"
                >
                  Yes, Clear All Data
                </button>
                <button
                  onClick={handleCancelClear}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-2xl font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Petra Wallet Required
              </h3>
              <p className="text-gray-600 mb-6">
                To connect your wallet, please install the Petra Wallet
                extension first.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.open("https://petra.app/", "_blank")}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Install Petra Wallet
                </button>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="w-full text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
