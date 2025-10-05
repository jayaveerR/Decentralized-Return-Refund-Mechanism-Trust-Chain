import React from 'react';

interface WalletSectionProps {
  isConnected: boolean;
  walletAddress: string;
  transactionHashes: any[];
  refreshing: boolean;
  onConnectWallet: () => void;
  onRefresh: () => void;
  onClearClick: () => void;
}

export const WalletSection: React.FC<WalletSectionProps> = ({
  isConnected,
  walletAddress,
  transactionHashes,
  refreshing,
  onConnectWallet,
  onRefresh,
  onClearClick
}) => {
  const shortenAddress = (address: string) => 
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 sm:mb-8">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          My Transaction Hashes
        </h1>
        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          View all your stored transaction hashes
        </p>
        {isConnected && walletAddress && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs sm:text-sm text-gray-600">
              Connected: <span className="font-mono font-medium">{shortenAddress(walletAddress)}</span>
            </p>
          </div>
        )}
      </div>

      {isConnected ? (
        transactionHashes.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors duration-200 disabled:opacity-50 shadow-md text-sm sm:text-base min-w-[120px]"
            >
              {refreshing ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                  <span className="hidden sm:inline">Refreshing...</span>
                  <span className="sm:hidden">Refresh...</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
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
              onClick={onClearClick}
              className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors duration-200 shadow-md text-sm sm:text-base min-w-[120px]"
            >
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
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
        )
      ) : (
        <div className="flex-shrink-0">
          <button
            onClick={onConnectWallet}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors duration-200 shadow-md text-sm sm:text-base min-w-[120px]"
          >
            <span>Connect Wallet</span>
          </button>
        </div>
      )}
    </div>
  );
};