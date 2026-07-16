/**
 * Tailwind CSS v4 配置文件
 * 项目实际样式由 globals.css @theme inline 处理
 * 此文件保留以兼容 Next.js 开发工具
 */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
};

export default config;
