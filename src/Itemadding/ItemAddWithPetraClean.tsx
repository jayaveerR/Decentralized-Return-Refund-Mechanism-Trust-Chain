import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAptosWallet } from "./useAptosWallet";
import { useTransaction } from "./useTransaction";
import { Navigation } from "./Navigation";
import { ItemForm } from "./ItemForm";
import { SuccessPayment } from "./SuccessPayment";
import { FailedTransaction } from "./FailedTransaction";
import { useAptTransaction } from "./AptTransaction";

interface ItemFormData {
  productId: string;
  orderId: string;
  brand: string;
  ownerWalletAddress: string;
}

const NETWORK = import.meta.env.VITE_APP_NETWORK || "Testnet";
const RECIPIENT_ADDRESS =
  "0x6b1ba42c8d262c346398f70df6103ded5bf022c08e43626a4b6a7a1eecc9790a";

export default function ItemAddWithPetraClean() {
  const [form, setForm] = useState<ItemFormData>({
    productId: "",
    orderId: "",
    brand: "",
    ownerWalletAddress: "",
  });

  const [copied, setCopied] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [paymentTransactionHash, setPaymentTransactionHash] = useState<
    string | null
  >(null);
  const [explorerUrl, setExplorerUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const {
    connected,
    address,
    connecting,
    connectWallet,
    disconnectWallet,
    checkProvider,
    maskAddress,
  } = useAptosWallet();

  const { storeTransactionHash, submitToBlockchain } = useTransaction();
  const navigate = useNavigate();

  // Initialize AptTransaction as a hook
  const { sendTransaction } = useAptTransaction({
    amount: "20000000", // 0.2 APT in octas
    recipientAddress: RECIPIENT_ADDRESS,
    onSuccess: handlePaymentSuccess,
    onError: handlePaymentError,
    onTransactionStart: () => {
      console.log("Payment transaction starting...");
      setPaymentProcessing(true);
      setPaymentError(null);
    },
    onTransactionEnd: () => {
      console.log("Payment transaction ended");
      setPaymentProcessing(false);
    },
  });

  // Set explorer URL
  useEffect(() => {
    const baseUrl = "https://explorer.aptoslabs.com";
    setExplorerUrl(`${baseUrl}/txn/`);
  }, []);

  // Auto-fill owner wallet address
  useEffect(() => {
    if (connected && address) {
      setForm((prev) => ({
        ...prev,
        ownerWalletAddress: address,
      }));
    }
  }, [connected, address]);

  function handlePaymentSuccess(hash: string) {
    console.log("Payment success handler called with hash:", hash);
    setPaymentTransactionHash(hash);
    setPaymentCompleted(true);
    setPaymentError(null);
    setShowPaymentSuccess(true);
    setShowPaymentError(false);
  }

  function handlePaymentError(error: string) {
    console.log("Payment error handler called with:", error);
    setPaymentError(error);
    setPaymentCompleted(false);
    setShowPaymentError(true);
    setShowPaymentSuccess(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.productId.trim()) return "Product ID is required";
    if (!form.orderId.trim()) return "Order ID is required";
    if (!form.brand.trim()) return "Brand is required";
    if (!form.ownerWalletAddress.trim())
      return "Owner wallet address is required";

    if (
      !form.ownerWalletAddress.startsWith("0x") ||
      form.ownerWalletAddress.length !== 66
    ) {
      return "Invalid wallet address format. Must start with 0x and be 66 characters long.";
    }

    return null;
  };

  // ✅ MAIN submit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if payment is completed
    if (!paymentCompleted) {
      setErrorMsg(
        "Please complete the payment first before adding to blockchain"
      );
      return;
    }

    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      return;
    }

    if (!connected) {
      setErrorMsg("Please connect your wallet first");
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    setTransactionHash(null);
    setShowSuccess(false);

    try {
      const result = await submitToBlockchain(form);
      setTransactionHash(result.hash);

      if (address) {
        storeTransactionHash(result.hash, address);
        console.log("Transaction hash stored:", result.hash);
      }

      setShowSuccess(true);

      // Reset form and payment status
      setTimeout(() => {
        setForm({
          productId: "",
          orderId: "",
          brand: "",
          ownerWalletAddress: address || "",
        });
        setPaymentCompleted(false);
        setPaymentTransactionHash(null);
      }, 1000);
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMsg(
        err?.message?.toLowerCase()?.includes("user rejected")
          ? "Transaction rejected by user."
          : err?.message?.includes("INSUFFICIENT_BALANCE")
          ? "Insufficient balance for transaction fees."
          : "Failed to submit transaction. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ PayNow handler
  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Pay Now button clicked");

    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      return;
    }

    if (!connected) {
      setErrorMsg("Please connect your wallet first");
      return;
    }

    setErrorMsg(null);
    setPaymentError(null);
    setShowPaymentError(false);

    try {
      console.log("Calling sendTransaction...");
      await sendTransaction();
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      setPaymentError(err.message || "Failed to initiate payment");
      setShowPaymentError(true);
    }
  };

  const viewOnExplorer = (hash: string) => {
    if (hash && explorerUrl) {
      window.open(
        `${explorerUrl}${hash}?network=${NETWORK.toLowerCase()}`,
        "_blank"
      );
    }
  };

  const navigateToMyOrders = () => navigate("/myorders");
  const closeSuccess = () => setShowSuccess(false);
  const closePaymentSuccess = () => {
    console.log("Closing payment success modal");
    setShowPaymentSuccess(false);
  };
  const closePaymentError = () => {
    console.log("Closing payment error modal");
    setShowPaymentError(false);
    setPaymentError(null);
  };

  const retryPayment = () => {
    console.log("Retrying payment...");
    setShowPaymentError(false);
    setPaymentError(null);
    // Create a proper event for retry
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent;
    handlePayNow(fakeEvent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      {/* Payment Success Overlay */}
      {showPaymentSuccess && paymentTransactionHash && (
        <SuccessPayment
          transactionHash={paymentTransactionHash}
          amount="0.2 APT"
          onViewExplorer={() => viewOnExplorer(paymentTransactionHash)}
          onContinue={closePaymentSuccess}
        />
      )}

      {/* Payment Error Overlay */}
      {showPaymentError && paymentError && (
        <FailedTransaction
          errorMessage={paymentError}
          onRetry={retryPayment}
          onCancel={closePaymentError}
        />
      )}

      {/* Original Success Overlay */}
      {showSuccess && (
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
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Success!
              </h3>
              <p className="text-green-600 font-medium mb-2">
                Item successfully added to blockchain!
              </p>
              <p className="text-gray-600 text-sm">
                Transaction has been confirmed on {NETWORK} network
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeSuccess}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Continue
              </button>
              <button
                onClick={() => viewOnExplorer(transactionHash || "")}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors duration-200"
              >
                View Explorer
              </button>
            </div>
          </div>
        </div>
      )}

      <Navigation
        checkProvider={checkProvider}
        connected={connected}
        address={address}
        showWalletOptions={showWalletOptions}
        setShowWalletOptions={setShowWalletOptions}
        copied={copied}
        setCopied={setCopied}
        disconnectWallet={disconnectWallet}
        maskAddress={maskAddress}
        connectWallet={connectWallet}
        connecting={connecting}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment Status Banner */}
        {paymentCompleted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top duration-500">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
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
              <div>
                <p className="text-green-800 font-medium">Payment Completed!</p>
                <p className="text-green-600 text-sm">
                  0.2 APT payment confirmed. You can now add item to blockchain.
                </p>
                {paymentTransactionHash && (
                  <p className="text-xs text-green-500 mt-1">
                    TX: {paymentTransactionHash.substring(0, 10)}...
                    {paymentTransactionHash.substring(
                      paymentTransactionHash.length - 8
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errorMsg}
          </div>
        )}

        {paymentProcessing && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing payment transaction...</span>
            </div>
          </div>
        )}

        <ItemForm
          form={form}
          connected={connected}
          submitting={submitting || paymentProcessing}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handlePayNow={handlePayNow}
          paymentCompleted={paymentCompleted}
        />
      </main>
    </div>
  );
}
