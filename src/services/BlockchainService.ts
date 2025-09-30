// Petra Wallet types
interface AptosWindow extends Window {
  aptos?: any;
}

declare const window: AptosWindow;

interface BlockchainServiceProps {
  walletConnected: boolean;
  walletAddress: string;
  onRecordingChange?: (recording: boolean) => void;
}

// Product verification data structure
interface ProductVerificationData {
  brandName: string;
  productId: string;
  userAddress: string;
  transactionHash: string;
  matchStatus: string;
  action: string;
}

// Helper function to ensure address has 0x prefix and is 66 chars (64 hex + 0x)
const normalizeAddress = (address: string): string => {
  if (!address || address === "undefined" || address === "null" || address === "0x") {
    // Return zero address if invalid
    return "0x0000000000000000000000000000000000000000000000000000000000000000";
  }
  
  // Remove 0x prefix if exists
  let cleaned = address.toLowerCase().replace(/^0x/, '');
  
  // Remove any non-hex characters (keep only 0-9, a-f)
  cleaned = cleaned.replace(/[^0-9a-f]/g, '');
  
  // If empty after cleaning, return zero address
  if (cleaned.length === 0) {
    return "0x0000000000000000000000000000000000000000000000000000000000000000";
  }
  
  // Pad to exactly 64 characters with leading zeros
  cleaned = cleaned.padStart(64, '0');
  
  // Ensure we have exactly 64 characters (truncate if somehow longer)
  if (cleaned.length > 64) {
    cleaned = cleaned.substring(0, 64);
  }
  
  return '0x' + cleaned;
};

// Helper to convert address string to proper format for Move (remove 0x prefix for arguments)
const formatAddressForMove = (address: string): string => {
  const normalized = normalizeAddress(address);
  // Remove 0x prefix for Move function arguments
  return normalized.startsWith('0x') ? normalized.substring(2) : normalized;
};

// Helper to sanitize string inputs - removes special characters
const sanitizeString = (value: any, defaultValue: string = "Unknown"): string => {
  if (!value || value === "undefined" || value === "null") {
    return defaultValue;
  }
  
  // Convert to string and trim
  const str = String(value).trim();
  
  if (str.length === 0) {
    return defaultValue;
  }
  
  // Remove or replace problematic characters, keep alphanumeric, spaces, hyphens, underscores
  return str.replace(/[^\w\s-]/g, '').substring(0, 100); // Limit length to 100 chars
};

