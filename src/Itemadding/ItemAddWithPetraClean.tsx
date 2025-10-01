import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAptosWallet } from "./useAptosWallet";
import { useTransaction } from "./useTransaction";
import { Navigation } from "./Navigation";
import { ItemForm } from "./ItemForm";

interface ItemFormData {
  productId: string;
  orderId: string;
  brand: string;
  ownerWalletAddress: string;
}

const NETWORK = import.meta.env.VITE_APP_NETWORK || "Testnet";

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
  const [explorerUrl, setExplorerUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Set explorer URL
  useEffect(() => {
    const baseUrl =
      NETWORK.toLowerCase() === "mainnet"
        ? "https://explorer.aptoslabs.com"
        : "https://explorer.aptoslabs.com";
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

  // Hide success overlay after 5s
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

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

      // Reset form
      setTimeout(() => {
        setForm({
          productId: "",
          orderId: "",
          brand: "",
          ownerWalletAddress: address || "",
        });
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

  // ✅ PayNow handler (separate, not nested!)
  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Pay Now clicked:", form);
    // You can add custom payment logic here
  
    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      return;
    }

  };

  const viewOnExplorer = () => {
    if (transactionHash && explorerUrl) {
      window.open(
        `${explorerUrl}${transactionHash}?network=${NETWORK.toLowerCase()}`,
        "_blank"
      );
    }
  };

  const navigateToMyOrders = () => navigate("/myorders");
  const closeSuccess = () => setShowSuccess(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      {/* Success Animation Overlay */}
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

                {/* Pulsing rings */}
                <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-0 border-2 border-green-300 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Success Text */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2 animate-in fade-in-0 duration-500">
                Success!
              </h3>
              <p className="text-green-600 font-medium mb-2 animate-in fade-in-0 duration-700">
                Item successfully added to blockchain!
              </p>
              <p className="text-gray-600 text-sm animate-in fade-in-0 duration-900">
                Transaction has been confirmed on {NETWORK} network
              </p>

              {/* Transaction Hash */}
              {transactionHash && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg animate-in fade-in-0 duration-1100">
                  <p className="text-xs text-gray-500 mb-1">
                    Transaction Hash:
                  </p>
                  <p className="font-mono text-xs break-all text-gray-700">
                    {transactionHash}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 animate-in fade-in-0 duration-1300">
              <button
                onClick={closeSuccess}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                Continue
              </button>
              <button
                onClick={viewOnExplorer}
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
        {/* Static Success Banner (alternative to modal) */}
        {transactionHash && !showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top duration-500">
            <div className="flex items-center justify-between">
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
                  <p className="text-green-800 font-medium">
                    Transaction Successful!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Item successfully added to blockchain on {NETWORK}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={viewOnExplorer}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                >
                  View Explorer
                </button>
                <button
                  onClick={navigateToMyOrders}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  View My Orders
                </button>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-in slide-in-from-top duration-500">
            {errorMsg}
          </div>
        )}

        <ItemForm
          form={form}
          connected={connected}
          submitting={submitting}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
           handlePayNow={handlePayNow} // ✅ added
        />
      </main>
    </div>
  );
}