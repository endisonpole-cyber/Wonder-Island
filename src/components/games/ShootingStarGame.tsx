"use client";

import { useState, useEffect } from "react";

interface ShootingStarGameProps {
  onComplete: (score: number, stars: number) => void;
}

interface Problem {
  a: number;
  b: number;
  answer: number;
  options: number[];
}

function generateProblem(round: number): Problem {
  const maxNum = Math.min(10 + round * 4, 20);
  const a = Math.floor(Math.random() * maxNum) + 1;
  const b = Math.floor(Math.random() * maxNum) + 1;
  const answer = a + b;

  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 6) - 3;
    const opt = answer + (offset === 0 ? 1 : offset);
    if (opt > 0 && opt !== answer) options.add(opt);
  }

  return { a, b, answer, options: Array.from(options).sort(() => Math.random() - 0.5) };
}

export default function ShootingStarGame({ onComplete }: ShootingStarGameProps) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"playing" | "feedback" | "done">("playing");
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const totalRounds = 6;

  useEffect(() => {
    setProblem(generateProblem(round));
  }, [round]);

  const handleSelect = (option: number) => {
    if (!problem || phase !== "playing") return;
    setSelected(option);
    setCorrect(option === problem.answer);
    setPhase("feedback");

    if (option === problem.answer) {
      setScore((s) => s + 1);
    }

    const timer = setTimeout(() => {
      if (round < totalRounds - 1) {
        setRound((r) => r + 1);
        setSelected(null);
        setPhase("playing");
      } else {
        setPhase("done");
      }
    }, 1500);

    return () => clearTimeout(timer);
  };

  useEffect(() => {
    if (phase === "done") {
      const finalScore = score * 5;
      const stars = score >= 5 ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0;
      onComplete(finalScore, stars);
    }
  }, [phase]);

  if (phase === "done" || !problem) {
    if (!problem) return null;
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
        <span className="text-6xl mb-4">🌠</span>
        <h2 className="text-3xl font-bold text-sunshine mb-2">
          {score >= 5 ? "太厉害了！" : score >= 3 ? "做得不错！" : "继续加油！"}
        </h2>
        <p className="text-xl text-cream">
          你答对了 <span className="text-teal font-bold">{score}</span>/{totalRounds} 题
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">☄️</span>
          <span className="text-lg font-bold text-cream">流星加减法</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
            第 <span className="text-sunshine font-bold">{round + 1}</span>/{totalRounds} 题
          </span>
          <span className="bg-navy-mid border border-navy-border rounded-full px-3 py-1">
            <span className="text-sm text-muted">正确：</span>
            <span className="text-teal font-bold">{score}</span>
          </span>
        </div>
      </div>

      {/* Problem */}
      <div className="relative w-full max-w-lg h-40 sm:h-48 bg-navy-mid rounded-2xl border border-navy-border flex items-center justify-center star-field overflow-hidden">
        <div className="text-center">
          <p className="text-4xl sm:text-5xl font-bold text-cream mb-2">
            {problem.a} + {problem.b} = <span className="text-sunshine">?</span>
          </p>
          <p className="text-xs sm:text-sm text-muted">点击正确的流星，发射答案！</p>
        </div>
      </div>

      {/* Options - Shooting stars */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
        {problem.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option)}
            disabled={phase !== "playing"}
            className={`relative h-16 sm:h-20 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all duration-300 ${
              phase === "feedback" && selected === option
                ? correct
                  ? "bg-teal/20 border-teal text-teal scale-105"
                  : "bg-coral/20 border-coral text-coral"
                : phase === "feedback" && option === problem.answer
                ? "bg-teal/20 border-teal text-teal"
                : "bg-navy-mid border-navy-border text-cream hover:border-sunshine hover:text-sunshine hover:scale-105"
            }`}
          >
            <span className="absolute -top-4 text-lg">☄️</span>
            {option}
            {phase === "feedback" && selected === option && (
              <span className="ml-3 text-xl">{correct ? "✓" : "✗"}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
