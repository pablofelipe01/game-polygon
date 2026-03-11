"use client";

import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/components/layout/ToastProvider";

export default function ConnectButton() {
  const { isConnected, phantomNotInstalled, loading, connect } = useWallet();
  const { addToast } = useToast();

  if (isConnected) return null;

  if (phantomNotInstalled) {
    return (
      <a
        href="https://phantom.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 bg-gaming-purple hover:bg-gaming-purple/80 text-white font-pixel text-sm px-8 py-4 rounded-xl glow-purple transition-all hover:scale-105"
      >
        Instalar Phantom →
      </a>
    );
  }

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error: any) {
      addToast(error.message || "Error al conectar", "error");
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="inline-flex items-center gap-3 bg-gaming-purple hover:bg-gaming-purple/80 text-white font-pixel text-sm px-8 py-4 rounded-xl glow-purple transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <span className="animate-spin">⏳</span>
          Conectando...
        </>
      ) : (
        <>Conectar con Phantom 👻</>
      )}
    </button>
  );
}
