"use client";

import { useState, useCallback } from "react";

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      type: "socratic" | "content" | "encourage",
      context: Record<string, string>
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, context }),
        });

        if (!response.ok) throw new Error("AI request failed");

        const data = await response.json();

        if (data.success && data.response) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.response },
          ]);
          return data.response;
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);

        // Fallback mock responses
        const fallbacks: Record<string, string> = {
          socratic: "没关系，我们换个方式想一想！你刚才的回答其实很接近了，再试一次？🤔",
          content: "这个问题很有趣！知知觉得...其实答案就藏在你身边哦～🌟",
          encourage: "你做得真棒！继续加油，知知为你感到骄傲！💪✨",
        };
        return fallbacks[type] || fallbacks.encourage;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return { loading, messages, error, sendMessage, clearMessages };
}
