import { motion } from "framer-motion";
import { MdError, MdRefresh, MdHelp } from "react-icons/md";

interface FailedTransactionProps {
  error: string;
  errorCode?: string;
  action: string;
  data?: any;
  onRetry?: () => void;
  onClose: () => void;
  onShowHelp?: () => void;
}

const FailedTransaction = ({
  error,
  errorCode,
  action,
  data,
  onRetry,
  onClose,
  onShowHelp,
}: FailedTransactionProps) => {
  const getErrorMessage = () => {
    if (errorCode === '4001') {
      return "Transaction was rejected by user.";
    } else if (error?.includes('INSUFFICIENT_BALANCE')) {
      return "Insufficient balance in your wallet to pay for gas fees.";
    } else if (error?.includes('SEQUENCE_NUMBER_TOO_OLD')) {
      return "Transaction sequence error. Please refresh the page and try again.";
    } else if (error?.includes('TYPE_MISMATCH') || error?.includes('FAILED_TO_DESERIALIZE')) {
      return "Data type mismatch. Please ensure all fields are properly filled.";
    } else if (error?.includes('Hex characters are invalid')) {
      return "Invalid data format detected. Please check your inputs and try again.";
    }
    return error || "Unknown error occurred";
  };

  const getErrorTitle = () => {
    if (errorCode === '4001') return "Transaction Rejected";
    if (error?.includes('INSUFFICIENT_BALANCE')) return "Insufficient Balance";
    if (error?.includes('SEQUENCE_NUMBER_TOO_OLD')) return "Sequence Error";
    if (error?.includes('TYPE_MISMATCH')) return "Data Type Error";
    return "Transaction Failed";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
          <MdError className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-800">{getErrorTitle()} ❌</h3>
          <p className="text-red-600 text-sm">The transaction could not be completed</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg mb-4">
        <p className="font-medium text-gray-700 mb-2">Error Details:</p>
        <p className="text-red-600 text-sm font-mono bg-red-50 p-3 rounded border border-red-200">
          {getErrorMessage()}
        </p>
        
        {errorCode && (
          <div className="mt-2">
            <p className="font-medium text-gray-700 text-sm">Error Code: <span className="font-mono">{errorCode}</span></p>
          </div>
        )}
      </div>

      {data && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="font-medium text-yellow-800 text-sm mb-2">Attempted Action:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Action:</span> {action}
            </div>
            <div>
              <span className="text-gray-600">Brand:</span> {data.brandName || "Unknown"}
            </div>
            <div>
              <span className="text-gray-600">Product ID:</span> {data.productId || "Unknown"}
            </div>
            <div>
              <span className="text-gray-600">Status:</span> {data.overallMatch || "unknown"}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        {onRetry && (
          <motion.button
            onClick={onRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <MdRefresh size={16} />
            Try Again
          </motion.button>
        )}
        
        {onShowHelp && (
          <motion.button
            onClick={onShowHelp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <MdHelp size={16} />
            Get Help
          </motion.button>
        )}
        
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          Close
        </motion.button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Tip:</strong> Make sure your wallet is connected and has sufficient APT for gas fees.
        </p>
      </div>
    </motion.div>
  );
};

export default FailedTransaction;