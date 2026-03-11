// ═══════════════════════════════════════════════
//  TIPOS GLOBALES — Code Quest
// ═══════════════════════════════════════════════

// ── Pregunta del banco de preguntas ───────────
export interface Question {
  id: string;
  world: number;
  question: string;
  code: string | null;
  options: string[];
  correct: number;
  explanation: string;
  fgt: number;
}

// ── Mundo del juego ───────────────────────────
export interface World {
  id: number;
  name: string;
  icon: string;
  description: string;
  requiredFGT: number;
  activities: Activity[];
}

// ── Actividad dentro de un mundo ──────────────
export interface Activity {
  id: string;
  worldId: number;
  index: number;
  type: "question" | "space-invaders" | "snake" | "memory" | "quiz-timer";
  title: string;
  fgtReward: number;
}

// ── Estado del jugador ────────────────────────
export interface PlayerProgress {
  completedActivities: Record<string, CompletedActivity>;
  totalFGTEarned: number;
}

export interface CompletedActivity {
  activityId: string;
  fgtEarned: number;
  completedAt: number;
  txHash?: string;
}

// ── Estado del wallet ─────────────────────────
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  provider: any | null;
  signer: any | null;
  phantomNotInstalled: boolean;
  isCorrectNetwork: boolean;
}

// ── Estado del Game Pass ──────────────────────
export type PassStatus = "idle" | "loading" | "confirming" | "success" | "error";

export interface GamePassState {
  hasPass: boolean;
  status: PassStatus;
  error: string | null;
}

// ── Reward request ────────────────────────────
export interface RewardRequest {
  playerAddress: string;
  amount: number;
  gameId: string;
  signature: string;
}

export interface RewardResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

// ── Toast notification ────────────────────────
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// ── Memory Card (juego de memoria) ────────────
export interface MemoryCard {
  id: number;
  content: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

// ── Pares para el juego de memoria ────────────
export interface MemoryPair {
  term: string;
  definition: string;
}

// ── EVM provider type ─────────────────────────
interface EthereumProvider {
  isPhantom?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    phantom?: {
      ethereum?: EthereumProvider;
    };
  }
}
