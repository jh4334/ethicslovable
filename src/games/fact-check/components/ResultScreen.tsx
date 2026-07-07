import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { markCompleted } from "@/lib/progress";
import type { FcContent } from "../types";
import type { FactCheckGame } from "../useFactCheckGame";

interface ResultScreenProps {
  content: FcContent;
  game: FactCheckGame;
}

export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { grades, resultSummary, labels } = content;
  const { score, correctCount, totalRounds } = game;

  // 점수에 맞는 가장 높은 등급을 고른다
  const grade = useMemo(() => {
    const sorted = [...grades].sort((a, b) => a.min - b.min);
    let chosen = sorted[0];
    for (const g of sorted) if (score >= g.min) chosen = g;
    return chosen;
  }, [grades, score]);

  // 결과 화면에 도착하면 학습 완료로 한 번만 기록 (StrictMode 안전)
  const reportedRef = useRef(false);
  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    markCompleted(
      "fact-check",
      `검증 요원 등급 ${grade.title} · ${totalRounds}라운드 중 ${correctCount}개 정확`,
    );
  }, [grade.title, correctCount, totalRounds]);

  return (
    <div className="fc-shell flex min-h-[calc(100vh-2.75rem)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg"
      >
        <div className="mb-1 text-center text-xs font-bold text-muted-foreground">
          {labels.resultTitle}
        </div>
        <div className="mb-2 text-center text-5xl">{grade.emoji}</div>
        <h2 className="text-center text-xl font-black">{grade.title}</h2>
        <p className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
          {grade.desc}
        </p>

        <div className="my-4 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-black text-primary">{score}점</div>
            <div className="text-[11px] text-muted-foreground">최종 점수</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl font-black">
              {correctCount}
              <span className="text-lg text-muted-foreground">/{totalRounds}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">{labels.correctCountLabel}</div>
          </div>
        </div>

        {/* 핵심 정리 3줄 */}
        <div className="mb-5 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          {resultSummary.map((line, i) => (
            <div key={i} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="text-foreground">{line}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={game.restart}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary py-3 text-sm font-bold text-secondary-foreground transition hover:brightness-95"
          >
            <RotateCcw className="h-4 w-4" />
            {labels.retryButton}
          </button>
          <Link
            to="/"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:brightness-105"
          >
            <Home className="h-4 w-4" />
            {labels.homeButton}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
