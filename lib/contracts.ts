import { ethers } from "ethers";
import FGTokenABI from "@/contracts/abis/FGToken.json";
import GamePassABI from "@/contracts/abis/GamePass.json";

// ═══════════════════════════════════════════════
//  CONFIGURACIÓN DE CONTRATOS
// ═══════════════════════════════════════════════

// Direcciones de los contratos (client-side)
export const FG_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_FG_TOKEN_ADDRESS || "";
export const GAME_PASS_ADDRESS =
  process.env.NEXT_PUBLIC_GAME_PASS_ADDRESS || "";
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://polygon-rpc.com";
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "137");

// ABIs exportados
export { FGTokenABI, GamePassABI };

// ── Provider de solo lectura (RPC público) ────
export function getReadProvider() {
  return new ethers.providers.StaticJsonRpcProvider(RPC_URL, {
    name: "polygon",
    chainId: 137,
  });
}

// ── Instancia FGToken de solo lectura ─────────
export function getFGTokenReadOnly() {
  const provider = getReadProvider();
  return new ethers.Contract(FG_TOKEN_ADDRESS, FGTokenABI, provider);
}

// ── Instancia GamePass de solo lectura ────────
export function getGamePassReadOnly() {
  const provider = getReadProvider();
  return new ethers.Contract(GAME_PASS_ADDRESS, GamePassABI, provider);
}

// ── Instancia FGToken con signer (client) ─────
export function getFGTokenWithSigner(signer: ethers.Signer) {
  return new ethers.Contract(FG_TOKEN_ADDRESS, FGTokenABI, signer);
}

// ── Instancia GamePass con signer (client) ────
export function getGamePassWithSigner(signer: ethers.Signer) {
  return new ethers.Contract(GAME_PASS_ADDRESS, GamePassABI, signer);
}

// ── Polygon Mainnet chain config ──────────────
export const POLYGON_CHAIN = {
  chainId: "0x89",
  chainName: "Polygon Mainnet",
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  rpcUrls: ["https://polygon-rpc.com"],
  blockExplorerUrls: ["https://polygonscan.com"],
};
