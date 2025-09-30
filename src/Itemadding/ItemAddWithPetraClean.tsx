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

  const {
    connected,
    address,
    connecting,
    errorMsg,
    setErrorMsg,
    connectWallet,
    disconnectWallet,
    checkProvider,
  } = useAptosWallet();

  const { storeTransactionHash, submitToBlockchain } = useTransaction();
  const navigate = useNavigate();

  // Set explorer URL based on network
  useEffect(() => {
    const baseUrl =
      NETWORK.toLowerCase() === "mainnet"
        ? "https://explorer.aptoslabs.com"
        : "https://explorer.aptoslabs.com";
    setExplorerUrl(`${baseUrl}/txn/`);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const maskAddress = (addr?: string | null) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const validateForm = () => {
    if (!form.productId.trim()) return "Product ID is required";
    if (!form.orderId.trim()) return "Order ID is required";
    if (!form.brand.trim()) return "Brand is required";
    if (!form.ownerWalletAddress.trim()) return "Owner wallet address is required";

    if (
      !form.ownerWalletAddress.startsWith("0x") ||
      form.ownerWalletAddress.length !== 66
    ) {
      return "Invalid wallet address format";
    }

    return null;
  };

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

    try {
      const result = await submitToBlockchain(form);
      setTransactionHash(result.hash);

      if (address) {
        storeTransactionHash(result.hash, address);
        console.log("Transaction hash stored:", result.hash);
      }

      alert(
        `Item successfully added to blockchain!\nTransaction Hash: ${result.hash}`
      );

      setForm({
        productId: "",
        orderId: "",
        brand: "",
        ownerWalletAddress: address || "",
      });
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

  const viewOnExplorer = () => {
    if (transactionHash && explorerUrl) {
      window.open(
        `${explorerUrl}${transactionHash}?network=${NETWORK.toLowerCase()}`,
        "_blank"
      );
    }
  };

  const navigateToMyOrders = () => {
    navigate("/myorders");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {transactionHash && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 font-medium">Transaction Successful!</p>
                <p className="text-green-600 text-sm mt-1">
                  Item successfully added to blockchain on {NETWORK}
                </p>
                <p className="font-mono text-xs mt-2 break-all text-green-700">
                  Hash: {transactionHash}
                </p>
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errorMsg}
          </div>
        )}

        <ItemForm
          form={form}
          connected={connected}
          submitting={submitting}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}