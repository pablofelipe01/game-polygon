"use client";

import { useState, useEffect } from "react";
import type { MemoryPair } from "@/types";

interface MemoryCardsProps {
  worldId: number;
  onComplete: (fgt: number) => void;
}

const PAIRS_BY_WORLD: Record<number, MemoryPair[]> = {
  1: [
    { term: "<h1>", definition: "Título" },
    { term: "<p>", definition: "Párrafo" },
    { term: "<a>", definition: "Enlace" },
    { term: "<img>", definition: "Imagen" },
    { term: "<ul>", definition: "Lista" },
    { term: "<div>", definition: "Contenedor" },
    { term: "<form>", definition: "Formulario" },
    { term: "<input>", definition: "Campo de texto" },
  ],
  2: [
    { term: "color", definition: "Color de texto" },
    { term: "margin", definition: "Espacio exterior" },
    { term: "padding", definition: "Espacio interior" },
    { term: "display", definition: "Tipo de caja" },
    { term: "flex", definition: "Diseño flexible" },
    { term: ".clase", definition: "Selector clase" },
    { term: "#id", definition: "Selector ID" },
    { term: "border", definition: "Borde" },
  ],
  3: [
    { term: "let", definition: "Variable" },
    { term: "function", definition: "Función" },
    { term: "[]", definition: "Array" },
    { term: "{}", definition: "Objeto" },
    { term: "if", definition: "Condicional" },
    { term: "for", definition: "Bucle" },
    { term: "console.log", definition: "Imprimir" },
    { term: "return", definition: "Retornar valor" },
  ],
};

interface Card {
  id: number;
  content: string;
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryCards({ worldId, onComplete }: MemoryCardsProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Inicializar cartas
  useEffect(() => {
    const pairs = PAIRS_BY_WORLD[worldId] || PAIRS_BY_WORLD[1];
    const allCards: Card[] = [];

    pairs.forEach((pair, index) => {
      allCards.push({
        id: index * 2,
        content: pair.term,
        pairId: index,
        isFlipped: false,
        isMatched: false,
      });
      allCards.push({
        id: index * 2 + 1,
        content: pair.definition,
        pairId: index,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Mezclar cartas (Fisher-Yates)
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    setCards(allCards);
    setStartTime(Date.now());
  }, [worldId]);

  // Timer
  useEffect(() => {
    if (completed || startTime === 0) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, completed]);

  const handleCardClick = (cardId: number) => {
    if (isChecking || completed) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    // Voltear carta
    const newCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Si hay 2 cartas volteadas, verificar match
    if (newFlipped.length === 2) {
      setIsChecking(true);
      setAttempts((a) => a + 1);

      const card1 = newCards.find((c) => c.id === newFlipped[0])!;
      const card2 = newCards.find((c) => c.id === newFlipped[1])!;

      if (card1.pairId === card2.pairId) {
        // Match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === card1.pairId ? { ...c, isMatched: true } : c
            )
          );
          setMatchedPairs((m) => {
            const newM = m + 1;
            if (newM === 8) {
              setCompleted(true);
              onComplete(15);
            }
            return newM;
          });
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No match — voltear de vuelta
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Stats */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-white/60">
          Pares: <span className="text-gaming-gold">{matchedPairs}/8</span>
        </div>
        <div className="text-sm text-white/60">
          Tiempo: <span className="text-gaming-purple">{formatTime(elapsed)}</span>
        </div>
        <div className="text-sm text-white/60">
          Intentos: <span className="text-gaming-purple">{attempts}</span>
        </div>
      </div>

      {/* Grid 4x4 */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flip-card aspect-square cursor-pointer"
            onClick={() => handleCardClick(card.id)}
          >
            <div
              className={`flip-card-inner ${
                card.isFlipped || card.isMatched ? "flipped" : ""
              }`}
            >
              {/* Frente (tapada) */}
              <div className="flip-card-front bg-gaming-purple/30 border-2 border-gaming-purple/50 hover:border-gaming-purple">
                <span className="font-pixel text-lg text-gaming-purple">?</span>
              </div>
              {/* Reverso (contenido) */}
              <div
                className={`flip-card-back border-2 p-2 ${
                  card.isMatched
                    ? "bg-gaming-green/20 border-gaming-green/50"
                    : "bg-gaming-card border-gaming-gold/50"
                }`}
              >
                <span className="font-mono text-xs text-center text-gaming-gold leading-tight">
                  {card.content}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resultado */}
      {completed && (
        <div className="mt-6 text-center bg-gaming-green/10 border border-gaming-green/50 rounded-xl p-4">
          <p className="font-pixel text-sm text-gaming-green mb-1">
            ¡Completado!
          </p>
          <p className="text-sm text-white/60">
            {attempts} intentos · {formatTime(elapsed)}
          </p>
          <p className="text-gaming-gold font-pixel text-xs mt-2">+15 FGT</p>
        </div>
      )}
    </div>
  );
}
