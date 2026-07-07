/**
 * 2단계 · 확률 공개 — "이제 상자 뒤를 볼까요?"
 * 숨겨져 있던 공개 확률표와 내 실제 뽑기 결과를 나란히 놓고,
 * 기대 횟수(1 ÷ 확률) 계산 카드와 보너스 확률 퀴즈로 이어진다.
 */
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { GbContent } from "../types";
import type { GachaGame } from "../useGachaGame";
import { buildVars, fillTemplate, legendaryOf } from "../format";

interface RevealScreenProps {
  content: GbContent;
  game: GachaGame;
}

export default function RevealScreen({ content, game }: RevealScreenProps) {
  const reveal = content.probabilityReveal;
  const { quiz } = reveal;
  const totalPulls = game.pulls.length;

  const vars = buildVars(content, {
    pulls: totalPulls,
    spentCoins: game.spentCoins,
    nearMissCount: game.nearMissCount,
  });

  const answered = game.quizChoice !== null;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <span className="gb-pill text-[11px]">2단계 · 확률 공개</span>
        <h1 className="mt-3 text-xl font-black">🔍 {reveal.title}</h1>
        <p className="mt-1.5 text-xs font-bold leading-relaxed text-muted-foreground">{reveal.intro}</p>
      </motion.div>

      {/* 공개 확률표 vs 내 결과 — 나란히 비교 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mlq-card mt-5 p-4"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* 왼쪽: 상점이 숨겨 뒀던 진짜 확률 */}
          <div>
            <h2 className="text-xs font-extrabold">{reveal.tableTitle}</h2>
            <div className="mt-2.5 space-y-2">
              {content.rarities.map((rarity) => {
                const percent = Math.round(rarity.probability * 1000) / 10;
                return (
                  <div key={rarity.key}>
                    <div className="flex items-baseline justify-between text-[11px] font-bold">
                      <span style={{ color: rarity.color }}>{rarity.label}</span>
                      <span className="tabular-nums">{percent}%</span>
                    </div>
                    <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="gb-bar h-full rounded-full"
                        style={{ width: `${Math.max(percent, 2)}%`, backgroundColor: rarity.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 오른쪽: 내 10회 결과 히스토그램 */}
          <div>
            <h2 className="text-xs font-extrabold">
              {reveal.myResultTitle} <span className="text-muted-foreground">({totalPulls}회)</span>
            </h2>
            <div className="mt-2.5 space-y-2">
              {content.rarities.map((rarity) => {
                const count = game.rarityCounts[rarity.key] ?? 0;
                const percent = totalPulls > 0 ? (count / totalPulls) * 100 : 0;
                return (
                  <div key={rarity.key}>
                    <div className="flex items-baseline justify-between text-[11px] font-bold">
                      <span style={{ color: rarity.color }}>{rarity.label}</span>
                      <span className="tabular-nums">{count}회</span>
                    </div>
                    <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="gb-bar h-full rounded-full"
                        style={{ width: `${count > 0 ? Math.max(percent, 4) : 0}%`, backgroundColor: rarity.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="mt-3 border-t pt-2.5 text-[11px] font-semibold leading-relaxed text-muted-foreground">
          {reveal.myResultNote}
        </p>
      </motion.div>

      {/* 핵심 계산 카드 — 기대 횟수 = 1 ÷ 확률 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="gb-callout mt-4 rounded-2xl p-4"
      >
        <h2 className="text-sm font-black">{reveal.calcCard.title}</h2>
        <div className="mt-2 space-y-2">
          {reveal.calcCard.lines.map((line, i) => (
            <p key={i} className="text-sm font-bold leading-relaxed">
              {fillTemplate(line, vars)}
            </p>
          ))}
        </div>
        <p className="mt-2.5 rounded-xl bg-white/60 px-3 py-2 text-center text-xs font-black">
          <span className="gb-grad-text">
            {fillTemplate(`평균 횟수 = 1 ÷ 확률 → 1 ÷ ${legendaryOf(content).probability} ≈ {기대횟수}번`, vars)}
          </span>
        </p>
        <p className="mt-2 text-[11px] font-semibold text-muted-foreground">{reveal.calcCard.note}</p>
      </motion.div>

      {/* 보너스 확률 퀴즈 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mlq-card mt-4 p-4"
      >
        <h2 className="text-sm font-black">{reveal.quizTitle}</h2>
        <p className="mt-1.5 text-sm font-bold leading-relaxed">{quiz.question}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {quiz.choices.map((choice, i) => {
            const isPicked = game.quizChoice === i;
            const isAnswer = i === quiz.answerIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => game.answerQuiz(i)}
                disabled={answered}
                className={cn(
                  "rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold transition-all",
                  !answered && "border-border bg-card hover:-translate-y-0.5 hover:border-warning",
                  answered && isAnswer && "border-success bg-success/10 text-success",
                  answered && isPicked && !isAnswer && "border-destructive bg-destructive/10 text-destructive",
                  answered && !isPicked && !isAnswer && "border-border bg-muted text-muted-foreground opacity-60",
                )}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {answered && (
          <div
            className={cn(
              "gb-bounce-in mt-3 rounded-xl p-3 text-xs font-bold leading-relaxed",
              game.quizCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {game.quizCorrect ? `⭕ ${quiz.correctFeedback}` : `❌ ${quiz.wrongFeedback}`}
          </div>
        )}
      </motion.div>

      <button
        type="button"
        onClick={game.goTricks}
        disabled={!answered}
        className="gb-btn mt-5 w-full px-6 py-3.5 text-base"
      >
        🔧 {reveal.nextButton}
      </button>
      {!answered && (
        <p className="mt-2 text-center text-[11px] font-semibold text-muted-foreground">
          퀴즈에 답하면 다음 단계로 갈 수 있어요.
        </p>
      )}
    </div>
  );
}
