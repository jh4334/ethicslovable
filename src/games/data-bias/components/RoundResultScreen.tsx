import { cn } from "@/lib/utils";
import type { DbContent, RoundResult } from "../types";
import type { DataBiasGame } from "../useDataBiasGame";
import BabyBot from "./BabyBot";

interface RoundResultScreenProps {
  content: DbContent;
  game: DataBiasGame;
}

function toneLine(content: DbContent, accuracy: number): string {
  if (accuracy === 100) return content.results.perfectLine;
  if (accuracy >= 67) return content.results.goodLine;
  return content.results.badLine;
}

function compareLine(content: DbContent, r1: RoundResult, r2: RoundResult): string {
  const { results } = content;
  if (r1.accuracy === 100 && r2.accuracy === 100) return results.compareBothPerfect;
  if (r2.accuracy > r1.accuracy) return results.compareImproved;
  if (r2.accuracy === r1.accuracy) return results.compareSame;
  return results.compareWorse;
}

/** 라운드 결과 — 정확도와 틀린 문제(원인 포함), 2라운드에서는 1차와 비교 */
export default function RoundResultScreen({ content, game }: RoundResultScreenProps) {
  const { results } = content;
  const result = game.currentResult;
  if (!result) return null;

  const wrong = result.judged.filter((j) => !j.judgement.correct);
  const isRound2 = game.round === 2;
  const r1 = game.round1Result;

  return (
    <div className="mx-auto w-full max-w-md animate-fade-in px-4 py-6">
      <h2 className="text-center text-lg font-black">
        {game.round}차 {results.title}
      </h2>

      {/* 정확도 */}
      <div className="mlq-card mt-4 p-6 text-center">
        <div className="text-xs font-bold text-muted-foreground">{results.accuracyLabel}</div>
        <div
          className={cn(
            "mt-1 animate-scale-in text-7xl font-black tabular-nums tracking-tight",
            result.accuracy >= 67 ? "db-grad-text" : "text-destructive",
          )}
        >
          {result.accuracy}%
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {result.total}문제 중 {result.correctCount}문제 정답
        </div>
        <div className="mx-auto mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted shadow-inner">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              result.accuracy >= 67 ? "db-bar-fill" : "bg-destructive",
            )}
            style={{ width: `${result.accuracy}%` }}
          />
        </div>
        <div className="mt-4 flex justify-center">
          <BabyBot
            line={toneLine(content, result.accuracy)}
            mood={result.accuracy === 100 ? "happy" : "confused"}
          />
        </div>
      </div>

      {/* 1차 vs 2차 비교 */}
      {isRound2 && r1 && (
        <div className="db-callout mt-4 rounded-2xl p-4">
          <div className="db-grad-text text-center text-xs font-extrabold">{results.compareTitle}</div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="mlq-card flex-1 px-3 py-3 text-center text-2xl font-black tabular-nums text-muted-foreground">
              {r1.accuracy}%
            </span>
            <span className="db-grad-text shrink-0 text-xl font-black" aria-hidden>
              →
            </span>
            <span
              className={cn(
                "mlq-card flex-1 px-3 py-3 text-center text-2xl font-black tabular-nums",
                result.accuracy >= r1.accuracy ? "border-success/30" : "border-destructive/30",
              )}
            >
              <span className={result.accuracy >= r1.accuracy ? "db-grad-text" : "text-destructive"}>
                {result.accuracy}%
              </span>
            </span>
          </div>
          <p className="mt-2.5 text-center text-xs font-semibold leading-relaxed">
            {compareLine(content, r1, result)}
          </p>
        </div>
      )}

      {/* 틀린 문제 목록 */}
      <div className="mt-4">
        <h3 className="text-xs font-bold">📋 {results.wrongListTitle}</h3>
        {wrong.length === 0 ? (
          <p className="mlq-card mt-2 border-success/40 bg-success/10 px-3 py-2.5 text-xs font-bold text-success">
            🎉 {results.allCorrectNote}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {wrong.map(({ card, judgement }) => (
              <li key={card.id} className="mlq-card p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" aria-hidden>
                    {card.emoji}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold">{card.label}</div>
                    <div className="text-[10px] text-muted-foreground">
                      아기봇의 답: {judgement.botAnswer}
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/80">
                  {card.explanationWhenWrong}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {judgement.missing.map((m) => (
                    <span
                      key={m}
                      className="mlq-chip border border-warning/50 bg-warning/15 px-2 py-0.5 text-[10px] text-warning-foreground"
                    >
                      빠진 데이터 · {m}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 다음 단계 */}
      {!isRound2 ? (
        <div className="mt-5">
          <p className="text-center text-xs text-muted-foreground">{results.toRound2Note}</p>
          <button
            type="button"
            onClick={game.startRound2}
            className="db-btn mt-2 w-full px-6 py-3 text-sm"
          >
            {results.toRound2Button}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={game.goReflection}
          className="db-btn mt-5 w-full px-6 py-3 text-sm"
        >
          {results.toReflectionButton}
        </button>
      )}
    </div>
  );
}
