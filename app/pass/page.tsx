"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useGamePass } from "@/hooks/useGamePass";
import Header from "@/components/layout/Header";
import MagicPassCard from "@/components/pass/MagicPassCard";

export default function PassPage() {
  const { isConnected, address, initializing } = useWallet();
  const { hasPass, checkPass } = useGamePass();
  const router = useRouter();

  // Redirigir si no está conectado (solo después de inicializar)
  useEffect(() => {
    if (!initializing && !isConnected) {
      router.push("/");
    }
  }, [initializing, isConnected, router]);

  // Verificar si ya tiene el pass
  useEffect(() => {
    if (address) {
      checkPass(address);
    }
  }, [address, checkPass]);

  // Redirigir si ya tiene el pass
  useEffect(() => {
    if (hasPass) {
      router.push("/map");
    }
  }, [hasPass, router]);

  if (initializing || !isConnected) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <MagicPassCard />
      </div>
    </>
  );
}
