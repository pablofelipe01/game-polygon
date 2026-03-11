import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/layout/ToastProvider";
import { WalletProvider } from "@/components/wallet/WalletProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Code Quest — Fundación Guaicaramo",
  description:
    "Aprende a programar y gana FGT tokens reales en Polygon. Un juego educativo Play-to-Earn.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${pressStart.variable}`}>
      <body className="font-sans bg-gaming-dark text-white min-h-screen">
        <WalletProvider>
          <ToastProvider>
            {/* Estrellas de fondo */}
            <div className="starfield" />
            {/* Scanlines retro */}
            <div className="scanlines" />
            {/* Contenido principal */}
            <main className="relative z-10">{children}</main>
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
