"use client";

import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/components/layout/ToastProvider";

export function NetworkGuard() {
  const { isConnected, isCorrectNetwork, switchToPolygon } = useWallet();
  const { addToast } = useToast();

  if (!isConnected || isCorrectNetwork) return null;

  const handleSwitch = async () => {
    try {
      await switchToPolygon();
      addToast("Red cambiada a Polygon", "success");
    } catch {
      addToast("Error al cambiar de red", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gaming-dark/95 flex items-center justify-center">
      <div className="bg-gaming-card border border-gaming-red/50 rounded-2xl p-8 max-w-md text-center">
        <span className="text-5xl block mb-4">⚠️</span>
        <h2 className="font-pixel text-lg text-gaming-red mb-3">
          Red Incorrecta
        </h2>
        <p className="text-white/70 mb-6">
          Code Quest funciona en Polygon Mainnet. Cambia tu red para continuar.
        </p>
        <button
          onClick={handleSwitch}
          className="bg-gaming-purple hover:bg-gaming-purple/80 text-white font-pixel text-xs px-6 py-3 rounded-xl glow-purple transition-all"
        >
          Cambiar a Polygon
        </button>
      </div>
    </div>
  );
}
