import { motion } from "framer-motion";
import { ArrowRight, Hammer, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcContent } from "../types";
import type { AiCopyrightGame } from "../useAiCopyrightGame";

interface Part2ScreenProps {
  content: AcContent;
  game: AiCopyrightGame;
}

/** 2부 · 바르게 만들기 — 올바른 절차 고르기 화면 */
export default function Part2Screen({ content, game }: Part2ScreenProps) {
  const { labels, makeRight } = content;
  const scenario = makeRight[Math.min(game.mrIndex, makeRight.length - 1)];
  const { mrPick } = game;
  const solved = mrPick?.isGood === true;

  return (
    <div className="ac-shell relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col overflow-hidden border-x">
      {/* 상단 진행 바 */}
      <header className="sticky top-0 z-10 w-full border-b bg-card/95 px-3 py-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">
            <span className="ac-part-tag mr-1.5">{labels.part2Name}</span>
            {labels.part2RoundLabel} {game.mrIndex + 1}
            <span className="text-muted-foreground"> / {game.totalMakeRight}</span>
          </span>
          <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
            {game.score}점
          </span>
        </div>
        <div className="mt-1.5 flex gap-1">
          {Array.from({ length: game.totalMakeRight }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < game.mrIndex
                  ? "bg-success"
                  : i === game.mrIndex
                    ? "bg-primary"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-3 pb-32">
        {game.mrIndex === 0 && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed text-foreground">
            <Hammer className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{labels.part2Intro}</span>
          </div>
        )}

        {/* 상황 카드 */}
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="ac-situation-card p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="ac-situation-emoji text-2xl">{scenario.emoji}</span>
            <span className="ac-chip-soft text-[11px] font-bold">
              {labels.part2RoundLabel} {game.mrIndex + 1}
            </span>
          </div>
          <p className="text-sm font-bold leading-relaxed text-foreground">
            {scenario.situation}
          </p>
        </motion.div>

        <p className="mt-3 px-1 text-[11px] font-bold text-muted-foreground">
          {labels.part2Hint}
        </p>

        {/* 선택지 3개 */}
        <div className="mt-2 space-y-2">
          {scenario.choices.map((choice, i) => {
            const isPicked = mrPick?.choiceIndex === i;
            // 정답을 이미 맞혔으면 정답 선택지를 항상 초록으로 표시
            const showAsGood = (solved && choice.isGood) || (isPicked && choice.isGood);
            const showAsBad = isPicked && !choice.isGood;
            return (
              <button
                key={i}
                onClick={() => game.chooseMakeRight(i)}
                disabled={solved}
                className={cn(
                  "ac-choice w-full rounded-xl p-3 text-left",
                  !solved && "ac-choice-active",
                  showAsGood && "ac-choice-correct",
                  showAsBad && "ac-choice-wrong",
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="ac-choice-num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[13px] font-medium leading-snug text-foreground">
                    {choice.text}
                  </span>
                  {showAsGood && (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  )}
                  {showAsBad && (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 선택 피드백 */}
        {mrPick && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-2"
          >
            <div
              className={cn(
                "rounded-xl p-3 text-sm font-bold",
                mrPick.isGood
                  ? "ac-banner-correct text-foreground"
                  : "ac-banner-wrong text-foreground",
              )}
            >
              {mrPick.isGood ? labels.part2GoodBanner : labels.part2BadBanner}
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-sm leading-relaxed text-foreground">
                {scenario.choices[mrPick.choiceIndex].feedback}
              </p>
            </div>
          </motion.div>
        )}
      </main>

      {/* 하단 고정 조작 영역 */}
      <div className="sticky bottom-0 z-10 border-t bg-card/95 p-3 backdrop-blur">
        <button
          onClick={game.nextMakeRight}
          disabled={!solved}
          className="ac-btn-cta flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-base font-bold text-white"
        >
          {game.isLastMakeRight ? labels.resultButton : labels.nextButton}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
