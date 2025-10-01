import { motion } from "framer-motion";
import {
  MdContentCopy,
  MdAssignmentReturn,
  MdPayment,
  MdEdit,
} from "react-icons/md";

interface ActionEligibleProps {
  productInfo: {
    returnStatus: string;
    refundStatus: string;
    brandName?: string;
    productId?: string;
    mismatchFields?: string[];
  };
  verificationResult: {
    brandMatch: boolean;
    productIdMatch: boolean;
    overallMatch: string;
    mismatchFields: string[];
  };
  walletAddress: string;
  isRecording: boolean;
  onRecordMismatch: () => void;
  onInitiateReturn: () => void;
  onInitiateRefund: () => void;
  onEditDetails: () => void;
}

const ActionEligible = ({
  productInfo,
  verificationResult,
  walletAddress,
  isRecording,
  onRecordMismatch,
  onInitiateReturn,
  onInitiateRefund,
  onEditDetails,
}: ActionEligibleProps) => {
  return (
    <>
      {/* Eligibility Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className={`p-4 rounded-lg text-center ${
            productInfo?.returnStatus === "eligible"
              ? "bg-orange-50 border border-orange-200"
              : "bg-gray-50"
          }`}
        >
          <p className="font-semibold">Return Eligibility</p>
          <p
            className={
              productInfo?.returnStatus === "eligible"
                ? "text-orange-600"
                : "text-gray-600"
            }
          >
            {productInfo?.returnStatus === "eligible"
              ? "✅ Eligible"
              : "❌ Not Eligible"}
          </p>
          {productInfo?.mismatchFields?.length === 1 && (
            <p className="text-xs text-gray-500 mt-1">
              (Any mismatch makes return eligible)
            </p>
          )}
        </div>
        <div
          className={`p-4 rounded-lg text-center ${
            productInfo?.refundStatus === "eligible"
              ? "bg-green-50 border border-green-200"
              : "bg-gray-50"
          }`}
        >
          <p className="font-semibold">Refund Eligibility</p>
          <p
            className={
              productInfo?.refundStatus === "eligible"
                ? "text-green-600"
                : "text-gray-600"
            }
          >
            {productInfo?.refundStatus === "eligible"
              ? "✅ Eligible"
              : "❌ Not Eligible"}
          </p>
          {productInfo?.mismatchFields?.length === 1 && (
            <p className="text-xs text-gray-500 mt-1">
              (Only both mismatched for refund)
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          onClick={onRecordMismatch}
          disabled={isRecording}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <MdContentCopy size={20} />
          {isRecording ? "Recording..." : "Record Mismatch on Blockchain"}
        </motion.button>

        <div className="flex gap-3">
          <motion.button
            onClick={onInitiateReturn}
            disabled={productInfo?.returnStatus !== "eligible"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-3 bg-white text-black border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <MdAssignmentReturn />
            {productInfo?.returnStatus === "processing"
              ? "Processing..."
              : productInfo?.returnStatus === "completed"
              ? "Return Completed"
              : "Initiate Return"}
          </motion.button>
          <motion.button
            onClick={onInitiateRefund}
            disabled={productInfo?.refundStatus !== "eligible"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-3 bg-white text-black border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <MdPayment />
            {productInfo?.refundStatus === "processing"
              ? "Processing..."
              : productInfo?.refundStatus === "completed"
              ? "Refund Completed"
              : "Process Refund"}
          </motion.button>
        </div>

        <motion.button
          onClick={onEditDetails}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-3 bg-white text-black border-2 border-gray-400 rounded-xl hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <MdEdit size={20} />
          Edit Product Details
        </motion.button>
      </div>

      {/* Status Updates */}
      {(productInfo?.returnStatus === "processing" ||
        productInfo?.refundStatus === "processing") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-blue-50 rounded-lg"
        >
          <p className="text-blue-700 text-sm text-center">
            {productInfo.returnStatus === "processing" &&
              "🔄 Return process initiated..."}
            {productInfo.refundStatus === "processing" &&
              "💰 Refund process initiated..."}
          </p>
        </motion.div>
      )}
    </>
  );
};

export default ActionEligible;