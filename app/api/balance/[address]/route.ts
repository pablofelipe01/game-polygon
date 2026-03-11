import { NextResponse } from "next/server";
import { ethers } from "ethers";
import FGTokenABI from "@/contracts/abis/FGToken.json";
import { createProvider } from "@/lib/provider";

export async function GET(
  _request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    const fgTokenAddress = process.env.FG_TOKEN_ADDRESS || process.env.NEXT_PUBLIC_FG_TOKEN_ADDRESS || "";

    if (!ethers.utils.isAddress(address)) {
      return NextResponse.json(
        { error: "Dirección inválida" },
        { status: 400 }
      );
    }

    const provider = createProvider();
    const fgToken = new ethers.Contract(fgTokenAddress, FGTokenABI, provider);
    const balanceWei = await fgToken.balanceOf(address);
    const balance = ethers.utils.formatEther(balanceWei);

    return NextResponse.json({ balance });
  } catch (error: any) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { error: "Error al obtener el balance", details: error.message },
      { status: 500 }
    );
  }
}
