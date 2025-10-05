import React from 'react';
import type { TransactionHashItem } from './Myorders';

interface TransactionGridProps {
  isConnected: boolean;
  transactionHashes: TransactionHashItem[];
  copiedHash: string | null;
  onCopyHash: (hash: string | null) => void;
  showToastMessage: (message: string) => void;
}

export const TransactionGrid: React.FC<TransactionGridProps> = ({
  isConnected,
  transactionHashes,
  copiedHash,
  onCopyHash,
  showToastMessage
}) => {
  const shortenHash = (hash: string) =>
    hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : "";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    onCopyHash(text);
    showToastMessage("Transaction hash copied to clipboard!");
    setTimeout(() => onCopyHash(null), 2000);
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

  if (!isConnected) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg
            className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400"
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
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
          Connect your Petra wallet to view your transaction hashes
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('connectWallet'))}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-lg"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (transactionHashes.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg
            className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400"
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
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
          No Transaction Hashes Found
        </h3>
        <p className="text-gray-500 mb-2 text-sm sm:text-base">
          You haven't stored any transaction hashes yet.
        </p>
        <p className="text-xs sm:text-sm text-gray-400">
          Transaction hashes will appear here after successful blockchain operations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {transactionHashes.map((item, index) => (
          <div
            key={`${item.hash}-${index}`}
            className={`border-2 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${getHashColor(
              item.hash
            )}`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm border">
                  <span className="text-xs sm:text-sm font-bold text-gray-700">
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

            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Transaction Hash
              </p>
              <div className="bg-white p-2 sm:p-3 rounded-lg border shadow-sm">
                <p className="font-mono text-xs text-gray-900 break-all leading-relaxed">
                  {item.hash}
                </p>
              </div>
              <div className="mt-1 sm:mt-2">
                <p className="text-xs text-gray-500">
                  Short:{" "}
                  <span className="font-mono font-medium">
                    {shortenHash(item.hash)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-3 sm:mb-4">
              <button
                onClick={() => copyToClipboard(item.hash)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-2 sm:px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-xs sm:text-sm font-medium"
              >
                {copiedHash === item.hash ? (
                  <>
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
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
                      className="w-3 h-3 sm:w-4 sm:h-4"
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
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-2 sm:px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 text-xs sm:text-sm font-medium"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
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

            <div className="pt-2 sm:pt-3 border-t border-gray-200">
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

      <div className="text-center pt-6 sm:pt-8 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100">
          <p className="text-base sm:text-lg font-semibold text-gray-900">
            {transactionHashes.length} Transaction Hash
            {transactionHashes.length !== 1 ? "es" : ""} Stored
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
            Only transaction hashes are stored locally for privacy and efficiency
          </p>
        </div>
      </div>
    </div>
  );
};