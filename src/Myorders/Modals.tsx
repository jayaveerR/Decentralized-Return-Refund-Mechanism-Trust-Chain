import React from 'react';
import type { TransactionHashItem } from './Myorders';

interface ModalsProps {
  showClearConfirmation: boolean;
  showWalletModal: boolean;
  transactionHashes: TransactionHashItem[];
  onClearTransactionHashes: () => void;
  onCancelClear: () => void;
  onCloseWalletModal: () => void;
}

export const Modals: React.FC<ModalsProps> = ({
  showClearConfirmation,
  showWalletModal,
  transactionHashes,
  onClearTransactionHashes,
  onCancelClear,
  onCloseWalletModal
}) => {
  return (
    <>
      {showClearConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl mx-2">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Clear All Transaction Hashes?
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                This action will permanently delete all {transactionHashes.length} transaction hashes for your wallet. This cannot be undone.
              </p>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={onClearTransactionHashes}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 text-sm sm:text-base"
                >
                  Yes, Clear All Data
                </button>
                <button
                  onClick={onCancelClear}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl mx-2">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Petra Wallet Required
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                To connect your wallet, please install the Petra Wallet extension first.
              </p>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => window.open("https://petra.app/", "_blank")}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm sm:text-base"
                >
                  Install Petra Wallet
                </button>
                <button
                  onClick={onCloseWalletModal}
                  className="w-full text-gray-500 hover:text-gray-700 transition-colors duration-200 text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};