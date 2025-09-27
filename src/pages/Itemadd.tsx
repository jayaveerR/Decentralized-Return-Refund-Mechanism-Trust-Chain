"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    Aptos?: {
      connect?: () => Promise<{ address: string; publicKey?: string }>;
      account?: () => Promise<{ address: string; publicKey?: string } | null>;
      isConnected?: () => Promise<boolean>;
      disconnect?: () => Promise<void>;
      onDisconnect?: (cb: () => void) => void;
      onAccountChange?: (cb: (account: any) => void) => void;
    };
  }
}

interface ItemForm {
  productId: string;
  orderId: string;
  brand: string;
  pickupDate: string;
  ownerWalletAddress: string;
}

export default function ItemAddWithPetraClean() {
  const [form, setForm] = useState<ItemForm>({
    productId: "",
    orderId: "",
    brand: "",
    pickupDate: "",
    ownerWalletAddress: "",
  });

  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);

  const checkProvider = useCallback(() => !!window?.aptos, []);

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
    };

    const onAccountChange = (newAccount: any) => {
      if (newAccount?.address) {
        setConnected(true);
        setAddress(newAccount.address);
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
    if (!form.pickupDate.trim()) return "Pickup date is required";
    if (!form.ownerWalletAddress.trim())
      return "Owner wallet address is required";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg(null);
    alert("Blockchain Item generated successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                BlockVerify
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              {["Home", "Admin", "MyOrders", "Learn"].map((item) => (
                <button
                  key={item}
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Wallet Connection */}
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

                  {/* Wallet Options Dropdown */}
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
                        </div>
                        <button
                          onClick={copyAddress}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {copied ? "Copied!" : "Copy Address"}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Add Item to Trust-Chain
            </h1>
            <p className="text-gray-600">
              Register your product on the blockchain for authenticity tracking
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product ID */}
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
                  disabled={!connected} // 🔒 disable if wallet not connected
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
       disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Unique product identifier"
                />
              </div>

              {/* Order ID */}
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
                  disabled={!connected} // 🔒
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
       disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Order identification number"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                  disabled={!connected} // 🔒
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
       disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter Item Brand"
                />
              </div>

              {/* Pickup Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Date *
                </label>
                <input
                  type="date"
                  name="pickupDate"
                  value={form.pickupDate}
                  onChange={handleChange}
                  required
                  disabled={!connected} // 🔒
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
       disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Owner Wallet Address */}
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
                  disabled={!connected} // 🔒
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg 
       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
       disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter wallet address"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={!connected}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium 
             hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add BlockChain
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
