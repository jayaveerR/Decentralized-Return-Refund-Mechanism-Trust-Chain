import { motion } from "framer-motion";
import { MdCheckCircle, MdContentCopy, MdOpenInNew } from "react-icons/md";

interface SuccessTransactionProps {
  transactionHash: string;
  action: string;
  data: {
    brandName: string;
    productId: string;
    userAddress: string;
    transactionHash: string;
    overallMatch: string;
  };
  moduleAddress: string;
  onClose: () => void;
  onCopyHash: (hash: string) => void;
}

const SuccessTransaction = ({
  transactionHash,
  action,
  data,
  moduleAddress,
  onClose,
  onCopyHash,
}: SuccessTransactionProps) => {
  const handleViewOnExplorer = () => {
    window.open(`https://explorer.aptoslabs.com/txn/${transactionHash}?network=testnet`, '_blank');
  };

  const handleCopyHash = () => {
    onCopyHash(transactionHash);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
          <MdCheckCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-green-800">Transaction Successful! 🎉</h3>
          <p className="text-green-600 text-sm">Your transaction has been recorded on the blockchain</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded-lg">
          <p className="font-medium text-gray-600 text-sm mb-1">Action</p>
          <p className="text-gray-900 font-semibold">{action}</p>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <p className="font-medium text-gray-600 text-sm mb-1">Transaction Hash</p>
          <p className="font-mono text-xs text-gray-900 break-all">{transactionHash}</p>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <p className="font-medium text-gray-600 text-sm mb-1">Brand</p>
          <p className="text-gray-900 font-semibold">{data.brandName || "Unknown"}</p>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <p className="font-medium text-gray-600 text-sm mb-1">Product ID</p>
          <p className="text-gray-900 font-semibold">{data.productId || "Unknown"}</p>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <p className="font-medium text-gray-600 text-sm mb-1">Connected Wallet</p>
          <p className="font-mono text-xs text-gray-900 break-all">{data.userAddress || "Unknown"}</p>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <p className="font-medium text-gray-600 text-sm mb-1">Match Status</p>
          <p className="text-gray-900 font-semibold">{data.overallMatch || "unknown"}</p>
        </div>
        <div className="bg-white p-3 rounded-lg md:col-span-2">
          <p className="font-medium text-gray-600 text-sm mb-1">Smart Contract</p>
          <p className="font-mono text-xs text-gray-900 break-all">{moduleAddress}</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <motion.button
          onClick={handleViewOnExplorer}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <MdOpenInNew size={16} />
          View on Explorer
        </motion.button>
        <motion.button
          onClick={handleCopyHash}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <MdContentCopy size={16} />
          Copy Hash
        </motion.button>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center gap-2"
        >
          Close
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SuccessTransaction;