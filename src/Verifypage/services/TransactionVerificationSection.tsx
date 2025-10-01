import { motion, AnimatePresence } from "framer-motion";
import {
  MdVerified,
  MdContentCopy,
  MdRefresh,
  MdCheckCircle,
  MdWarning,
  MdEdit,
} from "react-icons/md";
import ActionEligible from "../services/ActionEligible";
import type { TransactionDetails } from "../services/TransactionAnalysisService";

interface ProductInfo {
  brandName: string;
  productId: string;
  userAddress: string;
  expectedBrand: string;
  expectedProductId: string;
  matchStatus: "valid" | "mismatch" | "pending";
  returnStatus: "eligible" | "not-eligible" | "processing" | "completed";
  refundStatus: "eligible" | "not-eligible" | "processing" | "completed";
  mismatchFields: string[];
}

interface TransactionVerificationSectionProps {
  scannedData: string | null;
  transactionDetails: TransactionDetails | null;
  isLoading: boolean;
  fetchError: string | null;
  productInfo: ProductInfo | null;
  showReEnterForm: boolean;
  verificationResult: any;
  isRecording: boolean;
  walletAddress: string;
  brandName: string;
  productId: string;
  userAddress: string;
  onCopyToClipboard: (text: string) => void;
  onFetchData: () => void;
  onVerifyProductMatch: () => void;
  onReEnterProductInfo: () => void;
  onRecordSuccess: () => void;
  onRecordMismatch: () => void;
  onInitiateReturn: () => void;
  onInitiateRefund: () => void;
  onResetScan: () => void;
  onBrandNameChange: (value: string) => void;
  onProductIdChange: (value: string) => void;
  onUserAddressChange: (value: string) => void;
  formatTimestamp: (timestamp: string) => string;
  formatGasUsed: (gasUsed: string) => string;
  formatFunctionName: (func: string) => string;
}

