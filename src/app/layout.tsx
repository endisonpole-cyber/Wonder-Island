import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "奇知岛 Wonder Island - AI驱动的跨学科主题探险学习平台",
  description: "面向小学1-3年级，以故事剧情驱动的跨学科主题探险学习平台，AI陪伴孩子在太空、动物、植物探险中自然融合数学、英语和科学知识的学习。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0E1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="antialiased">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
