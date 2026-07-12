"use client";

import { useState } from "react";

interface ConstellationDetectiveProps {
  onComplete: (score: number, stars: number) => void;
}

const CONSTELLATIONS = [
  {
    name: "北斗七星",
    description: "像一把大勺子，在北方天空很容易找到",
    emoji: "🥄",
    stars: 7,
    season: "全年可见",
    hint: "找到后可以帮你找到北极星！",
  },
  {
    name: "猎户座",
    description: "像一个举着弓箭的猎人，有三颗星排成一排的腰带",
    emoji: "🏹",
    stars: 7,
    season: "冬季最亮",
    hint: "腰带上的三颗星非常容易认！",
  },
  {
    name: "天蝎座",
    description: "像一只蝎子，有一颗红色亮星叫心宿二",
    emoji: "🦂",
    stars: 8,
    season: "夏季可见",
    hint: "心宿二是天蝎座的心脏，红红的很显眼！",
  },
  {
    name: "仙后座",
    description: "像一个字母W或M，就在北斗七星的对面",
    emoji: "👑",
    stars: 5,
    season: "全年可见",
    hint: "和北斗七星隔着北极星遥遥相望！",
  },
];

export default function ConstellationDetective({ onComplete }: ConstellationDetectiveProps) {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<"explore" | "quiz" | "done">("explore");
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  // Quiz: Show constellation name, pick correct description
  const quizQuestions = CONSTELLATIONS.map((c) => ({
    name: c.name,
    emoji: c.emoji,
    question: `${c.emoji} ${c.name}有什么特点？`,
    correct: c.description,
    options: generateOptions(c, CONSTELLATIONS),
  }));

  const currentQuiz = quizQuestions[current];

  function generateOptions(target: typeof CONSTELLATIONS[0], all: typeof CONSTELLATIONS) {
    const others = all.filter((c) => c.name !== target.name);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    return [
      { text: target.description, correct: true },
      ...shuffled.map((c) => ({ text: c.description, correct: false })),
    ].sort(() => Math.random() - 0.5);
  }

  const handleQuizSelect = (idx: number) => {
    if (feedback) return;
    setSelectedAnswer(idx);
    setFeedback(currentQuiz.options[idx].correct ? "correct" : "wrong");
    if (currentQuiz.options[idx].correct) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      if (current < quizQuestions.length - 1) {
        setCurrent((c) => c + 1);
        setSelectedAnswer(null);
        setFeedback(null);
      } else {
        setPhase("done");
        const stars = score >= 3 ? 3 : score >= 2 ? 2 : 1;
        onComplete(score * 5, stars);
      }
    }, 1500);
  };

  // Explore phase
  if (phase === "explore") {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🕵️</span>
          <span className="text-lg font-bold text-cream">星座小侦探</span>
        </div>

        <div className="bg-navy-mid border border-lavender rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-cream">
            观察下面的星座卡片，了解每个星座的故事！
          </p>
          <p className="text-sm text-muted mt-1">看完后点击"开始测验"</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
          {CONSTELLATIONS.map((c, idx) => (
            <div
              key={idx}
              className="bg-navy-mid border border-navy-border rounded-xl p-4 text-center hover:border-sunshine/50 transition-all"
            >
              <span className="text-5xl block mb-2">{c.emoji}</span>
              <h3 className="text-lg font-bold text-sunshine">{c.name}</h3>
              <p className="text-sm text-cream mt-1">{c.description}</p>
              <div className="flex justify-center gap-2 mt-2">
                <span className="text-xs bg-navy/50 px-2 py-0.5 rounded-full text-muted">
                  {c.stars}颗星
                </span>
                <span className="text-xs bg-navy/50 px-2 py-0.5 rounded-full text-muted">
                  {c.season}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setPhase("quiz")}
          className="px-8 py-3 rounded-xl bg-teal text-navy font-bold hover:bg-teal/80 transition-all"
        >
          开始测验 🎯
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <span className="text-6xl mb-4">🔭</span>
        <h2 className="text-3xl font-bold text-sunshine mb-2">小侦探合格！</h2>
        <p className="text-xl text-cream">
          你答对了 <span className="text-teal font-bold">{score}</span>/{CONSTELLATIONS.length} 题
        </p>
      </div>
    );
  }

  // Quiz phase
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🕵️</span>
          <span className="text-lg font-bold text-cream">星座小测验</span>
        </div>
        <span className="bg-navy-mid border border-navy-border rounded-full px-3 py-1 text-sm text-muted">
          {current + 1}/{quizQuestions.length}
        </span>
      </div>

      <div className="w-full max-w-lg bg-navy-mid border border-sunshine/30 rounded-xl p-6 text-center">
        <span className="text-5xl block mb-3">{currentQuiz.emoji}</span>
        <h3 className="text-xl font-bold text-sunshine mb-2">{currentQuiz.name}</h3>
        <p className="text-lg text-cream">{currentQuiz.question}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
        {currentQuiz.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleQuizSelect(idx)}
            disabled={feedback !== null}
            className={`p-4 rounded-xl border-2 text-left text-base font-medium transition-all duration-300 ${
              feedback === null
                ? "bg-navy-mid border-navy-border text-cream hover:border-sunshine"
                : option.correct
                ? "bg-teal/20 border-teal text-teal"
                : selectedAnswer === idx
                ? "bg-coral/10 border-coral/30 text-coral opacity-50"
                : "bg-navy-mid border-navy-border text-cream"
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}
