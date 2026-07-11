import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { markCompleted } from "@/lib/progress";
import { cn } from "@/lib/utils";
import type { AfContent } from "../types";
import type { AiFairGame } from "../useAiFairGame";

interface ResultScreenProps {
  content: AfContent;
  game: AiFairGame;
}

/** 결과 — 공정 점수·검사관 등급·도감·3원칙, 그리고 학습 완료 기록 */
export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { ui, causes, fairnessRules } = content;
  const { fairnessScore, grade, badgeCount } = game;

  // 학습 완료 기록 — StrictMode 이중 실행에도 한 번만 저장한다
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    markCompleted("ai-fair", `공정 검사관 등급 ${grade.name} · 불공평 ${badgeCount}개 고침`);
  }, [grade.name, badgeCount]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-md flex-col justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-center text-lg font-black">{ui.resultTitle}</h2>

        {/* 등급 + 점수 */}
        <div className="mlq-card af-bounce-in mt-4 p-5 text-center">
          <div
            className="mlq-emoji-tile mx-auto flex h-20 w-20 items-center justify-center text-4xl"
            style={{ "--tile-hue": 95 } as CSSProperties}
            aria-hidden
          >
            {grade.emoji}
          </div>
          <div className="mt-2 text-[11px] font-bold text-muted-foreground">{ui.gradeLabel}</div>
          <div className="af-grad-text text-xl font-black">{grade.name}</div>
          <p className="mt-1 text-xs text-muted-foreground">{grade.desc}</p>

          <div className="mt-3 border-t pt-3">
            <div className="text-[11px] font-bold text-muted-foreground">{ui.scoreLabel}</div>
            <div className="af-grad-text text-3xl font-black tabular-nums">{fairnessScore}점</div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="af-bar-fill h-full rounded-full" style={{ width: `${fairnessScore}%` }} />
            </div>
            <div className="mt-2 flex justify-center gap-3 text-[11px] font-semibold text-muted-foreground">
              <span>판단 {game.judgeScore}</span>
              <span>도감 {game.causeScore}</span>
              <span>고치기 {game.fixScore}</span>
            </div>
          </div>
        </div>

        {/* 차별 유형 도감 */}
        <div className="mt-4">
          <div className="text-sm font-extrabold">🗂️ {ui.codexTitle}</div>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {causes.map((c) => {
              const got = game.collectedCauseIds.includes(c.id);
              return (
                <div
                  key={c.id}
                  className={cn(
                    "flex items-start gap-2.5 rounded-2xl border bg-card px-3.5 py-2.5",
                    got ? "af-codex-on" : "af-codex-off",
                  )}
                >
                  <span className="mlq-emoji-tile h-9 w-9 shrink-0 text-lg" aria-hidden>
                    {got ? c.emoji : "❔"}
                  </span>
                  <span>
                    <span className="text-sm font-extrabold">{got ? c.name : "???"}</span>
                    {got && (
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
                        {c.desc}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          {game.collectedCauseIds.length === 0 && (
            <p className="mt-2 text-[11px] text-muted-foreground">{ui.codexEmpty}</p>
          )}
        </div>

        {/* 모두를 위한 AI 3원칙 */}
        <div className="mt-4">
          <div className="text-sm font-extrabold">🌈 {ui.rulesTitle}</div>
          <div className="mt-2 grid gap-2">
            {fairnessRules.map((rule, i) => (
              <div key={i} className="af-callout rounded-2xl p-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>
                    {rule.emoji}
                  </span>
                  <h3 className="af-grad-text text-sm font-black">{rule.title}</h3>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">{rule.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mlq-card mt-4 p-3 text-center">
          <p className="text-[11px] text-muted-foreground">✅ {ui.finishNote}</p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Link to="/" className="af-btn w-full px-6 py-3 text-center text-sm">
            {ui.mapButton}
          </Link>
          <button
            type="button"
            onClick={game.restart}
            className="w-full rounded-xl border bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            {ui.restartButton}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
