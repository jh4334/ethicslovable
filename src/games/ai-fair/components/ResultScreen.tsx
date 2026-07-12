import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import NextQuest from "@/components/NextQuest";
import { markCompleted } from "@/lib/progress";
import type { AfContent } from "../types";
import type { AiFairGame } from "../useAiFairGame";

interface ResultScreenProps {
  content: AfContent;
  game: AiFairGame;
}

/** 결과 — 포용·설계자 등급·모두를 위한 AI 3원칙, 그리고 학습 완료 기록 */
export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { ui, rules, users } = content;
  const { grade, rounds, enabledIds } = game;
  const total = users.length;
  const enabledCount = enabledIds.length;

  // 학습 완료 기록 — StrictMode 이중 실행에도 한 번만 저장한다
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    markCompleted(
      "ai-fair",
      `${grade.name} · ${enabledCount}/${total}명 모두 쓰게 함 (시험 ${rounds}번)`,
    );
  }, [grade.name, enabledCount, total, rounds]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-md flex-col justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-center text-lg font-black">{ui.resultTitle}</h2>

        {/* 등급 */}
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

          <div className="mt-3 flex justify-center gap-3 border-t pt-3">
            <div>
              <div className="text-[11px] font-bold text-muted-foreground">{ui.inclusionLabel}</div>
              <div className="af-grad-text text-2xl font-black tabular-nums">
                {enabledCount}/{total}
              </div>
            </div>
            <div className="border-l pl-3">
              <div className="text-[11px] font-bold text-muted-foreground">{ui.roundsLabel}</div>
              <div className="af-grad-text text-2xl font-black tabular-nums">{rounds}</div>
            </div>
          </div>

          {/* 최종으로 남긴 개선 — 학습지 '남긴 3개' 기록용 */}
          {game.keptCards.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <div className="text-[11px] font-bold text-muted-foreground">{ui.keptLabel}</div>
              <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
                {game.keptCards.map((c) => (
                  <span key={c.id} className="af-tag-on rounded-full px-2 py-0.5 text-[11px] font-bold">
                    {c.emoji} {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 모두를 위한 AI 3원칙 */}
        <div className="mt-4">
          <div className="text-sm font-extrabold">🌈 {ui.rulesTitle}</div>
          <div className="mt-2 grid gap-2">
            {rules.map((rule, i) => (
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

        <div className="mlq-card mt-4 p-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">📄 {ui.worksheetNote}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">✅ {ui.finishNote}</p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <NextQuest gameId="ai-fair" />
          <Link to="/" className="w-full rounded-xl border bg-card px-6 py-3 text-center text-sm font-bold text-foreground transition-colors hover:bg-muted">
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
