import React from "react";

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
  handlePayNow: (e: React.FormEvent) => void; // ✅ required now
}

export const ItemForm: React.FC<ItemFormProps> = ({
  form,
  connected,
  submitting,
  handleChange,
  handleSubmit,
  handlePayNow,
}) => {
  const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS!;
  const NETWORK = import.meta.env.VITE_APP_NETWORK || "Testnet";

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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              onChange={handleChange}
              required
              disabled={!connected || submitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Order identification number"
            />
          </div>

          {/* Brand */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter wallet address (0x...)"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4 pt-4">
          {/* Add to Blockchain */}
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

          {/* Pay Now 0.2 APT */}
          <button
            type="button"
            onClick={handlePayNow}
            disabled={!connected || submitting}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium 
              hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed
              flex items-center space-x-2 min-w-[200px] justify-center"
          >
            
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Transaction...</span>
              </>
            ) : (
            <span className="cursor-pointer">Pay Now 0.2 APT</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
