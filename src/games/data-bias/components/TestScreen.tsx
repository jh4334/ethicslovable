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
        <span className="db-pill text-[11px]">{game.round}차 시험</span>
        <h2 className="text-lg font-black">{rounds.testTitle}</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{rounds.testGuide}</p>

      {/* 진행 점 */}
      <div className="mt-3 flex items-center gap-1.5">
        {game.judged.map((j, i) => (
          <div
            key={j.card.id}
            className={cn(
              "h-2 flex-1 rounded-full shadow-inner transition-colors",
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
          <div className="mlq-card mt-3 p-5 text-center">
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
                <BabyBot className="db-bot-lg" line={babyBot.thinkingLine} mood="thinking" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <BabyBot
                  className="db-bot-lg db-bounce-in"
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
                  "mlq-card flex items-center justify-between gap-2 px-3.5 py-3",
                  judgement.correct
                    ? "border-success/40 bg-success/10"
                    : "border-destructive/40 bg-destructive/10",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 text-base font-black",
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
                <div className="mlq-card mt-2 border-warning/50 bg-warning/10 p-3">
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
                        className="mlq-chip border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive"
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
                className="db-btn mt-4 w-full px-6 py-3 text-sm"
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
