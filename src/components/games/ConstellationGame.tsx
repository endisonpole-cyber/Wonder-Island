"use client";

import { useState, useEffect } from "react";

interface ConstellationGameProps {
  onComplete: (score: number, stars: number) => void;
}

interface Dot {
  id: number;
  x: number;
  y: number;
  number: number;
  connected: boolean;
}

// Predefined constellation patterns (normalized 0-100 coordinates)
const PATTERNS = [
  { name: "北斗七星", dots: [{x:15,y:70},{x:25,y:50},{x:40,y:45},{x:55,y:50},{x:65,y:65},{x:80,y:55},{x:85,y:40}] },
  { name: "猎户座", dots: [{x:30,y:15},{x:45,y:10},{x:60,y:15},{x:25,y:45},{x:65,y:45},{x:35,y:80},{x:55,y:80}] },
  { name: "天蝎座", dots: [{x:15,y:35},{x:25,y:30},{x:35,y:25},{x:45,y:30},{x:55,y:40},{x:65,y:55},{x:75,y:65},{x:80,y:75}] },
];

export default function ConstellationGame({ onComplete }: ConstellationGameProps) {
  const [dots, setDots] = useState<Dot[]>([]);
  const [connectedOrder, setConnectedOrder] = useState<number[]>([]);
  const [pattern, setPattern] = useState(PATTERNS[0]);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"playing" | "success">("playing");
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    startRound();
  }, []);

  const startRound = () => {
    const p = PATTERNS[round % PATTERNS.length];
    setPattern(p);
    setDots(
      p.dots.map((d, i) => ({
        id: i,
        x: d.x,
        y: d.y,
        number: i + 1,
        connected: false,
      }))
    );
    setConnectedOrder([]);
    setPhase("playing");
  };

  const handleDotClick = (dotId: number) => {
    if (phase !== "playing") return;

    const nextNum = connectedOrder.length + 1;

    // Check if correct
    if (dotId + 1 === nextNum) {
      setDots((prev) =>
        prev.map((d) => (d.id === dotId ? { ...d, connected: true } : d))
      );
      setConnectedOrder((prev) => [...prev, dotId]);

      // Check if all connected
      if (nextNum === pattern.dots.length) {
        const timer = setTimeout(() => {
          setPhase("success");
          const score = Math.max(10 - errors * 3, 1);
          const stars = errors === 0 ? 3 : errors <= 1 ? 2 : 1;

          if (round < 2) {
            setTimeout(() => {
              setRound((r) => r + 1);
              setErrors(0);
              startRound();
            }, 1500);
          } else {
            onComplete(score * 3, stars);
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    } else {
      setErrors((e) => e + 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔭</span>
          <span className="text-lg font-bold text-cream">星座连线</span>
        </div>
        <div className="bg-navy-mid border border-navy-border rounded-full px-4 py-1">
          <span className="text-sm text-muted">第 {round + 1}/3 轮 · </span>
          <span className="text-sm text-sunshine font-bold">{pattern.name}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-navy-mid border border-lavender rounded-xl p-4 text-center">
        <p className="text-xl font-bold text-cream">
          按数字顺序把星星连成{pattern.name}！
        </p>
        <p className="text-sm text-muted mt-1">
          下一个要点的是第 <span className="text-sunshine font-bold">{connectedOrder.length + 1}</span> 号星星
        </p>
      </div>

      {/* Constellation board */}
      <div className="relative w-full max-w-lg h-[320px] sm:h-[400px] bg-navy-mid rounded-2xl border border-navy-border overflow-hidden star-field">
        {/* Connection lines using SVG */}
        <svg className="absolute inset-0 w-full h-full">
          {connectedOrder.map((dotId, idx) => {
            if (idx === 0) return null;
            const prevDot = dots.find((d) => d.id === connectedOrder[idx - 1]);
            const currDot = dots.find((d) => d.id === dotId);
            if (!prevDot || !currDot) return null;
            return (
              <line
                key={idx}
                x1={`${prevDot.x}%`}
                y1={`${prevDot.y}%`}
                x2={`${currDot.x}%`}
                y2={`${currDot.y}%`}
                stroke="#FFE66D"
                strokeWidth="2"
                opacity="0.7"
              />
            );
          })}
        </svg>

        {/* Dots */}
        {dots.map((dot) => (
          <button
            key={dot.id}
            onClick={() => handleDotClick(dot.id)}
            className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300 border-2 ${
              dot.connected
                ? "bg-sunshine border-sunshine text-navy scale-110"
                : connectedOrder.length + 1 === dot.number
                ? "bg-navy border-teal text-teal animate-pulse-glow scale-110"
                : "bg-navy border-navy-border text-muted hover:border-sunshine hover:text-sunshine"
            }`}
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {dot.connected ? "✓" : dot.number}
          </button>
        ))}

        {phase === "success" && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy/60 animate-fade-in">
            <div className="text-center">
              <span className="text-5xl">🌟</span>
              <p className="text-2xl font-bold text-sunshine mt-2">
                {pattern.name}！连好了！
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {Array.from({ length: pattern.dots.length }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < connectedOrder.length
                ? "bg-sunshine"
                : "bg-navy-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
