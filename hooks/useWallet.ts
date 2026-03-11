"use client";

import { useState, useEffect, useCallback } from "react";
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

function getPhantomProvider() {
  if (typeof window === "undefined") return null;
  if (window.phantom?.ethereum) return window.phantom.ethereum;
  if (window.ethereum?.isPhantom) return window.ethereum;
  if (window.ethereum) return window.ethereum;
  return null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(initialState);
  const [loading, setLoading] = useState(false);
  // initializing = true hasta que terminamos de verificar si ya estaba conectado
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
        const web3Provider = new ethers.providers.Web3Provider(phantomProvider as any);
        const signer = web3Provider.getSigner();
        setWallet((prev) => ({ ...prev, provider: web3Provider, signer, isCorrectNetwork: false }));
      }
    };

    phantomProvider.on("accountsChanged", handleAccountsChanged);
    phantomProvider.on("chainChanged", handleChainChanged);
    return () => {
      phantomProvider.removeListener("accountsChanged", handleAccountsChanged);
      phantomProvider.removeListener("chainChanged", handleChainChanged);
    };
  }, [checkNetwork, disconnect]);

  // Auto-reconectar — al terminar, setInitializing(false)
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

  return {
    ...wallet,
    loading,
    initializing,
    connect,
    disconnect,
    switchToPolygon,
    checkNetwork,
  };
}
