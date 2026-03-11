"use client";

import { useGamePass } from "@/hooks/useGamePass";
import { useToast } from "@/components/layout/ToastProvider";

export default function MagicPassCard() {
  const { status, error, buyPass, reset } = useGamePass();
  const { addToast } = useToast();

  const handleBuy = async () => {
    reset();
    await buyPass();
  };

  // Mostrar toast en error
  if (status === "error" && error) {
    addToast(error, "error");
    reset();
  }

  const buttonContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <span className="animate-spin inline-block mr-2">⏳</span>
            Esperando confirmación...
          </>
        );
      case "confirming":
        return (
          <>
            <span className="animate-spin inline-block mr-2">🔄</span>
            Confirmando en blockchain...
          </>
        );
      case "success":
        return <>✅ ¡Magic Pass activado!</>;
      default:
        return <>Comprar Magic Pass → 0.5 POL</>;
    }
  };

  return (
    <div className="relative max-w-md w-full mx-auto">
      {/* Brillo animado de fondo */}
      <div className="absolute inset-0 rounded-2xl shimmer-purple" />

      <div className="relative bg-gaming-card border-2 border-gaming-purple/50 rounded-2xl p-8 glow-purple">
        {/* Título */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🪄</span>
          <h2 className="font-pixel text-xl text-gaming-gold mb-2">
            Magic Pass
          </h2>
          <p className="text-white/60 text-sm">
            Tu entrada al mundo de Code Quest
          </p>
        </div>

        {/* Beneficios */}
        <ul className="space-y-3 mb-8">
          <li className="flex items-center gap-3 text-white/80">
            <span className="text-gaming-green">✅</span>
            Acceso completo a 3 mundos
          </li>
          <li className="flex items-center gap-3 text-white/80">
            <span className="text-gaming-green">✅</span>
            Gana FGT tokens reales
          </li>
          <li className="flex items-center gap-3 text-white/80">
            <span className="text-gaming-green">✅</span>
            Certificado de aprendizaje en blockchain
          </li>
          <li className="flex items-center gap-3 text-white/80">
            <span className="text-gaming-green">✅</span>
            Acceso a futuro exchange FGT → POL
          </li>
        </ul>

        {/* Precio */}
        <div className="text-center mb-6">
          <p className="font-pixel text-3xl text-gaming-gold mb-1">0.5 POL</p>
          <p className="text-white/40 text-xs">Pago único · Acceso permanente</p>
        </div>

        {/* Botón de compra */}
        <button
          onClick={handleBuy}
          disabled={status !== "idle"}
          className={`w-full font-pixel text-sm py-4 rounded-xl transition-all ${
            status === "success"
              ? "bg-gaming-green text-white glow-green"
              : "bg-gaming-purple hover:bg-gaming-purple/80 text-white glow-purple hover:scale-[1.02]"
          } disabled:opacity-70 disabled:cursor-not-allowed`}
        >
          {buttonContent()}
        </button>

        {/* Confetti en success */}
        {status === "success" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-10px",
                  backgroundColor: ["#f59e0b", "#7c3aed", "#10b981", "#ef4444"][
                    i % 4
                  ],
                  animationDelay: `${Math.random() * 1}s`,
                  width: `${6 + Math.random() * 8}px`,
                  height: `${6 + Math.random() * 8}px`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
