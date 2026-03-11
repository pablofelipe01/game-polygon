"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useReward } from "@/hooks/useReward";
import { useToast } from "@/components/layout/ToastProvider";
import Header from "@/components/layout/Header";
import RewardAnimation from "@/components/game/RewardAnimation";
import QuestionCard from "@/components/game/QuestionCard";
import MemoryCards from "@/components/games/MemoryCards";
import QuizTimer from "@/components/games/QuizTimer";
import Snake from "@/components/games/Snake";
import SpaceInvaders from "@/components/games/SpaceInvaders";
import { getQuestionsByWorld } from "@/data/questions";
import type { Activity, CompletedActivity } from "@/types";

const WORLD_NAMES: Record<number, { name: string; icon: string }> = {
  1: { name: "HTML", icon: "🌐" },
  2: { name: "CSS", icon: "🎨" },
  3: { name: "JavaScript", icon: "⚡" },
};

function getWorldActivities(worldId: number): Activity[] {
  const questions = getQuestionsByWorld(worldId);
  const activities: Activity[] = [];

  // 6 preguntas de código
  questions.forEach((q, i) => {
    activities.push({
      id: `w${worldId}-q${i + 1}`,
      worldId,
      index: i,
      type: "question",
      title: `Pregunta ${i + 1}: ${q.question.slice(0, 40)}...`,
      fgtReward: q.fgt,
    });
  });

  // 4 mini juegos
  const games: Array<{ type: Activity["type"]; title: string }> = [
    { type: "memory", title: "Memory Cards" },
    { type: "quiz-timer", title: "Quiz Contrarreloj" },
    { type: "snake", title: "Snake Code" },
    { type: "space-invaders", title: "Space Invaders" },
  ];

  games.forEach((game, i) => {
    activities.push({
      id: `w${worldId}-g${i + 1}`,
      worldId,
      index: 6 + i,
      type: game.type,
      title: game.title,
      fgtReward: game.type === "quiz-timer" ? 25 : 15,
    });
  });

  return activities;
}

