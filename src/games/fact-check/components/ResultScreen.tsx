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
        className="mlq-card w-full max-w-md p-6"
      >
        <div className="mb-2 text-center text-xs font-bold text-muted-foreground">
          {labels.resultTitle}
        </div>
        <div className="fc-emblem mx-auto mb-3">
          <span>{grade.emoji}</span>
        </div>
        <h2 className="fc-gradient-text text-center text-2xl font-black">{grade.title}</h2>
        <p className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
          {grade.desc}
        </p>

        <div className="my-4 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="fc-gradient-text text-3xl font-black">{score}점</div>
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
        <div className="mb-5 space-y-2">
          {resultSummary.map((line, i) => (
            <div key={i} className="fc-callout flex items-start gap-2 p-3 text-sm leading-relaxed">
              <span className="fc-num-badge mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                {i + 1}
              </span>
              <span className="text-foreground">{line}</span>
            </div>
          ))}
        </div>

        {/* 학습지 연계 안내 */}
        <p className="mb-4 text-[11px] leading-relaxed text-muted-foreground">
          📄 {labels.worksheetNote}
        </p>

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
            className="fc-btn-cta flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-white"
          >
            <Home className="h-4 w-4" />
            {labels.homeButton}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
