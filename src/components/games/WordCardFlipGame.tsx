"use client";

import { useState, useEffect } from "react";
import { speakEnglish } from "@/lib/speech";

interface WordCardFlipGameProps {
  onComplete: (score: number, stars: number) => void;
}

interface Card {
  id: number;
  type: "en" | "zh";
  content: string;
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

const SPACE_WORDS = [
  { en: "star", zh: "星星" },
  { en: "moon", zh: "月亮" },
  { en: "sky", zh: "天空" },
  { en: "night", zh: "夜晚" },
  { en: "sun", zh: "太阳" },
  { en: "hello", zh: "你好" },
  { en: "red", zh: "红色" },
  { en: "blue", zh: "蓝色" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCards(count: number): Card[] {
  const words = shuffleArray(SPACE_WORDS).slice(0, count);
  const cards: Card[] = [];
  words.forEach((word, idx) => {
    cards.push({ id: idx * 2, type: "en", content: word.en, pairId: idx, flipped: false, matched: false });
    cards.push({ id: idx * 2 + 1, type: "zh", content: word.zh, pairId: idx, flipped: false, matched: false });
  });
  return shuffleArray(cards);
}

export default function WordCardFlipGame({ onComplete }: WordCardFlipGameProps) {
  const [cards, setCards] = useState<Card[]>(() => createCards(6));
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<"playing" | "done">("playing");

  const handleFlip = (cardId: number) => {
    if (phase !== "playing") return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;
    if (flippedCards.length >= 2) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c))
    );

    // Auto-speak English words
    if (card.type === "en") {
      speakEnglish(card.content);
    }

    if (newFlipped.length === 2) {
      setAttempts((a) => a + 1);
      const first = cards.find((c) => c.id === newFlipped[0])!;
      const second = cards.find((c) => c.id === newFlipped[1])!;

      if (first.pairId === second.pairId) {
        // Match!
        setCards((prev) =>
          prev.map((c) =>
            c.pairId === first.pairId ? { ...c, matched: true } : c
          )
        );
        setFlippedCards([]);
        const newMatched = matchedPairs + 1;
        setMatchedPairs(newMatched);

        if (newMatched === cards.length / 2) {
          setPhase("done");
          const score = Math.max(30 - attempts, 5);
          const stars = attempts <= 8 ? 3 : attempts <= 12 ? 2 : 1;
          setTimeout(() => onComplete(score, stars), 1000);
        }
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === newFlipped[0] || c.id === newFlipped[1]
                ? { ...c, flipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <span className="text-6xl mb-4">🎊</span>
        <h2 className="text-3xl font-bold text-sunshine mb-2">配对成功！</h2>
        <p className="text-xl text-cream">
          你学会了 <span className="text-teal font-bold">{matchedPairs}</span> 个新单词！
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="text-lg font-bold text-cream">星空单词卡</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-navy-mid border border-navy-border rounded-full px-3 py-1">
            <span className="text-sm text-muted">配对：</span>
            <span className="text-teal font-bold">{matchedPairs}</span>
            <span className="text-muted">/{cards.length / 2}</span>
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-navy-mid border border-lavender rounded-xl p-3 text-center">
        <p className="text-lg font-bold text-cream">
          翻开两张卡片，找到英文和中文的配对！
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-4 gap-3 w-full max-w-lg">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-lg font-bold transition-all duration-300 ${
              card.matched
                ? "bg-teal/20 border-teal text-teal scale-95 opacity-70"
                : card.flipped
                ? card.type === "en"
                  ? "bg-lavender/20 border-lavender text-lavender"
                  : "bg-sunshine/20 border-sunshine text-sunshine"
                : "bg-navy-mid border-navy-border text-transparent hover:border-muted cursor-pointer"
            }`}
          >
            {!card.flipped && !card.matched ? (
              <span className="text-2xl">❓</span>
            ) : (
              <>
                <span className="text-xs opacity-60">
                  {card.type === "en" ? "EN" : "中"}
                </span>
                <span>{card.content}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
