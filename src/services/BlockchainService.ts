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

export const useBlockchainService = ({
  walletConnected,
  walletAddress,
  onRecordingChange,
}: BlockchainServiceProps) => {
  // Check if Petra Wallet is installed
  const isPetraInstalled = () => {
    return typeof window !== "undefined" && !!window.aptos;
  };

  // Record verification result on blockchain
  const recordOnBlockchain = async (action: string, data: any) => {
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

      const payload = {
        type: "entry_function_payload",
        function: "0x1::message::set_message",
        arguments: [
          `Action: ${action}`,
          `Brand: ${data.brandName || "Unknown"}`,
          `ProductID: ${data.productId || "Unknown"}`,
          `Match: ${data.overallMatch || "unknown"}`,
          `Mismatches: ${data.mismatchFields?.join(",") || "none"}`,
          `Wallet: ${walletAddress}`,
          `Timestamp: ${new Date().toISOString()}`,
        ],
        type_arguments: [],
      };

      console.log("Sending transaction with payload:", payload);

      // Send transaction using Petra Wallet
      const pendingTransaction = await window.aptos.signAndSubmitTransaction(
        payload
      );

      console.log("Transaction submitted:", pendingTransaction);

      // Wait for transaction confirmation
      const transaction = await window.aptos.waitForTransaction(
        pendingTransaction.hash
      );

      console.log("Transaction confirmed:", transaction);

      alert(
        `✅ ${action} recorded on blockchain!\n\nTransaction Hash: ${transaction.hash}\n\nView on explorer: https://explorer.aptoslabs.com/txn/${transaction.hash}?network=mainnet`
      );

      return transaction.hash;
    } catch (error: any) {
      console.error("Failed to record on blockchain:", error);

      if (error.code === 4001) {
        alert("Transaction was rejected by user.");
      } else {
        alert(
          `Failed to record on blockchain: ${error.message || "Unknown error"}`
        );
      }
      return null;
    } finally {
      onRecordingChange?.(false);
    }
  };

  // Connect to Petra Wallet
  const connectWallet = async () => {
    if (!isPetraInstalled()) {
      alert(
        "Petra Wallet is not installed. Please install it from https://petra.app/"
      );
      return null;
    }

    try {
      const response = await window.aptos.connect();
      console.log("Wallet connected:", response.address);
      return response.address;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
      return null;
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    if (isPetraInstalled()) {
      try {
        await window.aptos.disconnect();
        console.log("Wallet disconnected");
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  };

  return {
    recordOnBlockchain,
    connectWallet,
    disconnectWallet,
    isPetraInstalled,
  };
};

// Export types
export type { BlockchainServiceProps };