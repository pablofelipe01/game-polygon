"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import Header from "@/components/layout/Header";
import WorldMap from "@/components/map/WorldMap";

export default function MapPage() {
  const { isConnected, initializing } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !isConnected) {
      router.push("/");
    }
  }, [initializing, isConnected, router]);

  if (initializing || !isConnected) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen px-4 py-8">
        <WorldMap />
      </div>
    </>
  );
}
