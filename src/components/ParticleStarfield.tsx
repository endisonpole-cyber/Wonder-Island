"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number; // 深度，用于视差与大小
  r: number; // 半径
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number;
  vy: number;
  color: string;
};

type ShootingStar = {
  x: number;
  y: number;
  len: number;
  speed: number;
  angle: number;
  life: number;
  maxLife: number;
};

const STAR_COLORS = [
  "rgba(255, 255, 255, 1)",
  "rgba(255, 240, 200, 1)", // 暖白
  "rgba(200, 220, 255, 1)", // 冷白蓝
  "rgba(255, 220, 230, 1)", // 粉白
  "rgba(167, 139, 250, 1)", // 淡紫
  "rgba(78, 205, 196, 1)",  // 青色
];

/**
 * 粒子星空背景动画
 * - 多层星星，带闪烁、缓慢漂移与视差
 * - 随机生成流星
 * - 鼠标附近星星会被轻微吸引/高亮
 */
export default function ParticleStarfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let rafId = 0;
    let lastShootingTime = 0;

    const pickStarCount = () => {
      // 根据屏幕面积动态决定星星数量，平衡视觉效果与性能
      const area = width * height;
      return Math.min(260, Math.max(120, Math.floor(area / 7000)));
    };

    const initStars = () => {
      const count = pickStarCount();
      stars = [];
      for (let i = 0; i < count; i++) {
        const z = Math.random(); // 0~1
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          r: 0.4 + z * 1.6,
          baseAlpha: 0.3 + Math.random() * 0.7,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinklePhase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.05 * (0.3 + z),
          vy: (Math.random() - 0.5) * 0.05 * (0.3 + z),
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        });
      }
    };

    const resize = () => {
      // 小屏设备降低 DPR 以减少 GPU 负载，大屏保持高清
      const isSmallScreen = window.innerWidth < 768;
      dpr = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.5 : 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    };

    const spawnShootingStar = () => {
      // 从屏幕左上区域随机起点，斜向右下飞行
      const startX = Math.random() * width * 0.6;
      const startY = Math.random() * height * 0.4;
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4; // ~45°
      const speed = 8 + Math.random() * 6;
      shootingStars.push({
        x: startX,
        y: startY,
        len: 80 + Math.random() * 120,
        speed,
        angle,
        life: 0,
        maxLife: 60 + Math.random() * 40,
      });
    };

    const draw = (t: number) => {
      // 半透明清屏，制造轻微拖尾
      ctx.fillStyle = "rgba(11, 14, 26, 0.35)";
      ctx.fillRect(0, 0, width, height);

      const time = t / 1000;

      // 绘制星星
      for (const s of stars) {
        // 漂移
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        else if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        else if (s.y > height) s.y = 0;

        // 闪烁
        const twinkle =
          0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinklePhase);
        let alpha = s.baseAlpha * (0.4 + 0.6 * twinkle);

        // 鼠标交互：附近星星增亮
        if (mouseRef.current.active) {
          const dx = s.x - mouseRef.current.x;
          const dy = s.y - mouseRef.current.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 14400) {
            // 120px 半径
            const boost = 1 - dist2 / 14400;
            alpha = Math.min(1, alpha + boost * 0.5);
          }
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        // 较大的星星加上光晕
        if (s.r > 1.2) {
          ctx.globalAlpha = alpha * 0.25;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 流星
      if (
        shootingStars.length < 3 &&
        t - lastShootingTime > 3500 &&
        Math.random() < 0.02
      ) {
        spawnShootingStar();
        lastShootingTime = t;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const sh = shootingStars[i];
        sh.life += 1;
        sh.x += Math.cos(sh.angle) * sh.speed;
        sh.y += Math.sin(sh.angle) * sh.speed;

        const lifeRatio = sh.life / sh.maxLife;
        const alpha = lifeRatio < 0.1
          ? lifeRatio / 0.1
          : 1 - (lifeRatio - 0.1) / 0.9;

        const tailX = sh.x - Math.cos(sh.angle) * sh.len;
        const tailY = sh.y - Math.sin(sh.angle) * sh.len;

        const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        grad.addColorStop(0.3, `rgba(200, 220, 255, ${alpha * 0.6})`);
        grad.addColorStop(1, "rgba(167, 139, 250, 0)");

        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // 流星头部光点
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 1.8, 0, Math.PI * 2);
        ctx.fill();

        if (sh.life >= sh.maxLife || sh.x > width + 50 || sh.y > height + 50) {
          shootingStars.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };

    let mouseRafId = 0;
    const handleMouseMove = (e: MouseEvent) => {
      // 用 rAF 节流，避免高频 mousemove 触发不必要的重绘
      if (mouseRafId) return;
      mouseRafId = requestAnimationFrame(() => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
        mouseRef.current.active = true;
        mouseRafId = 0;
      });
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    // 页面可见性检测：隐藏时暂停动画，恢复时重启，节省 CPU/GPU
    let running = true;
    const handleVisibility = () => {
      if (document.hidden) {
        running = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      } else if (!running) {
        running = true;
        lastShootingTime = performance.now();
        rafId = requestAnimationFrame(draw);
      }
    };

    // resize 防抖，避免拖拽窗口时频繁重建星星
    let resizeTimer = 0;
    const debouncedResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };

    resize();
    window.addEventListener("resize", debouncedResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    rafId = requestAnimationFrame(draw);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (mouseRafId) cancelAnimationFrame(mouseRafId);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
