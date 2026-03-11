"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface SpaceInvadersProps {
  worldId: number;
  onComplete: (fgt: number) => void;
}

const CANVAS_W = 600;
const CANVAS_H = 500;
const PLAYER_W = 40;
const PLAYER_H = 30;
const BULLET_SIZE = 4;
const ENEMY_W = 50;
const ENEMY_H = 30;
const MAX_BULLETS = 3;
const COLS = 5;
const ROWS = 3;

const ENEMY_LABELS: Record<number, string[]> = {
  1: ["<h1>", "<p>", "<a>", "<img>", "<div>", "<ul>", "<li>", "<form>", "<span>", "<br>",
      "<h2>", "<h3>", "<table>", "<tr>", "<td>"],
  2: [".class", "#id", "*", "div", "p", "color", "flex", "grid", "margin", "padding",
      "border", "font", "text", "bg", "hover"],
  3: ["{}", "()", "=>", ";", "fn", "let", "const", "if", "for", "while",
      "map", "push", "pop", "new", "this"],
  4: ["contract", "mapping", "address", "uint256", "msg.sender", "require", "event",
      "emit", "payable", "view", "pure", "modifier", "storage", "memory", "abi"],
};

interface Entity {
  x: number;
  y: number;
  alive: boolean;
  label: string;
}

interface Bullet {
  x: number;
  y: number;
  active: boolean;
}

