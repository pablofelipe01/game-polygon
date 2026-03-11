"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { useFGToken } from "@/hooks/useFGToken";
import { NetworkGuard } from "@/components/wallet/NetworkGuard";

export default function Header() {
  const { address, isConnected, disconnect } = useWallet();
  const { balance } = useFGToken(address);

  if (!isConnected) return null;

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <>
      <NetworkGuard />
      <header className="fixed top-0 left-0 right-0 z-50 bg-gaming-dark/90 backdrop-blur-sm border-b border-gaming-purple/30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/map" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">⚡</span>
            <span className="font-pixel text-xs text-gaming-gold">
              CODE QUEST
            </span>
          </Link>

          {/* Balance FGT */}
          <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-lg">💰</span>
            <span className="font-pixel text-xs text-gaming-gold">
              {parseFloat(balance).toFixed(0)} FGT
            </span>
          </Link>

          {/* Wallet info */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gaming-purple font-mono">
              {shortAddress}
            </span>
            <button
              onClick={disconnect}
              className="text-xs text-white/50 hover:text-white border border-white/20 rounded px-2 py-1 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
