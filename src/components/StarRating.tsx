"use client";

interface StarRatingProps {
  stars: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ stars, max = 3, size = "md" }: StarRatingProps) {
  const sizeMap = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`${sizeMap[size]} transition-all duration-300 ${
            i < stars ? "opacity-100 scale-100" : "opacity-20 scale-75"
          }`}
          role="img"
          aria-label={i < stars ? "获得的星星" : "未获得的星星"}
        >
          ⭐
        </span>
      ))}
    </div>
  );
}
