"use client";

interface CrystalCounterProps {
  collected: number;
  total: number;
}

export default function CrystalCounter({ collected, total }: CrystalCounterProps) {
  const percentage = total > 0 ? (collected / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-navy-light border border-navy-border rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
      <div className="flex gap-0.5 sm:gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`text-base sm:text-xl transition-all duration-500 ${
              i < collected ? "opacity-100 scale-110" : "opacity-30 scale-90"
            }`}
            role="img"
            aria-label={i < collected ? "已收集水晶" : "未收集水晶"}
          >
            💎
          </span>
        ))}
      </div>
      <div className="text-xs sm:text-sm whitespace-nowrap">
        <span className="text-teal font-bold">{collected}</span>
        <span className="text-muted">/{total}</span>
      </div>
      <div className="hidden sm:block w-16 h-2 bg-navy-mid rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal to-lavender rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
