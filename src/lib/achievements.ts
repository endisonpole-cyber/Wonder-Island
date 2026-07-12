// 成就系统：定义成就徽章及解锁条件评估逻辑
// 成就状态为派生数据，从现有 store 进度实时计算，无需额外持久化

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  /** 进度信息，用于展示进度条（已解锁时为 null） */
  progress: { current: number; target: number } | null;
}

/** 评估成就所需的上下文，由页面从 store 中提取后传入 */
export interface AchievementContext {
  /** 已完成的学科任务数 */
  completedCount: number;
  /** 学科任务总数 */
  totalStations: number;
  /** 已收集水晶数 */
  totalCrystals: number;
  /** 水晶总数上限 */
  maxCrystals: number;
  /** 所有站点获得的星星总数 */
  totalStars: number;
  /** 已学会的单词数 */
  wordsLearned: number;
  /** 已完成的思考题数 */
  thinkingAnswers: number;
  /** 获得满星(3星)的站点数 */
  perfectStations: number;
}

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  /** 难度分组，用于前端分区展示 */
  tier: "bronze" | "silver" | "gold";
  /** 返回当前进度值与目标值 */
  getProgress: (ctx: AchievementContext) => { current: number; target: number };
}

// 成就定义表：12 枚徽章，3 级难度梯度
// 入门(铜)3 枚：快速正反馈，门槛低
// 进阶(银)5 枚：需要实质性进度
// 大师(金)4 枚：接近完美才能解锁
const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ── 入门（铜牌）──
  {
    id: "first-step",
    name: "初次启航",
    description: "完成第 1 个任务",
    emoji: "🌟",
    tier: "bronze",
    getProgress: (ctx) => ({ current: ctx.completedCount, target: 1 }),
  },
  {
    id: "first-crystal",
    name: "初拾水晶",
    description: "收集第 1 颗水晶",
    emoji: "💎",
    tier: "bronze",
    getProgress: (ctx) => ({ current: ctx.totalCrystals, target: 1 }),
  },
  {
    id: "first-word",
    name: "第一课",
    description: "学会第 1 个单词",
    emoji: "📝",
    tier: "bronze",
    getProgress: (ctx) => ({ current: ctx.wordsLearned, target: 1 }),
  },

  // ── 进阶（银牌）──
  {
    id: "halfway",
    name: "渐入佳境",
    description: "完成 3 个学科任务",
    emoji: "🚀",
    tier: "silver",
    getProgress: (ctx) => ({ current: ctx.completedCount, target: 3 }),
  },
  {
    id: "star-shining",
    name: "星光闪耀",
    description: "累计获得 8 颗星",
    emoji: "⭐",
    tier: "silver",
    getProgress: (ctx) => ({ current: ctx.totalStars, target: 8 }),
  },
  {
    id: "word-builder",
    name: "词汇积累",
    description: "学会 4 个单词",
    emoji: "📖",
    tier: "silver",
    getProgress: (ctx) => ({ current: ctx.wordsLearned, target: 4 }),
  },
  {
    id: "crystal-half",
    name: "水晶过半",
    description: "收集 3 颗水晶",
    emoji: "🔮",
    tier: "silver",
    getProgress: (ctx) => ({ current: ctx.totalCrystals, target: 3 }),
  },
  {
    id: "thinker",
    name: "善于思考",
    description: "完成思考挑战",
    emoji: "🧠",
    tier: "silver",
    getProgress: (ctx) => ({ current: ctx.thinkingAnswers, target: 1 }),
  },

  // ── 大师（金牌）──
  {
    id: "all-subjects",
    name: "全科通关",
    description: "完成全部 5 个学科任务",
    emoji: "🏆",
    tier: "gold",
    getProgress: (ctx) => ({ current: ctx.completedCount, target: ctx.totalStations }),
  },
  {
    id: "crystal-master",
    name: "水晶满囊",
    description: "收集全部 5 颗水晶",
    emoji: "💰",
    tier: "gold",
    getProgress: (ctx) => ({ current: ctx.totalCrystals, target: ctx.maxCrystals }),
  },
  {
    id: "star-burst",
    name: "群星璀璨",
    description: "累计获得 12 颗星",
    emoji: "✨",
    tier: "gold",
    getProgress: (ctx) => ({ current: ctx.totalStars, target: 12 }),
  },
  {
    id: "perfect-master",
    name: "满星达人",
    description: "3 个站点获得满星",
    emoji: "🎓",
    tier: "gold",
    getProgress: (ctx) => ({ current: ctx.perfectStations, target: 3 }),
  },
];

/** 根据当前进度评估所有成就的解锁状态 */
export function evaluateAchievements(ctx: AchievementContext): Achievement[] {
  return ACHIEVEMENT_DEFS.map((def) => {
    const { current, target } = def.getProgress(ctx);
    const unlocked = current >= target;
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      emoji: def.emoji,
      unlocked,
      progress: unlocked ? null : { current, target },
    };
  });
}

/** 统计已解锁成就数 */
export function countUnlocked(achievements: Achievement[]): number {
  return achievements.filter((a) => a.unlocked).length;
}
