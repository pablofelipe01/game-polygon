"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useFGToken } from "@/hooks/useFGToken";
import type { RewardResponse } from "@/types";

export function useReward() {
  const { signer, address } = useWallet();
  const { refresh } = useFGToken(address);
  const [claiming, setClaiming] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const claimReward = useCallback(
    async (amount: number, gameId: string): Promise<RewardResponse> => {
      if (!signer || !address) {
        return { success: false, error: "Wallet no conectada" };
      }

      setClaiming(true);

      try {
        // 1. Firmar el mensaje con la wallet del jugador
        const message = `Reward request: ${gameId}`;
        const signature = await signer.signMessage(message);

        // 2. Enviar al backend para mintear
        const res = await fetch("/api/reward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerAddress: address,
            amount,
            gameId,
            signature,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error || "Error al reclamar" };
        }

        // 3. Disparar animación de partículas doradas
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 2000);

        // 4. Actualizar balance en header
        setTimeout(() => refresh(), 2000);

        // 5. Guardar en localStorage el historial local
        const history = JSON.parse(
          localStorage.getItem("fgt_history") || "[]"
        );
        history.push({
          gameId,
          amount,
          txHash: data.txHash,
          timestamp: Date.now(),
        });
        localStorage.setItem("fgt_history", JSON.stringify(history));

        return { success: true, txHash: data.txHash };
      } catch (error: any) {
        if (error.code === 4001 || error.code === "ACTION_REJECTED") {
          return { success: false, error: "Firma cancelada" };
        }
        return {
          success: false,
          error: error.message || "Error al reclamar recompensa",
        };
      } finally {
        setClaiming(false);
      }
    },
    [signer, address, refresh]
  );

  return { claimReward, claiming, showParticles };
}
