// FailedTransaction.tsx
import React from 'react';

interface FailedTransactionProps {
  errorMessage: string;
  onRetry: () => void;
  onCancel: () => void;
}

export const FailedTransaction: React.FC<FailedTransactionProps> = ({
  errorMessage,
  onRetry,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform transition-all duration-500 scale-100 animate-in fade-in-0 zoom-in-95">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error Text */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Failed
          </h3>
          <p className="text-red-600 font-medium mb-2">
            Transaction could not be completed
          </p>
          <p className="text-gray-600 text-sm bg-red-50 p-3 rounded-lg">
            {errorMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};