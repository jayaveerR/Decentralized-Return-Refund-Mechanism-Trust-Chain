import { useCallback, useEffect, useState } from "react";

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

export const useAptosWallet = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      console.error("Error setting up wallet listeners:", e);
    }
  }, [checkProvider, refreshConnectionState]);

  const connectWallet = async () => {
    setErrorMsg(null);
    if (!checkProvider()) {
      setErrorMsg("Petra wallet not installed. Install from https://petra.app/");
      return;
    }
    
    setConnecting(true);
    try {
      // Ensure we're working with the latest provider state
      await refreshConnectionState();
      
      // Check if already connected
      const isAlreadyConnected = await window.aptos!.isConnected?.();
      if (isAlreadyConnected) {
        const account = await window.aptos!.account?.();
        setConnected(true);
        setAddress(account?.address || null);
        return;
      }

      // Connect to wallet
      const response = await window.aptos!.connect!();
      if (response?.address) {
        setConnected(true);
        setAddress(response.address);
        
        // Store connection in localStorage for persistence
        localStorage.setItem("walletConnected", "true");
        localStorage.setItem("walletAddress", response.address);
      }
    } catch (err: any) {
      console.error("connectWallet error:", err);
      const errorMessage = err?.message || "Unknown error occurred";
      
      if (errorMessage.toLowerCase().includes("user rejected")) {
        setErrorMsg("Connection rejected by user.");
      } else if (errorMessage.toLowerCase().includes("already connected")) {
        // If already connected, try to get account info
        try {
          const account = await window.aptos!.account?.();
          setConnected(true);
          setAddress(account?.address || null);
        } catch {
          setErrorMsg("Wallet connection failed. Please try again.");
        }
      } else {
        setErrorMsg(`Failed to connect: ${errorMessage}`);
      }
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

    // Clear local state and storage
    setConnected(false);
    setAddress(null);
    localStorage.removeItem("walletConnected");
    localStorage.removeItem("walletAddress");
  };

  // Mask address for display
  const maskAddress = useCallback((addr?: string | null) => {
    if (!addr) return "Not connected";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  return {
    connected,
    address,
    connecting,
    errorMsg,
    setErrorMsg,
    connectWallet,
    disconnectWallet,
    checkProvider,
    maskAddress, // Added maskAddress function
  };
};