"use client";

import { useState } from "react";
import { ZhizhiSpeaker } from "@/components/ZhizhiOwl";

interface ThinkingQuestionProps {
  questions: Array<{
    question: string;
    hints: string[];
    aiGuidance: string;
  }>;
  onComplete: (score: number, stars: number) => void;
}

export default function ThinkingQuestion({ questions, onComplete }: ThinkingQuestionProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<"answering" | "done">("answering");

  const q = questions[currentQ];

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setAnswers((prev) => [...prev, inputValue.trim()]);
    setInputValue("");
    setSubmitted(true);
  };

  const handleNext = () => {
    setShowHint(false);
    setSubmitted(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      setPhase("done");
      onComplete(15, 2); // Thinking questions are subjective, always give positive feedback
    }
  };

  if (phase === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <span className="text-6xl mb-4">💡</span>
        <h2 className="text-3xl font-bold text-sunshine mb-2">思考真棒！</h2>
        <p className="text-xl text-cream">每个好问题都是探索的开始！</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">💡</span>
        <span className="text-lg font-bold text-cream">思考时间</span>
        <span className="bg-navy-mid border border-navy-border rounded-full px-3 py-1 text-sm text-muted">
          {currentQ + 1}/{questions.length}
        </span>
      </div>

      {/* Zhizhi guidance */}
      <div className="w-full max-w-lg">
        <ZhizhiSpeaker
          message={submitted ? q.aiGuidance : "这道题没有标准答案哦，把你的想法写下来吧！"}
          size="sm"
          autoSpeak={false}
        />
      </div>

      {/* Question card */}
      <div className="w-full max-w-lg bg-gradient-to-br from-sunshine/10 to-lavender/10 border border-sunshine/30 rounded-2xl p-6">
        <p className="text-2xl font-bold text-cream leading-relaxed">{q.question}</p>
      </div>

      {/* Answer input */}
      {!submitted ? (
        <div className="w-full max-w-lg flex gap-3">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="写下你的想法..."
            className="flex-1 bg-navy-mid border border-navy-border rounded-xl p-4 text-xl text-cream placeholder:text-muted/50 resize-none h-24 focus:outline-none focus:border-lavender"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="px-6 py-3 rounded-xl bg-lavender border border-lavender text-navy font-bold hover:bg-lavender/80 disabled:opacity-30 transition-all self-end"
          >
            提交
          </button>
        </div>
      ) : (
        <div className="w-full max-w-lg">
          {/* AI feedback on answer */}
          <div className="bg-navy-mid border border-teal/30 rounded-xl p-4 mb-4">
            <p className="text-sm text-teal font-bold mb-1">你的回答：</p>
            <p className="text-lg text-cream">{answers[answers.length - 1]}</p>
          </div>

          {/* AI personalized response */}
          {answers.length > 0 && (
            <div className="mb-4">
              <ZhizhiSpeaker
                message={`"${answers[answers.length - 1]}"——这是一个很棒的思考！${q.aiGuidance}`}
                size="sm"
                autoSpeak={true}
              />
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full px-6 py-3 rounded-xl bg-teal border border-teal text-navy font-bold hover:bg-teal/80 transition-all"
          >
            {currentQ < questions.length - 1 ? "下一题 →" : "完成思考 ✨"}
          </button>
        </div>
      )}

      {/* Hint button */}
      {!submitted && (
        <div className="w-full max-w-lg">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-sm text-muted hover:text-sunshine transition-colors flex items-center gap-1"
          >
            <span>{showHint ? "隐藏提示" : "💬 需要小提示？"}</span>
          </button>
          {showHint && (
            <div className="mt-2 bg-navy-mid border border-sunshine/20 rounded-lg p-3">
              {q.hints.map((hint, i) => (
                <p key={i} className="text-sm text-cream/80">
                  💡 {hint}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