export default function WorldPage() {
  const params = useParams();
  const router = useRouter();
  const worldId = parseInt(params.id as string);
  const { isConnected, address, initializing } = useWallet();
  const { claimReward, claiming, showParticles } = useReward();
  const { addToast } = useToast();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<
    Record<string, CompletedActivity>
  >({});
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [rewardAmount, setRewardAmount] = useState(0);

  // Redirigir si no está conectado
  useEffect(() => {
    if (!initializing && !isConnected) router.push("/");
  }, [initializing, isConnected, router]);

  // Cargar actividades del mundo
  useEffect(() => {
    if (!worldId || worldId < 1 || worldId > 3) {
      router.push("/map");
      return;
    }
    setActivities(getWorldActivities(worldId));
  }, [worldId, router]);

  // Cargar progreso desde localStorage
  useEffect(() => {
    if (!address) return;
    const saved = localStorage.getItem(`progress_${address}`);
    if (saved) {
      const progress = JSON.parse(saved);
      setCompletedActivities(progress.completedActivities || {});
    }
  }, [address]);

  // Guardar progreso
  const saveProgress = useCallback(
    (newCompleted: Record<string, CompletedActivity>) => {
      if (!address) return;
      const totalFGT = Object.values(newCompleted).reduce(
        (sum, a) => sum + a.fgtEarned,
        0
      );
      localStorage.setItem(
        `progress_${address}`,
        JSON.stringify({
          completedActivities: newCompleted,
          totalFGTEarned: totalFGT,
        })
      );
    },
    [address]
  );

  // Completar actividad y reclamar recompensa
  const handleActivityComplete = useCallback(
    async (activityId: string, fgt: number) => {
      if (!address || fgt <= 0) {
        setActiveActivity(null);
        return;
      }

      setRewardAmount(fgt);

      const gameId = `${address}-${worldId}-${activityId}-${Date.now()}`;
      const result = await claimReward(fgt, gameId);

      if (result.success) {
        const newCompleted = {
          ...completedActivities,
          [activityId]: {
            activityId,
            fgtEarned: fgt,
            completedAt: Date.now(),
            txHash: result.txHash,
          },
        };
        setCompletedActivities(newCompleted);
        saveProgress(newCompleted);
        addToast(`+${fgt} FGT ganados`, "success");
      } else {
        addToast(result.error || "Error al reclamar", "error");
      }

      setTimeout(() => setActiveActivity(null), 2000);
    },
    [address, worldId, claimReward, completedActivities, saveProgress, addToast]
  );

  const worldInfo = WORLD_NAMES[worldId] || WORLD_NAMES[1];
  const completedCount = activities.filter(
    (a) => completedActivities[a.id]
  ).length;
  const progressPercent =
    activities.length > 0 ? (completedCount / activities.length) * 100 : 0;

  if (initializing || !isConnected) return null;

  // ── Render de la actividad activa ───────────
  const renderActivity = () => {
    if (!activeActivity) return null;

    const questions = getQuestionsByWorld(worldId);

    switch (activeActivity.type) {
      case "question": {
        const qIndex = activeActivity.index;
        const question = questions[qIndex];
        if (!question) return null;
        return (
          <QuestionCard
            question={question}
            onComplete={(correct, fgt) =>
              handleActivityComplete(activeActivity.id, fgt)
            }
          />
        );
      }
      case "memory":
        return (
          <MemoryCards
            worldId={worldId}
            onComplete={(fgt) =>
              handleActivityComplete(activeActivity.id, fgt)
            }
          />
        );
      case "quiz-timer":
        return (
          <QuizTimer
            worldId={worldId}
            onComplete={(fgt) =>
              handleActivityComplete(activeActivity.id, fgt)
            }
          />
        );
      case "snake":
        return (
          <Snake
            worldId={worldId}
            onComplete={(fgt) =>
              handleActivityComplete(activeActivity.id, fgt)
            }
          />
        );
      case "space-invaders":
        return (
          <SpaceInvaders
            worldId={worldId}
            onComplete={(fgt) =>
              handleActivityComplete(activeActivity.id, fgt)
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <RewardAnimation show={showParticles} amount={rewardAmount} />

      <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        {/* Header del mundo */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">{worldInfo.icon}</span>
          <h1 className="font-pixel text-xl text-gaming-gold mb-2">
            Mundo {worldId}: {worldInfo.name}
          </h1>

          {/* Barra de progreso */}
          <div className="max-w-md mx-auto mt-4">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>
                {completedCount}/{activities.length} actividades
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-3 bg-gaming-dark rounded-full overflow-hidden border border-gaming-purple/20">
              <div
                className="h-full bg-gaming-purple rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actividad activa o lista de actividades */}
        {activeActivity ? (
          <div>
            <button
              onClick={() => setActiveActivity(null)}
              className="mb-6 text-sm text-gaming-purple hover:text-white transition-colors flex items-center gap-2"
            >
              ← Volver a la lista
            </button>
            <h2 className="font-pixel text-sm text-white mb-6 text-center">
              {activeActivity.title}
            </h2>
            {renderActivity()}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((activity) => {
              const isCompleted = !!completedActivities[activity.id];
              const earnedFGT =
                completedActivities[activity.id]?.fgtEarned || 0;

              const typeIcons: Record<string, string> = {
                question: "📝",
                memory: "🃏",
                "quiz-timer": "⏱️",
                snake: "🐍",
                "space-invaders": "👾",
              };

              return (
                <button
                  key={activity.id}
                  onClick={() => !isCompleted && setActiveActivity(activity)}
                  disabled={isCompleted || claiming}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isCompleted
                      ? "border-gaming-green/30 bg-gaming-green/5 cursor-default"
                      : "border-gaming-purple/30 bg-gaming-card hover:border-gaming-purple hover:bg-gaming-purple/5 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {isCompleted ? "✅" : typeIcons[activity.type] || "📋"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-bold truncate ${
                          isCompleted ? "text-gaming-green" : "text-white"
                        }`}
                      >
                        {activity.title}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {isCompleted
                          ? `+${earnedFGT} FGT ganados`
                          : `Recompensa: ${activity.fgtReward} FGT`}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Botón volver al mapa */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push("/map")}
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            ← Volver al mapa de mundos
          </button>
        </div>
      </div>
    </>
  );
}
