import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DbContent } from "../types";
import type { DataBiasGame } from "../useDataBiasGame";
import BabyBot from "./BabyBot";

interface TestScreenProps {
  content: DbContent;
  game: DataBiasGame;
}

/** 시험 단계 — 아기봇이 시험 카드를 한 장씩 판정한다 */
export default function TestScreen({ content, game }: TestScreenProps) {
  const { rounds, babyBot } = content;
  const current = game.judged[game.testIndex];
  // 문제마다 잠깐 '생각 중…'을 보여 준 뒤 판정을 공개한다
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    const timer = setTimeout(() => setRevealed(true), 1200);
    return () => clearTimeout(timer);
  }, [game.testIndex]);

  if (!current) return null;
  const { card, judgement } = current;
  const isLast = game.testIndex === game.judged.length - 1;

  return (
    <div className="mx-auto w-full max-w-md animate-fade-in px-4 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
          {game.round}차 시험
        </span>
        <h2 className="text-base font-black">{rounds.testTitle}</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{rounds.testGuide}</p>

      {/* 진행 점 */}
      <div className="mt-3 flex items-center gap-1.5">
        {game.judged.map((j, i) => (
          <div
            key={j.card.id}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < game.testIndex
                ? j.judgement.correct
                  ? "bg-success"
                  : "bg-destructive"
                : i === game.testIndex
                  ? revealed
                    ? j.judgement.correct
                      ? "bg-success"
                      : "bg-destructive"
                    : "bg-primary/50"
                  : "bg-muted",
            )}
          />
        ))}
      </div>
      <div className="mt-1 text-right text-[10px] font-medium text-muted-foreground">
        문제 {game.testIndex + 1} / {game.judged.length}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          {/* 시험 카드 */}
          <div className="mt-3 rounded-2xl border bg-card p-5 text-center shadow-sm">
            <div className="text-[11px] font-bold text-muted-foreground">{rounds.testQuestion}</div>
            <motion.div
              className="mt-2 text-6xl"
              aria-hidden
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              {card.emoji}
            </motion.div>
            <div className="mt-2 text-sm font-bold">{card.label}</div>
          </div>

          {/* 아기봇 판정 */}
          <div className="mt-4 min-h-[4.5rem]">
            {!revealed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <BabyBot line={babyBot.thinkingLine} mood="thinking" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <BabyBot
                  line={judgement.botLine}
                  mood={judgement.correct ? "happy" : "confused"}
                />
              </motion.div>
            )}
          </div>

          {/* 판정 결과 */}
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.25 }}
              className="mt-3"
            >
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3 py-2.5",
                  judgement.correct
                    ? "border-success/40 bg-success/10"
                    : "border-destructive/40 bg-destructive/10",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-black",
                    judgement.correct ? "text-success" : "text-destructive",
                  )}
                >
                  {judgement.correct ? `⭕ ${rounds.correctBadge}` : `❌ ${rounds.wrongBadge}`}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  아기봇의 답 <strong className="text-foreground">{judgement.botAnswer}</strong>
                  {" · "}
                  {rounds.answerLabel} <strong className="text-foreground">{card.species}</strong>
                </span>
              </div>

              {/* 왜 틀렸을까? */}
              {!judgement.correct && (
                <div className="mt-2 rounded-xl border border-warning/50 bg-warning/10 p-3">
                  <div className="text-xs font-bold text-warning-foreground">
                    🔍 {rounds.whyWrongTitle}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/90">
                    {card.explanationWhenWrong}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {rounds.missingDataLabel}:
                    </span>
                    {judgement.missing.map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={game.nextTest}
                className="mt-4 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
              >
                {isLast ? rounds.seeResultButton : rounds.nextButton}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
