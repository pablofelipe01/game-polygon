import { NextResponse } from "next/server";
import { ethers } from "ethers";
import GamePassABI from "@/contracts/abis/GamePass.json";
import { createProvider } from "@/lib/provider";

export async function GET(
  _request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const gamePassAddress = process.env.GAME_PASS_ADDRESS || process.env.NEXT_PUBLIC_GAME_PASS_ADDRESS || "";

    if (!ethers.utils.isAddress(address)) {
      return NextResponse.json(
        { error: "Dirección inválida" },
        { status: 400 }
      );
    }

    const provider = createProvider();
    const gamePass = new ethers.Contract(gamePassAddress, GamePassABI, provider);
    const hasPass = await gamePass.hasPass(address);

    return NextResponse.json({ hasPass });
  } catch (error: any) {
    console.error("Error checking pass:", error);
    return NextResponse.json(
      { error: "Error al verificar el pass", details: error.message },
      { status: 500 }
    );
  }
}
