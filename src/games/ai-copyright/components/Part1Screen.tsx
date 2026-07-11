import { motion } from "framer-motion";
import { ArrowRight, HelpCircle, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcContent } from "../types";
import type { AiCopyrightGame } from "../useAiCopyrightGame";

interface Part1ScreenProps {
  content: AcContent;
  game: AiCopyrightGame;
}

/** 1부 · 이거 써도 될까? — 상황 판별 화면 */
export default function Part1Screen({ content, game }: Part1ScreenProps) {
  const { labels, principles } = content;
  const { round1, r1Verdict } = game;
  const answered = r1Verdict !== null;

  const focusPrinciple = principles.find((p) => p.id === round1.focusPrincipleId);

  return (
    <div className="ac-shell relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col overflow-hidden border-x">
      {/* 상단 진행 바 */}
      <header className="sticky top-0 z-10 w-full border-b bg-card/95 px-3 py-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">
            <span className="ac-part-tag mr-1.5">{labels.part1Name}</span>
            {labels.part1RoundLabel} {game.r1Index + 1}
            <span className="text-muted-foreground"> / {game.totalRound1}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
              📌 원칙 {game.collectedPrincipleIds.length}/{principles.length}
            </span>
            <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
              {game.score}점
            </span>
          </div>
        </div>
        <div className="mt-1.5 flex gap-1">
          {Array.from({ length: game.totalRound1 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < game.r1Index
                  ? "bg-success"
                  : i === game.r1Index
                    ? "bg-primary"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-3 pb-32">
        {/* 상황 카드 */}
        <motion.div
          key={round1.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="ac-situation-card p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="ac-situation-emoji text-2xl">{round1.emoji}</span>
            <span className="ac-chip-soft text-[11px] font-bold">
              {labels.situationLabel} {game.r1Index + 1}
            </span>
          </div>
          <p className="text-sm font-bold leading-relaxed text-foreground">
            {round1.situation}
          </p>
        </motion.div>

        {/* 질문 배너 */}
        <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
          <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold text-primary">
            <HelpCircle className="h-3.5 w-3.5" />
            {labels.questionTitle}
          </div>
          {!answered && (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {labels.part1Hint}
            </p>
          )}
        </div>

        {/* 선택지 3개 */}
        <div className="mt-3 space-y-2">
          {round1.choices.map((choice) => {
            const isPicked = r1Verdict?.pickedKey === choice.key;
            const isCorrectChoice = choice.key === round1.correct;
            const showAsCorrect = answered && isCorrectChoice;
            const showAsWrongPick = answered && isPicked && !isCorrectChoice;
            return (
              <button
                key={choice.key}
                onClick={() => game.chooseRound1(choice.key)}
                disabled={answered}
                className={cn(
                  "ac-choice w-full rounded-xl p-3 text-left",
                  !answered && "ac-choice-active",
                  showAsCorrect && "ac-choice-correct",
                  showAsWrongPick && "ac-choice-wrong",
                  answered && !showAsCorrect && !showAsWrongPick && "opacity-60",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "ac-verdict-badge",
                      `ac-verdict-${choice.key}`,
                    )}
                  >
                    {choice.label}
                  </span>
                  {showAsCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                  {showAsWrongPick && <XCircle className="h-4 w-4 text-destructive" />}
                </div>
                <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
                  {choice.text}
                </p>
              </button>
            );
          })}
        </div>

        {/* 판정 + 해설 + 원칙 수집 */}
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-3"
          >
            <div
              className={cn(
                "rounded-xl p-3 text-sm font-bold",
                r1Verdict.correct
                  ? "ac-banner-correct text-foreground"
                  : "ac-banner-wrong text-foreground",
              )}
            >
              {r1Verdict.correct ? labels.correctBanner : labels.wrongBanner}
            </div>

            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-1 text-[11px] font-bold text-primary">
                {labels.answerLabel}
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {round1.explain}
              </p>
            </div>

            {/* 이번에 얻은(또는 놓친) 책임 원칙 */}
            {focusPrinciple && (
              <div
                className={cn(
                  "flex items-start gap-2.5 rounded-xl p-3",
                  r1Verdict.correct ? "ac-principle-card" : "ac-principle-card-missed",
                )}
              >
                <span className="text-2xl">
                  {r1Verdict.correct ? focusPrinciple.emoji : "🔒"}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
                    {r1Verdict.correct && <Sparkles className="h-3 w-3" />}
                    {r1Verdict.correct
                      ? labels.newPrincipleTitle
                      : labels.wrongBanner}
                  </div>
                  <div className="text-sm font-black text-foreground">
                    {focusPrinciple.name}
                  </div>
                  <p className="text-[12px] leading-snug text-muted-foreground">
                    {focusPrinciple.desc}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* 하단 고정 조작 영역 */}
      <div className="sticky bottom-0 z-10 border-t bg-card/95 p-3 backdrop-blur">
        <button
          onClick={game.nextRound1}
          disabled={!answered}
          className="ac-btn-cta flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-base font-bold text-white"
        >
          {game.isLastRound1 ? labels.toPart2Button : labels.nextButton}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
