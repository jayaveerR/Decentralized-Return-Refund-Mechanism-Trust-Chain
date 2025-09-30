import { useCallback } from "react";

const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS!;
const TRANSACTION_HASHES_STORAGE_KEY = "blockverify_transaction_hashes";

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

export const useTransaction = () => {
  const storeTransactionHash = useCallback((hash: string, walletAddress: string) => {
    try {
      const storedHashes = JSON.parse(
        localStorage.getItem(TRANSACTION_HASHES_STORAGE_KEY) || "{}"
      );

      if (!storedHashes[walletAddress]) {
        storedHashes[walletAddress] = [];
      }

      if (!storedHashes[walletAddress].includes(hash)) {
        storedHashes[walletAddress] = [hash, ...storedHashes[walletAddress]];
        storedHashes[walletAddress] = storedHashes[walletAddress].slice(0, 50);

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
  }, []);

  const submitToBlockchain = async (formData: ItemForm): Promise<TransactionResponse> => {
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

  return {
    storeTransactionHash,
    submitToBlockchain,
  };
};