"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    Aptos?: {
      connect?: () => Promise<{ address: string; publicKey?: string }>;
      account?: () => Promise<{ address: string; publicKey?: string } | null>;
      isConnected?: () => Promise<boolean>;
      disconnect?: () => Promise<void>;
      onDisconnect?: (cb: () => void) => void;
      onAccountChange?: (cb: (account: any) => void) => void;
      signAndSubmitTransaction?: (transaction: any) => Promise<any>;
    };
  }
}

interface ItemForm {
  productId: string;
  orderId: string;
  brand: string;
  ownerWalletAddress: string;
}

interface TransactionResponse {
  hash: string;
  success?: boolean;
}

// Environment variables
const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS!;
const NETWORK = import.meta.env.VITE_APP_NETWORK || "Testnet";

// Storage key for transaction hashes only
const TRANSACTION_HASHES_STORAGE_KEY = "blockverify_transaction_hashes";

export default function ItemAddWithPetraClean() {
  const [form, setForm] = useState<ItemForm>({
    productId: "",
    orderId: "",
    brand: "",
    ownerWalletAddress: "",
  });

  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string>("");

  const checkProvider = useCallback(() => !!window?.aptos, []);
  const navigate = useNavigate();

  // Set explorer URL based on network
  useEffect(() => {
    const baseUrl =
      NETWORK.toLowerCase() === "mainnet"
        ? "https://explorer.aptoslabs.com"
        : "https://explorer.aptoslabs.com";
    setExplorerUrl(`${baseUrl}/txn/`);
  }, []);

  // Store only transaction hash in localStorage
  const storeTransactionHash = useCallback(
    (hash: string, walletAddress: string) => {
      try {
        const storedHashes = JSON.parse(
          localStorage.getItem(TRANSACTION_HASHES_STORAGE_KEY) || "{}"
        );

        if (!storedHashes[walletAddress]) {
          storedHashes[walletAddress] = [];
        }

        // Add new hash to the beginning of the array (avoid duplicates)
        if (!storedHashes[walletAddress].includes(hash)) {
          storedHashes[walletAddress] = [hash, ...storedHashes[walletAddress]];

          // Keep only last 50 transactions per wallet to prevent localStorage overflow
          storedHashes[walletAddress] = storedHashes[walletAddress].slice(
            0,
            50
          );

          localStorage.setItem(
            TRANSACTION_HASHES_STORAGE_KEY,
            JSON.stringify(storedHashes)
          );
        }

        return true;
      } catch (error) {
        console.error("Error storing transaction hash:", error);
        return false;
      }
    },
    []
  );

  const refreshConnectionState = useCallback(async () => {
    if (!checkProvider()) {
      setConnected(false);
      setAddress(null);
      return;
    }
    try {
      const isConn = await window.aptos!.isConnected?.();
      if (isConn) {
        const acct = await window.aptos!.account?.();
        const addr = acct?.address ?? null;
        setConnected(true);
        setAddress(addr);
        // ❌ Removed auto-fill of ownerWalletAddress
      } else {
        setConnected(false);
        setAddress(null);
      }
    } catch {
      setConnected(false);
      setAddress(null);
    }
  }, [checkProvider]);

  useEffect(() => {
    refreshConnectionState();
    if (!checkProvider()) return;

    const onDisconnect = () => {
      setConnected(false);
      setAddress(null);
      setForm((prev) => ({ ...prev, ownerWalletAddress: "" }));
    };

    const onAccountChange = (newAccount: any) => {
      if (newAccount?.address) {
        setConnected(true);
        setAddress(newAccount.address);
        setForm((prev) => ({
          ...prev,
          ownerWalletAddress: newAccount.address,
        }));
      } else {
        onDisconnect();
      }
    };

    try {
      window.aptos!.onDisconnect?.(onDisconnect);
      window.aptos!.onAccountChange?.(onAccountChange);
    } catch (e) {
      // ignore
    }
  }, [checkProvider, refreshConnectionState]);

  const connectWallet = async () => {
    setErrorMsg(null);
    if (!checkProvider()) {
      setErrorMsg(
        "Petra wallet not installed. Install from https://petra.app/"
      );
      return;
    }
    setConnecting(true);
    try {
      const resp = await window.aptos!.connect!();
      const addr = resp?.address ?? null;
      setConnected(true);
      setAddress(addr);
      // ❌ Removed auto-fill of ownerWalletAddress
      setShowWalletOptions(false);
    } catch (err: any) {
      console.error("connectWallet error:", err);
      setErrorMsg(
        err?.message?.toLowerCase()?.includes("user rejected")
          ? "Connection rejected by user."
          : "Failed to connect to wallet."
      );
      setConnected(false);
      setAddress(null);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    setErrorMsg(null);
    if (!checkProvider()) return;

    try {
      await window.aptos!.disconnect?.();
    } catch (e) {
      console.error("Disconnect error:", e);
    }

    setConnected(false);
    setAddress(null);
    setShowWalletOptions(false);
    setForm((prev) => ({ ...prev, ownerWalletAddress: "" }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const maskAddress = (addr?: string | null) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
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
      return "Invalid wallet address format";
    }

    return null;
  };

  const submitToBlockchain = async (
    formData: ItemForm
  ): Promise<TransactionResponse> => {
    if (!window.aptos?.signAndSubmitTransaction) {
      throw new Error("Wallet does not support transaction signing");
    }

    const transaction = {
      arguments: [
        formData.productId,
        formData.orderId,
        formData.brand,
        formData.ownerWalletAddress,
      ],
      function: `${MODULE_ADDRESS}::product_return::add_item`,
      type: "entry_function_payload",
      type_arguments: [],
    };

    console.log("Submitting transaction:", transaction);

    try {
      const response = await window.aptos.signAndSubmitTransaction(transaction);
      return { hash: response.hash, success: true };
    } catch (error: any) {
      console.error("Transaction error:", error);
      throw new Error(error.message || "Transaction failed");
    }
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

      // Store only the transaction hash with wallet address
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
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                BlockVerify
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-500">Network:</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                {NETWORK}
              </span>
            </div>

            <div className="hidden md:flex space-x-8">
              {["Home", "Admin", "MyOrders", "Learn"].map((item) => (
                <button
                  onClick={() => {
                    if (item === "Home") navigate("/");
                    else if (item === "Admin") navigate("/itemadd");
                    else if (item === "MyOrders") navigate("/myorders");
                  }}
                  key={item}
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {!checkProvider() ? (
                <a
                  href="https://petra.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Install Petra
                </a>
              ) : connected ? (
                <div className="relative">
                  <button
                    onClick={() => setShowWalletOptions(!showWalletOptions)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>{maskAddress(address)}</span>
                  </button>

                  <AnimatePresence>
                    {showWalletOptions && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm text-gray-600">
                            Connected Wallet
                          </p>
                          <p className="text-sm font-mono text-gray-900 truncate">
                            {maskAddress(address)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Network: {NETWORK}
                          </p>
                        </div>
                        <button
                          onClick={copyAddress}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {copied ? "Copied!" : "Copy Address"}
                        </button>
                        <button
                          onClick={navigateToMyOrders}
                          className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          View My Orders
                        </button>
                        <button
                          onClick={disconnectWallet}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Disconnect Wallet
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={connecting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {transactionHash && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 font-medium">
                  Transaction Successful!
                </p>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Add Item to Trust-Chain
            </h1>
            <p className="text-gray-600">
              Register your product on the {NETWORK} blockchain for authenticity
              tracking
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Module: {maskAddress(MODULE_ADDRESS)}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID *
                </label>
                <input
                  type="text"
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                  required
                  disabled={!connected || submitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
       disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Unique product identifier"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID *
                </label>
                <input
                  type="text"
                  name="orderId"
                  value={form.orderId}
                  onChange={handleChange}
                  required
                  disabled={!connected || submitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
       disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Order identification number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                  disabled={!connected || submitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
       disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter Item Brand"
                />
              </div>

              {/* Owner Wallet Address field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Wallet Address *
                </label>
                <input
                  type="text"
                  name="ownerWalletAddress"
                  value={form.ownerWalletAddress}
                  onChange={handleChange}
                  required
                  disabled={!connected || submitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
       disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter wallet address (0x...)"
                />
                {/* ❌ Removed "Use connected wallet" suggestion */}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={!connected || submitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium 
             hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed
             flex items-center space-x-2 min-w-[200px] justify-center"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Transaction...</span>
                  </>
                ) : (
                  <span className="cursor-pointer">Add to Blockchain</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
