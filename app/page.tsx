"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import ConnectButton from "@/components/wallet/ConnectButton";

export default function LandingPage() {
  const { isConnected, address, initializing } = useWallet();
  const router = useRouter();

  // Redirigir según estado del pass
  useEffect(() => {
    if (initializing || !isConnected || !address) return;

    async function checkAndRedirect() {
      try {
        const res = await fetch(`/api/checkpass/${address}`);
        const data = await res.json();
        if (data.hasPass) {
          router.push("/map");
        } else {
          router.push("/pass");
        }
      } catch {
        router.push("/pass");
      }
    }

    checkAndRedirect();
  }, [initializing, isConnected, address, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Logo principal */}
        <div className="mb-8">
          <h1 className="font-pixel text-4xl md:text-5xl text-gaming-gold mb-4 leading-relaxed">
            ⚡ CODE QUEST
          </h1>
          <p className="font-pixel text-sm text-gaming-purple">
            by Fundación Guaicaramo
          </p>
        </div>

        {/* Descripción */}
        <p className="text-xl text-white/80 mb-12 leading-relaxed">
          Aprende a programar y gana{" "}
          <span className="text-gaming-gold font-bold">FGT tokens</span> reales
          en la blockchain de Polygon
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gaming-card/50 border border-gaming-purple/20 rounded-xl p-6">
            <span className="text-3xl block mb-3">🌐</span>
            <h3 className="font-pixel text-xs text-gaming-purple mb-2">
              HTML
            </h3>
            <p className="text-sm text-white/60">
              Aprende las bases de la web
            </p>
          </div>
          <div className="bg-gaming-card/50 border border-gaming-purple/20 rounded-xl p-6">
            <span className="text-3xl block mb-3">🎨</span>
            <h3 className="font-pixel text-xs text-gaming-purple mb-2">CSS</h3>
            <p className="text-sm text-white/60">
              Dale estilo a tus páginas
            </p>
          </div>
          <div className="bg-gaming-card/50 border border-gaming-purple/20 rounded-xl p-6">
            <span className="text-3xl block mb-3">⚡</span>
            <h3 className="font-pixel text-xs text-gaming-purple mb-2">
              JavaScript
            </h3>
            <p className="text-sm text-white/60">
              Programa interactividad real
            </p>
          </div>
        </div>

        {/* Botón de conexión */}
        <ConnectButton />

        {/* Footer info */}
        <p className="mt-8 text-xs text-white/30">
          Polygon Mainnet · Play-to-Earn · Educación Web3
        </p>
      </div>
    </div>
  );
}
