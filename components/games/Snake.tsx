"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface SnakeProps {
  worldId: number;
  onComplete: (fgt: number) => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE; // 400x400
const INITIAL_SPEED = 150;
const SPEED_INCREASE = 5;
const TARGET_SCORE = 10;

const FOOD_ITEMS: Record<number, string[]> = {
  1: ["<h1>", "<p>", "<a>", "<img>", "<div>", "<ul>", "<form>", "<input>", "<span>", "<table>"],
  2: ["color", "margin", "padding", "flex", "grid", ".class", "#id", "border", "display", "font"],
  3: ["let", "const", "function", "=>", "if", "for", "push()", "map()", "return", "async"],
};

interface Point {
  x: number;
  y: number;
}

export default function Snake({ worldId, onComplete }: SnakeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentFood, setCurrentFood] = useState("");
  const [flashTag, setFlashTag] = useState<string | null>(null);

  // Game state refs (no causan re-render)
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const foodRef = useRef<Point>({ x: 15, y: 10 });
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const scoreRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const foodItems = FOOD_ITEMS[worldId] || FOOD_ITEMS[1];
  const foodIndexRef = useRef(0);

  const spawnFood = useCallback(() => {
    const snake = snakeRef.current;
    let pos: Point;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    foodRef.current = pos;
    foodIndexRef.current = Math.floor(Math.random() * foodItems.length);
    setCurrentFood(foodItems[foodIndexRef.current]);
  }, [foodItems]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fondo
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid sutil
    ctx.strokeStyle = "rgba(124, 58, 237, 0.05)";
    for (let i = 0; i < GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Serpiente
    const snake = snakeRef.current;
    snake.forEach((segment, i) => {
      const brightness = 1 - i * 0.03;
      ctx.fillStyle = i === 0
        ? "#7c3aed"
        : `rgba(124, 58, 237, ${Math.max(0.3, brightness)})`;
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Comida
    const food = foodRef.current;
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(
      food.x * CELL_SIZE + 1,
      food.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );

    // Texto de la comida
    ctx.fillStyle = "#0a0a1a";
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const tag = foodItems[foodIndexRef.current] || "";
    const shortTag = tag.length > 4 ? tag.slice(0, 4) : tag;
    ctx.fillText(
      shortTag,
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2
    );
  }, [foodItems]);

  const gameStep = useCallback(() => {
    const snake = [...snakeRef.current];
    const dir = nextDirRef.current;
    dirRef.current = dir;

    // Nueva cabeza
    const head = {
      x: snake[0].x + dir.x,
      y: snake[0].y + dir.y,
    };

    // Colisión con paredes
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameOver(true);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    // Colisión consigo misma
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      setGameOver(true);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    snake.unshift(head);

    // ¿Comió comida?
    const food = foodRef.current;
    if (head.x === food.x && head.y === food.y) {
      scoreRef.current += 1;
      setScore(scoreRef.current);

      // Flash del tag
      setFlashTag(foodItems[foodIndexRef.current]);
      setTimeout(() => setFlashTag(null), 500);

      if (scoreRef.current >= TARGET_SCORE) {
        setCompleted(true);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        onComplete(15);
        return;
      }

      // Aumentar velocidad cada 5 items
      if (scoreRef.current % 5 === 0) {
        speedRef.current = Math.max(50, speedRef.current - SPEED_INCREASE);
        // Reiniciar loop con nueva velocidad
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(() => {
          gameStep();
        }, speedRef.current);
      }

      spawnFood();
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    draw();
  }, [draw, spawnFood, foodItems, onComplete]);

  // Controles del teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const dir = dirRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (dir.y !== 1) nextDirRef.current = { x: 0, y: -1 };
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (dir.y !== -1) nextDirRef.current = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (dir.x !== 1) nextDirRef.current = { x: -1, y: 0 };
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (dir.x !== -1) nextDirRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Iniciar juego
  useEffect(() => {
    spawnFood();
    draw();

    gameLoopRef.current = setInterval(() => {
      gameStep();
    }, speedRef.current);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center">
      {/* Stats */}
      <div className="flex justify-between w-full max-w-[400px] mb-4">
        <div className="text-sm text-white/60">
          Score: <span className="text-gaming-gold font-pixel text-xs">{score}/{TARGET_SCORE}</span>
        </div>
        <div className="text-sm text-gaming-purple">
          Comida: <span className="text-gaming-gold">{currentFood}</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="game-canvas"
        />

        {/* Flash tag */}
        {flashTag && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-pixel text-2xl text-gaming-gold animate-ping">
              {flashTag}
            </span>
          </div>
        )}

        {/* Game Over */}
        {gameOver && !completed && (
          <div className="absolute inset-0 flex items-center justify-center bg-gaming-dark/80 rounded-lg">
            <div className="text-center">
              <p className="font-pixel text-lg text-gaming-red mb-2">
                Game Over
              </p>
              <p className="text-sm text-white/60">Score: {score}/{TARGET_SCORE}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-gaming-purple text-white font-pixel text-xs px-4 py-2 rounded-lg"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Completado */}
        {completed && (
          <div className="absolute inset-0 flex items-center justify-center bg-gaming-dark/80 rounded-lg">
            <div className="text-center">
              <p className="font-pixel text-lg text-gaming-green mb-2">
                ¡Completado!
              </p>
              <p className="font-pixel text-sm text-gaming-gold">+15 FGT</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-white/30 mt-4">
        Usa las flechas o WASD para moverte
      </p>
    </div>
  );
}