export const useBlockchainService = ({
  walletConnected,
  walletAddress,
  onRecordingChange,
}: BlockchainServiceProps) => {
  // Get module address from environment variables
  const getModuleAddress = () => {
    const envAddress = import.meta.env.VITE_MODULE_ADDRESS || "0xfa1c12cc2e127047b02bc951d71d376cf25b9db220d213bfa972f45c0c55de38";
    // Normalize the module address too
    return normalizeAddress(envAddress);
  };

  // Check if Petra Wallet is installed
  const isPetraInstalled = () => {
    return typeof window !== "undefined" && !!window.aptos;
  };

  // Record verification result on blockchain using smart contract
  const recordOnBlockchain = async (action: string, data: any): Promise<{hash: string, success: boolean} | null> => {
    if (!walletConnected) {
      alert("Please connect your Petra Wallet first.");
      return null;
    }

    if (!isPetraInstalled()) {
      alert(
        "Petra Wallet is not installed. Please install it from https://petra.app/"
      );
      return null;
    }

    try {
      onRecordingChange?.(true);

      // Get and normalize module address
      const moduleAddress = getModuleAddress();
      
      // Sanitize all string inputs
      const brandName = sanitizeString(data.brandName, "Unknown");
      const productId = sanitizeString(data.productId, "Unknown");
      const transactionHash = sanitizeString(data.transactionHash, "pending");
      const matchStatus = sanitizeString(data.overallMatch || data.matchStatus, "unknown");
      const actionStr = sanitizeString(action, "verification");
      
      // Use the ORIGINAL connected wallet address, not the user input address
      // The user might enter a different address, but we should use the connected wallet
      const userAddressToUse = walletAddress; // Always use the connected wallet address
      const moveFormattedUserAddress = formatAddressForMove(userAddressToUse);
      
      // Log everything for debugging
      console.log("=== Transaction Preparation ===");
      console.log("Module Address:", moduleAddress);
      console.log("Brand Name:", brandName);
      console.log("Product ID:", productId);
      console.log("Connected Wallet Address (original):", walletAddress);
      console.log("Connected Wallet Address (normalized):", normalizeAddress(walletAddress));
      console.log("Connected Wallet Address (Move format):", moveFormattedUserAddress);
      console.log("User Input Address (if any):", data.userAddress);
      console.log("Transaction Hash:", transactionHash);
      console.log("Match Status:", matchStatus);
      console.log("Action:", actionStr);
      
      const payload = {
        type: "entry_function_payload",
        function: `${moduleAddress}::ProductVerification::record_verification`,
        arguments: [
          brandName,
          productId,
          moveFormattedUserAddress, // Use the connected wallet address (Move format)
          transactionHash,
          matchStatus,
          actionStr
        ],
        type_arguments: [],
      };

      console.log("=== Final Payload ===");
      console.log(JSON.stringify(payload, null, 2));

      // Send transaction using Petra Wallet
      const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);

      console.log("✓ Transaction submitted:", pendingTransaction);

      // Wait for transaction confirmation
      const transaction = await window.aptos.waitForTransaction(pendingTransaction.hash);

      console.log("✓ Transaction confirmed:", transaction);

      // Display transaction details
      showTransactionDetails(transaction.hash, actionStr, {
        brandName,
        productId,
        userAddress: normalizeAddress(walletAddress), // Show normalized connected wallet address
        transactionHash,
        overallMatch: matchStatus
      }, moduleAddress);

      return {
        hash: transaction.hash,
        success: transaction.success
      };
    } catch (error: any) {
      console.error("=== Transaction Error ===");
      console.error("Error:", error);
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);

      if (error.code === 4001) {
        alert("Transaction was rejected by user.");
      } else if (error.message?.includes('Hex characters are invalid')) {
        alert("❌ Invalid data format detected.\n\nPlease check:\n1. Your wallet is properly connected\n2. All input fields are filled correctly\n\nCheck the browser console for detailed error information.");
        console.error("=== Debug Information ===");
        console.error("Wallet Address:", walletAddress);
        console.error("Data received:", data);
      } else if (error.message?.includes('INSUFFICIENT_BALANCE')) {
        alert("❌ Insufficient balance in your wallet to pay for gas fees.");
      } else if (error.message?.includes('SEQUENCE_NUMBER_TOO_OLD')) {
        alert("❌ Transaction sequence error. Please refresh the page and try again.");
      } else if (error.message?.includes('TYPE_MISMATCH') || error.message?.includes('FAILED_TO_DESERIALIZE')) {
        alert("❌ Data type mismatch. Please ensure all fields are properly filled.");
      } else {
        alert(
          `❌ Failed to record on blockchain:\n\n${error.message || "Unknown error"}\n\nCheck the console for more details.`
        );
      }
      return null;
    } finally {
      onRecordingChange?.(false);
    }
  };

  // Enhanced function that returns transaction hash
  const recordProductVerification = async (
    action: string,
    productData: {
      brandName: string;
      productId: string;
      userAddress: string;
      transactionHash: string;
      overallMatch: string;
    }
  ): Promise<string | null> => {
    const result = await recordOnBlockchain(action, productData);
    return result ? result.hash : null;
  };

  // Display transaction details
  const showTransactionDetails = (transactionHash: string, action: string, data: any, moduleAddr: string) => {
    // Remove any existing transaction details
    const existing = document.querySelectorAll('.transaction-details-section');
    existing.forEach(el => el.remove());

    const transactionSection = document.createElement('div');
    transactionSection.className = 'transaction-details-section';
    transactionSection.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 shadow-lg animate-fade-in">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce-once">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-green-800">Transaction Successful! 🎉</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="bg-white p-3 rounded-lg">
            <p class="font-medium text-gray-600 text-sm mb-1">Action</p>
            <p class="text-gray-900 font-semibold">${action}</p>
          </div>
          <div class="bg-white p-3 rounded-lg">
            <p class="font-medium text-gray-600 text-sm mb-1">Transaction Hash</p>
            <p class="font-mono text-xs text-gray-900 break-all">${transactionHash}</p>
          </div>
          <div class="bg-white p-3 rounded-lg">
            <p class="font-medium text-gray-600 text-sm mb-1">Brand</p>
            <p class="text-gray-900 font-semibold">${data.brandName || "Unknown"}</p>
          </div>
          <div class="bg-white p-3 rounded-lg">
            <p class="font-medium text-gray-600 text-sm mb-1">Product ID</p>
            <p class="text-gray-900 font-semibold">${data.productId || "Unknown"}</p>
          </div>
          <div class="bg-white p-3 rounded-lg">
            <p class="font-medium text-gray-600 text-sm mb-1">Connected Wallet</p>
            <p class="font-mono text-xs text-gray-900 break-all">${data.userAddress || "Unknown"}</p>
          </div>
          <div class="bg-white p-3 rounded-lg">
            <p class="font-medium text-gray-600 text-sm mb-1">Match Status</p>
            <p class="text-gray-900 font-semibold">${data.overallMatch || "unknown"}</p>
          </div>
          <div class="bg-white p-3 rounded-lg md:col-span-2">
            <p class="font-medium text-gray-600 text-sm mb-1">Smart Contract</p>
            <p class="font-mono text-xs text-gray-900 break-all">${moduleAddr}</p>
          </div>
        </div>

        <div class="flex gap-3 flex-wrap">
          <button onclick="window.open('https://explorer.aptoslabs.com/txn/${transactionHash}?network=testnet', '_blank')" 
                  class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105">
            🔍 View on Explorer
          </button>
          <button onclick="navigator.clipboard.writeText('${transactionHash}').then(() => { const btn = this; const orig = btn.innerHTML; btn.innerHTML = '✓ Copied!'; setTimeout(() => btn.innerHTML = orig, 2000); })" 
                  class="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
            📋 Copy Hash
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  class="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg">
            ✕ Close
          </button>
        </div>
      </div>
    `;

    // Add to the page
    const mainContainer = document.querySelector('.max-w-6xl.mx-auto') || document.body;
    if (mainContainer) {
      mainContainer.insertBefore(transactionSection, mainContainer.firstChild);
      // Scroll to transaction details
      transactionSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Specialized recording functions that return transaction hash
  const recordMismatch = async (mismatchData: {
    brandName: string;
    productId: string;
    userAddress: string;
    transactionHash: string;
    mismatchFields: string[];
    overallMatch: string;
  }): Promise<string | null> => {
    const result = await recordOnBlockchain("Product Mismatch Detected", mismatchData);
    return result ? result.hash : null;
  };

  const recordSuccess = async (successData: {
    brandName: string;
    productId: string;
    userAddress: string;
    transactionHash: string;
    overallMatch: string;
  }): Promise<string | null> => {
    const result = await recordOnBlockchain("Product Verification Success", successData);
    return result ? result.hash : null;
  };

  const recordReturnInitiation = async (returnData: {
    brandName: string;
    productId: string;
    userAddress: string;
    transactionHash: string;
    mismatchFields: string[];
  }): Promise<string | null> => {
    const result = await recordOnBlockchain("Return Initiated", returnData);
    return result ? result.hash : null;
  };

  const recordRefundInitiation = async (refundData: {
    brandName: string;
    productId: string;
    userAddress: string;
    transactionHash: string;
    mismatchFields: string[];
  }): Promise<string | null> => {
    const result = await recordOnBlockchain("Refund Initiated", refundData);
    return result ? result.hash : null;
  };

  // Connect to Petra Wallet
  const connectWallet = async (): Promise<string | null> => {
    if (!isPetraInstalled()) {
      alert(
        "Petra Wallet is not installed. Please install it from https://petra.app/"
      );
      return null;
    }

    try {
      const response = await window.aptos.connect();
      const address = response.address;
      console.log("✓ Wallet connected:", address);
      console.log("✓ Normalized address:", normalizeAddress(address));
      console.log("✓ Move formatted address:", formatAddressForMove(address));
      return address;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
      return null;
    }
  };

  // Disconnect wallet
  const disconnectWallet = async (): Promise<void> => {
    if (isPetraInstalled()) {
      try {
        await window.aptos.disconnect();
        console.log("✓ Wallet disconnected");
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  };

  return {
    recordOnBlockchain,
    recordProductVerification,
    recordMismatch,
    recordSuccess,
    recordReturnInitiation,
    recordRefundInitiation,
    connectWallet,
    disconnectWallet,
    isPetraInstalled,
    getModuleAddress, // Export for debugging
    normalizeAddress, // Export for debugging
    formatAddressForMove, // Export for debugging
  };
};

// Export types and helper
export type { BlockchainServiceProps, ProductVerificationData };
export { normalizeAddress, formatAddressForMove };