"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { useFGToken } from "@/hooks/useFGToken";
import { getFGTokenWithSigner } from "@/lib/contracts";
import { useToast } from "@/components/layout/ToastProvider";
import WorldCard from "./WorldCard";
import type { PlayerProgress } from "@/types";

const WORLDS = [
  {
    id: 1,
    name: "HTML",
    icon: "🌐",
    description: "Aprende las bases de la estructura web",
    requiredFGT: 0,
    totalActivities: 10,
  },
  {
    id: 2,
    name: "CSS",
    icon: "🎨",
    description: "Dale estilo y diseño a tus páginas",
    requiredFGT: 50,
    totalActivities: 10,
  },
  {
    id: 3,
    name: "JavaScript",
    icon: "⚡",
    description: "Programa la interactividad de la web",
    requiredFGT: 150,
    totalActivities: 10,
  },
  {
    id: 4,
    name: "Solidity",
    icon: "🔗",
    description: "Programa smart contracts en la blockchain",
    requiredFGT: 500,
    totalActivities: 10,
  },
];

export default function WorldMap() {
  const { address, signer } = useWallet();
  const { balance, refresh } = useFGToken(address);
  const { addToast } = useToast();
  const [progress, setProgress] = useState<PlayerProgress>({
    completedActivities: {},
    totalFGTEarned: 0,
  });
  const [unlockedWorlds, setUnlockedWorlds] = useState<Set<number>>(
    new Set([1])
  );
  const [unlocking, setUnlocking] = useState(false);

  // Cargar progreso desde localStorage
  useEffect(() => {
    if (!address) return;
    const saved = localStorage.getItem(`progress_${address}`);
    if (saved) {
      setProgress(JSON.parse(saved));
    }

    const savedUnlocked = localStorage.getItem(`unlocked_${address}`);
    if (savedUnlocked) {
      setUnlockedWorlds(new Set(JSON.parse(savedUnlocked)));
    }
  }, [address]);

  const getWorldProgress = (worldId: number) => {
    return Object.values(progress.completedActivities).filter(
      (a) => a.activityId.startsWith(`w${worldId}-`)
    ).length;
  };

  const handleUnlock = async (worldId: number, requiredFGT: number) => {
    if (!signer || unlocking) return;

    setUnlocking(true);
    try {
      const fgToken = getFGTokenWithSigner(signer);
      const amountWei = ethers.utils.parseEther(requiredFGT.toString());
      const tx = await fgToken.burn(amountWei);
      addToast(`Quemando ${requiredFGT} FGT...`, "info");
      await tx.wait();

      const newUnlocked = new Set(unlockedWorlds);
      newUnlocked.add(worldId);
      setUnlockedWorlds(newUnlocked);
      if (address) {
        localStorage.setItem(
          `unlocked_${address}`,
          JSON.stringify([...newUnlocked])
        );
      }

      refresh();
      addToast(`Mundo ${worldId} desbloqueado!`, "success");
    } catch (error: any) {
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        addToast("Transacción cancelada", "error");
      } else {
        addToast("Error al desbloquear el mundo", "error");
      }
    } finally {
      setUnlocking(false);
    }
  };

  const playerBalance = parseFloat(balance);

  return (
    <div>
      {/* Balance header */}
      <div className="text-center mb-12">
        <h1 className="font-pixel text-2xl text-gaming-gold mb-4">
          Mapa de Mundos
        </h1>
        <p className="text-white/60">
          Explora los 3 mundos y gana FGT tokens
        </p>
      </div>

      {/* Grid de mundos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {WORLDS.map((world) => {
          const isUnlocked =
            world.requiredFGT === 0 || unlockedWorlds.has(world.id);
          const canUnlock = playerBalance >= world.requiredFGT;

          return (
            <div
              key={world.id}
              onClick={() => {
                if (!isUnlocked && canUnlock) {
                  handleUnlock(world.id, world.requiredFGT);
                }
              }}
            >
              <WorldCard
                id={world.id}
                name={world.name}
                icon={world.icon}
                description={world.description}
                progress={getWorldProgress(world.id)}
                total={world.totalActivities}
                requiredFGT={world.requiredFGT}
                playerBalance={playerBalance}
                isUnlocked={isUnlocked}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
