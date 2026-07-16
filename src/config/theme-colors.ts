/**
 * 项目主题颜色单一来源（single source of truth）。
 * Tailwind 配置和任何需要运行时读取颜色的代码都应从这里导入，
 * 避免在客户端组件中直接导入 tailwind.config.ts。
 */
export const themeColors = {
  coral: "#FF6B6B",
  teal: "#4ECDC4",
  sunshine: "#FFE66D",
  lavender: "#A78BFA",
  navy: "#0B0E1A",
  "navy-light": "#141829",
  "navy-mid": "#1C2038",
  "navy-border": "#2A2E45",
  cream: "#F0F0F5",
  muted: "#8B8FA3",
} as const;

export type ThemeColorName = keyof typeof themeColors;
