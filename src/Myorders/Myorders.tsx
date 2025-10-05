import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar';
import { WalletSection } from './WalletSection';
import { TransactionGrid } from './TransactionGrid';
import { Modals } from './Modals';
import { ToastNotification } from './ToastNotification';

const TRANSACTION_HASHES_STORAGE_KEY = "blockverify_transaction_hashes";

interface PetraWallet {
  connect: () => Promise<{ address: string; publicKey: string }>;
  disconnect: () => Promise<void>;
  isConnected: () => Promise<boolean>;
  account: () => Promise<{ address: string }>;
  onAccountChange?: (
    listener: (newAddress: { address: string }) => void
  ) => void;
}

declare global {
  interface Window {
    apto?: PetraWallet;
  }
}

export interface TransactionHashItem {
  hash: string;
  timestamp: number;
}

const MyOrders: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isPetraInstalled, setIsPetraInstalled] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [transactionHashes, setTransactionHashes] = useState<TransactionHashItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    checkPetraInstallation();
    checkConnection();

    if (window.aptos && window.aptos.onAccountChange) {
      try {
        window.aptos.onAccountChange((newAddress: { address: string }) => {
          if (newAddress && newAddress.address) {
            setWalletAddress(newAddress.address);
            loadTransactionHashes(newAddress.address);
            setIsConnected(true);
          } else {
            setWalletAddress("");
            setIsConnected(false);
            setTransactionHashes([]);
          }
        });
      } catch (error) {
        console.error("Error setting up account change listener:", error);
      }
    }
  }, []);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const checkPetraInstallation = () => {
    setIsPetraInstalled(!!window.aptos);
  };

  const checkConnection = async () => {
    if (window.aptos) {
      try {
        const connected = await window.aptos.isConnected();
        if (connected) {
          const account = await window.aptos.account();
          setWalletAddress(account.address);
          setIsConnected(true);
          loadTransactionHashes(account.address);
        }
      } catch (error: any) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (!isPetraInstalled) {
      setShowWalletModal(true);
      return;
    }

    try {
      const response = await window.aptos!.connect();
      setWalletAddress(response.address);
      setIsConnected(true);
      loadTransactionHashes(response.address);
      showToastMessage("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      showToastMessage("Failed to connect wallet");
    }
  };

  const loadTransactionHashes = (address: string) => {
    if (!address) {
      setTransactionHashes([]);
      return;
    }

    setRefreshing(true);
    try {
      const storedHashes = JSON.parse(
        localStorage.getItem(TRANSACTION_HASHES_STORAGE_KEY) || "{}"
      );

      const walletHashes: string[] = storedHashes[address] || [];
      const hashItems: TransactionHashItem[] = walletHashes.map(
        (hash, index) => ({
          hash,
          timestamp: Date.now() - index * 60000,
        })
      );

      setTransactionHashes(hashItems);
    } catch (error) {
      console.error("Error loading transaction hashes:", error);
      setTransactionHashes([]);
    } finally {
      setRefreshing(false);
    }
  };

  const clearTransactionHashes = () => {
    if (!walletAddress) return;

    try {
      const storedHashes = JSON.parse(
        localStorage.getItem(TRANSACTION_HASHES_STORAGE_KEY) || "{}"
      );

      delete storedHashes[walletAddress];
      localStorage.setItem(
        TRANSACTION_HASHES_STORAGE_KEY,
        JSON.stringify(storedHashes)
      );
      setTransactionHashes([]);
      setShowClearConfirmation(false);
      showToastMessage("All transaction hashes cleared successfully!");
    } catch (error) {
      console.error("Error clearing transaction hashes:", error);
      showToastMessage("Failed to clear transaction hashes");
    }
  };

  const handleClearClick = () => {
    setShowClearConfirmation(true);
  };

  const handleCancelClear = () => {
    setShowClearConfirmation(false);
    showToastMessage("Clear operation cancelled");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar activeTab="myorders" />
      
      <ToastNotification 
        showToast={showToast} 
        toastMessage={toastMessage} 
      />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 min-h-screen">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          <WalletSection
            isConnected={isConnected}
            walletAddress={walletAddress}
            transactionHashes={transactionHashes}
            refreshing={refreshing}
            onConnectWallet={connectWallet}
            onRefresh={() => loadTransactionHashes(walletAddress)}
            onClearClick={handleClearClick}
          />

          <TransactionGrid
            isConnected={isConnected}
            transactionHashes={transactionHashes}
            copiedHash={copiedHash}
            onCopyHash={setCopiedHash}
            showToastMessage={showToastMessage}
          />
        </div>
      </main>

      <Modals
        showClearConfirmation={showClearConfirmation}
        showWalletModal={showWalletModal}
        transactionHashes={transactionHashes}
        onClearTransactionHashes={clearTransactionHashes}
        onCancelClear={handleCancelClear}
        onCloseWalletModal={() => setShowWalletModal(false)}
      />
    </div>
  );
};

export default MyOrders;