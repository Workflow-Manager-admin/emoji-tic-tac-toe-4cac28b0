"use client";
import { useState, useEffect } from "react";

// --- Constants for emojis and colors ---
const PLAYER_EMOJIS = ["😺", "🐶"];
const PLAYER_LABELS = ["Cat", "Dog"];
const BOARD_SIZE = 3;
const WIN_PATTERNS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Color palette
const COLOR_PRIMARY = "#4F8A8B";
const COLOR_SECONDARY = "#FFB866";
const COLOR_ACCENT = "#F76E5C";

type GameStatus = "playing" | "win" | "draw";

// PUBLIC_INTERFACE
function getWinner(board: (0|1|null)[]): 0|1|null {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (
      board[a] !== null &&
      board[a] === board[b] &&
      board[b] === board[c]
    ) {
      return board[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function isDraw(board: (0|1|null)[]): boolean {
  return board.every(cell => cell !== null);
}

// --- Animated Background Component ---
function AnimatedBackground() {
  // Animate bubbles with color+size+movement, SVG + tailwind + keyframes
  // Modern playful effect: floating colored blobs with motion

  // Simple CSS keyframes injected here (so tailwind will include them)
  return (
    <>
      <style>{`
        @keyframes floatxy {
          0%   { transform: translateY(0px) translateX(0px) scale(1);}
          40%  { transform: translateY(-30px) translateX(20px) scale(1.08);}
          70%  { transform: translateY(30px)  translateX(-10px) scale(0.97);}
          100% { transform: translateY(0px) translateX(0px) scale(1);}
        }
      `}</style>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <svg width="100vw" height="100vh" className="absolute w-full h-full" style={{ filter: "blur(8px)" }}>
          {/* Blobs */}
          <ellipse
            cx="18%"
            cy="20%"
            rx="160"
            ry="110"
            fill={COLOR_PRIMARY}
            fillOpacity={0.25}
            style={{ animation: "floatxy 10s ease-in-out infinite" }}
          />
          <ellipse
            cx="80%"
            cy="22%"
            rx="110"
            ry="170"
            fill={COLOR_ACCENT}
            fillOpacity={0.20}
            style={{ animation: "floatxy 12s ease-in-out alternate infinite", animationDelay: "2s" }}
          />
          <ellipse
            cx="45%"
            cy="85%"
            rx="210"
            ry="100"
            fill={COLOR_SECONDARY}
            fillOpacity={0.22}
            style={{ animation: "floatxy 16s ease-in-out alternate infinite", animationDelay: "4s" }}
          />
        </svg>
      </div>
    </>
  );
}

// --- Board Square ---
type SquareProps = {
  value: 0|1|null,
  onClick: () => void,
  highlight: boolean,
  idx: number,
  disabled: boolean,
};
function Square({ value, onClick, highlight, idx, disabled }: SquareProps) {
  return (
    <button
      aria-label={`Tic Tac Toe Square ${idx+1}`}
      type="button"
      className={`
        aspect-square w-full flex items-center justify-center text-5xl sm:text-6xl
        rounded-xl border-2 transition-all duration-200
        shadow-sm
        ${highlight
          ? `border-[${COLOR_ACCENT}] bg-[${COLOR_SECONDARY}] bg-opacity-40 scale-110`
          : "border-gray-300 bg-white dark:bg-[#272727]"}
        hover:scale-105 hover:shadow-lg
      `}
      style={{
        minHeight: "56px",
        outline: highlight ? `4px solid ${COLOR_ACCENT}` : undefined,
        borderColor: highlight ? COLOR_ACCENT : "#E0E0E0",
        background:
          highlight
            ? `linear-gradient(135deg, ${COLOR_PRIMARY}11 0%, ${COLOR_ACCENT}15 100%)`
            : undefined,
        cursor: disabled ? "default" : "pointer"
      }}
      onClick={onClick}
      disabled={disabled || !!value}
      tabIndex={0}
    >
      {typeof value === "number" ? (
        <span
          className={`transition-transform duration-300 select-none ${
            value !== null ? "scale-100" : "scale-0"
          }`}
        >
          {PLAYER_EMOJIS[value]}
        </span>
      ) : ""}
    </button>
  );
}

// --- Main Game UI ---
export default function Home() {
  // State: board (flat 3x3), 0 for player1, 1 for player2, null for empty. 0 goes first.
  const [board, setBoard] = useState<(0|1|null)[]>(Array(BOARD_SIZE*BOARD_SIZE).fill(null));
  const [next, setNext] = useState<0|1>(0);
  const [winner, setWinner] = useState<0|1|null>(null);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [playLocked, setPlayLocked] = useState(false);

  // Check for win/draw on board change
  useEffect(() => {
    const foundWinner = getWinner(board);
    if (foundWinner !== null) {
      setWinner(foundWinner);
      setStatus("win");
      // Find the winning line
      const line = WIN_PATTERNS.find(
        ([a, b, c]) => board[a] === foundWinner && board[b] === foundWinner && board[c] === foundWinner
      );
      setWinLine(line || null);
      setPlayLocked(true);
    } else if (isDraw(board)) {
      setStatus("draw");
      setWinLine(null);
      setPlayLocked(true);
    } else {
      setWinner(null);
      setStatus("playing");
      setWinLine(null);
      setPlayLocked(false);
    }
  }, [board]);

  // PUBLIC_INTERFACE
  function handleSquare(idx: number) {
    if (board[idx] !== null || playLocked) return;
    setBoard(prev => prev.map((v, i) => (i === idx ? next : v)));
    setNext(prev => (prev === 0 ? 1 : 0));
  }

  // PUBLIC_INTERFACE
  function resetGame() {
    setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    setNext(Math.random() < 0.5 ? 0 : 1); // Randomize first player on reset
    setStatus("playing");
    setWinner(null);
    setWinLine(null);
    setPlayLocked(false);
  }

  // --- Render ---
  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex flex-col items-center justify-center px-3 pb-5 pt-10 relative z-0">
        {/* Title and control */}
        <div className="flex flex-col items-center mb-7 gap-1">
          <h1
            className='mb-1 text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-lg text-center'
            style={{
              color: COLOR_PRIMARY,
              textShadow: `2px 2px 0 ${COLOR_SECONDARY}, 0px 8px 20px ${COLOR_ACCENT}cc`
            }}>
            Emoji Tic Tac Toe
          </h1>
          <div className="flex gap-2 items-center justify-center">
            <span className="font-bold text-xl">😺</span>
            <span className="rounded px-2 py-1" style={{
              background: next === 0 && status === "playing" ? COLOR_PRIMARY : "#eee",
              color: next === 0 ? "#fff" : "#222",
              border: next === 0 ? `2px solid ${COLOR_ACCENT}` : "none",
              fontWeight: "600",
              transition: "all 0.2s"
            }}>
              Cat
            </span>
            <span className="text-md font-bold px-2 opacity-60">vs</span>
            <span className="rounded px-2 py-1" style={{
              background: next === 1 && status === "playing" ? COLOR_SECONDARY : "#eee",
              color: next === 1 ? "#fff" : "#222",
              border: next === 1 ? `2px solid ${COLOR_ACCENT}` : "none",
              fontWeight: "600"
            }}>
              Dog
            </span>
            <span className="font-bold text-xl">🐶</span>
          </div>
          <span className="mt-3 text-base font-semibold tracking-wide"
            style={{ color: COLOR_ACCENT, letterSpacing: "1px" }}>
            {status === "playing" && (
              <>
                <span className="animate-pulse">
                  {PLAYER_LABELS[next]}{"'"}s turn {PLAYER_EMOJIS[next]}
                </span>
              </>
            )}
            {status === "win" && winner !== null && (
              <>
                <span className="font-black text-2xl drop-shadow w-24 animate-bounce">
                  {PLAYER_LABELS[winner]} {PLAYER_EMOJIS[winner]} wins!
                </span>
              </>
            )}
            {status === "draw" && (
              <>
                <span className="font-black text-xl drop-shadow animate-shake">
                  It{"'"}s a Draw!
                </span>
              </>
            )}
          </span>
        </div>

        {/* Board */}
        <div
          className={`
            grid
            mx-auto
            gap-2
            sm:gap-3
            rounded-3xl p-4
            shadow-[0_8px_40px_0_${COLOR_ACCENT}33]
            bg-white bg-opacity-95
            dark:bg-[#1e1e1ecc]
            transition-all duration-400
            w-full
            max-w-xs sm:max-w-md
          `}
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: "min(92vw, 410px)",
          }}
        >
          {board.map((val, idx) => (
            <Square
              key={idx}
              value={val}
              onClick={() => handleSquare(idx)}
              highlight={!!winLine?.includes(idx)}
              idx={idx}
              disabled={playLocked}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            className="rounded-full px-7 py-2 text-lg sm:text-xl font-semibold border-4 border-transparent shadow-sm hover:shadow-lg transition-all bg-gradient-to-r from-[#fbe3b2] to-[#ffd6cf] text-[#36312e]"
            style={{
              background: `linear-gradient(90deg, ${COLOR_PRIMARY}22 0%, ${COLOR_SECONDARY}55 100%)`,
              borderColor: COLOR_ACCENT,
              color: "#242424",
              fontWeight: 800,
              letterSpacing: "1.5px"
            }}
            onClick={resetGame}
            aria-label="Reset Game"
          >
            🔄 Reset Game
          </button>
          <span className="text-xs text-gray-500 mt-2">Made with Next.js &amp; ❤️</span>
        </div>
      </div>
    </>
  );
}
