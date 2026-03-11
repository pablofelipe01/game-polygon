"use client";

import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { ethers } from "ethers";
import { CHAIN_ID, POLYGON_CHAIN } from "@/lib/contracts";
import type { WalletState } from "@/types";

const initialState: WalletState = {
  address: null,
  isConnected: false,
  provider: null,
  signer: null,
  phantomNotInstalled: false,
  isCorrectNetwork: false,
};

export interface WalletContextValue extends WalletState {
  loading: boolean;
  initializing: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToPolygon: () => Promise<void>;
  checkNetwork: () => Promise<boolean>;
}

export const WalletContext = createContext<WalletContextValue | null>(null);

function getPhantomProvider() {
  if (typeof window === "undefined") return null;
  if (window.phantom?.ethereum) return window.phantom.ethereum;
  if (window.ethereum?.isPhantom) return window.ethereum;
  if (window.ethereum) return window.ethereum;
  return null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(initialState);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const checkNetwork = useCallback(async () => {
    const provider = getPhantomProvider();
    if (!provider) return false;
    try {
      const chainIdHex = await provider.request({ method: "eth_chainId" });
      return parseInt(chainIdHex, 16) === CHAIN_ID;
    } catch {
      return false;
    }
  }, []);

  const switchToPolygon = useCallback(async () => {
    const provider = getPhantomProvider();
    if (!provider) return;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [POLYGON_CHAIN],
        });
      }
    }
  }, []);

  const connect = useCallback(async () => {
    const phantomProvider = getPhantomProvider();
    if (!phantomProvider) {
      setWallet((prev) => ({ ...prev, phantomNotInstalled: true }));
      return;
    }

    setLoading(true);
    try {
      const accounts = await phantomProvider.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length === 0) throw new Error("No se obtuvieron cuentas");

      const isCorrect = await checkNetwork();
      if (!isCorrect) await switchToPolygon();

      const web3Provider = new ethers.providers.Web3Provider(phantomProvider as any);
      const signer = web3Provider.getSigner();

      setWallet({
        address: accounts[0],
        isConnected: true,
        provider: web3Provider,
        signer,
        phantomNotInstalled: false,
        isCorrectNetwork: true,
      });
    } catch (error: any) {
      if (error.code === 4001) throw new Error("Conexión cancelada");
      throw new Error("Error de red, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  }, [checkNetwork, switchToPolygon]);

  const disconnect = useCallback(() => {
    setWallet(initialState);
  }, []);

  // Escuchar cambios de cuenta y red
  useEffect(() => {
    const phantomProvider = getPhantomProvider();
    if (!phantomProvider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWallet((prev) => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = async () => {
      const isCorrect = await checkNetwork();
      if (isCorrect) {
        setWallet((prev) => ({ ...prev, isCorrectNetwork: true }));
      } else {
        const phantomProv = getPhantomProvider();
        if (phantomProv) {
          const web3Provider = new ethers.providers.Web3Provider(phantomProv as any);
          const signer = web3Provider.getSigner();
          setWallet((prev) => ({ ...prev, provider: web3Provider, signer, isCorrectNetwork: false }));
        }
      }
    };

    phantomProvider.on("accountsChanged", handleAccountsChanged);
    phantomProvider.on("chainChanged", handleChainChanged);
    return () => {
      phantomProvider.removeListener("accountsChanged", handleAccountsChanged);
      phantomProvider.removeListener("chainChanged", handleChainChanged);
    };
  }, [checkNetwork, disconnect]);

  // Auto-reconectar
  useEffect(() => {
    const phantomProvider = getPhantomProvider();

    if (!phantomProvider) {
      setWallet((prev) => ({ ...prev, phantomNotInstalled: true }));
      setInitializing(false);
      return;
    }

    phantomProvider
      .request({ method: "eth_accounts" })
      .then(async (accounts: string[]) => {
        if (accounts.length > 0) {
          const isCorrect = await checkNetwork();
          const web3Provider = new ethers.providers.Web3Provider(phantomProvider as any);
          const signer = web3Provider.getSigner();
          setWallet({
            address: accounts[0],
            isConnected: true,
            provider: web3Provider,
            signer,
            phantomNotInstalled: false,
            isCorrectNetwork: isCorrect,
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        setInitializing(false);
      });
  }, [checkNetwork]);

  const value: WalletContextValue = {
    ...wallet,
    loading,
    initializing,
    connect,
    disconnect,
    switchToPolygon,
    checkNetwork,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
