"use client";

import { useState, useEffect, useCallback } from "react";
import { getQuizQuestions } from "@/data/questions";
import type { Question } from "@/types";

interface QuizTimerProps {
  worldId: number;
  onComplete: (fgt: number) => void;
}

const TOTAL_TIME = 60; // 60 segundos total

export default function QuizTimer({ worldId, onComplete }: QuizTimerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Inicializar preguntas
  useEffect(() => {
    const worldQuestions = getQuizQuestions(worldId);
    // Duplicar y mezclar si hay menos de 10
    let pool = [...worldQuestions];
    while (pool.length < 10) {
      pool = [...pool, ...worldQuestions];
    }
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setQuestions(pool.slice(0, 10));
  }, [worldId]);

  // Timer countdown
  useEffect(() => {
    if (finished || questions.length === 0) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, finished, questions]);

  // Keyboard shortcuts (1, 2, 3, 4)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showResult || finished) return;
      const key = parseInt(e.key);
      if (key >= 1 && key <= 4) {
        handleAnswer(key - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleAnswer = useCallback(
    (index: number) => {
      if (showResult || finished || !questions[currentIndex]) return;

      setSelectedAnswer(index);
      setShowResult(true);

      const isCorrect = index === questions[currentIndex].correct;
      if (isCorrect) {
        setScore((s) => s + 1);
      }

      setTimeout(() => {
        if (currentIndex + 1 >= 10) {
          setFinished(true);
        } else {
          setCurrentIndex((i) => i + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        }
      }, 1000);
    },
    [showResult, finished, questions, currentIndex]
  );

  // Calcular recompensa al terminar
  useEffect(() => {
    if (!finished) return;
    let fgt: number;
    if (score === 10) fgt = 25;
    else if (score >= 7) fgt = 18;
    else if (score >= 4) fgt = 10;
    else fgt = 3;
    onComplete(fgt);
  }, [finished, score, onComplete]);

  if (questions.length === 0) {
    return (
      <div className="text-center text-white/60">Cargando preguntas...</div>
    );
  }

  const timePercent = (timeLeft / TOTAL_TIME) * 100;
  const isCritical = timeLeft <= 10;

  if (finished) {
    let fgt: number;
    let message: string;
    if (score === 10) {
      fgt = 25;
      message = "¡Perfecto! 🌟";
    } else if (score >= 7) {
      fgt = 18;
      message = "¡Excelente! ⭐";
    } else if (score >= 4) {
      fgt = 10;
      message = "¡Bien! 👍";
    } else {
      fgt = 3;
      message = "¡Sigue intentando! 💪";
    }

    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-gaming-card border border-gaming-purple/30 rounded-xl p-8">
          <h3 className="font-pixel text-2xl text-gaming-gold mb-4">
            {message}
          </h3>
          <div className="text-4xl font-pixel text-gaming-purple mb-4">
            {score}/10
          </div>
          <p className="text-white/60 mb-4">respuestas correctas</p>
          <div className="bg-gaming-gold/10 border border-gaming-gold/30 rounded-lg p-3">
            <p className="font-pixel text-sm text-gaming-gold">+{fgt} FGT</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header: timer + progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/60">
            Pregunta {currentIndex + 1}/10
          </span>
          <span
            className={`font-pixel text-xs ${
              isCritical ? "text-gaming-red" : "text-gaming-purple"
            }`}
          >
            {timeLeft}s
          </span>
          <span className="text-gaming-gold">Score: {score}</span>
        </div>

        {/* Barra de tiempo */}
        <div className="h-3 bg-gaming-dark rounded-full overflow-hidden border border-gaming-purple/20">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isCritical
                ? "bg-gaming-red progress-critical"
                : "bg-gaming-purple"
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      </div>

      {/* Pregunta */}
      <div className="bg-gaming-card border border-gaming-purple/30 rounded-xl p-5 mb-4">
        <p className="text-white font-bold">{currentQ.question}</p>
        {currentQ.code && (
          <pre className="mt-3 bg-gaming-dark rounded-lg p-3 font-mono text-sm text-gaming-gold">
            {currentQ.code}
          </pre>
        )}
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-1 gap-2">
        {currentQ.options.map((option, index) => {
          let style =
            "border-gaming-purple/30 hover:border-gaming-purple bg-gaming-card";
          if (showResult) {
            if (index === currentQ.correct) {
              style = "border-gaming-green bg-gaming-green/10";
            } else if (
              index === selectedAnswer &&
              index !== currentQ.correct
            ) {
              style = "border-gaming-red bg-gaming-red/10";
            } else {
              style = "border-white/10 bg-gaming-card opacity-50";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={`w-full text-left border-2 rounded-lg px-4 py-3 transition-all ${style} disabled:cursor-default`}
            >
              <span className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </span>
                <span className="font-mono text-sm">{option}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-white/30 text-xs mt-4">
        Usa las teclas 1, 2, 3, 4 para responder rápido
      </p>
    </div>
  );
}
