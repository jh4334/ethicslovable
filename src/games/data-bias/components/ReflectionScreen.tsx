import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { markCompleted } from "@/lib/progress";
import NextQuest from "@/components/NextQuest";
import { cn } from "@/lib/utils";
import type { DbContent } from "../types";
import type { DataBiasGame } from "../useDataBiasGame";

interface ReflectionScreenProps {
  content: DbContent;
  game: DataBiasGame;
}

/** 성찰 화면 — 배움 3단계를 차례로 짚고 학습 완료를 기록한다 */
export default function ReflectionScreen({ content, game }: ReflectionScreenProps) {
  const { reflection } = content;
  const [step, setStep] = useState(0);
  const totalSteps = reflection.beats.length;
  const isLastBeat = step >= totalSteps - 1;

  const accuracy1 = game.round1Result?.accuracy ?? 0;
  const accuracy2 = game.round2Result?.accuracy ?? 0;

  // 학습 완료 기록 — StrictMode 이중 실행에도 한 번만 저장한다
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    markCompleted("data-bias", `아기봇 정확도 1차 ${accuracy1}% → 2차 ${accuracy2}%`);
  }, [accuracy1, accuracy2]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-md flex-col justify-center px-4 py-8">
      <h2 className="text-center text-lg font-black">{reflection.title}</h2>

      {/* 단계 점 */}
      <div className="mt-3 flex justify-center gap-1.5">
        {reflection.beats.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-8 rounded-full transition-colors",
              i <= step ? "db-bar-fill" : "bg-muted",
            )}
          />
        ))}
      </div>

      {/* 배움 카드 — 지금까지 연 단계를 쌓아서 보여 준다 */}
      <div className="mt-4 space-y-3">
        {reflection.beats.slice(0, step + 1).map((beat, i) => {
          const isRemember = i === totalSteps - 1;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("p-4", isRemember ? "db-callout rounded-2xl" : "mlq-card")}
            >
              <div className="flex items-center gap-2">
                <span
                  className="mlq-emoji-tile h-9 w-9 shrink-0 text-xl"
                  style={{ "--tile-hue": 152 } as CSSProperties}
                  aria-hidden
                >
                  {beat.emoji}
                </span>
                <h3 className="text-sm font-extrabold">{beat.title}</h3>
              </div>
              <p
                className={cn(
                  "mt-2 text-xs leading-relaxed",
                  isRemember ? "db-grad-text text-sm font-extrabold" : "text-foreground/90",
                )}
              >
                {beat.text}
              </p>
            </motion.div>
          );
        })}
      </div>

      {!isLastBeat ? (
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(s + 1, totalSteps - 1))}
          className="db-btn mt-5 w-full px-6 py-3 text-sm"
        >
          {reflection.nextButton}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-4"
        >
          {/* 훈련 기록 요약 */}
          <div className="mlq-card p-4 text-center">
            <div className="text-xs font-bold text-muted-foreground">{reflection.summaryTitle}</div>
            <div className="mt-1.5 flex items-center justify-center gap-3 text-2xl font-black tabular-nums">
              <span className="text-muted-foreground">{accuracy1}%</span>
              <span className="db-grad-text text-base" aria-hidden>
                →
              </span>
              <span className={accuracy2 >= accuracy1 ? "db-grad-text" : "text-destructive"}>
                {accuracy2}%
              </span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">✅ {reflection.finishNote}</p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <NextQuest gameId="data-bias" />
            <Link
              to="/"
              className="w-full rounded-xl border bg-card px-6 py-3 text-center text-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              {reflection.mapButton}
            </Link>
            <button
              type="button"
              onClick={game.restart}
              className="w-full rounded-xl border bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted"
            >
              {reflection.restartButton}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
