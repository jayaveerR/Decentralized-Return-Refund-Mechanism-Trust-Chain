// SuccessPayment.tsx
import React from 'react';

interface SuccessPaymentProps {
  transactionHash: string;
  amount: string;
  onViewExplorer: () => void;
  onContinue: () => void;
}

export const SuccessPayment: React.FC<SuccessPaymentProps> = ({
  transactionHash,
  amount,
  onViewExplorer,
  onContinue,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform transition-all duration-500 scale-100 animate-in fade-in-0 zoom-in-95">
        {/* Success Icon Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  className="w-10 h-10 text-white animate-in rotate-in-90 duration-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Pulsing rings */}
            <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 border-2 border-green-300 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Success Text */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 animate-in fade-in-0 duration-500">
            Payment Successful!
          </h3>
          <p className="text-green-600 font-medium mb-2 animate-in fade-in-0 duration-700">
            {amount} APT payment confirmed!
          </p>
          <p className="text-gray-600 text-sm mb-4 animate-in fade-in-0 duration-900">
            Your payment has been processed successfully
          </p>

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg animate-in fade-in-0 duration-1100">
              <p className="text-xs text-gray-500 mb-1">Transaction Hash:</p>
              <p className="font-mono text-xs break-all text-gray-700">
                {transactionHash.substring(0, 20)}...{transactionHash.substring(transactionHash.length - 20)}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 animate-in fade-in-0 duration-1300">
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Continue
          </button>
          <button
            onClick={onViewExplorer}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200"
          >
            View Explorer
          </button>
        </div>
      </div>
    </div>
  );
};