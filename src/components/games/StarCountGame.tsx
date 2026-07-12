"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface StarCountGameProps {
  onComplete: (score: number, stars: number) => void;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  clicked: boolean;
  color: string;
}

export default function StarCountGame({ onComplete }: StarCountGameProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [count, setCount] = useState(0);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [targetCount, setTargetCount] = useState(0);
  const totalRounds = 3;

  const colors = ["#FFE66D", "#FF6B6B", "#4ECDC4", "#A78BFA", "#fff"];

  const generateStars = useCallback((num: number) => {
    const newStars: Star[] = [];
    for (let i = 0; i < num; i++) {
      newStars.push({
        id: i,
        x: 10 + Math.random() * 75,
        y: 10 + Math.random() * 65,
        size: 28 + Math.random() * 16,
        clicked: false,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return newStars;
  }, []);

  const startRound = useCallback(() => {
    const num = 5 + Math.floor(Math.random() * 6) + round * 3; // 5-8, 8-11, 11-14
    setTargetCount(num);
    setStars(generateStars(num));
    setCount(0);
    setPhase("playing");
  }, [round, generateStars]);

  // 用 ref 缓存回调，避免 prop 变化导致 effect 意外重运行
  const onCompleteRef = useRef(onComplete);
  const startRoundRef = useRef(startRound);
  useEffect(() => { onCompleteRef.current = onComplete; });
  useEffect(() => { startRoundRef.current = startRound; });

  useEffect(() => {
    if (phase === "intro") {
      startRoundRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStarClick = (starId: number) => {
    if (phase !== "playing") return;
    setStars((prev) =>
      prev.map((s) => (s.id === starId ? { ...s, clicked: true } : s))
    );
    setCount((prev) => prev + 1);
  };

  useEffect(() => {
    if (count === targetCount && phase === "playing") {
      const timer = setTimeout(() => {
        if (round < totalRounds - 1) {
          setRound((r) => r + 1);
          startRoundRef.current();
        } else {
          setPhase("result");
          const finalScore = (round + 1) * 10;
          onCompleteRef.current(finalScore, 3);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [count, targetCount, phase, round, totalRounds]);

  if (phase === "result") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
        <span className="text-6xl mb-4">🎉</span>
        <h2 className="text-3xl font-bold text-sunshine mb-2">太棒了！</h2>
        <p className="text-xl text-cream mb-6">
          你数对了 <span className="text-teal font-bold">{(round + 1) * 10}</span> 颗星星！
        </p>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="text-4xl animate-pulse">⭐</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          <span className="text-lg font-bold text-cream">
            第 <span className="text-sunshine">{round + 1}</span>/{totalRounds} 轮
          </span>
        </div>
        <div className="bg-navy-mid border border-navy-border rounded-full px-4 py-1">
          <span className="text-sm text-muted">已数：</span>
          <span className="text-xl font-bold text-teal">{count}</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-navy-mid border border-lavender rounded-xl p-4 text-center">
        <p className="text-xl font-bold text-cream">
          请点击每一颗星星，数一数一共有几颗？
        </p>
        <p className="text-sm text-muted mt-1">
          {count === 0 ? "开始点击星星吧！" : `你已经数了 ${count} 颗，继续加油！`}
        </p>
      </div>

      {/* Star field */}
      <div className="relative w-full max-w-lg h-[320px] sm:h-[400px] bg-navy-mid rounded-2xl border border-navy-border overflow-hidden star-field">
        {stars.map((star) => (
          <button
            key={star.id}
            onClick={() => handleStarClick(star.id)}
            className={`absolute transition-all duration-300 ${
              star.clicked
                ? "scale-50 opacity-30"
                : "scale-100 opacity-100 hover:scale-125"
            }`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              fontSize: `${star.size}px`,
              cursor: star.clicked ? "default" : "pointer",
            }}
            disabled={star.clicked}
          >
            {star.clicked ? "✨" : "⭐"}
          </button>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < round
                ? "bg-teal"
                : i === round
                ? "bg-sunshine animate-pulse"
                : "bg-navy-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
