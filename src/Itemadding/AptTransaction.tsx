// AptTransaction.tsx
import { useCallback } from 'react';

interface UseAptTransactionProps {
  amount: string;
  recipientAddress: string;
  onSuccess: (hash: string) => void;
  onError: (error: string) => void;
  onTransactionStart: () => void;
  onTransactionEnd: () => void;
}

// Type declaration for window.aptos
declare global {
  interface Window {
    aptos?: any;
  }
}

export const useAptTransaction = ({
  amount,
  recipientAddress,
  onSuccess,
  onError,
  onTransactionStart,
  onTransactionEnd,
}: UseAptTransactionProps) => {
  const sendTransaction = useCallback(async () => {
    try {
      onTransactionStart();
      
      console.log('Starting transaction...');
      
      // Check if Petra wallet is available
      if (!window.aptos) {
        throw new Error('Petra wallet not found. Please install Petra wallet.');
      }

      // Check if wallet is connected
      try {
        const account = await window.aptos.account();
        console.log('Connected account:', account);
        if (!account) {
          throw new Error('Please connect your wallet first');
        }
      } catch (error) {
        throw new Error('Please connect your wallet first');
      }

      // Prepare transaction
      const transaction = {
        arguments: [recipientAddress, amount],
        function: '0x1::coin::transfer',
        type: 'entry_function_payload',
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
      };

      console.log('Sending transaction:', transaction);

      // Send transaction
      const response = await window.aptos.signAndSubmitTransaction(transaction);
      console.log('Transaction response:', response);

      if (!response?.hash) {
        throw new Error('No transaction hash received from wallet');
      }

      const transactionHash = response.hash;
      console.log('Transaction hash:', transactionHash);

      // Wait for transaction confirmation with better error handling
      const network = import.meta.env.VITE_APP_NETWORK?.toLowerCase() || 'testnet';
      const nodeUrl = network === 'mainnet' 
        ? 'https://fullnode.mainnet.aptoslabs.com'
        : 'https://fullnode.testnet.aptoslabs.com';

      console.log('Waiting for transaction confirmation on:', nodeUrl);

      // Use fetch API to check transaction status
      const checkTransactionStatus = async (hash: string): Promise<boolean> => {
        try {
          const response = await fetch(`${nodeUrl}/v1/transactions/by_hash/${hash}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              // Transaction not found yet, might still be processing
              return false;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const transactionData = await response.json();
          console.log('Transaction data:', transactionData);
          
          // Check if transaction was successful
          if (transactionData.success !== undefined) {
            return transactionData.success;
          }
          
          // For pending transactions
          if (transactionData.type === 'pending_transaction') {
            return false;
          }
          
          // For other transaction types, check if they have success status
          return transactionData.success === true;
        } catch (error) {
          console.error('Error checking transaction status:', error);
          return false;
        }
      };

      // Poll for transaction status
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Checking transaction status (attempt ${attempts})...`);
        
        const isSuccess = await checkTransactionStatus(transactionHash);
        
        if (isSuccess) {
          console.log('Transaction confirmed successfully!');
          onSuccess(transactionHash);
          return;
        }
        
        // Wait 1 second before next attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // If we reach here, transaction timed out
      throw new Error('Transaction confirmation timeout. Please check the explorer later.');
      
    } catch (error: any) {
      console.error('Transaction error:', error);
      
      // Better error message handling
      let errorMessage = 'Transaction failed';
      
      if (error.message?.includes('user rejected') || error.message?.includes('denied')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message?.includes('INSUFFICIENT_BALANCE') || error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance for transaction';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Transaction timeout. Please check the explorer for status.';
      } else if (error.message?.includes('Petra wallet not found')) {
        errorMessage = 'Petra wallet not found. Please install Petra wallet.';
      } else if (error.message?.includes('connect your wallet')) {
        errorMessage = 'Please connect your wallet first';
      } else if (error.message?.includes('No transaction hash')) {
        errorMessage = 'Transaction failed: No response from wallet';
      } else {
        errorMessage = error.message || 'Transaction failed. Please try again.';
      }
      
      console.log('Sending error:', errorMessage);
      onError(errorMessage);
    } finally {
      console.log('Transaction process ended');
      onTransactionEnd();
    }
  }, [amount, recipientAddress, onSuccess, onError, onTransactionStart, onTransactionEnd]);

  return {
    sendTransaction
  };
};

export default useAptTransaction;