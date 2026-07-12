"use client";

import { useState, useEffect } from "react";
import { speakEnglish } from "@/lib/speech";
import { useGameStore } from "@/lib/store";

interface ReadAlongGameProps {
  onComplete: (score: number, stars: number) => void;
}

const WORD_SETS = [
  {
    category: "问候语",
    words: [
      { en: "hello", zh: "你好", emoji: "👋" },
      { en: "goodbye", zh: "再见", emoji: "🤗" },
      { en: "good morning", zh: "早上好", emoji: "🌅" },
      { en: "good night", zh: "晚安", emoji: "🌙" },
    ],
  },
  {
    category: "颜色",
    words: [
      { en: "red", zh: "红色", emoji: "🔴" },
      { en: "blue", zh: "蓝色", emoji: "🔵" },
      { en: "yellow", zh: "黄色", emoji: "🟡" },
      { en: "white", zh: "白色", emoji: "⚪" },
    ],
  },
  {
    category: "身体部位",
    words: [
      { en: "eye", zh: "眼睛", emoji: "👀" },
      { en: "ear", zh: "耳朵", emoji: "👂" },
      { en: "hand", zh: "手", emoji: "✋" },
      { en: "head", zh: "头", emoji: "🗣️" },
    ],
  },
];

export default function ReadAlongGame({ onComplete }: ReadAlongGameProps) {
  const [currentSet, setCurrentSet] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const [practicedWords, setPracticedWords] = useState<Set<number>>(new Set());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [phase, setPhase] = useState<"learning" | "quiz" | "done">("learning");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<Array<{ text: string; correct: boolean }>>([]);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const learnWord = useGameStore((s) => s.learnWord);

  // Generate quiz options
  const generateQuiz = () => {
    const allWords = WORD_SETS.flatMap((s) => s.words);
    const target = allWords[quizIndex % allWords.length];
    const others = allWords.filter((w) => w.en !== target.en);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);

    const options = [
      { text: target.zh, correct: true },
      ...shuffled.map((w) => ({ text: w.zh, correct: false })),
    ].sort(() => Math.random() - 0.5);

    setQuizOptions(options);
    setQuizFeedback(null);
  };

  useEffect(() => {
    if (phase === "quiz") generateQuiz();
  }, [phase, quizIndex]);

  const handleSpeak = (word: string) => {
    setIsSpeaking(true);
    speakEnglish(word, 0.6);
    setTimeout(() => setIsSpeaking(false), 2000);
  };

  const handleWordClick = (globalIdx: number) => {
    handleSpeak(WORD_SETS.flatMap((s) => s.words)[globalIdx].en);
    setPracticedWords((prev) => new Set([...prev, globalIdx]));
  };

  const handleNextSet = () => {
    if (currentSet < WORD_SETS.length - 1) {
      setCurrentSet((s) => s + 1);
      setCurrentWord(0);
    } else {
      setPhase("quiz");
      setQuizIndex(0);
    }
  };

  const handleQuizSelect = (option: { text: string; correct: boolean }) => {
    if (quizFeedback) return;

    if (option.correct) {
      setQuizFeedback("correct");
      setQuizScore((s) => s + 1);
    } else {
      setQuizFeedback("wrong");
    }

    const target = WORD_SETS.flatMap((s) => s.words)[quizIndex % WORD_SETS.flatMap((s) => s.words).length];
    if (option.correct) {
      handleSpeak(target.en);
      learnWord(target.en);
    }

    setTimeout(() => {
      if (quizIndex < 7) {
        setQuizIndex((i) => i + 1);
      } else {
        setPhase("done");
        const stars = quizScore >= 6 ? 3 : quizScore >= 4 ? 2 : 1;
        onComplete(quizScore * 5, stars);
      }
    }, 1500);
  };

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <span className="text-6xl mb-4">🗣️</span>
        <h2 className="text-3xl font-bold text-sunshine mb-2">跟读完成！</h2>
        <p className="text-xl text-cream">
          你答对了 <span className="text-teal font-bold">{quizScore}</span>/8 题
        </p>
      </div>
    );
  }

  const wordSet = WORD_SETS[currentSet];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗣️</span>
          {phase === "learning" ? (
            <>
              <span className="text-lg font-bold text-cream">知知读一读</span>
              <span className="bg-navy-mid border border-lavender rounded-full px-3 py-1 text-sm text-lavender">
                {wordSet.category}
              </span>
            </>
          ) : (
            <>
              <span className="text-lg font-bold text-cream">听力小测验</span>
              <span className="bg-navy-mid border border-sunshine rounded-full px-3 py-1 text-sm text-sunshine">
                第 {quizIndex + 1}/8 题
              </span>
            </>
          )}
        </div>
        {phase === "quiz" && (
          <span className="bg-navy-mid border border-teal rounded-full px-3 py-1">
            <span className="text-sm text-muted">正确：</span>
            <span className="text-teal font-bold">{quizScore}</span>
          </span>
        )}
      </div>

      {/* Learning phase */}
      {phase === "learning" && (
        <>
          {/* Instructions */}
          <div className="bg-navy-mid border border-lavender rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-cream">
              点击单词卡片，听知知读一读！
            </p>
            <p className="text-sm text-muted mt-1">
              大声跟读，记住每个单词的读音
            </p>
          </div>

          {/* Word cards */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            {wordSet.words.map((word, idx) => {
              const globalIdx = WORD_SETS.slice(0, currentSet).reduce((sum, s) => sum + s.words.length, 0) + idx;
              const practiced = practicedWords.has(globalIdx);
              return (
                <button
                  key={idx}
                  onClick={() => handleWordClick(globalIdx)}
                  className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                    practiced
                      ? "bg-lavender/20 border-lavender text-lavender"
                      : "bg-navy-mid border-navy-border text-cream hover:border-sunshine hover:text-sunshine"
                  } ${isSpeaking ? "scale-95" : "hover:scale-105"}`}
                >
                  <span className="text-4xl">{word.emoji}</span>
                  <span className="text-2xl font-bold">{word.en}</span>
                  <span className="text-sm text-muted">{word.zh}</span>
                  {practiced && <span className="text-xs text-lavender">✓ 已跟读</span>}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <button
            onClick={handleNextSet}
            className="px-8 py-3 rounded-xl bg-teal text-navy font-bold hover:bg-teal/80 transition-all"
          >
            {currentSet < WORD_SETS.length - 1 ? "下一组 →" : "开始测验 🎯"}
          </button>
        </>
      )}

      {/* Quiz phase */}
      {phase === "quiz" && (
        <>
          {/* Play button */}
          <div className="bg-navy-mid border border-lavender rounded-xl p-6 text-center">
            <p className="text-lg text-cream mb-3">听知知读的英语，选择正确的中文意思</p>
            <button
              onClick={() => {
                const allWords = WORD_SETS.flatMap((s) => s.words);
                handleSpeak(allWords[quizIndex % allWords.length].en);
              }}
              className="px-8 py-3 rounded-xl bg-lavender text-white font-bold text-lg hover:bg-lavender/80 transition-all flex items-center gap-2 mx-auto"
            >
              <span>🔊</span>
              <span>播放</span>
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
            {quizOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleQuizSelect(option)}
                disabled={quizFeedback !== null}
                className={`h-20 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                  quizFeedback === null
                    ? "bg-navy-mid border-navy-border text-cream hover:border-sunshine hover:text-sunshine"
                    : option.correct
                    ? "bg-teal/20 border-teal text-teal scale-105"
                    : quizOptions.findIndex((o) => o.correct) === idx
                    ? "bg-teal/20 border-teal text-teal"
                    : "bg-coral/10 border-coral/30 text-coral opacity-50"
                }`}
              >
                {option.text}
                {quizFeedback !== null && option.correct && <span className="ml-2">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
