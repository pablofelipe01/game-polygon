"use client";

import { useEffect, useState } from "react";

interface RewardAnimationProps {
  show: boolean;
  amount: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: number;
}

export default function RewardAnimation({
  show,
  amount,
}: RewardAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      setShowText(false);
      return;
    }

    // Generar partículas doradas
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      delay: Math.random() * 0.5,
      size: 4 + Math.random() * 8,
    }));
    setParticles(newParticles);
    setShowText(true);

    const timeout = setTimeout(() => {
      setParticles([]);
      setShowText(false);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [show]);

  if (!show && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[150]">
      {/* Partículas doradas */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            boxShadow: "0 0 6px #f59e0b, 0 0 12px #f59e0b",
          }}
        />
      ))}

      {/* Texto de recompensa */}
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gaming-dark/80 backdrop-blur-sm rounded-2xl px-8 py-6 text-center border border-gaming-gold/50 glow-gold animate-bounce">
            <span className="text-4xl block mb-2">💰</span>
            <p className="font-pixel text-xl text-gaming-gold">
              +{amount} FGT
            </p>
            <p className="text-sm text-white/60 mt-1">¡Recompensa ganada!</p>
          </div>
        </div>
      )}
    </div>
  );
}