export default function SpaceInvaders({ worldId, onComplete }: SpaceInvadersProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Refs for game state
  const playerXRef = useRef(CANVAS_W / 2 - PLAYER_W / 2);
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Entity[]>([]);
  const enemyBulletsRef = useRef<Bullet[]>([]);
  const enemyDirRef = useRef(1);
  const enemySpeedRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const keysRef = useRef<Set<string>>(new Set());
  const animRef = useRef<number>(0);
  const lastEnemyMoveRef = useRef(0);
  const lastEnemyShotRef = useRef(0);
  const gameOverRef = useRef(false);

  // Inicializar enemigos
  const initEnemies = useCallback(() => {
    const labels = ENEMY_LABELS[worldId] || ENEMY_LABELS[1];
    const enemies: Entity[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        enemies.push({
          x: 60 + col * (ENEMY_W + 20),
          y: 40 + row * (ENEMY_H + 15),
          alive: true,
          label: labels[(row * COLS + col) % labels.length],
        });
      }
    }
    enemiesRef.current = enemies;
  }, [worldId]);

  // Dibujar frame
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fondo
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Jugador (triángulo)
    const px = playerXRef.current;
    const py = CANVAS_H - 50;
    ctx.fillStyle = "#7c3aed";
    ctx.beginPath();
    ctx.moveTo(px + PLAYER_W / 2, py);
    ctx.lineTo(px, py + PLAYER_H);
    ctx.lineTo(px + PLAYER_W, py + PLAYER_H);
    ctx.closePath();
    ctx.fill();

    // Glow del jugador
    ctx.shadowColor = "#7c3aed";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Balas del jugador
    ctx.fillStyle = "#f59e0b";
    bulletsRef.current.forEach((b) => {
      if (b.active) {
        ctx.fillRect(b.x - BULLET_SIZE / 2, b.y, BULLET_SIZE, BULLET_SIZE * 2);
      }
    });

    // Enemigos
    enemiesRef.current.forEach((e) => {
      if (!e.alive) return;
      ctx.fillStyle = "#12122a";
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1;
      ctx.fillRect(e.x, e.y, ENEMY_W, ENEMY_H);
      ctx.strokeRect(e.x, e.y, ENEMY_W, ENEMY_H);

      // Label del enemigo
      ctx.fillStyle = "#f59e0b";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(e.label, e.x + ENEMY_W / 2, e.y + ENEMY_H / 2);
    });

    // Balas enemigas
    ctx.fillStyle = "#ef4444";
    enemyBulletsRef.current.forEach((b) => {
      if (b.active) {
        ctx.fillRect(b.x - 2, b.y, 4, 8);
      }
    });

    // HUD
    ctx.fillStyle = "#f59e0b";
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${scoreRef.current}`, 10, 20);
    ctx.textAlign = "right";
    ctx.fillText(`Vidas: ${"♥".repeat(livesRef.current)}`, CANVAS_W - 10, 20);
  }, []);

  // Game loop
  const gameLoop = useCallback(
    (time: number) => {
      if (gameOverRef.current) return;

      const keys = keysRef.current;

      // Mover jugador
      if (keys.has("ArrowLeft") || keys.has("a")) {
        playerXRef.current = Math.max(0, playerXRef.current - 5);
      }
      if (keys.has("ArrowRight") || keys.has("d")) {
        playerXRef.current = Math.min(
          CANVAS_W - PLAYER_W,
          playerXRef.current + 5
        );
      }

      // Disparar
      if (keys.has(" ")) {
        const activeBullets = bulletsRef.current.filter((b) => b.active);
        if (activeBullets.length < MAX_BULLETS) {
          bulletsRef.current.push({
            x: playerXRef.current + PLAYER_W / 2,
            y: CANVAS_H - 55,
            active: true,
          });
        }
        keys.delete(" ");
      }

      // Mover balas del jugador
      bulletsRef.current = bulletsRef.current
        .map((b) => (b.active ? { ...b, y: b.y - 6 } : b))
        .filter((b) => b.y > -10);

      // Mover balas enemigas
      enemyBulletsRef.current = enemyBulletsRef.current
        .map((b) => (b.active ? { ...b, y: b.y + 4 } : b))
        .filter((b) => b.y < CANVAS_H + 10);

      // Mover enemigos
      if (time - lastEnemyMoveRef.current > 800) {
        lastEnemyMoveRef.current = time;
        const aliveEnemies = enemiesRef.current.filter((e) => e.alive);

        // Verificar bordes
        const rightMost = Math.max(...aliveEnemies.map((e) => e.x + ENEMY_W));
        const leftMost = Math.min(...aliveEnemies.map((e) => e.x));

        if (rightMost >= CANVAS_W - 10 && enemyDirRef.current === 1) {
          enemyDirRef.current = -1;
          enemiesRef.current.forEach((e) => {
            if (e.alive) e.y += 20;
          });
        } else if (leftMost <= 10 && enemyDirRef.current === -1) {
          enemyDirRef.current = 1;
          enemiesRef.current.forEach((e) => {
            if (e.alive) e.y += 20;
          });
        }

        enemiesRef.current.forEach((e) => {
          if (e.alive) {
            e.x += enemyDirRef.current * 20 * enemySpeedRef.current;
          }
        });
      }

      // Disparos enemigos
      if (time - lastEnemyShotRef.current > 1500) {
        lastEnemyShotRef.current = time;
        const aliveEnemies = enemiesRef.current.filter((e) => e.alive);
        if (aliveEnemies.length > 0) {
          const shooter =
            aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
          enemyBulletsRef.current.push({
            x: shooter.x + ENEMY_W / 2,
            y: shooter.y + ENEMY_H,
            active: true,
          });
        }
      }

      // Colisión: bala del jugador vs enemigo
      bulletsRef.current.forEach((bullet) => {
        if (!bullet.active) return;
        enemiesRef.current.forEach((enemy) => {
          if (!enemy.alive) return;
          if (
            bullet.x >= enemy.x &&
            bullet.x <= enemy.x + ENEMY_W &&
            bullet.y >= enemy.y &&
            bullet.y <= enemy.y + ENEMY_H
          ) {
            bullet.active = false;
            enemy.alive = false;
            scoreRef.current += 10;
            setScore(scoreRef.current);
          }
        });
      });

      // Colisión: bala enemiga vs jugador
      const px = playerXRef.current;
      const py = CANVAS_H - 50;
      enemyBulletsRef.current.forEach((bullet) => {
        if (!bullet.active) return;
        if (
          bullet.x >= px &&
          bullet.x <= px + PLAYER_W &&
          bullet.y >= py &&
          bullet.y <= py + PLAYER_H
        ) {
          bullet.active = false;
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            gameOverRef.current = true;
            setGameOver(true);
            return;
          }
        }
      });

      // Enemigo llega abajo
      const bottomEnemy = enemiesRef.current.some(
        (e) => e.alive && e.y + ENEMY_H >= CANVAS_H - 60
      );
      if (bottomEnemy) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
          gameOverRef.current = true;
          setGameOver(true);
          return;
        }
      }

      // Victoria: todos los enemigos eliminados
      const allDead = enemiesRef.current.every((e) => !e.alive);
      if (allDead) {
        gameOverRef.current = true;
        setCompleted(true);
        onComplete(15);
        return;
      }

      draw();
      animRef.current = requestAnimationFrame(gameLoop);
    },
    [draw, onComplete]
  );

  // Keyboard events
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === " ") e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Start game
  useEffect(() => {
    initEnemies();
    animRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="game-canvas"
        />

        {/* Game Over overlay */}
        {gameOver && !completed && (
          <div className="absolute inset-0 flex items-center justify-center bg-gaming-dark/80 rounded-lg">
            <div className="text-center">
              <p className="font-pixel text-lg text-gaming-red mb-2">
                Game Over
              </p>
              <p className="text-sm text-white/60">Score: {score}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-gaming-purple text-white font-pixel text-xs px-4 py-2 rounded-lg"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Victoria */}
        {completed && (
          <div className="absolute inset-0 flex items-center justify-center bg-gaming-dark/80 rounded-lg">
            <div className="text-center">
              <p className="font-pixel text-lg text-gaming-green mb-2">
                ¡Victoria!
              </p>
              <p className="text-sm text-white/60">Score: {score}</p>
              <p className="font-pixel text-sm text-gaming-gold mt-2">
                +15 FGT
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-white/30 mt-4">
        ← → o A/D para mover · Espacio para disparar
      </p>
    </div>
  );
}
