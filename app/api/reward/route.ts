import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import FGTokenABI from "@/contracts/abis/FGToken.json";
import { createProvider } from "@/lib/provider";

// Ruta al archivo anti-cheat
const REWARDED_GAMES_PATH = join(process.cwd(), "lib", "rewardedGames.json");

// Leer gameIds ya recompensados
function getRewardedGames(): string[] {
  try {
    const data = readFileSync(REWARDED_GAMES_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Guardar gameId recompensado
function saveRewardedGame(gameId: string) {
  const games = getRewardedGames();
  games.push(gameId);
  writeFileSync(REWARDED_GAMES_PATH, JSON.stringify(games, null, 2));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerAddress, amount, gameId, signature } = body;

    // ── Validaciones básicas ──────────────────
    if (!playerAddress || !amount || !gameId || !signature) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    if (!ethers.utils.isAddress(playerAddress)) {
      return NextResponse.json(
        { error: "Dirección inválida" },
        { status: 400 }
      );
    }

    if (amount <= 0 || amount > 100) {
      return NextResponse.json(
        { error: "Cantidad inválida" },
        { status: 400 }
      );
    }

    // ── Verificar firma EIP-191 ───────────────
    // El jugador debe haber firmado el mensaje "Reward request: {gameId}"
    const expectedMessage = `Reward request: ${gameId}`;
    const recoveredAddress = ethers.utils.verifyMessage(
      expectedMessage,
      signature
    );

    if (recoveredAddress.toLowerCase() !== playerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Firma inválida: la dirección no coincide" },
        { status: 403 }
      );
    }

    // ── Anti-cheat: verificar gameId no duplicado
    const rewardedGames = getRewardedGames();
    if (rewardedGames.includes(gameId)) {
      return NextResponse.json(
        { error: "Esta actividad ya fue recompensada" },
        { status: 409 }
      );
    }

    // ── Verificar formato del gameId ──────────
    // Formato esperado: {address}-{world}-{activityId}-{timestamp}
    const gameIdParts = gameId.split("-");
    if (gameIdParts.length < 4) {
      return NextResponse.json(
        { error: "Formato de gameId inválido" },
        { status: 400 }
      );
    }

    // ── Mintear tokens FGT al jugador ─────────
    const fgTokenAddress = process.env.FG_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_FG_TOKEN_ADDRESS || "";
    const masterKey = process.env.MASTER_WALLET_PRIVATE_KEY || "";

    const provider = createProvider();
    const masterWallet = new ethers.Wallet(masterKey, provider);
    const fgToken = new ethers.Contract(
      fgTokenAddress,
      FGTokenABI,
      masterWallet
    );

    // Convertir amount a wei (18 decimales)
    const amountWei = ethers.utils.parseEther(amount.toString());

    const tx = await fgToken.mint(playerAddress, amountWei);
    const receipt = await tx.wait();

    // ── Guardar gameId como recompensado ──────
    saveRewardedGame(gameId);

    return NextResponse.json({
      success: true,
      txHash: receipt.transactionHash,
    });
  } catch (error: any) {
    console.error("Error processing reward:", error);

    // Manejar errores específicos de blockchain
    if (error.code === "INSUFFICIENT_FUNDS") {
      return NextResponse.json(
        { error: "La master wallet no tiene fondos suficientes para gas" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error al procesar la recompensa", details: error.message },
      { status: 500 }
    );
  }
}
