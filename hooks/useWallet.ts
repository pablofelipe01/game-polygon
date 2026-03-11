"use client";

import { useContext } from "react";
import { WalletContext } from "@/components/wallet/WalletProvider";
import type { WalletContextValue } from "@/components/wallet/WalletProvider";

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet debe usarse dentro de <WalletProvider>");
  }
  return context;
}
