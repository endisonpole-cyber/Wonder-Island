"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useGameStore } from "@/lib/store";
import { ZhizhiSpeaker } from "@/components/ZhizhiOwl";
import CrystalCounter from "@/components/CrystalCounter";
import StarRating from "@/components/StarRating";

// 游戏组件按需加载，减小初始 bundle 体积，加快首屏
const GameLoading = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <span className="text-4xl animate-twinkle">✨</span>
    <span className="text-muted ml-2">加载中...</span>
  </div>
);

const StarCountGame = dynamic(() => import("@/components/games/StarCountGame"), {
  ssr: false,
  loading: () => <GameLoading />,
});
const ConstellationGame = dynamic(() => import("@/components/games/ConstellationGame"), {
  ssr: false,
  loading: () => <GameLoading />,
});
const ShootingStarGame = dynamic(() => import("@/components/games/ShootingStarGame"), {
  ssr: false,
  loading: () => <GameLoading />,
});
const WordCardFlipGame = dynamic(() => import("@/components/games/WordCardFlipGame"), {
  ssr: false,
  loading: () => <GameLoading />,
});
const SunScienceBook = dynamic(() => import("@/components/games/SunScienceBook"), {
  ssr: false,
  loading: () => <GameLoading />,
});
const ThinkingQuestion = dynamic(() => import("@/components/games/ThinkingQuestion"), {
  ssr: false,
  loading: () => <GameLoading />,
});
const ReadAlongGame = dynamic(() => import("@/components/games/ReadAlongGame"), {
  ssr: false,
  loading: () => <GameLoading />,
});
const ConstellationDetective = dynamic(() => import("@/components/games/ConstellationDetective"), {
  ssr: false,
  loading: () => <GameLoading />,
});

const ACT_DATA = [
  {
    title: "第一幕：地球的夜空",
    subtitle: "星星的秘密",
    emoji: "🌟",
    description: "夜空中布满了闪烁的星星，让我们来认识它们吧！",
    storyMessage: "小探险家，欢迎来到奇知岛！我是知知，一只来自知识星球的猫头鹰。今天我们要去星空探险，帮星星们找回丢失的水晶碎片。准备好了吗？出发吧！",
  },
];

const STATION_LIST = [
  { type: "story" as const, label: "故事导入", emoji: "📖", description: "知知讲述冒险故事" },
  { type: "math1" as const, label: "星星数一数", emoji: "🔢", description: "点击夜空中的星星，数一数有几颗" },
  { type: "math2" as const, label: "星座连线", emoji: "🔭", description: "按数字顺序连成星座图案" },
  { type: "math3" as const, label: "流星加减法", emoji: "☄️", description: "选择正确答案发射流星" },
  { type: "math4" as const, label: "银河分组", emoji: "🔄", description: "将亮星和暗星分类比较" },
  { type: "english1" as const, label: "星空单词卡", emoji: "📚", description: "翻牌配对学单词" },
  { type: "english2" as const, label: "知知读一读", emoji: "🗣️", description: "跟着知知大声朗读单词" },
  { type: "science1" as const, label: "太阳百科", emoji: "☀️", description: "互动绘本认识太阳" },
  { type: "science2" as const, label: "星座小侦探", emoji: "🕵️", description: "观察匹配常见星座" },
  { type: "thinking" as const, label: "思考题", emoji: "💡", description: "动脑筋，想一想" },
];

const THINKING_QUESTIONS = [
  {
    question: "如果太阳是一颗星星，那为什么白天我们看不到其他星星呢？你能猜猜原因吗？",
    hints: ["想一想，太阳和星星，谁离我们更近？", "谁更亮呢？", "白天的时候，什么东西把整个天空都照亮了？"],
    aiGuidance: "太阳离我们比其他星星近得多，而且非常非常亮。它发出的光把整个天空都照亮了，就像在很亮的房间里看不到远处的小灯一样。",
  },
  {
    question: "你能在天空中找到自己最喜欢的星星图案吗？试着用你的想象力给它起个名字！",
    hints: ["看看那些星星，它们像什么？", "像动物？像房子？还是像别的什么？", "发挥你的想象力！"],
    aiGuidance: "你的想象力真丰富！其实古人也是这样给星座起名字的。北斗七星就像一把勺子，猎户座就像一个拿弓箭的猎人。也许将来人们会用你起的名字呢！",
  },
];

