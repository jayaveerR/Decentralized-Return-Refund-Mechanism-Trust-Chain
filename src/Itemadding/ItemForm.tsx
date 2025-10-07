import React, { useState } from "react";

interface ItemFormProps {
  form: {
    productId: string;
    orderId: string;
    brand: string;
    ownerWalletAddress: string;
  };
  connected: boolean;
  submitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handlePayNow: (e: React.FormEvent) => void;
  paymentCompleted?: boolean;
}

// Brand input component
export const BrandInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^[A-Za-z\s]*$/.test(input)) {
      onChange(input);
      setError("");
    } else {
      setError("Only letters are allowed for Brand");
    }
  };

  return (
    <>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        placeholder="Enter Item Brand"
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        required
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </>
  );
};

export const ItemForm: React.FC<ItemFormProps> = ({
  form,
  connected,
  submitting,
  handleChange,
  handleSubmit,
  handlePayNow,
  paymentCompleted = false,
}) => {
  const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS!;
  const NETWORK = import.meta.env.VITE_APP_NETWORK || "Testnet";

  const [orderError, setOrderError] = useState("");

  const maskAddress = (addr?: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Add Item to Trust-Chain
        </h1>
        <p className="text-gray-600">
          Register your product on the {NETWORK} blockchain for authenticity tracking
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Module: {maskAddress(MODULE_ADDRESS)}
        </div>
      </div>

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
              disabled={!connected || submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Unique product identifier"
              autoComplete="off"
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
              onChange={(e) => {
                const input = e.target.value;
                if (/^[A-Za-z0-9-]*$/.test(input)) {
                  handleChange(e);
                  setOrderError("");
                } else {
                  setOrderError("Only letters, numbers, and hyphens are allowed");
                }
              }}
              required
              disabled={!connected || submitting}
              placeholder="Order identification number"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                orderError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {orderError && <p className="text-red-500 text-sm mt-1">{orderError}</p>}
          </div>

          {/* Brand */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <BrandInput
              value={form.brand}
              onChange={(value) =>
                handleChange({
                  target: { name: "brand", value },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              disabled={!connected || submitting}
            />
          </div>

          {/* Wallet Address */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter wallet address (0x...)"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 pt-4">
          {/* Pay Now 0.2 APT */}
          <button
            type="button"
            onClick={handlePayNow}
            disabled={!connected || submitting || paymentCompleted}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[200px] justify-center"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </>
            ) : paymentCompleted ? (
              <>
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Payment Completed</span>
              </>
            ) : (
              <span>Pay Now 0.2 APT</span>
            )}
          </button>

          {/* Add to Blockchain */}
          <button
            type="submit"
            disabled={!connected || submitting || !paymentCompleted}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[200px] justify-center"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Transaction...</span>
              </>
            ) : (
              <span>Add to Blockchain</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
