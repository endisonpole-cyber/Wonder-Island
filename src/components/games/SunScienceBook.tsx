"use client";

import { useState } from "react";
import { speak } from "@/lib/speech";

interface SunScienceBookProps {
  onComplete: (score: number, stars: number) => void;
}

const PAGES = [
  {
    title: "太阳是什么？",
    content: "太阳是一颗巨大的恒星，它自己会发光发热！离我们约1.5亿公里远，但它发出的光只需要8分钟就能到达地球。",
    illustration: "☀️",
    bgColor: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/50",
  },
  {
    title: "太阳的运动",
    content: "每天早晨，太阳从东方升起，中午升到最高（在南方），傍晚从西方落下。这是地球在转动的结果哦！",
    illustration: "🌅",
    bgColor: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/50",
  },
  {
    title: "用太阳认方向",
    content: "早晨面对太阳，前面是东，后面是西，左边是北，右边是南。古人就是靠太阳来辨别方向的！",
    illustration: "🧭",
    bgColor: "from-yellow-500/20 to-amber-500/20",
    borderColor: "border-yellow-500/50",
  },
  {
    title: "太阳给我们的礼物",
    content: "太阳给地球带来光和热，让植物可以生长，让我们感到温暖。没有太阳，地球就会变得又冷又黑！",
    illustration: "🌱",
    bgColor: "from-green-500/20 to-teal-500/20",
    borderColor: "border-green-500/50",
  },
];

export default function SunScienceBook({ onComplete }: SunScienceBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [readPages, setReadPages] = useState<Set<number>>(new Set());

  const handleRead = () => {
    setReadPages((prev) => new Set([...prev, currentPage]));
    // Auto-speak the page content
    speak(PAGES[currentPage].content, 0.85);
  };

  const handleNext = () => {
    if (currentPage < PAGES.length - 1) {
      setCurrentPage((p) => p + 1);
    } else if (readPages.size === PAGES.length) {
      onComplete(20, 3);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  const page = PAGES[currentPage];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">📖</span>
        <span className="text-lg font-bold text-cream">太阳百科</span>
      </div>

      {/* Book */}
      <div className={`relative w-full max-w-lg rounded-2xl border-2 ${page.borderColor} overflow-hidden`}>
        {/* Top decoration */}
        <div className={`h-3 bg-gradient-to-r ${page.bgColor}`} />

        <div className="p-8 min-h-[350px] flex flex-col items-center justify-center">
          {/* Illustration */}
          <span className="text-8xl mb-6 animate-float">{page.illustration}</span>

          {/* Title */}
          <h3 className="text-2xl font-bold text-cream mb-4 text-center">
            {page.title}
          </h3>

          {/* Content */}
          <p className="text-xl text-cream/90 leading-relaxed text-center max-w-md">
            {page.content}
          </p>
        </div>

        {/* Bottom decoration */}
        <div className={`h-3 bg-gradient-to-r ${page.bgColor}`} />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="px-6 py-3 rounded-xl bg-navy-mid border border-navy-border text-cream font-bold disabled:opacity-30 hover:border-sunshine transition-all"
        >
          ← 上一页
        </button>

        {/* Page indicator */}
        <div className="flex gap-2">
          {PAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                i === currentPage
                  ? "bg-teal border-teal text-navy"
                  : readPages.has(i)
                  ? "bg-sunshine/30 border-sunshine text-sunshine"
                  : "bg-navy-mid border-navy-border text-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="px-6 py-3 rounded-xl bg-teal border border-teal text-navy font-bold hover:bg-teal/80 transition-all"
        >
          {currentPage === PAGES.length - 1 ? "完成 ✨" : "下一页 →"}
        </button>
      </div>

      {/* Read button */}
      <button
        onClick={handleRead}
        className="px-8 py-3 rounded-xl bg-lavender/20 border border-lavender text-lavender font-bold hover:bg-lavender/30 transition-all flex items-center gap-2"
      >
        <span>🔊</span>
        <span>知知读一读</span>
      </button>

      {/* Reading progress */}
      <div className="flex gap-2">
        {PAGES.map((_, i) => (
          <div
            key={i}
            className={`w-12 h-2 rounded-full ${
              readPages.has(i) ? "bg-sunshine" : "bg-navy-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
