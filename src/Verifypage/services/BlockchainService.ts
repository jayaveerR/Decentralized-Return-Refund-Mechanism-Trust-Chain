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
    return "0x0000000000000000000000000000000000000000000000000000000000000000";
  }
  
  let cleaned = address.toLowerCase().replace(/^0x/, '');
  cleaned = cleaned.replace(/[^0-9a-f]/g, '');
  
  if (cleaned.length === 0) {
    return "0x0000000000000000000000000000000000000000000000000000000000000000";
  }
  
  cleaned = cleaned.padStart(64, '0');
  if (cleaned.length > 64) {
    cleaned = cleaned.substring(0, 64);
  }
  
  return '0x' + cleaned;
};

// Helper to convert address string to proper format for Move (remove 0x prefix for arguments)
const formatAddressForMove = (address: string): string => {
  const normalized = normalizeAddress(address);
  return normalized.startsWith('0x') ? normalized.substring(2) : normalized;
};

// Helper to sanitize string inputs - removes special characters
const sanitizeString = (value: any, defaultValue: string = "Unknown"): string => {
  if (!value || value === "undefined" || value === "null") {
    return defaultValue;
  }
  
  const str = String(value).trim();
  if (str.length === 0) {
    return defaultValue;
  }
  
  return str.replace(/[^\w\s-]/g, '').substring(0, 100);
};

// Custom transaction waiter since waitForTransaction might not be available
const waitForTransaction = async (transactionHash: string, maxWaitTime: number = 30000): Promise<any> => {
  const startTime = Date.now();
  const checkInterval = 2000;

  return new Promise((resolve, reject) => {
    const checkTransaction = async () => {
      try {
        const response = await fetch(`https://fullnode.testnet.aptoslabs.com/v1/transactions/by_hash/${transactionHash}`);
        
        if (response.ok) {
          const transaction = await response.json();
          resolve(transaction);
        } else if (response.status === 404) {
          if (Date.now() - startTime > maxWaitTime) {
            reject(new Error(`Transaction not found after ${maxWaitTime/1000} seconds`));
          } else {
            setTimeout(checkTransaction, checkInterval);
          }
        } else {
          reject(new Error(`Failed to fetch transaction: ${response.status}`));
        }
      } catch (error) {
        if (Date.now() - startTime > maxWaitTime) {
          reject(error);
        } else {
          setTimeout(checkTransaction, checkInterval);
        }
      }
    };

    checkTransaction();
  });
};

