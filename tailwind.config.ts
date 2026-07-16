import type { Config } from "tailwindcss";
import { themeColors } from "./src/config/theme-colors";

/**
 * 传统 Tailwind 配置文件，主要用于兼容 Next.js 16 内部工具
 *（如 bundle analyzer / dev overlay）读取 theme colors。
 * 项目实际样式由 Tailwind CSS v4 的 globals.css @theme inline 处理。
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: themeColors,
    },
  },
  plugins: [],
};

export default config;
