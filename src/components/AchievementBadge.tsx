"use client";

import { useState, useEffect, useRef } from "react";
import type { Achievement } from "@/lib/achievements";

interface AchievementBadgeProps {
  achievement: Achievement;
}

export default function AchievementBadge({ achievement: ach }: AchievementBadgeProps) {
  const prevUnlocked = useRef(ach.unlocked);
  const mounted = useRef(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [burst, setBurst] = useState(false);

  // 检测从锁定→解锁的状态变化，触发一次性庆祝动画
  useEffect(() => {
    if (mounted.current && !prevUnlocked.current && ach.unlocked) {
      setJustUnlocked(true);
      setBurst(true);
      const t1 = setTimeout(() => setJustUnlocked(false), 900);
      const t2 = setTimeout(() => setBurst(false), 700);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    prevUnlocked.current = ach.unlocked;
    mounted.current = true;
  }, [ach.unlocked]);

  const progressPct = ach.progress
    ? Math.min(100, (ach.progress.current / ach.progress.target) * 100)
    : 0;

  return (
    <div
      className={`relative rounded-xl border p-3 sm:p-4 text-center overflow-hidden transition-all duration-300 ${
        ach.unlocked
          ? "bg-gradient-to-br from-sunshine/15 to-teal/10 border-sunshine/40 achievement-badge"
          : "bg-navy-light border-navy-border opacity-60"
      } ${justUnlocked ? "badge-unlock" : ""}`}
    >
      {/* 光泽扫过层：仅已解锁时显示 */}
      {ach.unlocked && <div className="badge-shine-layer" aria-hidden />}

      {/* 解锁瞬间的粒子爆发 */}
      {burst && (
        <div className="badge-burst" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="badge-spark"
              style={{
                // 8 个粒子均匀分布在 360°
                ["--spark-angle" as string]: `${i * 45}deg`,
              }}
            />
          ))}
        </div>
      )}

      {/* emoji 图标 */}
      <div
        className={`relative text-3xl sm:text-4xl mb-1 ${
          ach.unlocked
            ? justUnlocked
              ? "badge-emoji-pop"
              : "badge-emoji-idle"
            : "grayscale opacity-50"
        }`}
      >
        {ach.unlocked ? ach.emoji : "🔒"}
      </div>

      <h3 className="text-xs sm:text-sm font-bold text-cream truncate relative">{ach.name}</h3>
      <p className="text-[10px] sm:text-xs text-muted mt-0.5 leading-tight relative">
        {ach.description}
      </p>

      {/* 未解锁时显示进度条 */}
      {!ach.unlocked && ach.progress && (
        <div className="mt-2">
          <div className="h-1 bg-navy-mid rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal to-sunshine rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted mt-1">
            {ach.progress.current}/{ach.progress.target}
          </p>
        </div>
      )}

      {/* 已解锁的角标 */}
      {ach.unlocked && (
        <span className="absolute top-1.5 right-1.5 text-xs badge-sparkle">✨</span>
      )}
    </div>
  );
}
