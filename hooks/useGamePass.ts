"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { getGamePassWithSigner } from "@/lib/contracts";
import type { PassStatus } from "@/types";

export function useGamePass() {
  const { signer, address } = useWallet();
  const [hasPass, setHasPass] = useState(false);
  const [status, setStatus] = useState<PassStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // ── Verificar si el jugador tiene el pass ───
  const checkPass = useCallback(async (addr: string) => {
    try {
      const res = await fetch(`/api/checkpass/${addr}`);
      const data = await res.json();
      setHasPass(data.hasPass);
      return data.hasPass;
    } catch {
      return false;
    }
  }, []);

  // ── Comprar el Magic Pass ───────────────────
  const buyPass = useCallback(async () => {
    if (!signer) {
      setError("Wallet no conectada");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const gamePass = getGamePassWithSigner(signer);

      // Enviar transacción con 0.5 POL
      const tx = await gamePass.buyPass({
        value: ethers.utils.parseEther("0.5"),
      });

      setStatus("confirming");

      // Esperar confirmación
      await tx.wait();

      setStatus("success");
      setHasPass(true);
    } catch (err: any) {
      setStatus("error");

      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setError("Transacción cancelada");
      } else if (err.message?.includes("insufficient funds")) {
        setError("Saldo insuficiente para el gas");
      } else if (err.message?.includes("ya tienes")) {
        setError("Ya tienes el Magic Pass");
        setHasPass(true);
      } else {
        setError("Error al comprar el pass");
      }
    }
  }, [signer]);

  // ── Reset del estado ────────────────────────
  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { hasPass, status, error, checkPass, buyPass, reset };
}
