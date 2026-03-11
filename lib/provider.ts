import { ethers } from "ethers";

const POLYGON_NETWORK = { name: "polygon", chainId: 137 };

/**
 * Crea un provider compatible con Next.js App Router (Node 18+).
 *
 * ethers v5 usa un header Referrer: "client" que el fetch nativo
 * de Node 18 rechaza. Usamos FetchRequest personalizado para evitarlo.
 */
export function createProvider(): ethers.providers.StaticJsonRpcProvider {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-rpc.com";

  const connection: ethers.utils.ConnectionInfo = {
    url: rpcUrl,
    headers: {
      "Content-Type": "application/json",
    },
    // Evitar el header Referrer que causa problemas
    skipFetchSetup: true,
  };

  return new ethers.providers.StaticJsonRpcProvider(
    connection,
    POLYGON_NETWORK
  );
}
