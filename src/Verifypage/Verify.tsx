"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdQrCodeScanner,
  MdVerified,
  MdContentCopy,
  MdRefresh,
  MdCheckCircle,
  MdWarning,
  MdEdit,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import ScanningCamera from "../components/ScanningCamera";
import NavbarWallet from "../components/NavbarWallet";
import ActionEligible from "../components/ActionEligible";
import { useBlockchainService } from "../services/BlockchainService";

// Types for real Aptos transaction data
interface TransactionDetails {
  hash: string;
  version: string;
  success: boolean;
  vm_status: string;
  gas_used: string;
  timestamp: string;
  sender: string;
  payload?: {
    function: string;
    arguments: any[];
    type: string;
    type_arguments: any[];
  };
  events?: any[];
  explorerUrl: string;
  block_height?: string;
  state_change_hash?: string;
  event_root_hash?: string;
}

interface ProductInfo {
  brandName: string;
  productId: string;
  expectedBrand: string;
  expectedProductId: string;
  matchStatus: "valid" | "mismatch" | "pending";
  returnStatus: "eligible" | "not-eligible" | "processing" | "completed";
  refundStatus: "eligible" | "not-eligible" | "processing" | "completed";
  mismatchFields: string[];
}

const Verify = () => {
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Product verification states
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [brandName, setBrandName] = useState("");
  const [productId, setProductId] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showReEnterForm, setShowReEnterForm] = useState(false);

  // Wallet states
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Blockchain service
  const { recordOnBlockchain } = useBlockchainService({
    walletConnected,
    walletAddress,
    onRecordingChange: setIsRecording,
  });

  // Wallet connection handler
  const handleWalletConnect = (connected: boolean, address: string) => {
    setWalletConnected(connected);
    setWalletAddress(address);
  };

  const handleQRCodeDetected = (data: string) => {
    setIsLoading(true);
    setScannedData(data);
    setFetchError(null);

    if (data.startsWith("0x") && data.length === 66) {
      setTransactionDetails(null);
    } else {
      const extractedHash = extractTransactionHash(data);
      if (extractedHash) {
        setScannedData(extractedHash);
        setTransactionDetails(null);
      } else {
        setCameraError(
          "Invalid QR code content. Please scan a valid transaction hash QR code."
        );
        setIsLoading(false);
        return;
      }
    }

    setIsScanning(false);
    setIsLoading(false);
  };

  const extractTransactionHash = (data: string): string | null => {
    if (data.startsWith("0x") && data.length === 66) {
      return data;
    }

    const urlMatch = data.match(/0x[a-fA-F0-9]{64}/);
    if (urlMatch) {
      return urlMatch[0];
    }

    const aptosExplorerMatch = data.match(
      /explorer\.aptoslabs\.com\/txn\/(0x[a-fA-F0-9]{64})/
    );
    if (aptosExplorerMatch) {
      return aptosExplorerMatch[1];
    }

    return null;
  };

  const fetchRealTransactionDetails = async (hash: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(
        `https://api.testnet.aptoslabs.com/v1/transactions/by_hash/${hash}`
      );

      if (!response.ok) {
        throw new Error(`Transaction not found (HTTP ${response.status})`);
      }

      const transactionData = await response.json();

      const formattedDetails: TransactionDetails = {
        hash: transactionData.hash,
        version: transactionData.version,
        success: transactionData.success,
        vm_status: transactionData.vm_status,
        gas_used: transactionData.gas_used,
        timestamp: transactionData.timestamp,
        sender: transactionData.sender,
        payload: transactionData.payload,
        events: transactionData.events,
        block_height: transactionData.block_height,
        state_change_hash: transactionData.state_change_hash,
        event_root_hash: transactionData.event_root_hash,
        explorerUrl: `https://explorer.aptoslabs.com/txn/${hash}?network=mainnet`,
      };

      setTransactionDetails(formattedDetails);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      setFetchError(
        error instanceof Error
          ? error.message
          : "Failed to fetch transaction details from blockchain"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Payload analysis - Smart detection for brand names and product IDs
  const analyzeProductFromPayload = (payload: any) => {
    console.log("🔍 Analyzing payload:", payload);

    let extractedBrand = "";
    let extractedProductId = "";

    if (payload && payload.arguments && payload.arguments.length > 0) {
      console.log("📋 Arguments found:", payload.arguments);

      const stringArgs = payload.arguments.filter(
        (arg: any) => typeof arg === "string" && arg.trim().length > 0
      );

      console.log("📝 String arguments:", stringArgs);

      if (stringArgs.length > 0) {
        // SMART DETECTION: Analyze each string argument
        for (const arg of stringArgs) {
          const trimmedArg = arg.trim();

          const looksLikeProductId =
            /^[A-Z0-9]{6,12}$/.test(trimmedArg) ||
            /^[A-Z]{2,4}[0-9]{3,6}$/.test(trimmedArg) ||
            /^[0-9]{8,12}$/.test(trimmedArg) ||
            /^OD[0-9]+$/.test(trimmedArg);

          const looksLikeBrandName =
            /^[A-Za-z\s]{2,20}$/.test(trimmedArg) &&
            !/\d/.test(trimmedArg) &&
            trimmedArg.length >= 2;

          console.log(`🔍 Analyzing "${trimmedArg}":`, {
            looksLikeProductId,
            looksLikeBrandName,
          });

          if (looksLikeProductId && !extractedProductId) {
            extractedProductId = trimmedArg;
            console.log("🆔 Product ID identified:", extractedProductId);
          } else if (looksLikeBrandName && !extractedBrand) {
            extractedBrand = trimmedArg;
            console.log("🏷️ Brand name identified:", extractedBrand);
          }
        }

        // FALLBACK: If we couldn't identify by patterns, use position-based logic
        if (!extractedBrand || !extractedProductId) {
          console.log("🔄 Using fallback position-based detection");

          for (let i = 0; i < stringArgs.length; i++) {
            const arg = stringArgs[i];
            if (!extractedProductId && arg.length >= 6 && arg.length <= 15) {
              extractedProductId = arg;
            } else if (
              !extractedBrand &&
              arg.length >= 2 &&
              arg.length <= 20 &&
              /^[A-Za-z]/.test(arg)
            ) {
              extractedBrand = arg;
            }
          }
        }

        // ULTIMATE FALLBACK: Simple position-based assignment
        if (!extractedBrand && stringArgs.length >= 1) {
          extractedBrand = stringArgs[stringArgs.length - 1];
        }
        if (!extractedProductId && stringArgs.length >= 2) {
          extractedProductId = stringArgs[0];
        }
      }
    }

    console.log("🎯 Final extraction:", {
      brand: extractedBrand,
      productId: extractedProductId,
    });

    return {
      extractedBrand: extractedBrand || "Brand not found in transaction",
      extractedProductId:
        extractedProductId || "Product ID not found in transaction",
    };
  };

  // Improved product matching logic
  const verifyProductMatch = () => {
    if (!brandName || !productId || !transactionDetails) return;

    const { extractedBrand, extractedProductId } = analyzeProductFromPayload(
      transactionDetails.payload
    );

    console.log("🔍 Verification starting...");
    console.log("👤 User entered:", { brandName, productId });
    console.log("📦 Extracted from payload:", {
      extractedBrand,
      extractedProductId,
    });

    const normalizedUserBrand = brandName.toLowerCase().trim();
    const normalizedExtractedBrand = extractedBrand.toLowerCase().trim();

    const isBrandMatch = normalizedExtractedBrand === normalizedUserBrand;
    const isProductIdMatch = extractedProductId === productId;

    console.log("✅ Match results:", {
      isBrandMatch,
      isProductIdMatch,
      userBrand: normalizedUserBrand,
      extractedBrand: normalizedExtractedBrand,
      userProductId: productId,
      extractedProductId: extractedProductId,
    });

    const mismatchFields: string[] = [];
    if (!isBrandMatch) mismatchFields.push("Brand Name");
    if (!isProductIdMatch) mismatchFields.push("Product ID");

    const matchStatus = mismatchFields.length === 0 ? "valid" : "mismatch";

    const returnEligible = mismatchFields.length > 0;
    const refundEligible = mismatchFields.length === 2;

    const productInfo: ProductInfo = {
      brandName,
      productId,
      expectedBrand: extractedBrand,
      expectedProductId: extractedProductId,
      matchStatus,
      returnStatus: returnEligible ? "eligible" : "not-eligible",
      refundStatus: refundEligible ? "eligible" : "not-eligible",
      mismatchFields,
    };

    setProductInfo(productInfo);
    setVerificationResult({
      brandMatch: isBrandMatch,
      productIdMatch: isProductIdMatch,
      overallMatch: matchStatus,
      mismatchFields,
    });
    setShowReEnterForm(false);
  };

  const reEnterProductInfo = () => {
    setShowReEnterForm(true);
    setVerificationResult(null);
    setProductInfo(null);
  };

  const initiateReturnProcess = async () => {
    if (!productInfo) return;

    setProductInfo((prev) =>
      prev
        ? {
            ...prev,
            returnStatus: "processing",
          }
        : null
    );

    if (walletConnected) {
      const txHash = await recordOnBlockchain("Return Initiated", {
        brandName: productInfo.brandName,
        productId: productInfo.productId,
        mismatchFields: productInfo.mismatchFields,
        action: "return_initiation",
      });

      if (txHash) {
        setTimeout(() => {
          setProductInfo((prev) =>
            prev
              ? {
                  ...prev,
                  returnStatus: "completed",
                }
              : null
          );
        }, 3000);
      } else {
        setProductInfo((prev) =>
          prev
            ? {
                ...prev,
                returnStatus: "eligible",
              }
            : null
        );
      }
    } else {
      setTimeout(() => {
        setProductInfo((prev) =>
          prev
            ? {
                ...prev,
                returnStatus: "completed",
              }
            : null
        );
      }, 3000);
    }
  };

  const initiateRefundProcess = async () => {
    if (!productInfo) return;

    setProductInfo((prev) =>
      prev
        ? {
            ...prev,
            refundStatus: "processing",
          }
        : null
    );

    if (walletConnected) {
      const txHash = await recordOnBlockchain("Refund Initiated", {
        brandName: productInfo.brandName,
        productId: productInfo.productId,
        mismatchFields: productInfo.mismatchFields,
        action: "refund_initiation",
      });

      if (txHash) {
        setTimeout(() => {
          setProductInfo((prev) =>
            prev
              ? {
                  ...prev,
                  refundStatus: "completed",
                }
              : null
          );
        }, 3000);
      } else {
        setProductInfo((prev) =>
          prev
            ? {
                ...prev,
                refundStatus: "eligible",
              }
            : null
        );
      }
    } else {
      setTimeout(() => {
        setProductInfo((prev) =>
          prev
            ? {
                ...prev,
                refundStatus: "completed",
              }
            : null
        );
      }, 3000);
    }
  };

  const handleRecordMismatch = () => {
    recordOnBlockchain("Product Mismatch Detected", {
      ...verificationResult,
      brandName: productInfo?.brandName,
      productId: productInfo?.productId,
      mismatchFields: productInfo?.mismatchFields,
      walletAddress,
    });
  };

  const handleRecordSuccess = () => {
    recordOnBlockchain("Product Verification Success", {
      ...verificationResult,
      brandName: productInfo?.brandName,
      productId: productInfo?.productId,
      walletAddress,
    });
  };

  const handleScanClick = () => {
    setIsScanning(true);
    setScannedData(null);
    setTransactionDetails(null);
    setProductInfo(null);
    setCameraError(null);
    setFetchError(null);
    setShowReEnterForm(false);
    setVerificationResult(null);
    setBrandName("");
    setProductId("");
  };

  const handleCloseCamera = () => {
    setIsScanning(false);
    setCameraError(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const resetScan = () => {
    setScannedData(null);
    setTransactionDetails(null);
    setProductInfo(null);
    setIsScanning(false);
    setCameraError(null);
    setFetchError(null);
    setShowReEnterForm(false);
    setVerificationResult(null);
    setBrandName("");
    setProductId("");
  };

  const handleFetchData = () => {
    if (scannedData) {
      fetchRealTransactionDetails(scannedData);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatGasUsed = (gasUsed: string) => {
    return parseInt(gasUsed).toLocaleString();
  };

  const formatFunctionName = (func: string) => {
    const parts = func.split("::");
    return parts[parts.length - 1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-50 via-white-50 to-blue-50">
      {/* Navbar Component */}
      <NavbarWallet
        walletConnected={walletConnected}
        walletAddress={walletAddress}
        isWalletConnecting={isWalletConnecting}
        onWalletConnect={handleWalletConnect}
      />

      <main className="pt-32 pb-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center mb-16"
        >
          <div>
            <MdQrCodeScanner className="mx-auto text-6xl text-blue-600 mb-6" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Smart Product Verify
            <span className="block mt-2 text-blue-600">
              Return & Refund System
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mt-6">
            Scan transaction QR codes to verify product authenticity, manage
            returns, and process refunds on the Aptos blockchain.
          </p>
        </motion.div>

        {/* Scan Button */}
        <div className="flex justify-center items-center p-4 mb-12">
          <motion.button
            onClick={handleScanClick}
            disabled={isScanning}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black cursor-pointer border-2 border-blue-600 rounded-2xl px-8 py-4 font-semibold text-lg hover:bg-blue-600 hover:text-white hover:border-blue-700 transform transition-all duration-300 min-w-[200px] shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <MdQrCodeScanner size={24} />
            {isScanning ? "Scanning..." : "Scan QR Code"}
          </motion.button>
        </div>

        {/* Camera Scanner Modal */}
        <ScanningCamera
          isScanning={isScanning}
          onClose={handleCloseCamera}
          onQRCodeDetected={handleQRCodeDetected}
          cameraError={cameraError}
        />

        {/* Transaction & Product Verification Section */}
        <AnimatePresence>
          {scannedData && (
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
                    onClick={() => copyToClipboard(scannedData)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MdContentCopy size={20} />
                  </button>
                </div>
                <p className="text-gray-700 font-mono text-sm break-all bg-gray-100 p-4 rounded-lg">
                  {scannedData}
                </p>
              </div>

              {fetchError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-red-600 text-center">{fetchError}</p>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    Fetching real transaction data from Aptos blockchain...
                  </p>
                </div>
              ) : transactionDetails ? (
                <div className="space-y-6">
                  {/* Product Verification Form */}
                  {(!productInfo || showReEnterForm) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                    >
                      <h3 className="text-xl font-semibold text-gray-800 mb-6">
                        {showReEnterForm
                          ? "Edit Product Details"
                          : "Enter Product Details"}
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Brand Name
                          </label>
                          <input
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                            placeholder="Enter exact brand name from transaction"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Enter the brand name exactly as it appears in the
                            transaction
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Product ID
                          </label>
                          <input
                            type="text"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                            placeholder="Enter product ID from transaction"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Enter the product ID exactly as it appears in the
                            transaction
                          </p>
                        </div>
                        <motion.button
                          onClick={verifyProductMatch}
                          disabled={!brandName || !productId}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {showReEnterForm
                            ? "Update Product Verification"
                            : "Verify Product Match"}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Product Match Success */}
                  {verificationResult &&
                    verificationResult.overallMatch === "valid" &&
                    !showReEnterForm && (
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
                            Your product matches the transaction details
                            perfectly.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="font-semibold text-green-800">
                              Brand Name
                            </p>
                            <p className="text-green-600">✅ Perfect Match</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Expected: {productInfo?.expectedBrand}
                            </p>
                            <p className="text-sm text-gray-600">
                              Entered: {productInfo?.brandName}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="font-semibold text-green-800">
                              Product ID
                            </p>
                            <p className="text-green-600">✅ Perfect Match</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Expected: {productInfo?.expectedProductId}
                            </p>
                            <p className="text-sm text-gray-600">
                              Entered: {productInfo?.productId}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <motion.button
                            onClick={handleRecordSuccess}
                            disabled={isRecording}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <MdContentCopy size={20} />
                            {isRecording
                              ? "Recording..."
                              : "Record on Blockchain"}
                          </motion.button>
                          <motion.button
                            onClick={reEnterProductInfo}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-6 py-3 bg-white text-black border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <MdEdit size={20} />
                            Edit Details
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                  {/* Product Mismatch Detected */}
                  {verificationResult &&
                    verificationResult.overallMatch === "mismatch" &&
                    !showReEnterForm && (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div
                            className={`text-center p-4 rounded-lg ${
                              verificationResult.brandMatch
                                ? "bg-green-50"
                                : "bg-red-50"
                            }`}
                          >
                            <p className="font-semibold">Brand Name</p>
                            <p
                              className={
                                verificationResult.brandMatch
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {verificationResult.brandMatch
                                ? "✅ Matched"
                                : "❌ Mismatch"}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Expected: {productInfo?.expectedBrand}
                            </p>
                            <p className="text-sm text-gray-600">
                              Entered: {productInfo?.brandName}
                            </p>
                          </div>
                          <div
                            className={`text-center p-4 rounded-lg ${
                              verificationResult.productIdMatch
                                ? "bg-green-50"
                                : "bg-red-50"
                            }`}
                          >
                            <p className="font-semibold">Product ID</p>
                            <p
                              className={
                                verificationResult.productIdMatch
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {verificationResult.productIdMatch
                                ? "✅ Matched"
                                : "❌ Mismatch"}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Expected: {productInfo?.expectedProductId}
                            </p>
                            <p className="text-sm text-gray-600">
                              Entered: {productInfo?.productId}
                            </p>
                          </div>
                        </div>

                        {/* ActionEligible Component */}
                        <ActionEligible
                          productInfo={productInfo!}
                          verificationResult={verificationResult}
                          walletAddress={walletAddress}
                          isRecording={isRecording}
                          onRecordMismatch={handleRecordMismatch}
                          onInitiateReturn={initiateReturnProcess}
                          onInitiateRefund={initiateRefundProcess}
                          onEditDetails={reEnterProductInfo}
                        />
                      </motion.div>
                    )}

                  {/* Transaction Details */}
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

                  {/* Payload Analysis */}
                  {transactionDetails.payload && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                    >
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Payload Analysis
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-gray-700">Function:</p>
                          <p className="font-mono text-blue-600 text-lg">
                            {formatFunctionName(
                              transactionDetails.payload.function
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">
                            Full Function:
                          </p>
                          <p className="font-mono text-sm break-all text-gray-800 bg-gray-50 p-3 rounded-lg">
                            {transactionDetails.payload.function}
                          </p>
                        </div>
                        {transactionDetails.payload.arguments &&
                          transactionDetails.payload.arguments.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700">
                                Arguments:
                              </p>
                              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg mt-2 border">
                                {JSON.stringify(
                                  transactionDetails.payload.arguments,
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <motion.button
                    onClick={handleFetchData}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
                  >
                    <MdRefresh size={24} />
                    {isLoading
                      ? "Fetching Transaction Data..."
                      : "Fetch Transaction Data from Blockchain"}
                  </motion.button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <motion.button
                  onClick={resetScan}
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
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Verify;