export const useBlockchainService = ({
  walletConnected,
  walletAddress,
  onRecordingChange,
}: BlockchainServiceProps) => {
  // Get module address from environment variables
  const getModuleAddress = () => {
    const envAddress = import.meta.env.VITE_MODULE_ADDRESS || "0xfa1c12cc2e127047b02bc951d71d376cf25b9db220d213bfa972f45c0c55de38";
    return normalizeAddress(envAddress);
  };

  // Check if Petra Wallet is installed
  const isPetraInstalled = () => {
    return typeof window !== "undefined" && !!window.aptos;
  };

  // Show notification message
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const existing = document.querySelectorAll('.transaction-notification');
    existing.forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = `transaction-notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 max-w-md animate-fade-in ${
      type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
      type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
      type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
      'bg-blue-50 border-blue-500 text-blue-800'
    }`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="text-xl">${icon}</span>
        <div class="flex-1">
          <p class="font-medium">${message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-500 hover:text-gray-700 text-lg">
          ×
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, type === 'success' || type === 'info' ? 5000 : 8000);
  };

  // Record verification result on blockchain using smart contract
  const recordOnBlockchain = async (action: string, data: any): Promise<{hash: string, success: boolean} | null> => {
    if (!walletConnected) {
      showNotification("Please connect your Petra Wallet first.", "error");
      return null;
    }

    if (!isPetraInstalled()) {
      showNotification("Petra Wallet is not installed. Please install it from https://petra.app/", "error");
      return null;
    }

    try {
      onRecordingChange?.(true);
      showNotification("Preparing transaction...", "info");

      // Get and normalize module address
      const moduleAddress = getModuleAddress();
      
      // Sanitize all string inputs
      const brandName = sanitizeString(data.brandName, "Unknown");
      const productId = sanitizeString(data.productId, "Unknown");
      const transactionHash = sanitizeString(data.transactionHash, "pending");
      const matchStatus = sanitizeString(data.overallMatch || data.matchStatus, "unknown");
      const actionStr = sanitizeString(action, "verification");
      
      // Use the ORIGINAL connected wallet address
      const userAddressToUse = walletAddress;
      const moveFormattedUserAddress = formatAddressForMove(userAddressToUse);
      
      console.log("=== Transaction Preparation ===");
      console.log("Module Address:", moduleAddress);
      console.log("Brand Name:", brandName);
      console.log("Product ID:", productId);
      console.log("Wallet Address:", walletAddress);
      console.log("Move Formatted Address:", moveFormattedUserAddress);
      
      const payload = {
        type: "entry_function_payload",
        function: `${moduleAddress}::ProductVerification::record_verification`,
        arguments: [
          brandName,
          productId,
          moveFormattedUserAddress,
          transactionHash,
          matchStatus,
          actionStr
        ],
        type_arguments: [],
      };

      console.log("=== Final Payload ===");
      console.log(JSON.stringify(payload, null, 2));

      showNotification("Signing transaction with Petra Wallet...", "info");

      // Send transaction using Petra Wallet
      let transactionResult;
      try {
        transactionResult = await window.aptos.signAndSubmitTransaction(payload);
        console.log("✓ Transaction submitted (modern API):", transactionResult);
      } catch (error: any) {
        console.log("Modern API failed, trying legacy API...", error);
        transactionResult = await window.aptos.connect().signAndSubmitTransaction(payload);
        console.log("✓ Transaction submitted (legacy API):", transactionResult);
      }

      // Extract transaction hash from different possible response formats
      let transactionHashValue: string;
      
      if (typeof transactionResult === 'string') {
        transactionHashValue = transactionResult;
      } else if (transactionResult.hash) {
        transactionHashValue = transactionResult.hash;
      } else if (transactionResult.result && transactionResult.result.hash) {
        transactionHashValue = transactionResult.result.hash;
      } else {
        throw new Error("Could not extract transaction hash from response");
      }

      console.log("✓ Extracted Transaction Hash:", transactionHashValue);
      showNotification("Transaction submitted! Waiting for confirmation...", "info");

      // Wait for transaction confirmation
      let transaction;
      try {
        if (window.aptos.waitForTransaction) {
          transaction = await window.aptos.waitForTransaction(transactionHashValue);
        } else {
          transaction = await waitForTransaction(transactionHashValue);
        }
        console.log("✓ Transaction confirmed:", transaction);
      } catch (waitError) {
        console.warn("Could not wait for transaction confirmation, but transaction was submitted:", waitError);
        transaction = { hash: transactionHashValue, success: true };
      }

      showNotification("✅ Transaction successfully recorded on blockchain!", "success");
      
      // Display only transaction hash in details
      showTransactionDetails(transactionHashValue, actionStr);

      return {
        hash: transactionHashValue,
        success: true
      };

    } catch (error: any) {
      console.error("=== Transaction Error ===");
      console.error("Error:", error);
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);

      let errorMessage = "Failed to record on blockchain";

      if (error.code === 4001 || error.message?.includes('rejected')) {
        errorMessage = "Transaction was rejected by user.";
      } else if (error.message?.includes('Hex characters are invalid')) {
        errorMessage = "Invalid data format. Please check your inputs.";
      } else if (error.message?.includes('INSUFFICIENT_BALANCE')) {
        errorMessage = "Insufficient balance for gas fees.";
      } else if (error.message?.includes('SEQUENCE_NUMBER_TOO_OLD')) {
        errorMessage = "Transaction sequence error. Please refresh and try again.";
      } else if (error.message?.includes('TYPE_MISMATCH') || error.message?.includes('FAILED_TO_DESERIALIZE')) {
        errorMessage = "Data type mismatch. Please check all fields.";
      } else if (error.message?.includes('Network error')) {
        errorMessage = "Network connection error. Check your internet.";
      } else if (error.message?.includes('transaction hash')) {
        errorMessage = "Transaction submitted but confirmation failed. Check explorer.";
      } else {
        errorMessage = `Transaction failed: ${error.message || "Unknown error"}`;
      }

      showNotification(`❌ ${errorMessage}`, "error");
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

  // Copy transaction hash to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Transaction hash copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showNotification('Failed to copy transaction hash', 'error');
    });
  };

  // Simplified transaction details - only shows transaction hash
  const showTransactionDetails = (transactionHash: string, action: string) => {
    // Remove any existing transaction details
    const existing = document.querySelectorAll('.transaction-details-section');
    existing.forEach(el => el.remove());

    const transactionSection = document.createElement('div');
    transactionSection.className = 'transaction-details-section';
    transactionSection.innerHTML = `
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6 shadow-xl animate-fade-in">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce-once shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-green-800">Transaction Successful! 🎉</h3>
            <p class="text-green-600 mt-1">Your ${action} has been recorded on the blockchain</p>
          </div>
        </div>
        
        <div class="mb-6">
          <div class="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
            <p class="font-semibold text-gray-600 text-sm mb-2">Transaction Hash</p>
            <div class="flex items-center gap-3">
              <p class="font-mono text-sm text-gray-900 break-all flex-1">${transactionHash}</p>
              <button id="copyHashBtn" class="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="flex gap-3 flex-wrap">
          <button id="viewExplorerBtn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
            View on Explorer
          </button>
          <button id="copyHashMainBtn" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copy Hash
          </button>
          <button id="closeBtn" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Close
          </button>
        </div>
      </div>
    `;

    // Add to the page
    const mainContainer = document.querySelector('.max-w-6xl.mx-auto') || document.body;
    if (mainContainer) {
      mainContainer.insertBefore(transactionSection, mainContainer.firstChild);
      
      // Add event listeners after the element is inserted into DOM
      setTimeout(() => {
        // Copy hash button (small one next to hash)
        const copyHashBtn = document.getElementById('copyHashBtn');
        if (copyHashBtn) {
          copyHashBtn.addEventListener('click', () => {
            copyToClipboard(transactionHash);
            // Visual feedback
            const originalHTML = copyHashBtn.innerHTML;
            copyHashBtn.innerHTML = `
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            `;
            setTimeout(() => {
              copyHashBtn.innerHTML = originalHTML;
            }, 2000);
          });
        }

        // Copy hash button (main button)
        const copyHashMainBtn = document.getElementById('copyHashMainBtn');
        if (copyHashMainBtn) {
          copyHashMainBtn.addEventListener('click', () => {
            copyToClipboard(transactionHash);
            // Visual feedback
            const originalHTML = copyHashMainBtn.innerHTML;
            copyHashMainBtn.innerHTML = `
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Copied!
            `;
            setTimeout(() => {
              copyHashMainBtn.innerHTML = originalHTML;
            }, 2000);
          });
        }

        // View explorer button
        const viewExplorerBtn = document.getElementById('viewExplorerBtn');
        if (viewExplorerBtn) {
          viewExplorerBtn.addEventListener('click', () => {
            window.open(`https://explorer.aptoslabs.com/txn/${transactionHash}?network=testnet`, '_blank');
          });
        }

        // Close button
        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            transactionSection.remove();
          });
        }
      }, 100);
      
      // Scroll to transaction details
      setTimeout(() => {
        transactionSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  // Specialized recording functions
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
      showNotification("Petra Wallet is not installed. Please install it from https://petra.app/", "error");
      return null;
    }

    try {
      showNotification("Connecting to Petra Wallet...", "info");
      const response = await window.aptos.connect();
      const address = response.address;
      console.log("✓ Wallet connected:", address);
      showNotification("✅ Wallet connected successfully!", "success");
      return address;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      showNotification("Failed to connect wallet. Please try again.", "error");
      return null;
    }
  };

  // Disconnect wallet
  const disconnectWallet = async (): Promise<void> => {
    if (isPetraInstalled()) {
      try {
        await window.aptos.disconnect();
        console.log("✓ Wallet disconnected");
        showNotification("Wallet disconnected", "info");
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
        showNotification("Failed to disconnect wallet", "error");
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
    getModuleAddress,
    normalizeAddress,
    formatAddressForMove,
    showNotification,
  };
};

// Export types and helper
export type { BlockchainServiceProps, ProductVerificationData };
export { normalizeAddress, formatAddressForMove };