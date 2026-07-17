"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useGameStore } from "@/lib/store";
import { ZhizhiSpeaker } from "@/components/ZhizhiOwl";
import CrystalCounter from "@/components/CrystalCounter";
import StarRating from "@/components/StarRating";
import { speak, initPreferredVoice } from "@/lib/speech";

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
    storyMessage: "小探险家，欢迎来到奇知岛！我是知知，一只来自知识星球的猫头鹰。你知道吗？天上的星星其实都是巨大的火球，就像太阳一样，只是它们离我们太远太远了，所以看起来又小又暗。",
    storyMessage2: "星星们住在一条叫银河系的大河里，那里有上千亿颗星星呢！它们有的亮，有的暗，有的大，有的小。古人还把星星连成图案，给它们起了好听的名字，比如北斗七星、猎户座。",
    storyMessage3: "可是最近，星星们的水晶碎片不见了！没有水晶，星星就没法闪闪发光了。今天你的任务就是：通过数学、英语和科学的考验，帮星星们找回5颗水晶碎片。准备好了吗？先点击夜空中的星星，让它们亮起来吧！",
  },
];

// 故事导入页星星固定位置（共8颗，收集5颗即可）
const STORY_STAR_POSITIONS = [
  { x: 15, y: 20, delay: 0 },
  { x: 75, y: 15, delay: 0.5 },
  { x: 85, y: 40, delay: 1 },
  { x: 25, y: 75, delay: 1.5 },
  { x: 60, y: 80, delay: 2 },
  { x: 10, y: 55, delay: 0.3 },
  { x: 90, y: 70, delay: 1.2 },
  { x: 45, y: 30, delay: 0.8 },
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
  const [view, setView] = useState<"hub" | "story" | "game" | "galaxy" | "transition" | "complete">("hub");
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [showStationDetail, setShowStationDetail] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [galaxyData, setGalaxyData] = useState<{
    brightStars: number;
    dimStars: number;
    brightColor: string;
    dimColor: string;
  } | null>(null);
  const [autoPlayMode, setAutoPlayMode] = useState(false);
  const [transitionData, setTransitionData] = useState<{
    score: number;
    stars: number;
    nextStation: typeof STATION_LIST[number] | null;
    currentLabel: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [clickedStars, setClickedStars] = useState<number[]>([]);
  const [storyPhase, setStoryPhase] = useState<'intro' | 'dialogue' | 'ready'>('intro');
  const [displayedText, setDisplayedText] = useState('');
  const [brightCount, setBrightCount] = useState(0);
  const [dimCount, setDimCount] = useState(0);
  const [resultPhase, setResultPhase] = useState<"sorting" | "comparing">("sorting");
  const [sortingDone, setSortingDone] = useState(false);
  const [showWelcomeSpeech, setShowWelcomeSpeech] = useState(true);

  const [storyParagraph, setStoryParagraph] = useState(0);

  const actState = store.currentTheme
    ? store.themes[store.currentTheme].acts[0]
    : null;

  const getStationIndex = (type: string) =>
    STATION_LIST.findIndex((s) => s.type === type);

  const getNextStation = (currentType: string): typeof STATION_LIST[number] | null => {
    const currentIdx = getStationIndex(currentType);
    for (let i = currentIdx + 1; i < STATION_LIST.length; i++) {
      const station = STATION_LIST[i];
      const categoryMap: Record<string, "story" | "math" | "english" | "science" | "thinking"> = {
        story: "story", math1: "math", math2: "math", math3: "math", math4: "math",
        english1: "english", english2: "english", science1: "science", science2: "science",
        thinking: "thinking",
      };
      const cat = categoryMap[station.type];
      if (!actState?.stations[cat]?.completed) {
        return station;
      }
    }
    return null;
  };

  const startStation = (type: string) => {
    if (type === "story") {
      setView("story");
    } else if (type === "math4") {
      setView("galaxy");
      setGalaxyData({
        brightStars: 8 + Math.floor(Math.random() * 5),
        dimStars: 4 + Math.floor(Math.random() * 4),
        brightColor: "#FFE66D",
        dimColor: "#8B8FA3",
      });
    } else if (type === "math2") {
      setCurrentGame("constellation");
      setView("game");
    } else if (type === "math3") {
      setCurrentGame("shootingStar");
      setView("game");
    } else if (type === "english1") {
      setCurrentGame("wordFlip");
      setView("game");
    } else if (type === "english2") {
      setCurrentGame("readAlong");
      setView("game");
    } else if (type === "science1") {
      setCurrentGame("sunBook");
      setView("game");
    } else if (type === "science2") {
      setCurrentGame("constellationDetective");
      setView("game");
    } else if (type === "thinking") {
      setCurrentGame("thinking");
      setView("game");
    } else {
      setCurrentGame(type);
      setView("game");
    }
  };

  const handleResetProgress = () => {
    store.resetProgress();
    setShowResetConfirm(false);
    setView("hub");
    setCurrentGame(null);
    setShowStationDetail(null);
    setAutoPlayMode(false);
    setTransitionData(null);
  };

  useEffect(() => {
    if (!store.currentTheme) {
      store.selectTheme("space");
    }
  }, []);

  useEffect(() => {
    initPreferredVoice();
    if (view === "hub" && showWelcomeSpeech) {
      const timer = setTimeout(() => {
        speak("欢迎来到第一幕：地球的夜空！我是知知。夜空中布满了闪烁的星星，让我们来认识它们吧！先点击故事导入，开始今天的冒险。", 0.95);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [view, showWelcomeSpeech]);

  useEffect(() => {
    if (view !== "transition" || !transitionData) return;
    if (countdown <= 0) {
      goToNextStation();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, view, transitionData]);

  useEffect(() => {
    if (view !== "story") return;
    setClickedStars([]);
    setStoryPhase('intro');
    setDisplayedText('');
    setStoryParagraph(0);
    const startTimer = setTimeout(() => setStoryPhase('dialogue'), 800);
    return () => clearTimeout(startTimer);
  }, [view]);

  const STORY_PARAGRAPHS = [
    ACT_DATA[0].storyMessage,
    ACT_DATA[0].storyMessage2,
    ACT_DATA[0].storyMessage3,
  ];

  useEffect(() => {
    if (storyPhase !== 'dialogue') return;
    const currentText = STORY_PARAGRAPHS[storyParagraph] || '';
    let index = 0;
    const timer = setInterval(() => {
      if (index <= currentText.length) {
        setDisplayedText(currentText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
        setStoryPhase('ready');
      }
    }, 70);
    return () => clearInterval(timer);
  }, [storyPhase, storyParagraph]);

  const handleNextParagraph = () => {
    if (storyParagraph < STORY_PARAGRAPHS.length - 1) {
      setStoryParagraph(p => p + 1);
      setDisplayedText('');
      setStoryPhase('dialogue');
    }
  };

  const handleStationClick = (stationId: string) => {
    setAutoPlayMode(true);
    setCountdown(3);
    startStation(stationId);
  };

  const getStationTypeForStore = (type: string): "story" | "math" | "english" | "science" | "thinking" => {
    const map: Record<string, "story" | "math" | "english" | "science" | "thinking"> = {
      story: "story",
      math1: "math", math2: "math", math3: "math", math4: "math",
      english1: "english", english2: "english",
      science1: "science", science2: "science",
      thinking: "thinking",
    };
    return map[type] || "math";
  };

  const getCurrentStationKey = (): string => {
    if (view === "story") return "story";
    if (view === "galaxy") return "math4";
    if (view === "game" && currentGame) {
      const reverseMap: Record<string, string> = {
        constellation: "math2",
        shootingStar: "math3",
        wordFlip: "english1",
        readAlong: "english2",
        sunBook: "science1",
        constellationDetective: "science2",
        thinking: "thinking",
        math1: "math1",
      };
      return reverseMap[currentGame] || currentGame;
    }
    return "";
  };

  const handleComplete = (score: number, stars: number) => {
    const currentKey = getCurrentStationKey();
    const stationType = getStationTypeForStore(currentKey);
    const currentStation = STATION_LIST.find((s) => s.type === currentKey);

    store.completeStation(stationType, score, stars);
    store.collectCrystal(1);

    if (!autoPlayMode) {
      setView("hub");
      setCurrentGame(null);
      return;
    }

    const nextStation = getNextStation(currentKey);
    setCountdown(3);
    setTransitionData({
      score,
      stars,
      nextStation,
      currentLabel: currentStation?.label || "",
    });
    setView("transition");
    setCurrentGame(null);
  };

  const goToNextStation = () => {
    if (!transitionData?.nextStation) {
      setView("complete");
      setTransitionData(null);
      return;
    }
    startStation(transitionData.nextStation.type);
    setTransitionData(null);
  };

  const exitToHub = () => {
    setAutoPlayMode(false);
    setTransitionData(null);
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
            <button
              onClick={() => speak("欢迎来到第一幕：地球的夜空！我是知知。夜空中布满了闪烁的星星，让我们来认识它们吧！先点击故事导入，开始今天的冒险。", 0.95)}
              className="mt-3 px-4 py-1.5 rounded-full bg-navy-mid border border-teal/50 text-sm text-teal hover:bg-teal/20 transition-all flex items-center gap-2 mx-auto"
            >
              <span>🔊</span>
              <span>再听一遍</span>
            </button>
          </div>

          {/* Station grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {STATION_LIST.map((station, index) => {
              const categoryMap: Record<string, "story" | "math" | "english" | "science" | "thinking"> = {
                story: "story", math1: "math", math2: "math", math3: "math", math4: "math",
                english1: "english", english2: "english", science1: "science", science2: "science",
                thinking: "thinking",
              };
              const storeCategory = categoryMap[station.type] || "math";
              const completed = actState?.stations[storeCategory]?.completed;
              const stationScore = actState?.stations[storeCategory]?.score || 0;
              const stationStars = actState?.stations[storeCategory]?.stars || 0;
              const isNext = !completed && STATION_LIST.slice(0, index).every(
                (s) => actState?.stations[categoryMap[s.type]]?.completed
              );

              return (
                <button
                  key={station.type}
                  onClick={() => handleStationClick(station.type)}
                  className={`game-card relative rounded-2xl border-2 p-4 sm:p-5 text-left transition-all group ${
                    completed
                      ? "bg-teal/10 border-teal/30"
                      : isNext
                        ? "bg-navy-light border-teal/50 animate-pulse-glow"
                        : "bg-navy-light/50 border-navy-border opacity-60"
                  }`}
                >
                  {/* Corner decoration */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-xl transition-colors"
                       style={{ borderColor: completed ? '#4ECDC4' : (isNext ? '#4ECDC4' : '#2A2E45') }}></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-xl transition-colors"
                       style={{ borderColor: completed ? '#4ECDC4' : (isNext ? '#4ECDC4' : '#2A2E45') }}></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-xl transition-colors"
                       style={{ borderColor: completed ? '#4ECDC4' : (isNext ? '#4ECDC4' : '#2A2E45') }}></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-xl transition-colors"
                       style={{ borderColor: completed ? '#4ECDC4' : (isNext ? '#4ECDC4' : '#2A2E45') }}></div>

                  {/* Status badges */}
                  {completed && (
                    <div className="absolute top-2 right-2 text-lg animate-bounce-in">✅</div>
                  )}
                  {isNext && !completed && (
                    <div className="absolute top-2 right-2 text-lg animate-pulse">🔮</div>
                  )}

                  {/* Emoji with hover effect */}
                  <div className="relative mb-2">
                    <span className={`text-3xl sm:text-4xl block transition-transform duration-300 ${
                      isNext ? 'animate-float' : 'group-hover:scale-110'
                    }`}>
                      {station.emoji}
                    </span>
                    {isNext && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-teal rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={`text-base sm:text-lg font-bold mb-1 transition-colors ${
                    completed ? 'text-teal' : (isNext ? 'text-cream' : 'text-muted')
                  }`}>
                    {station.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted">{station.description}</p>

                  {/* Progress/Score */}
                  {completed && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy-border/50">
                      <StarRating stars={stationStars} size="sm" />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted">得分</span>
                        <span className="text-sm text-teal font-bold">{stationScore}</span>
                      </div>
                    </div>
                  )}

                  {/* Lock icon for locked stations */}
                  {!completed && !isNext && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-xs text-muted">🔒 完成前面的任务解锁</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Overall progress bar */}
          <div className="mt-8 bg-navy-mid/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-cream font-bold">📊 探险进度</span>
              <span className="text-sm text-teal font-bold">
                {actState ? Object.values(actState.stations).filter(s => s.completed).length : 0}/5 个任务完成
              </span>
            </div>
            <div className="w-full bg-navy-border rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal via-sunshine to-lavender h-full transition-all duration-700 flex items-center justify-end pr-2"
                style={{ width: `${actState ? (Object.values(actState.stations).filter(s => s.completed).length / 5) * 100 : 0}%` }}
              >
                <span className="text-xs text-navy font-bold">✨</span>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted">
              <span>开始探险</span>
              <span>通关完成</span>
            </div>
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
    const handleStarClick = (index: number) => {
      if (!clickedStars.includes(index)) {
        setClickedStars([...clickedStars, index]);
      }
    };

    return (
      <div className="min-h-screen bg-navy star-field relative overflow-hidden">
        {/* Animated background layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl animate-float animate-delay-0">🌌</div>
          <div className="absolute top-20 right-20 text-4xl animate-float animate-delay-10">🪐</div>
          <div className="absolute bottom-32 left-1/4 text-3xl animate-float animate-delay-20">🚀</div>
          <div className="absolute bottom-20 right-1/3 text-5xl animate-float animate-delay-5">🌠</div>
          <div className="absolute top-1/3 right-10 text-2xl animate-twinkle">⭐</div>
          <div className="absolute top-1/2 left-8 text-3xl animate-twinkle animate-delay-7">✨</div>
          <div className="absolute bottom-40 left-20 text-2xl animate-twinkle animate-delay-12">⭐</div>
        </div>

        {/* Interactive stars - 固定位置，点击收集 */}
        <div className="absolute inset-0 pointer-events-none">
          {STORY_STAR_POSITIONS.map((pos, i) => (
            <button
              key={i}
              onClick={() => handleStarClick(i)}
              className="absolute text-xl sm:text-2xl transition-all duration-300 hover:scale-150 pointer-events-auto"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                animation: clickedStars.includes(i) 
                  ? 'starPop 0.5s ease-out forwards' 
                  : `twinkle 3s ease-in-out ${pos.delay}s infinite`,
                opacity: clickedStars.includes(i) ? 1 : 0.7,
              }}
            >
              {clickedStars.includes(i) ? '💫' : '⭐'}
            </button>
          ))}
        </div>

        {/* 流星雨背景效果 - 头部亮，尾部暗，从上往下落 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-20 sm:w-28 h-px bg-gradient-to-l from-white/90 via-white/50 to-transparent"
              style={{
                top: `${5 + i * 11}%`,
                left: `${5 + (i % 4) * 25}%`,
                animation: `meteorShoot ${3 + i * 0.4}s linear ${i * 0.7}s infinite`,
                transform: 'rotate(45deg)',
                opacity: 0,
              }}
            />
          ))}
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          {/* Back button */}
          <button
            onClick={exitToHub}
            className="flex items-center gap-2 text-muted hover:text-cream transition-colors mb-6"
          >
            ← 返回探险地图
          </button>

          {/* Story content */}
          <div className="animate-fade-in">
            {/* Scene title */}
            <div className="text-center mb-6">
              <span className="text-4xl sm:text-5xl animate-bounce-in">{ACT_DATA[0].emoji}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-cream mt-2">{ACT_DATA[0].title}</h2>
              <p className="text-sm sm:text-base text-sunshine">{ACT_DATA[0].subtitle}</p>
            </div>

            {/* Scene illustration */}
            <div className="w-full h-48 sm:h-64 bg-gradient-to-b from-navy-mid/80 to-navy/80 rounded-3xl border-2 border-navy-border flex items-center justify-center mb-6 overflow-hidden star-field relative">
              <div className="text-center relative z-10">
                <span className="text-6xl sm:text-7xl block animate-float">🌟</span>
                <div className="flex gap-3 mt-3 justify-center">
                <span className="text-2xl sm:text-3xl animate-twinkle">⭐</span>
                <span className="text-xl sm:text-2xl animate-twinkle animate-delay-5">⭐</span>
                <span className="text-3xl sm:text-4xl animate-twinkle animate-delay-10">⭐</span>
                <span className="text-xl sm:text-2xl animate-twinkle animate-delay-15">⭐</span>
                <span className="text-2xl sm:text-3xl animate-twinkle animate-delay-20">⭐</span>
                </div>
                <p className="text-sm text-muted mt-4">点击星星让它们发光！✨</p>
              </div>
            </div>

            {/* Zhizhi narration */}
            <div className="bg-navy-light/90 rounded-2xl border border-lavender/30 p-4 sm:p-6 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-4xl animate-bounce-in">🦉</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-lavender">知知猫头鹰说：</p>
                    <div className="flex gap-1">
                      {STORY_PARAGRAPHS.map((_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === storyParagraph ? 'bg-lavender w-4' : 'bg-navy-border'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-cream text-base sm:text-lg leading-relaxed">
                    {storyPhase === 'intro' ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      <>
                        {displayedText}
                        {storyPhase === 'dialogue' && <span className="animate-pulse">|</span>}
                      </>
                    )}
                  </p>
                  {/* 继续按钮 */}
                  {storyPhase === 'ready' && storyParagraph < STORY_PARAGRAPHS.length - 1 && (
                    <button
                      onClick={handleNextParagraph}
                      className="mt-3 px-4 py-1.5 rounded-full bg-lavender/20 border border-lavender/50 text-sm text-lavender hover:bg-lavender/30 transition-all flex items-center gap-1"
                    >
                      继续
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Star collection progress */}
            <div className="bg-navy-mid/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">收集的星星</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl transition-all ${
                        i < Math.min(clickedStars.length, 5)
                          ? 'text-sunshine'
                          : 'text-muted/30'
                      }`}
                      style={i < Math.min(clickedStars.length, 5) ? { animation: `starPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s both` } : undefined}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full bg-navy-border rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal to-sunshine h-full transition-all duration-500"
                  style={{ width: `${Math.min((clickedStars.length / 5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Continue button - 只有最后一段且收集了5颗星星才显示 */}
            <div className="mt-4 text-center">
              {storyPhase === 'ready' && storyParagraph === STORY_PARAGRAPHS.length - 1 ? (
                clickedStars.length >= 5 ? (
                  <button
                    onClick={() => handleComplete(5, 1)}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-teal to-sunshine text-navy text-xl font-bold hover:opacity-90 transition-all animate-pulse-glow"
                  >
                    开始探险！🚀
                  </button>
                ) : (
                  <div className="text-sunshine text-sm">
                    ✨ 先点击背景中的星星，收集 5 颗星星再出发吧！
                    <span className="text-cream ml-1">（{clickedStars.length}/5）</span>
                  </div>
                )
              ) : (
                <div className="text-muted text-sm">
                  👆 点击「继续」听知知讲星星的故事
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== GALAXY GROUPING GAME (inline) ==========
  if (view === "galaxy" && galaxyData) {
    const totalBright = galaxyData.brightStars;
    const totalDim = galaxyData.dimStars;
    const isBrightDone = brightCount >= totalBright;
    const isDimDone = dimCount >= totalDim;
    const allSorted = isBrightDone && isDimDone;

    return (
      <div className="min-h-screen bg-navy star-field">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <button
            onClick={exitToHub}
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
            onClick={exitToHub}
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

  // ========== TRANSITION VIEW ==========
  if (view === "transition" && transitionData) {
    return (
      <div className="min-h-screen bg-navy star-field flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center animate-fade-in">
          <div className="bg-navy-light border-2 border-teal/40 rounded-3xl p-8 shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce-in">🎉</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-cream mb-2">
              {transitionData.currentLabel} 完成！
            </h2>
            <div className="flex justify-center gap-1 my-4">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`text-3xl ${
                    i <= transitionData.stars
                      ? "text-sunshine"
                      : "text-muted/30"
                  }`}
                  style={i <= transitionData.stars ? { animation: `starPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.15}s both` } : undefined}
                >
                  ⭐
                </span>
              ))}
            </div>
            <p className="text-lg text-teal font-bold mb-6">
              +{transitionData.score}分 · 💎 +1水晶
            </p>

            {transitionData.nextStation ? (
              <>
                <div className="bg-navy-mid rounded-xl p-4 mb-6">
                  <p className="text-sm text-muted mb-1">下一关</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl">{transitionData.nextStation.emoji}</span>
                    <span className="text-xl font-bold text-cream">
                      {transitionData.nextStation.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={goToNextStation}
                  className="w-full px-6 py-4 rounded-2xl bg-teal text-navy text-lg font-bold hover:bg-teal/80 transition-all animate-pulse-glow"
                >
                  继续冒险 → （{countdown}秒后自动进入）
                </button>
              </>
            ) : (
              <button
                onClick={goToNextStation}
                className="w-full px-6 py-4 rounded-2xl bg-sunshine text-navy text-lg font-bold hover:bg-sunshine/80 transition-all animate-pulse-glow"
              >
                查看成绩 🏆 （{countdown}秒后自动进入）
              </button>
            )}

            <button
              onClick={exitToHub}
              className="mt-4 text-sm text-muted hover:text-cream transition-colors"
            >
              先回到探险地图
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== COMPLETE VIEW ==========
  if (view === "complete") {
    const totalStars = actState
      ? Object.values(actState.stations).reduce((sum, s) => sum + s.stars, 0)
      : 0;
    const totalScore = actState
      ? Object.values(actState.stations).reduce((sum, s) => sum + s.score, 0)
      : 0;

    return (
      <div className="min-h-screen bg-navy star-field flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center animate-fade-in">
          <div className="bg-navy-light border-2 border-sunshine/40 rounded-3xl p-8 shadow-2xl">
            <div className="text-7xl mb-4 animate-bounce-in">🏆</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-sunshine via-teal to-lavender bg-clip-text text-transparent mb-2">
              恭喜通关！
            </h2>
            <p className="text-muted mb-6">你完成了所有的星空探险任务！</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-navy-mid rounded-xl p-3">
                <div className="text-3xl mb-1">⭐</div>
                <div className="text-2xl font-bold text-sunshine">{totalStars}</div>
                <div className="text-xs text-muted">星星总数</div>
              </div>
              <div className="bg-navy-mid rounded-xl p-3">
                <div className="text-3xl mb-1">💎</div>
                <div className="text-2xl font-bold text-teal">{actState?.crystalsCollected || 0}</div>
                <div className="text-xs text-muted">水晶收集</div>
              </div>
              <div className="bg-navy-mid rounded-xl p-3">
                <div className="text-3xl mb-1">🏅</div>
                <div className="text-2xl font-bold text-lavender">{totalScore}</div>
                <div className="text-xs text-muted">总得分</div>
              </div>
            </div>

            <div className="bg-navy-mid rounded-xl p-4 mb-6">
              <p className="text-cream">
                <span className="text-2xl mr-2">🦉</span>
                太棒了，小探险家！你帮星星们找回了所有的水晶碎片，
                星空又恢复了往日的闪亮。知知为你感到骄傲！
              </p>
            </div>

            <button
              onClick={() => {
                setAutoPlayMode(false);
                setView("hub");
              }}
              className="w-full px-6 py-4 rounded-2xl bg-teal text-navy text-lg font-bold hover:bg-teal/80 transition-all"
            >
              返回探险地图 🗺️
            </button>

            <button
              onClick={() => router.push("/achievement")}
              className="w-full mt-3 px-6 py-3 rounded-2xl bg-navy-mid border border-lavender/40 text-cream font-bold hover:bg-lavender/10 transition-all"
            >
              查看成就徽章 🏅
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== FALLBACK: Redirect to hub ==========
  return null;
}
