"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ParticleStarfield from "@/components/ParticleStarfield";
import { speak, getZhVoices, setPreferredVoice, initPreferredVoice } from "@/lib/speech";

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [phase, setPhase] = useState<"landing" | "name">("landing");
  const [zhVoices, setZhVoicesState] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  // 加载可用中文语音列表
  useEffect(() => {
    initPreferredVoice();
    const loadVoices = () => {
      const voices = getZhVoices();
      if (voices.length > 0) {
        setZhVoicesState(voices);
        const saved = localStorage.getItem("preferred-voice");
        setSelectedVoice(saved || voices[0]?.name || "");
      }
    };
    loadVoices();
    // 浏览器异步加载语音，监听变化
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (phase === "name") {
      const timer = setTimeout(() => {
        speak("你好呀小朋友！请告诉我你的名字吧！", 0.95);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="min-h-screen bg-navy star-field flex flex-col relative">
      {/* 粒子星空背景动画 */}
      <ParticleStarfield />

      {/* 顶部柔光渐变，增强标题区域氛围 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(78,205,196,0.18), rgba(167,139,250,0.10) 40%, transparent 70%)",
        }}
      />

      {/* ========== LANDING PHASE ========== */}
      {phase === "landing" && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
          {/* Logo & Title */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <span className="text-6xl sm:text-7xl md:text-8xl animate-float drop-shadow-[0_0_25px_rgba(78,205,196,0.45)]">🦉</span>
              <span className="absolute -top-2 -right-2 text-xl sm:text-2xl animate-twinkle">✨</span>
            </div>
            <h1
              className="hero-title-enter text-6xl sm:text-7xl md:text-8xl font-extrabold mt-6 tracking-wide"
              style={{
                background: "linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4, #A78BFA, #FF6B6B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "300% 300%",
              }}
            >
              奇知岛
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-cream mt-3 font-semibold tracking-[0.2em] sm:tracking-[0.3em] drop-shadow-[0_0_8px_rgba(78,205,196,0.35)]">
              Wonder Island
            </p>
            <p className="text-base sm:text-lg text-cream/70 mt-4 max-w-md">
              一个故事，三科同修
            </p>
          </div>

          {/* Theme cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-3xl w-full mb-8 sm:mb-10">
            <ThemeCard
              emoji="🚀"
              title="太空探险"
              subtitle="星星、月亮和太阳的秘密"
              color="teal"
              available
            />
            <ThemeCard
              emoji="🐾"
              title="动物世界"
              subtitle="和森林动物们的四季冒险"
              color="coral"
              available={false}
            />
            <ThemeCard
              emoji="🌸"
              title="植物王国"
              subtitle="唤醒神奇花园的精灵"
              color="lavender"
              available={false}
            />
          </div>

          {/* CTA */}
          <button
            onClick={() => setPhase("name")}
            className="px-10 py-4 rounded-2xl bg-teal text-navy text-xl font-bold hover:bg-teal/80 transition-all animate-pulse-glow"
          >
            开始探险 🚀
          </button>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted">
            <span className="flex items-center gap-1">
              <span>🤖</span> AI智能辅导
            </span>
            <span className="flex items-center gap-1">
              <span>🗣️</span> 语音陪伴
            </span>
            <span className="flex items-center gap-1">
              <span>📚</span> 数学·英语·科学
            </span>
            <span className="flex items-center gap-1">
              <span>🆓</span> 免费学习
            </span>
          </div>
        </div>
      )}

      {/* ========== NAME INPUT PHASE ========== */}
      {phase === "name" && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <span className="text-6xl sm:text-7xl animate-float drop-shadow-[0_0_20px_rgba(78,205,196,0.5)] block">🦉</span>
              <span className="absolute -top-1 -right-2 text-2xl animate-twinkle">✨</span>
            </div>
            <h2 className="text-3xl font-bold text-cream">
              你好呀，小朋友！
            </h2>
            <p className="text-lg text-muted mt-2">
              我是知知猫头鹰，你叫什么名字呀？
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && playerName.trim() && router.push("/adventure")}
              placeholder="输入你的名字..."
              maxLength={12}
              className="w-full bg-navy-mid border-2 border-navy-border rounded-xl px-6 py-4 text-xl text-center text-cream placeholder:text-muted/40 focus:outline-none focus:border-lavender transition-colors"
              autoFocus
            />

            <button
              onClick={() => playerName.trim() && router.push("/adventure")}
              disabled={!playerName.trim()}
              className="w-full px-6 py-4 rounded-xl bg-lavender text-white text-lg font-bold hover:bg-lavender/80 disabled:opacity-30 transition-all"
            >
              出发！🚀
            </button>

            <button
              onClick={() => setPhase("landing")}
              className="text-sm text-muted hover:text-cream transition-colors"
            >
              ← 返回
            </button>

            {/* 语音选择器 */}
            {zhVoices.length > 1 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted">🔊 语音：</span>
                <select
                  value={selectedVoice}
                  onChange={(e) => {
                    setSelectedVoice(e.target.value);
                    setPreferredVoice(e.target.value);
                    // 试听一下
                    setTimeout(() => speak("你好呀小朋友！", 0.95), 100);
                  }}
                  className="bg-navy-mid border border-navy-border rounded-lg px-2 py-1 text-xs text-cream focus:outline-none focus:border-lavender cursor-pointer"
                >
                  {zhVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name.replace(/Microsoft\s*|Google\s*/i, "")}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Floating decorations */}
          <div className="fixed bottom-10 left-0 right-0 flex justify-center gap-4 pointer-events-none">
            <span className="text-3xl animate-float opacity-30">⭐</span>
            <span className="text-2xl animate-twinkle opacity-20 animate-delay-10">✨</span>
            <span className="text-4xl animate-float opacity-30 animate-delay-5">💎</span>
            <span className="text-2xl animate-twinkle opacity-20 animate-delay-20">✨</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeCard({
  emoji,
  title,
  subtitle,
  color,
  available,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  color: "teal" | "coral" | "lavender";
  available: boolean;
}) {
  const colorMap = {
    teal: {
      border: "border-teal/30 hover:border-teal",
      bg: "bg-teal/5",
      text: "text-teal",
      badge: "bg-teal text-navy",
    },
    coral: {
      border: "border-navy-border",
      bg: "bg-navy-light/50",
      text: "text-muted",
      badge: "bg-navy-mid text-muted",
    },
    lavender: {
      border: "border-navy-border",
      bg: "bg-navy-light/50",
      text: "text-muted",
      badge: "bg-navy-mid text-muted",
    },
  };

  const c = colorMap[color];

  return (
    <div
      className={`rounded-2xl border-2 ${c.border} ${c.bg} p-5 text-center transition-all ${
        available ? "cursor-pointer hover:scale-105" : "opacity-50 cursor-not-allowed"
      }`}
    >
      <span className="text-4xl block mb-2">{emoji}</span>
      <h3 className={`text-lg font-bold ${c.text}`}>{title}</h3>
      <p className="text-sm text-muted mt-1">{subtitle}</p>
      <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${c.badge}`}>
        {available ? "初赛开放" : "即将开放"}
      </span>
    </div>
  );
}
