"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useFGToken } from "@/hooks/useFGToken";
import Header from "@/components/layout/Header";
import type { PlayerProgress } from "@/types";

interface RewardHistoryItem {
  gameId: string;
  amount: number;
  txHash: string;
  timestamp: number;
}

export default function ProfilePage() {
  const { isConnected, address, initializing } = useWallet();
  const { balance } = useFGToken(address);
  const router = useRouter();
  const [progress, setProgress] = useState<PlayerProgress>({
    completedActivities: {},
    totalFGTEarned: 0,
  });
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);

  useEffect(() => {
    if (!initializing && !isConnected) router.push("/");
  }, [initializing, isConnected, router]);

  useEffect(() => {
    if (!address) return;

    // Cargar progreso
    const saved = localStorage.getItem(`progress_${address}`);
    if (saved) setProgress(JSON.parse(saved));

    // Cargar historial de recompensas
    const savedHistory = localStorage.getItem("fgt_history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [address]);

  if (initializing || !isConnected || !address) return null;

  const completedByWorld = [1, 2, 3].map((worldId) => ({
    worldId,
    count: Object.keys(progress.completedActivities).filter((id) =>
      id.startsWith(`w${worldId}-`)
    ).length,
  }));

  const totalCompleted = Object.keys(progress.completedActivities).length;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <>
      <Header />
      <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
        <h1 className="font-pixel text-xl text-gaming-gold text-center mb-8">
          Perfil del Jugador
        </h1>

        {/* Info card */}
        <div className="bg-gaming-card border border-gaming-purple/30 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gaming-purple/20 border-2 border-gaming-purple flex items-center justify-center">
              <span className="text-2xl">👾</span>
            </div>
            <div>
              <p className="font-mono text-gaming-purple text-sm">
                {shortAddress}
              </p>
              <p className="font-pixel text-lg text-gaming-gold mt-1">
                {parseFloat(balance).toFixed(0)} FGT
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gaming-dark rounded-lg p-4 text-center">
              <p className="font-pixel text-lg text-gaming-gold">
                {totalCompleted}
              </p>
              <p className="text-xs text-white/50 mt-1">Actividades</p>
            </div>
            <div className="bg-gaming-dark rounded-lg p-4 text-center">
              <p className="font-pixel text-lg text-gaming-purple">
                {completedByWorld.filter((w) => w.count === 10).length}
              </p>
              <p className="text-xs text-white/50 mt-1">Mundos 100%</p>
            </div>
            <div className="bg-gaming-dark rounded-lg p-4 text-center">
              <p className="font-pixel text-lg text-gaming-green">
                {history.length}
              </p>
              <p className="text-xs text-white/50 mt-1">Recompensas</p>
            </div>
          </div>
        </div>

        {/* Progreso por mundo */}
        <div className="bg-gaming-card border border-gaming-purple/30 rounded-xl p-6 mb-6">
          <h2 className="font-pixel text-sm text-gaming-purple mb-4">
            Progreso por Mundo
          </h2>
          {completedByWorld.map(({ worldId, count }) => {
            const names = ["", "HTML 🌐", "CSS 🎨", "JavaScript ⚡"];
            const percent = (count / 10) * 100;
            return (
              <div key={worldId} className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/80">
                    Mundo {worldId}: {names[worldId]}
                  </span>
                  <span className="text-white/50">{count}/10</span>
                </div>
                <div className="h-2 bg-gaming-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percent === 100 ? "bg-gaming-green" : "bg-gaming-purple"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Historial de recompensas */}
        <div className="bg-gaming-card border border-gaming-purple/30 rounded-xl p-6">
          <h2 className="font-pixel text-sm text-gaming-purple mb-4">
            Últimas Recompensas
          </h2>
          {history.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">
              Aún no tienes recompensas
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history
                .slice(-10)
                .reverse()
                .map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gaming-dark rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-gaming-gold">
                        +{item.amount} FGT
                      </p>
                      <p className="text-xs text-white/30">
                        {new Date(item.timestamp).toLocaleString("es")}
                      </p>
                    </div>
                    {item.txHash && (
                      <a
                        href={`https://polygonscan.com/tx/${item.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gaming-purple hover:underline"
                      >
                        Ver tx
                      </a>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/map")}
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            ← Volver al mapa
          </button>
        </div>
      </div>
    </>
  );
}
