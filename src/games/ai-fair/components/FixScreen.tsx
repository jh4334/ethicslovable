import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AfContent } from "../types";
import type { AiFairGame } from "../useAiFairGame";

interface FixScreenProps {
  content: AfContent;
  game: AiFairGame;
}

/** 2부 · 공정하게 고치기 — 누리봇을 모두가 쓸 수 있게 고친다 */
export default function FixScreen({ content, game }: FixScreenProps) {
  const { ui, fixes } = content;
  const fix = game.currentFix;
  const isLast = game.fixIndex === fixes.length - 1;
  // 마지막으로 고른 선택지의 피드백을 보여 준다
  const lastPicked = game.fixPicked[game.fixPicked.length - 1];
  const lastChoice = lastPicked !== undefined ? fix.choices[lastPicked] : null;

  return (
    <div className="mx-auto w-full max-w-md animate-fade-in px-4 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="af-pill text-[11px]">2부</span>
        <h2 className="text-lg font-black">{ui.fixTitle}</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{ui.fixGuide}</p>

      {/* 진행 점 + 배지 수 */}
      <div className="mt-3 flex items-center gap-1.5">
        {fixes.map((f, i) => (
          <div
            key={f.id}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              i < game.fixIndex || (i === game.fixIndex && game.fixSolved)
                ? "af-bar-fill"
                : i === game.fixIndex
                  ? "bg-primary/50"
                  : "bg-muted",
            )}
          />
        ))}
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
        <span>
          {ui.badgesLabel}: {"🏅".repeat(game.badgeCount) || "—"}
        </span>
        <span>
          {game.fixIndex + 1} / {fixes.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={fix.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          {/* 문제 카드 */}
          <div className="mlq-card mt-3 p-4">
            <div className="flex items-center gap-2">
              <span className="mlq-emoji-tile h-10 w-10 shrink-0 text-xl" aria-hidden>
                {fix.emoji}
              </span>
              <div className="text-[11px] font-bold text-muted-foreground">{ui.problemLabel}</div>
            </div>
            <p className="mt-2 text-sm font-semibold leading-relaxed">{fix.problem}</p>
          </div>

          {/* 선택지 */}
          <div className="mt-3 grid gap-2">
            {fix.choices.map((choice, i) => {
              const picked = game.fixPicked.includes(i);
              const showGood = game.fixSolved && choice.isGood;
              const showBad = picked && !choice.isGood;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={game.fixSolved || (picked && !choice.isGood)}
                  onClick={() => game.pickFix(i)}
                  className={cn(
                    "af-pick rounded-2xl border bg-card px-4 py-3.5 text-left text-sm font-bold transition-transform",
                    showGood && "af-pick-on",
                    showBad && "border-destructive/40 bg-destructive/10 opacity-70",
                  )}
                >
                  <span className="mr-1.5" aria-hidden>
                    {showGood ? "✅" : showBad ? "❌" : "⬜"}
                  </span>
                  {choice.text}
                </button>
              );
            })}
          </div>

          {/* 피드백 */}
          {lastChoice && (
            <motion.div
              key={`${fix.id}-${lastPicked}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3"
            >
              {lastChoice.isGood ? (
                <div className="af-callout af-bounce-in rounded-2xl p-3.5 text-center">
                  <div className="text-sm font-black text-success">🏅 {ui.badgeEarned}</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                    {lastChoice.feedback}
                  </p>
                </div>
              ) : (
                <div className="mlq-card border-warning/50 bg-warning/10 p-3.5">
                  <p className="text-sm leading-relaxed text-foreground/90">{lastChoice.feedback}</p>
                  <p className="mt-1.5 text-[11px] font-bold text-warning-foreground">
                    {ui.tryAgainNote}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {game.fixSolved && (
            <button
              type="button"
              onClick={game.nextFix}
              className="af-btn mt-4 w-full px-6 py-3 text-sm"
            >
              {isLast ? ui.toResultButton : ui.nextFixButton}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
