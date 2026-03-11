"use client";

import Link from "next/link";

interface WorldCardProps {
  id: number;
  name: string;
  icon: string;
  description: string;
  progress: number;
  total: number;
  requiredFGT: number;
  playerBalance: number;
  isUnlocked: boolean;
}

export default function WorldCard({
  id,
  name,
  icon,
  description,
  progress,
  total,
  requiredFGT,
  playerBalance,
  isUnlocked,
}: WorldCardProps) {
  const progressPercent = total > 0 ? (progress / total) * 100 : 0;
  const canUnlock = playerBalance >= requiredFGT;

  return (
    <div
      className={`relative bg-gaming-card border-2 rounded-2xl p-6 transition-all ${
        isUnlocked
          ? "border-gaming-purple/50 hover:border-gaming-purple glow-purple hover:scale-[1.02]"
          : "border-white/10 opacity-60"
      }`}
    >
      {/* Ícono del mundo */}
      <div className="text-center mb-4">
        <span className="text-6xl block mb-3">{icon}</span>
        <h3 className="font-pixel text-sm text-gaming-gold">
          Mundo {id}
        </h3>
        <h4 className="font-pixel text-xs text-gaming-purple mt-1">{name}</h4>
      </div>

      {/* Descripción */}
      <p className="text-white/60 text-sm text-center mb-4">{description}</p>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>{progress}/{total} actividades</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 bg-gaming-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gaming-purple rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Acción */}
      {isUnlocked ? (
        <Link
          href={`/world/${id}`}
          className="block w-full text-center bg-gaming-purple hover:bg-gaming-purple/80 text-white font-pixel text-xs py-3 rounded-xl transition-all"
        >
          {progress === total && total > 0 ? "COMPLETADO ✅" : "JUGAR →"}
        </Link>
      ) : (
        <div className="text-center">
          <p className="text-xs text-white/40 mb-2">
            Requiere {requiredFGT} FGT
          </p>
          {canUnlock ? (
            <button className="w-full bg-gaming-gold/20 border border-gaming-gold/50 text-gaming-gold font-pixel text-xs py-3 rounded-xl hover:bg-gaming-gold/30 transition-all">
              Desbloquear ({requiredFGT} FGT)
            </button>
          ) : (
            <div className="w-full bg-white/5 border border-white/10 text-white/30 font-pixel text-xs py-3 rounded-xl cursor-not-allowed">
              BLOQUEADO 🔒
            </div>
          )}
        </div>
      )}
    </div>
  );
}