const TransactionVerificationSection = ({
  scannedData,
  transactionDetails,
  isLoading,
  fetchError,
  productInfo,
  showReEnterForm,
  verificationResult,
  isRecording,
  walletAddress,
  brandName,
  productId,
  userAddress,
  onCopyToClipboard,
  onFetchData,
  onVerifyProductMatch,
  onReEnterProductInfo,
  onRecordSuccess,
  onRecordMismatch,
  onInitiateReturn,
  onInitiateRefund,
  onResetScan,
  onBrandNameChange,
  onProductIdChange,
  onUserAddressChange,
  formatTimestamp,
  formatGasUsed,
  formatFunctionName,
}: TransactionVerificationSectionProps) => {
  if (!scannedData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-gray-200"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MdVerified className="text-4xl text-green-500" />
            <h2 className="text-3xl font-bold text-gray-800">
              Transaction Hash Scanned
            </h2>
          </div>
          <p className="text-gray-600">
            QR code successfully scanned and transaction hash extracted
            from blockchain
          </p>
        </div>

        {/* Transaction Hash Display */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Transaction Hash
            </h3>
            <button
              onClick={() => onCopyToClipboard(scannedData)}
              className="text-gray-400 hover:text-gray-600 transition-colors hidden"
            >
              <MdContentCopy size={20} />
            </button>
          </div>
          <p className="text-gray-700 font-mono text-sm break-all bg-gray-100 p-4 rounded-lg hidden">
            {scannedData}
          </p>
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-center">{fetchError}</p>
          </div>
        )}

        {isLoading ? (
          <LoadingState />
        ) : transactionDetails ? (
          <TransactionDetailsContent
            transactionDetails={transactionDetails}
            productInfo={productInfo}
            showReEnterForm={showReEnterForm}
            verificationResult={verificationResult}
            isRecording={isRecording}
            walletAddress={walletAddress}
            brandName={brandName}
            productId={productId}
            userAddress={userAddress}
            onVerifyProductMatch={onVerifyProductMatch}
            onReEnterProductInfo={onReEnterProductInfo}
            onRecordSuccess={onRecordSuccess}
            onRecordMismatch={onRecordMismatch}
            onInitiateReturn={onInitiateReturn}
            onInitiateRefund={onInitiateRefund}
            onBrandNameChange={onBrandNameChange}
            onProductIdChange={onProductIdChange}
            onUserAddressChange={onUserAddressChange}
            formatTimestamp={formatTimestamp}
            formatGasUsed={formatGasUsed}
            formatFunctionName={formatFunctionName}
          />
        ) : (
          <FetchDataButton
            isLoading={isLoading}
            onFetchData={onFetchData}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <motion.button
            onClick={onResetScan}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 bg-white text-black border-2 border-gray-400 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Scan Another QR Code
          </motion.button>
          <motion.button
            onClick={() =>
              window.open(
                `https://explorer.aptoslabs.com/txn/${scannedData}?network=mainnet`,
                "_blank"
              )
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 bg-white text-black border-2 border-blue-500 rounded-xl hover:bg-blue-50 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            View on Aptos Explorer
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const LoadingState = () => (
  <div className="text-center py-12">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    <p className="text-gray-600">
      Fetching real transaction data from Aptos blockchain...
    </p>
  </div>
);

const FetchDataButton = ({ isLoading, onFetchData }: { isLoading: boolean; onFetchData: () => void }) => (
  <div className="text-center py-8">
    <motion.button
      onClick={onFetchData}
      disabled={isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-3 mx-auto cursor-pointer"
    >
      <MdRefresh size={24} />
      {isLoading
        ? "Fetching Transaction Data..."
        : "Fetch Transaction Data from Blockchain"}
    </motion.button>
  </div>
);

const TransactionDetailsContent = ({
  transactionDetails,
  productInfo,
  showReEnterForm,
  verificationResult,
  isRecording,
  walletAddress,
  brandName,
  productId,
  userAddress,
  onVerifyProductMatch,
  onReEnterProductInfo,
  onRecordSuccess,
  onRecordMismatch,
  onInitiateReturn,
  onInitiateRefund,
  onBrandNameChange,
  onProductIdChange,
  onUserAddressChange,
  formatTimestamp,
  formatGasUsed,
}: any) => (
  <div className="space-y-6">
    {/* Product Verification Form */}
    {(!productInfo || showReEnterForm) && (
      <ProductVerificationForm
        showReEnterForm={showReEnterForm}
        brandName={brandName}
        productId={productId}
        userAddress={userAddress}
        onBrandNameChange={onBrandNameChange}
        onProductIdChange={onProductIdChange}
        onUserAddressChange={onUserAddressChange}
        onVerifyProductMatch={onVerifyProductMatch}
      />
    )}

    {/* Product Match Success */}
    {verificationResult?.overallMatch === "valid" && !showReEnterForm && (
      <ProductMatchSuccess
        productInfo={productInfo}
        isRecording={isRecording}
        onRecordSuccess={onRecordSuccess}
        onReEnterProductInfo={onReEnterProductInfo}
      />
    )}

    {/* Product Mismatch Detected */}
    {verificationResult?.overallMatch === "mismatch" && !showReEnterForm && (
      <ProductMismatchDetected
        productInfo={productInfo}
        verificationResult={verificationResult}
        isRecording={isRecording}
        walletAddress={walletAddress}
        onRecordMismatch={onRecordMismatch}
        onInitiateReturn={onInitiateReturn}
        onInitiateRefund={onInitiateRefund}
        onReEnterProductInfo={onReEnterProductInfo}
      />
    )}

    {/* Transaction Details */}
    <TransactionDetailsDisplay
      transactionDetails={transactionDetails}
      formatTimestamp={formatTimestamp}
      formatGasUsed={formatGasUsed}
    />
  </div>
);

const ProductVerificationForm = ({
  showReEnterForm,
  brandName,
  productId,
  userAddress,
  onBrandNameChange,
  onProductIdChange,
  onUserAddressChange,
  onVerifyProductMatch,
}: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
  >
    <h3 className="text-xl font-semibold text-gray-800 mb-6">
      {showReEnterForm ? "Edit Product Details" : "Enter Product Details"}
    </h3>
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Brand Name
        </label>
        <input
          type="text"
          value={brandName}
          onChange={(e) => onBrandNameChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          placeholder="Enter exact brand name from transaction"
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter the brand name exactly as it appears in the transaction
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Product ID
        </label>
        <input
          type="text"
          value={productId}
          onChange={(e) => onProductIdChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          placeholder="Enter product ID from transaction"
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter the product ID exactly as it appears in the transaction
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          User Address
        </label>
        <input
          type="text"
          value={userAddress}
          onChange={(e) => onUserAddressChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
          placeholder="Enter user wallet address"
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter any wallet address for product ownership
        </p>
      </div>
      <motion.button
        onClick={onVerifyProductMatch}
        disabled={!brandName || !productId || !userAddress}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {showReEnterForm ? "Update Product Verification" : "Verify Product Match"}
      </motion.button>
    </div>
  </motion.div>
);

const ProductMatchSuccess = ({
  productInfo,
  isRecording,
  onRecordSuccess,
  onReEnterProductInfo,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-green-200 rounded-xl p-8 shadow-sm"
  >
    <div className="text-center mb-6">
      <MdCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold text-green-800 mb-2">
        Product Verified Successfully!
      </h3>
      <p className="text-green-600">
        Your product matches the transaction details perfectly.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <p className="font-semibold text-green-800">Brand Name</p>
        <p className="text-green-600">✅ Perfect Match</p>
        <p className="text-sm text-gray-600">
          Entered: {productInfo?.brandName}
        </p>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <p className="font-semibold text-green-800">Product ID</p>
        <p className="text-green-600">✅ Perfect Match</p>
        <p className="text-sm text-gray-600">
          Entered: {productInfo?.productId}
        </p>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <p className="font-semibold text-green-800">User Address</p>
        <p className="text-green-600">✅ Registered</p>
        <p className="text-sm text-gray-600 font-mono break-all">
          {productInfo?.userAddress}
        </p>
      </div>
    </div>

    <div className="flex gap-3">
      <motion.button
        onClick={onRecordSuccess}
        disabled={isRecording}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <MdContentCopy size={20} />
        {isRecording ? "Recording..." : "Record on Blockchain"}
      </motion.button>
      <motion.button
        onClick={onReEnterProductInfo}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1 px-6 py-3 bg-white text-black border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
      >
        <MdEdit size={20} />
        Edit Details
      </motion.button>
    </div>
  </motion.div>
);

const ProductMismatchDetected = ({
  productInfo,
  verificationResult,
  isRecording,
  walletAddress,
  onRecordMismatch,
  onInitiateReturn,
  onInitiateRefund,
  onReEnterProductInfo,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-red-200 rounded-xl p-8 shadow-sm"
  >
    <div className="text-center mb-6">
      <MdWarning className="text-6xl text-orange-500 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold text-red-800 mb-2">
        Product Mismatch Detected
      </h3>
      <p className="text-red-600">
        {productInfo?.mismatchFields.length === 1
          ? "One field does not match transaction records."
          : "Multiple fields do not match transaction records."}
      </p>
    </div>

    {/* Mismatch Details */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div
        className={`text-center p-4 rounded-lg ${
          verificationResult.brandMatch ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <p className="font-semibold">Brand Name</p>
        <p
          className={
            verificationResult.brandMatch ? "text-green-600" : "text-red-600"
          }
        >
          {verificationResult.brandMatch ? "✅ Matched" : "❌ Mismatch"}
        </p>
        <p className="text-sm text-gray-600">
          Entered: {productInfo?.brandName}
        </p>
      </div>
      <div
        className={`text-center p-4 rounded-lg ${
          verificationResult.productIdMatch ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <p className="font-semibold">Product ID</p>
        <p
          className={
            verificationResult.productIdMatch ? "text-green-600" : "text-red-600"
          }
        >
          {verificationResult.productIdMatch ? "✅ Matched" : "❌ Mismatch"}
        </p>
        <p className="text-sm text-gray-600">
          Entered: {productInfo?.productId}
        </p>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <p className="font-semibold">User Address</p>
        <p className="text-green-600">✅ Registered</p>
        <p className="text-sm text-gray-600 font-mono break-all">
          {productInfo?.userAddress}
        </p>
      </div>
    </div>

    {/* ActionEligible Component */}
    <ActionEligible
      productInfo={productInfo!}
      verificationResult={verificationResult}
      walletAddress={walletAddress}
      isRecording={isRecording}
      onRecordMismatch={onRecordMismatch}
      onInitiateReturn={onInitiateReturn}
      onInitiateRefund={onInitiateRefund}
      onEditDetails={onReEnterProductInfo}
    />
  </motion.div>
);

const TransactionDetailsDisplay = ({
  transactionDetails,
  formatTimestamp,
  formatGasUsed,
}: any) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
  >
    <h3 className="text-xl font-semibold text-gray-800 mb-4">
      Transaction Details
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="font-medium text-gray-700">Status:</p>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            transactionDetails.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {transactionDetails.success ? "Success" : "Failed"}
        </span>
      </div>
      <div>
        <p className="font-medium text-gray-700">Gas Used:</p>
        <p className="font-mono text-gray-800">
          {formatGasUsed(transactionDetails.gas_used)} units
        </p>
      </div>
      <div>
        <p className="font-medium text-gray-700">Sender:</p>
        <p className="font-mono text-sm break-all text-gray-800">
          {transactionDetails.sender}
        </p>
      </div>
      <div>
        <p className="font-medium text-gray-700">Timestamp:</p>
        <p className="text-gray-800">
          {formatTimestamp(transactionDetails.timestamp)}
        </p>
      </div>
    </div>
  </motion.div>
);

export default TransactionVerificationSection;