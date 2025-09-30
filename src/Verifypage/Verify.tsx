"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScanningCamera from "../components/ScanningCamera";
import NavbarWallet from "../components/NavbarWallet";
import { useBlockchainService } from "../services/BlockchainService";
import { useTransactionAnalysis } from "../services/TransactionAnalysisService";
import type { TransactionDetails } from "../services/TransactionAnalysisService";
import HeroSection from "./HeroSection";
import ScanButton from "../components/ScanButton";
import TransactionVerificationSection from "../services/TransactionVerificationSection";

// Types for product verification
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
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
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

  // Services
  const { recordOnBlockchain } = useBlockchainService({
    walletConnected,
    walletAddress,
    onRecordingChange: setIsRecording,
  });

  const { 
    fetchRealTransactionDetails, 
    analyzeProductFromPayload, 
    extractTransactionHash 
  } = useTransactionAnalysis({
    enableLogging: true,
    apiEndpoint: "https://api.testnet.aptoslabs.com/v1"
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

    setIsScanning(false);
    setIsLoading(false);
  };

  const handleFetchData = async () => {
    if (!scannedData) return;

    setIsLoading(true);
    setFetchError(null);
    
    const { data, error } = await fetchRealTransactionDetails(scannedData);
    
    if (data) {
      setTransactionDetails(data);
    } else {
      setFetchError(error);
    }
    
    setIsLoading(false);
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
        <HeroSection />

        {/* Scan Button */}
        <ScanButton isScanning={isScanning} onScanClick={handleScanClick} />

        {/* Camera Scanner Modal */}
        <ScanningCamera
          isScanning={isScanning}
          onClose={handleCloseCamera}
          onQRCodeDetected={handleQRCodeDetected}
          cameraError={cameraError}
        />

        {/* Transaction & Product Verification Section */}
        <TransactionVerificationSection
          scannedData={scannedData}
          transactionDetails={transactionDetails}
          isLoading={isLoading}
          fetchError={fetchError}
          productInfo={productInfo}
          showReEnterForm={showReEnterForm}
          verificationResult={verificationResult}
          isRecording={isRecording}
          walletAddress={walletAddress}
          brandName={brandName}
          productId={productId}
          onCopyToClipboard={copyToClipboard}
          onFetchData={handleFetchData}
          onVerifyProductMatch={verifyProductMatch}
          onReEnterProductInfo={reEnterProductInfo}
          onRecordSuccess={handleRecordSuccess}
          onRecordMismatch={handleRecordMismatch}
          onInitiateReturn={initiateReturnProcess}
          onInitiateRefund={initiateRefundProcess}
          onResetScan={resetScan}
          onBrandNameChange={setBrandName}
          onProductIdChange={setProductId}
          formatTimestamp={formatTimestamp}
          formatGasUsed={formatGasUsed}
          formatFunctionName={formatFunctionName}
        />
      </main>
    </div>
  );
};

export default Verify;