export default function AdventurePage() {
  const router = useRouter();
  const store = useGameStore();
  const [view, setView] = useState<"hub" | "story" | "game" | "galaxy">("hub");
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [showStationDetail, setShowStationDetail] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [galaxyData, setGalaxyData] = useState<{
    brightStars: number;
    dimStars: number;
    brightColor: string;
    dimColor: string;
  } | null>(null);

  const handleResetProgress = () => {
    store.resetProgress();
    setShowResetConfirm(false);
    setView("hub");
    setCurrentGame(null);
    setShowStationDetail(null);
  };

  const actState = store.currentTheme
    ? store.themes[store.currentTheme].acts[0]
    : null;

  useEffect(() => {
    if (!store.currentTheme) {
      store.selectTheme("space");
    }
  }, []);

  const handleStationClick = (stationId: string) => {
    if (stationId === "story") {
      setView("story");
    } else if (stationId === "math4") {
      // Galaxy grouping game - inline implementation
      setView("galaxy");
      setGalaxyData({
        brightStars: 8 + Math.floor(Math.random() * 5),
        dimStars: 4 + Math.floor(Math.random() * 4),
        brightColor: "#FFE66D",
        dimColor: "#8B8FA3",
      });
    } else if (stationId === "math2") {
      setCurrentGame("constellation");
      setView("game");
    } else if (stationId === "math3") {
      setCurrentGame("shootingStar");
      setView("game");
    } else if (stationId === "english1") {
      setCurrentGame("wordFlip");
      setView("game");
    } else if (stationId === "english2") {
      setCurrentGame("readAlong");
      setView("game");
    } else if (stationId === "science1") {
      setCurrentGame("sunBook");
      setView("game");
    } else if (stationId === "science2") {
      setCurrentGame("constellationDetective");
      setView("game");
    } else if (stationId === "thinking") {
      setCurrentGame("thinking");
      setView("game");
    } else {
      setCurrentGame(stationId);
      setView("game");
    }
  };

  const handleComplete = (score: number, stars: number) => {
    const stationMap: Record<string, "math" | "english" | "science" | "thinking"> = {
      math1: "math", math2: "math", math3: "math", math4: "math",
      english1: "english", english2: "english",
      science1: "science", science2: "science",
      thinking: "thinking",
    };
    const current = currentGame || showStationDetail || "";
    const stationType = stationMap[current] || "math";

    store.completeStation(stationType, score, stars);
    store.collectCrystal(1);
    setView("hub");
    setCurrentGame(null);
  };

  // ========== HUB VIEW ==========
  if (view === "hub") {
    return (
      <div className="min-h-screen bg-navy star-field">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-navy/90 backdrop-blur-sm border-b border-navy-border px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl sm:text-2xl">🚀</span>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal to-sunshine bg-clip-text text-transparent">
                奇知岛
              </h1>
            </div>
            {actState && (
              <CrystalCounter
                collected={actState.crystalsCollected}
                total={actState.totalCrystals}
              />
            )}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => router.push("/achievement")}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-navy-mid border border-navy-border text-sm text-muted hover:text-cream hover:border-lavender transition-all"
                aria-label="学习成就"
              >
                <span className="sm:hidden">📊</span>
                <span className="hidden sm:inline">📊 成就</span>
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-navy-mid border border-navy-border text-sm text-muted hover:text-coral hover:border-coral/50 transition-all"
                aria-label="重新开始"
              >
                <span className="sm:hidden">🔄</span>
                <span className="hidden sm:inline">🔄 重新开始</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Act header */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <span className="text-5xl sm:text-6xl">{ACT_DATA[0].emoji}</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-cream mt-3">{ACT_DATA[0].title}</h2>
            <p className="text-base sm:text-lg text-sunshine mt-1">{ACT_DATA[0].subtitle}</p>
            <p className="text-sm sm:text-base text-muted mt-2">{ACT_DATA[0].description}</p>
          </div>

          {/* Station grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {STATION_LIST.map((station) => {
              // Map specific station keys to store categories
              const categoryMap: Record<string, "story" | "math" | "english" | "science" | "thinking"> = {
                story: "story", math1: "math", math2: "math", math3: "math", math4: "math",
                english1: "english", english2: "english", science1: "science", science2: "science",
                thinking: "thinking",
              };
              const storeCategory = categoryMap[station.type] || "math";
              const completed = actState?.stations[storeCategory]?.completed;
              const stationScore = actState?.stations[storeCategory]?.score || 0;
              const stationStars = actState?.stations[storeCategory]?.stars || 0;

              return (
                <button
                  key={station.type}
                  onClick={() => handleStationClick(station.type)}
                  className={`game-card relative rounded-2xl border-2 p-4 sm:p-5 text-left transition-all ${
                    completed
                      ? "bg-teal/10 border-teal/30"
                      : "bg-navy-light border-navy-border hover:border-teal/50"
                  }`}
                >
                  {completed && (
                    <div className="absolute top-2 right-2 text-lg">✅</div>
                  )}
                  <span className="text-3xl sm:text-4xl block mb-2">{station.emoji}</span>
                  <h3 className="text-base sm:text-lg font-bold text-cream mb-1">{station.label}</h3>
                  <p className="text-xs sm:text-sm text-muted">{station.description}</p>
                  {completed && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-navy-border">
                      <StarRating stars={stationStars} size="sm" />
                      <span className="text-sm text-teal font-bold">{stationScore}分</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Zhizhi at bottom */}
          <div className="mt-8 flex justify-start">
            <ZhizhiSpeaker
              message="选一个任务开始今天的星空探险吧！记住，每完成一个任务就能收集一颗水晶哦！"
              size="sm"
              autoSpeak={false}
            />
          </div>
        </div>

        {/* 重新开始确认模态 */}
        {showResetConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fade-in"
            style={{ background: "rgba(11, 14, 26, 0.8)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowResetConfirm(false)}
          >
            <div
              className="bg-navy-light border-2 border-coral/40 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-5xl block mb-3">🔄</span>
              <h3 className="text-2xl font-bold text-cream mb-2">重新开始探险？</h3>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                这会清空你所有的星星、水晶和分数哦！已学会的单词和思考题答案也会被擦掉。确定要重新开始吗？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-navy-mid border border-navy-border text-cream font-bold hover:bg-navy-mid/70 transition-all"
                >
                  再想想
                </button>
                <button
                  onClick={handleResetProgress}
                  className="flex-1 px-4 py-3 rounded-xl bg-coral text-white font-bold hover:bg-coral/80 transition-all"
                >
                  确认重置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== STORY VIEW ==========
  if (view === "story") {
    return (
      <div className="min-h-screen bg-navy star-field">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Back button */}
          <button
            onClick={() => {
              setView("hub");
              store.completeStation("story", 5, 1);
              store.collectCrystal(1);
            }}
            className="flex items-center gap-2 text-muted hover:text-cream transition-colors mb-6"
          >
            ← 返回探险地图
          </button>

          {/* Story content */}
          <div className="animate-fade-in">
            {/* Scene illustration */}
            <div className="w-full h-64 bg-gradient-to-b from-navy-mid to-navy rounded-2xl border border-navy-border flex items-center justify-center mb-8 overflow-hidden star-field">
              <div className="text-center">
                <span className="text-7xl block animate-float">🌟</span>
                <div className="flex gap-2 mt-4 justify-center">
                  <span className="text-3xl animate-twinkle">⭐</span>
                  <span className="text-2xl animate-twinkle" style={{ animationDelay: "0.5s" }}>⭐</span>
                  <span className="text-4xl animate-twinkle" style={{ animationDelay: "1s" }}>⭐</span>
                  <span className="text-2xl animate-twinkle" style={{ animationDelay: "1.5s" }}>⭐</span>
                  <span className="text-3xl animate-twinkle" style={{ animationDelay: "2s" }}>⭐</span>
                </div>
              </div>
            </div>

            {/* Zhizhi narration */}
            <ZhizhiSpeaker
              message={ACT_DATA[0].storyMessage}
              autoSpeak={true}
              onDone={() => {
                // Auto-mark as complete after narration ends
              }}
            />

            {/* Continue button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setView("hub");
                  store.completeStation("story", 5, 1);
                  store.collectCrystal(1);
                }}
                className="px-8 py-4 rounded-2xl bg-teal text-navy text-xl font-bold hover:bg-teal/80 transition-all animate-pulse-glow"
              >
                开始探险！🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== GALAXY GROUPING GAME (inline) ==========
  if (view === "galaxy" && galaxyData) {
    const [brightCount, setBrightCount] = useState(0);
    const [dimCount, setDimCount] = useState(0);
    const [resultPhase, setResultPhase] = useState<"sorting" | "comparing">("sorting");
    const [sortingDone, setSortingDone] = useState(false);

    const totalBright = galaxyData.brightStars;
    const totalDim = galaxyData.dimStars;
    const isBrightDone = brightCount >= totalBright;
    const isDimDone = dimCount >= totalDim;
    const allSorted = isBrightDone && isDimDone;

    return (
      <div className="min-h-screen bg-navy star-field">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <button
            onClick={() => { setView("hub"); }}
            className="flex items-center gap-2 text-muted hover:text-cream transition-colors mb-6"
          >
            ← 返回探险地图
          </button>

          <div className="text-center mb-6">
            <span className="text-3xl">🌌</span>
            <h2 className="text-2xl font-bold text-cream mt-2">银河分组</h2>
          </div>

          {resultPhase === "sorting" && (
            <>
              <div className="bg-navy-mid border border-lavender rounded-xl p-4 text-center mb-4">
                <p className="text-lg font-bold text-cream">
                  点击每颗星星，把它们分到"亮星"和"暗星"两个篮子里
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                {/* Bright stars basket */}
                <div className="bg-navy-mid border border-sunshine/30 rounded-xl p-3 sm:p-4 min-h-[160px] sm:min-h-[200px]">
                  <h3 className="text-center text-sunshine font-bold mb-2 text-sm sm:text-base">
                    ⭐ 亮星篮子
                  </h3>
                  <p className="text-center text-2xl sm:text-3xl font-bold text-sunshine">{brightCount}/{totalBright}</p>
                  <div className="mt-2 flex flex-wrap gap-1 justify-center">
                    {Array.from({ length: brightCount }).map((_, i) => (
                      <span key={i} className="text-lg sm:text-xl animate-fade-in">⭐</span>
                    ))}
                  </div>
                </div>

                {/* Dim stars basket */}
                <div className="bg-navy-mid border border-muted/30 rounded-xl p-3 sm:p-4 min-h-[160px] sm:min-h-[200px]">
                  <h3 className="text-center text-muted font-bold mb-2 text-sm sm:text-base">
                    ✧ 暗星篮子
                  </h3>
                  <p className="text-center text-2xl sm:text-3xl font-bold text-muted">{dimCount}/{totalDim}</p>
                  <div className="mt-2 flex flex-wrap gap-1 justify-center">
                    {Array.from({ length: dimCount }).map((_, i) => (
                      <span key={i} className="text-lg sm:text-xl opacity-40 animate-fade-in">✧</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stars to sort */}
              <div className="bg-navy-mid rounded-xl border border-navy-border p-6 flex flex-wrap gap-3 justify-center min-h-[120px]">
                {!allSorted ? (
                  <>
                    {/* Bright stars remaining */}
                    {Array.from({ length: totalBright - brightCount }).map((_, i) => (
                      <button
                        key={`bright-${i}`}
                        onClick={() => setBrightCount((c) => c + 1)}
                        className="text-4xl hover:scale-125 transition-transform cursor-pointer"
                      >
                        ⭐
                      </button>
                    ))}
                    {/* Dim stars remaining */}
                    {Array.from({ length: totalDim - dimCount }).map((_, i) => (
                      <button
                        key={`dim-${i}`}
                        onClick={() => setDimCount((c) => c + 1)}
                        className="text-4xl opacity-40 hover:opacity-80 hover:scale-125 transition-all cursor-pointer"
                      >
                        ✧
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="w-full text-center py-4">
                    <p className="text-xl font-bold text-teal">分类完成！✨</p>
                    <button
                      onClick={() => setResultPhase("comparing")}
                      className="mt-3 px-6 py-2 rounded-xl bg-teal text-navy font-bold"
                    >
                      比一比谁更多 →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {resultPhase === "comparing" && (
            <div className="animate-fade-in text-center">
              <div className="bg-navy-mid border border-lavender rounded-xl p-6 mb-4">
                <p className="text-xl font-bold text-cream mb-4">比较结果</p>
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <span className="text-4xl">⭐</span>
                    <p className="text-3xl font-bold text-sunshine">{totalBright}</p>
                    <p className="text-sm text-muted">亮星</p>
                  </div>
                  <div className="text-2xl">
                    {totalBright > totalDim ? (
                      <span className="text-sunshine">亮星更多！多 {totalBright - totalDim} 颗</span>
                    ) : totalDim > totalBright ? (
                      <span className="text-muted">暗星更多！多 {totalDim - totalBright} 颗</span>
                    ) : (
                      <span className="text-lavender">一样多！都是 {totalBright} 颗</span>
                    )}
                  </div>
                  <div>
                    <span className="text-4xl opacity-40">✧</span>
                    <p className="text-3xl font-bold text-muted">{totalDim}</p>
                    <p className="text-sm text-muted">暗星</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleComplete(15, 3)}
                className="px-8 py-3 rounded-xl bg-teal text-navy text-lg font-bold"
              >
                完成！收集水晶 ✨
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== GAME VIEW ==========
  if (view === "game" && currentGame) {
    return (
      <div className="min-h-screen bg-navy star-field">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Back button */}
          <button
            onClick={() => { setView("hub"); }}
            className="flex items-center gap-2 text-muted hover:text-cream transition-colors mb-6"
          >
            ← 返回探险地图
          </button>

          {/* Game content */}
          <div className="animate-fade-in">
            {currentGame === "math1" && <StarCountGame onComplete={handleComplete} />}
            {currentGame === "constellation" && <ConstellationGame onComplete={handleComplete} />}
            {currentGame === "shootingStar" && <ShootingStarGame onComplete={handleComplete} />}
            {currentGame === "wordFlip" && <WordCardFlipGame onComplete={handleComplete} />}
            {currentGame === "readAlong" && <ReadAlongGame onComplete={handleComplete} />}
            {currentGame === "sunBook" && <SunScienceBook onComplete={handleComplete} />}
            {currentGame === "constellationDetective" && <ConstellationDetective onComplete={handleComplete} />}
            {currentGame === "thinking" && <ThinkingQuestion questions={THINKING_QUESTIONS} onComplete={handleComplete} />}
          </div>
        </div>
      </div>
    );
  }

  // ========== FALLBACK: Redirect to hub ==========
  return null;
}
