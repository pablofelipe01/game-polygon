"use client";

import { useState } from "react";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  onComplete: (correct: boolean, fgt: number) => void;
}

export default function QuestionCard({
  question,
  onComplete,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === question.correct;
    setTimeout(() => {
      onComplete(isCorrect, isCorrect ? question.fgt : 0);
    }, 2500);
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return "border-gaming-purple/30 hover:border-gaming-purple bg-gaming-card hover:bg-gaming-purple/10";
    }
    if (index === question.correct) {
      return "border-gaming-green bg-gaming-green/10";
    }
    if (index === selectedAnswer && index !== question.correct) {
      return "border-gaming-red bg-gaming-red/10";
    }
    return "border-white/10 bg-gaming-card opacity-50";
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Pregunta */}
      <div className="bg-gaming-card border border-gaming-purple/30 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">
          {question.question}
        </h3>

        {/* Bloque de código */}
        {question.code && (
          <pre className="bg-gaming-dark border border-gaming-purple/20 rounded-lg p-4 mb-4 font-mono text-sm text-gaming-gold overflow-x-auto">
            <code>{question.code}</code>
          </pre>
        )}

        {/* Recompensa */}
        <div className="flex items-center gap-2 text-sm text-gaming-gold">
          <span>💰</span>
          <span>{question.fgt} FGT</span>
        </div>
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={showResult}
            className={`w-full text-left border-2 rounded-xl px-5 py-4 transition-all ${getOptionStyle(
              index
            )} disabled:cursor-default`}
          >
            <span className="inline-flex items-center gap-3">
              <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-sm font-bold shrink-0">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="font-mono text-sm">{option}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Explicación */}
      {showResult && (
        <div
          className={`mt-6 p-4 rounded-xl border ${
            selectedAnswer === question.correct
              ? "border-gaming-green/50 bg-gaming-green/5"
              : "border-gaming-red/50 bg-gaming-red/5"
          }`}
        >
          <p className="font-bold mb-1">
            {selectedAnswer === question.correct
              ? "✅ ¡Correcto!"
              : "❌ Incorrecto"}
          </p>
          <p className="text-sm text-white/70">{question.explanation}</p>
          {selectedAnswer === question.correct && (
            <p className="text-sm text-gaming-gold mt-2">
              +{question.fgt} FGT ganados
            </p>
          )}
        </div>
      )}
    </div>
  );
}
