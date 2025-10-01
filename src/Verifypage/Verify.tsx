
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import ScanningCamera from "./components/ScanningCamera";
import NavbarWallet from "./components/NavbarWallet";
import { useBlockchainService } from "./services/BlockchainService";
import { useTransactionAnalysis } from "./services/TransactionAnalysisService";
import type { TransactionDetails } from "./services/TransactionAnalysisService";
import HeroSection from "./HeroSection";
import ScanButton from "./components/ScanButton";
import TransactionVerificationSection from "./services/TransactionVerificationSection";

// Types for product verification
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

const Verify = () => {

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
  const [userAddress, setUserAddress] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [showReEnterForm, setShowReEnterForm] = useState(false);
  const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(null);

  // Wallet states
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isWalletConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Services with proper toast integration
  const { 
    recordMismatch, 
    recordSuccess, 
    recordReturnInitiation, 
    recordRefundInitiation 
  } = useBlockchainService({
    walletConnected,
    walletAddress,
    onRecordingChange: setIsRecording,
    // Pass toast functions to the service
  });

  const {
    fetchRealTransactionDetails,
    analyzeProductFromPayload,
    extractTransactionHash,
  } = useTransactionAnalysis({
    enableLogging: true,
    apiEndpoint: "https://api.testnet.aptoslabs.com/v1",
  });

  // Wallet connection handler
  const handleWalletConnect = (connected: boolean, address: string) => {
    setWalletConnected(connected);
    setWalletAddress(address);
    if (connected) {
      toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } else {
      toast.success('Wallet disconnected');
    }
  };

  const handleQRCodeDetected = (data: string) => {
    setIsLoading(true);
    setScannedData(data);
    setFetchError(null);

    const extractedHash = extractTransactionHash(data);
    if (extractedHash) {
      setScannedData(extractedHash);
      setTransactionDetails(null);
      toast.success('QR code scanned successfully!');
    } else {
      setCameraError("Invalid QR code content. Please scan a valid transaction hash QR code.");
      toast.error('Invalid QR code format');
      setIsLoading(false);
      return;
    }

    setIsScanning(false);
    setIsLoading(false);
  };

  const handleFetchData = async () => {
    if (!scannedData) {
      toast.error('No scanned data available');
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    setTransactionDetails(null);

    try {
      const details = await fetchRealTransactionDetails(scannedData);
      if (details && typeof details === "object" && details.data) {
        setTransactionDetails(details.data);
        toast.success('Transaction details fetched successfully!');
      } else {
        setFetchError(details?.error || 'No transaction details found for this hash.');
        toast.error('No transaction details found.');
      }
    } catch (error: any) {
      setFetchError(error?.message || 'Failed to fetch transaction details.');
      toast.error('Failed to fetch transaction details.');
    } finally {
      setIsLoading(false);
    }
  };

  

  const verifyProductMatch = () => {
    if (!brandName || !productId || !userAddress || !transactionDetails) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { extractedBrand, extractedProductId } = analyzeProductFromPayload(
      transactionDetails.payload
    );

    const normalizedUserBrand = brandName.toLowerCase().trim();
    const normalizedExtractedBrand = extractedBrand.toLowerCase().trim();

    const isBrandMatch = normalizedExtractedBrand === normalizedUserBrand;
    const isProductIdMatch = extractedProductId === productId;
    const isAddressValid = userAddress.trim().length > 0;

    const mismatchFields: string[] = [];
    if (!isBrandMatch) mismatchFields.push("Brand Name");
    if (!isProductIdMatch) mismatchFields.push("Product ID");

    const matchStatus = mismatchFields.length === 0 ? "valid" : "mismatch";

    const returnEligible = mismatchFields.length > 0;
    const refundEligible = mismatchFields.length >= 2;

    const productInfo: ProductInfo = {
      brandName,
      productId,
      userAddress,
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
      addressValid: isAddressValid,
      overallMatch: matchStatus,
      mismatchFields,
      userEnteredAddress: userAddress,
    });
    setShowReEnterForm(false);

    if (matchStatus === "valid") {
      toast.success('Product verification successful! All details match.');
    } else {
      toast.error(`Verification failed: ${mismatchFields.join(', ')} mismatch`);
    }
  };

  const reEnterProductInfo = () => {
    setShowReEnterForm(true);
    setVerificationResult(null);
    setProductInfo(null);
    toast('Please re-enter product information');
  };

  const initiateReturnProcess = async () => {
    if (!productInfo) return;

    setProductInfo((prev) =>
      prev ? { ...prev, returnStatus: "processing" } : null
    );

    if (walletConnected) {
      const txHash = await recordReturnInitiation({
        brandName: productInfo.brandName,
        productId: productInfo.productId,
        userAddress: productInfo.userAddress,
        transactionHash: scannedData || "unknown",
        mismatchFields: productInfo.mismatchFields,
      });

      if (txHash) {
        setLastTransactionHash(txHash);
        setTimeout(() => {
          setProductInfo((prev) =>
            prev ? { ...prev, returnStatus: "completed" } : null
          );
        }, 3000);
      } else {
        setProductInfo((prev) =>
          prev ? { ...prev, returnStatus: "eligible" } : null
        );
      }
    } else {
      setTimeout(() => {
        setProductInfo((prev) =>
          prev ? { ...prev, returnStatus: "completed" } : null
        );
        toast.success('Return process completed!');
      }, 3000);
    }
  };

  const initiateRefundProcess = async () => {
    if (!productInfo) return;

    setProductInfo((prev) =>
      prev ? { ...prev, refundStatus: "processing" } : null
    );

    if (walletConnected) {
      const txHash = await recordRefundInitiation({
        brandName: productInfo.brandName,
        productId: productInfo.productId,
        userAddress: productInfo.userAddress,
        transactionHash: scannedData || "unknown",
        mismatchFields: productInfo.mismatchFields,
      });

      if (txHash) {
        setLastTransactionHash(txHash);
        setTimeout(() => {
          setProductInfo((prev) =>
            prev ? { ...prev, refundStatus: "completed" } : null
          );
        }, 3000);
      } else {
        setProductInfo((prev) =>
          prev ? { ...prev, refundStatus: "eligible" } : null
        );
      }
    } else {
      setTimeout(() => {
        setProductInfo((prev) =>
          prev ? { ...prev, refundStatus: "completed" } : null
        );
        toast.success('Refund process completed!');
      }, 3000);
    }
  };

  const handleRecordMismatch = async () => {
    if (!productInfo || !verificationResult) return;

    const txHash = await recordMismatch({
      brandName: productInfo.brandName,
      productId: productInfo.productId,
      userAddress: productInfo.userAddress,
      transactionHash: scannedData || "unknown",
      mismatchFields: productInfo.mismatchFields,
      overallMatch: verificationResult.overallMatch,
    });

    if (txHash) {
      setLastTransactionHash(txHash);
    }
  };

  const handleRecordSuccess = async () => {
    if (!productInfo || !verificationResult) return;

    const txHash = await recordSuccess({
      brandName: productInfo.brandName,
      productId: productInfo.productId,
      userAddress: productInfo.userAddress,
      transactionHash: scannedData || "unknown",
      overallMatch: verificationResult.overallMatch,
    });

    if (txHash) {
      setLastTransactionHash(txHash);
    }
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
    setUserAddress("");
    setLastTransactionHash(null);
    toast('Camera activated - scan a QR code');
  };

  const handleCloseCamera = () => {
    setIsScanning(false);
    setCameraError(null);
    toast('Camera closed');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Transaction hash copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy to clipboard');
    });
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
    setUserAddress("");
    setLastTransactionHash(null);
    toast('Scan reset - ready for new verification');
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
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            duration: Infinity,
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#fff',
            },
          },
        }}
      />

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

        {/* Show last transaction hash if available */}
        {lastTransactionHash && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-green-800">Transaction Recorded</h3>
              </div>
              <div className="mb-4">
                <p className="font-medium text-gray-700 mb-2">Transaction Hash:</p>
                <p className="font-mono text-sm text-gray-800 break-all bg-green-100 p-3 rounded-lg">
                  {lastTransactionHash}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button 
                  onClick={() => window.open(`https://explorer.aptoslabs.com/txn/${lastTransactionHash}?network=testnet`, '_blank')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View on Explorer
                </button>
                <button 
                  onClick={() => copyToClipboard(lastTransactionHash)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Copy Hash
                </button>
                <button 
                  onClick={() => setLastTransactionHash(null)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
          userAddress={userAddress}
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
          onUserAddressChange={setUserAddress}
          formatTimestamp={formatTimestamp}
          formatGasUsed={formatGasUsed}
          formatFunctionName={formatFunctionName}
        />
      </main>
    </div>
  );
};

export default Verify;