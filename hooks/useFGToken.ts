"use client";

import { useState, useEffect, useCallback } from "react";

export function useFGToken(address: string | null) {
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  // ── Obtener balance del servidor ────────────
  const getBalance = useCallback(async (addr: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/balance/${addr}`);
      const data = await res.json();
      if (data.balance) {
        setBalance(data.balance);
      }
    } catch {
      // Silencioso: no interrumpir la UX por un error de balance
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Polling automático cada 15 segundos ─────
  useEffect(() => {
    if (!address) {
      setBalance("0");
      return;
    }

    // Fetch inicial
    getBalance(address);

    // Polling
    const interval = setInterval(() => {
      getBalance(address);
    }, 15000);

    return () => clearInterval(interval);
  }, [address, getBalance]);

  // ── Forzar actualización ────────────────────
  const refresh = useCallback(() => {
    if (address) {
      getBalance(address);
    }
  }, [address, getBalance]);

  return { balance, loading, refresh };
}
