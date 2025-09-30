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
      // ignore
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
      const resp = await window.aptos!.connect!();
      const addr = resp?.address ?? null;
      setConnected(true);
      setAddress(addr);
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
  };

  return {
    connected,
    address,
    connecting,
    errorMsg,
    setErrorMsg,
    connectWallet,
    disconnectWallet,
    checkProvider,
  };
};