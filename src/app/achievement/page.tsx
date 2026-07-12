"use client";

import { useGameStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import { evaluateAchievements, countUnlocked } from "@/lib/achievements";
import AchievementBadge from "@/components/AchievementBadge";

export default function AchievementPage() {
  const router = useRouter();
  const store = useGameStore();
  const themeState = store.currentTheme
    ? store.themes[store.currentTheme]
    : null;
  const actState = themeState?.acts[0];

  const totalCrystals = actState?.crystalsCollected || 0;
  const totalScore = store.totalScore;
  const wordsLearned = store.wordsLearned;
  const stations = actState?.stations;

  const completedCount = stations
    ? Object.values(stations).filter((s) => s.completed).length
    : 0;
  const totalStations = stations ? Object.keys(stations).length : 0;

  const stationDetails = stations
    ? [
        { key: "story", label: "故事导入", emoji: "📖" },
        { key: "math", label: "数学闯关", emoji: "🔢" },
        { key: "english", label: "英语学习", emoji: "📚" },
        { key: "science", label: "科学探索", emoji: "🔬" },
        { key: "thinking", label: "思考挑战", emoji: "💡" },
      ].map((s) => ({
        ...s,
        completed: stations[s.key as keyof typeof stations]?.completed,
        score: stations[s.key as keyof typeof stations]?.score || 0,
        stars: stations[s.key as keyof typeof stations]?.stars || 0,
      }))
    : [];

  // 成就评估：从当前进度派生解锁状态
  const totalStars = stations
    ? Object.values(stations).reduce((sum, s) => sum + (s.stars || 0), 0)
    : 0;
  const perfectStations = stations
    ? Object.values(stations).filter((s) => s.completed && s.stars >= 3).length
    : 0;
  const maxCrystals = actState?.totalCrystals || 5;
  const achievements = evaluateAchievements({
    completedCount,
    totalStations,
    totalCrystals,
    maxCrystals,
    totalStars,
    wordsLearned: wordsLearned.length,
    thinkingAnswers: store.thinkingAnswers.length,
    perfectStations,
  });
  const unlockedCount = countUnlocked(achievements);

  // 加载演示数据：半进度展示部分解锁+进度条，全解锁展示发光动画
  const loadDemoData = (mode: "half" | "full") => {
    store.resetProgress();
    store.selectTheme("space");
    if (mode === "half") {
      // 完成 4 个任务（留思考题未完成），4 颗水晶，10 颗星（2 个满星），5 个单词
      store.completeStation("story", 10, 3);
      store.completeStation("math", 30, 3);
      store.completeStation("english", 25, 2);
      store.completeStation("science", 28, 2);
      ["star", "moon", "sun", "planet", "comet"].forEach((w) => store.learnWord(w));
    } else {
      // 全部完成，5 颗水晶，15 颗星，8 个单词，1 道思考题
      store.completeStation("story", 10, 3);
      store.completeStation("math", 30, 3);
      store.completeStation("english", 25, 3);
      store.completeStation("science", 28, 3);
      store.completeStation("thinking", 20, 3);
      ["star", "moon", "sun", "planet", "comet", "galaxy", "rocket", "meteor"].forEach(
        (w) => store.learnWord(w)
      );
      store.addThinkingAnswer("因为白天太阳太亮了，其他星星的光被淹没啦！");
    }
  };

  return (
    <div className="min-h-screen bg-navy star-field">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-navy/90 backdrop-blur-sm border-b border-navy-border px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => router.push("/adventure")}
            className="flex items-center gap-2 text-muted hover:text-cream transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <span className="sm:hidden">←</span>
            <span className="hidden sm:inline">← 返回探险地图</span>
          </button>
          <h1 className="text-base sm:text-lg font-bold text-cream">📊 学习成就</h1>
          <div className="w-4 sm:w-16" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Demo data loader */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-lavender/30 bg-lavender/5 px-3 sm:px-4 py-2.5">
          <span className="text-xs sm:text-sm text-muted mr-1">🧪 演示数据：</span>
          <button
            onClick={() => loadDemoData("half")}
            className="px-3 py-1 rounded-lg bg-navy-mid border border-navy-border text-xs sm:text-sm text-cream hover:border-teal/50 hover:text-teal transition-all"
          >
            半进度（7/12 解锁）
          </button>
          <button
            onClick={() => loadDemoData("full")}
            className="px-3 py-1 rounded-lg bg-navy-mid border border-navy-border text-xs sm:text-sm text-cream hover:border-sunshine/50 hover:text-sunshine transition-all"
          >
            全解锁（12/12）
          </button>
          <button
            onClick={() => store.resetProgress()}
            className="px-3 py-1 rounded-lg bg-navy-mid border border-navy-border text-xs sm:text-sm text-muted hover:border-coral/50 hover:text-coral transition-all"
          >
            清空
          </button>
        </div>

        {/* Hero stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fade-in">
          <StatCard
            emoji="💎"
            label="水晶收集"
            value={String(totalCrystals)}
            color="teal"
          />
          <StatCard
            emoji="⭐"
            label="总分"
            value={String(totalScore)}
            color="sunshine"
          />
          <StatCard
            emoji="📝"
            label="完成任务"
            value={`${completedCount}/${totalStations}`}
            color="lavender"
          />
          <StatCard
            emoji="🗣️"
            label="学会单词"
            value={String(wordsLearned.length)}
            color="coral"
          />
        </div>

        {/* Achievement badges */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-cream">成就徽章</h2>
            <span className="text-sm text-muted">
              已解锁 <span className="text-sunshine font-bold">{unlockedCount}</span>/{achievements.length}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {achievements.map((ach) => (
              <AchievementBadge key={ach.id} achievement={ach} />
            ))}
          </div>
        </div>

        {/* Station progress */}
        <h2 className="text-xl sm:text-2xl font-bold text-cream mb-3 sm:mb-4">任务完成情况</h2>
        <div className="space-y-3 mb-6 sm:mb-8">
          {stationDetails.map((station) => (
            <div
              key={station.key}
              className={`flex items-center justify-between gap-2 bg-navy-light border rounded-xl p-3 sm:p-4 transition-all ${
                station.completed
                  ? "border-teal/30"
                  : "border-navy-border"
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0">{station.emoji}</span>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-cream truncate">{station.label}</h3>
                  {station.completed && (
                    <p className="text-xs sm:text-sm text-muted">
                      获得 {station.score} 分
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {station.completed && (
                  <StarRating stars={station.stars} size="sm" />
                )}
                <span className="text-lg sm:text-xl">
                  {station.completed ? "✅" : "⬜"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Words learned */}
        {wordsLearned.length > 0 && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-cream mb-3 sm:mb-4">已学会的单词</h2>
            <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
              {wordsLearned.map((word) => (
                <span
                  key={word}
                  className="bg-navy-mid border border-lavender/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-lavender font-bold"
                >
                  {word}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Encourage message */}
        <div className="bg-gradient-to-br from-sunshine/10 to-lavender/10 border border-sunshine/30 rounded-2xl p-5 sm:p-6 text-center animate-fade-in">
          <span className="text-3xl sm:text-4xl block mb-2">🦉</span>
          <p className="text-lg sm:text-xl text-cream font-bold">
            {completedCount === totalStations
              ? "恭喜你完成了所有任务！你是最棒的小探险家！"
              : completedCount > 0
              ? `你已经完成了 ${completedCount} 个任务，继续加油哦！`
              : "探险旅程才刚开始，快去完成任务吧！"}
          </p>
          <p className="text-sm text-muted mt-2">知知为你感到骄傲！</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: string;
  color: "teal" | "sunshine" | "lavender" | "coral";
}) {
  const colorMap = {
    teal: "text-teal border-teal/30",
    sunshine: "text-sunshine border-sunshine/30",
    lavender: "text-lavender border-lavender/30",
    coral: "text-coral border-coral/30",
  };

  return (
    <div className={`bg-navy-light border rounded-xl p-3 sm:p-4 text-center ${colorMap[color]}`}>
      <span className="text-2xl sm:text-3xl block mb-1">{emoji}</span>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
