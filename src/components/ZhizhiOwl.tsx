"use client";

import { useEffect } from "react";
import { speak } from "@/lib/speech";

interface ZhizhiOwlProps {
  message?: string;
  onClick?: () => void;
  speaking?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ZhizhiOwl({
  message,
  onClick,
  speaking = false,
  size = "md",
}: ZhizhiOwlProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const bubbleSize = size === "sm" ? "max-w-[200px]" : "max-w-[300px]";

  return (
    <div className="flex items-end gap-3 animate-fade-in">
      {message && (
        <div
          className={`${bubbleSize} bg-navy-mid border border-navy-border rounded-2xl rounded-bl-none p-3 animate-slide-in`}
        >
          <p className="text-cream text-base leading-relaxed">{message}</p>
          {speaking && (
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
              <div className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
              <span className="text-xs text-muted ml-1">知知正在说话...</span>
            </div>
          )}
        </div>
      )}
      <button
        onClick={onClick}
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-sunshine to-lavender flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-sunshine/50 animate-float ${onClick ? "cursor-pointer" : ""}`}
        title="点击知知"
      >
        <span className="text-4xl" role="img" aria-label="猫头鹰知知">
          🦉
        </span>
      </button>
      <span className="text-xs text-muted font-bold">知知</span>
    </div>
  );
}

// Auto-speak wrapper for ZhizhiOwl
interface ZhizhiSpeakerProps {
  message: string;
  autoSpeak?: boolean;
  size?: "sm" | "md" | "lg";
  onDone?: () => void;
  onClick?: () => void;
}

export function ZhizhiSpeaker({
  message,
  autoSpeak = true,
  size = "md",
  onDone,
  onClick,
}: ZhizhiSpeakerProps) {
  useEffect(() => {
    if (autoSpeak && message) {
      const timer = setTimeout(() => {
        const utterance = speak(message);
        if (utterance && onDone) {
          utterance.onend = onDone;
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoSpeak, message, onDone]);

  return (
    <ZhizhiOwl
      message={message}
      speaking={autoSpeak}
      size={size}
      onClick={onClick}
    />
  );
}
