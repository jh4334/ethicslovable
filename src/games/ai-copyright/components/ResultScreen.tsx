import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Home, BookMarked, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { markCompleted } from "@/lib/progress";
import type { AcContent } from "../types";
import type { AiCopyrightGame } from "../useAiCopyrightGame";

interface ResultScreenProps {
  content: AcContent;
  game: AiCopyrightGame;
}

/** 최종 보고서 — 책임 점수·심판 등급·원칙 도감·AI 창작 3약속 */
export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { grades, promises, principles, labels } = content;
  const { score, correctCount, totalRound1, collectedPrincipleIds } = game;

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
      "ai-copyright",
      `창작 심판 등급 ${grade.title} · 책임 원칙 ${collectedPrincipleIds.length}개 배움`,
    );
  }, [grade.title, collectedPrincipleIds.length]);

  return (
    <div className="ac-shell flex min-h-[calc(100vh-3rem)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mlq-card my-4 w-full max-w-md p-6"
      >
        <div className="mb-2 text-center text-xs font-bold text-muted-foreground">
          {labels.resultTitle}
        </div>
        <div className="ac-emblem mx-auto mb-3">
          <span>{grade.emoji}</span>
        </div>
        <h2 className="ac-gradient-text text-center text-2xl font-black">
          {grade.title}
        </h2>
        <p className="mt-1 text-center text-sm leading-relaxed text-muted-foreground">
          {grade.desc}
        </p>

        <div className="my-4 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="ac-gradient-text text-3xl font-black">{score}점</div>
            <div className="text-[11px] text-muted-foreground">{labels.scoreLabel}</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl font-black">
              {correctCount}
              <span className="text-lg text-muted-foreground">/{totalRound1}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              {labels.correctCountLabel}
            </div>
          </div>
        </div>

        {/* 책임 원칙 도감 */}
        <div className="mb-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-black">
            <BookMarked className="h-4 w-4 text-primary" />
            {labels.principleBookTitle}
            <span className="text-xs font-bold text-muted-foreground">
              {collectedPrincipleIds.length}/{principles.length}
            </span>
          </div>
          <p className="mb-2 text-[11px] text-muted-foreground">
            {labels.principleBookHint}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {principles.map((p) => {
              const collected = collectedPrincipleIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-start gap-2 p-2.5",
                    collected ? "ac-book-slot" : "ac-book-slot ac-book-slot-locked",
                  )}
                  title={collected ? p.desc : labels.lockedPrincipleLabel}
                >
                  <span className="ac-book-emoji text-lg">
                    {collected ? p.emoji : "🔒"}
                  </span>
                  <span className="text-[11px] font-bold leading-tight">
                    {collected ? p.name : labels.lockedPrincipleLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI 창작 3약속 */}
        <div className="mb-5">
          <div className="mb-1.5 flex items-center gap-1.5 text-sm font-black">
            <HandHeart className="h-4 w-4 text-primary" />
            {labels.promisesTitle}
          </div>
          <p className="mb-2 text-[11px] text-muted-foreground">{labels.promisesHint}</p>
          <div className="space-y-2">
            {promises.map((promise, i) => (
              <div
                key={i}
                className="ac-promise-card flex items-start gap-2.5 p-3 text-sm leading-relaxed"
              >
                <span className="text-xl">{promise.emoji}</span>
                <div className="min-w-0">
                  <span className="font-black text-foreground">{promise.title}</span>
                  <span className="ml-1.5 text-[13px] text-muted-foreground">
                    {promise.desc}
                  </span>
                </div>
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
            className="ac-btn-cta flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-white"
          >
            <Home className="h-4 w-4" />
            {labels.homeButton}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
