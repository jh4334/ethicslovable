import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Home, BookMarked, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { markCompleted } from "@/lib/progress";
import type { SdContent } from "../types";
import type { SearchDetectiveGame } from "../useSearchDetectiveGame";

interface ResultScreenProps {
  content: SdContent;
  game: SearchDetectiveGame;
}

/** 최종 보고서 — 점수·탐정 등급·단서 도감·검색 3단계 습관 */
export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { grades, habits, clues, labels } = content;
  const { score, correctCount, totalRounds, collectedClueIds } = game;

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
      "search-detective",
      `탐정 등급 ${grade.title} · 단서 ${collectedClueIds.length}종`,
    );
  }, [grade.title, collectedClueIds.length]);

  return (
    <div className="sd-shell flex min-h-[calc(100vh-3rem)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mlq-card my-4 w-full max-w-md p-6"
      >
        <div className="mb-2 text-center text-xs font-bold text-muted-foreground">
          {labels.resultTitle}
        </div>
        <div className="sd-emblem mx-auto mb-3">
          <span>{grade.emoji}</span>
        </div>
        <h2 className="sd-gradient-text text-center text-2xl font-black">{grade.title}</h2>
        <p className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
          {grade.desc}
        </p>

        <div className="my-4 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="sd-gradient-text text-3xl font-black">{score}점</div>
            <div className="text-[11px] text-muted-foreground">{labels.scoreLabel}</div>
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

        {/* 단서 도감 */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-black">
            <BookMarked className="h-4 w-4 text-primary" />
            {labels.clueBookTitle}
            <span className="text-xs font-bold text-muted-foreground">
              {collectedClueIds.length}/{clues.length}
            </span>
          </div>
          <p className="mb-2 text-[11px] text-muted-foreground">{labels.clueBookHint}</p>
          <div className="grid grid-cols-3 gap-2">
            {clues.map((clue) => {
              const collected = collectedClueIds.includes(clue.id);
              return (
                <div
                  key={clue.id}
                  className={cn(
                    "flex flex-col items-center gap-0.5 p-2 text-center",
                    collected ? "sd-book-slot" : "sd-book-slot sd-book-slot-locked",
                  )}
                  title={collected ? clue.desc : labels.lockedClueLabel}
                >
                  <span className="sd-book-emoji text-xl">{collected ? clue.emoji : "🔒"}</span>
                  <span className="text-[10px] font-bold leading-tight">
                    {collected ? clue.name : labels.lockedClueLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 검색 3단계 습관 */}
        <div className="mb-5">
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-black">
            <ListChecks className="h-4 w-4 text-primary" />
            {labels.habitsTitle}
          </div>
          <div className="space-y-2">
            {habits.map((line, i) => (
              <div key={i} className="sd-habit-card flex items-start gap-2 p-3 text-sm leading-relaxed">
                <span className="sd-habit-num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                  {i + 1}
                </span>
                <span className="text-foreground">{line}</span>
              </div>
            ))}
          </div>
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
            className="sd-btn-cta flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-white"
          >
            <Home className="h-4 w-4" />
            {labels.homeButton}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
