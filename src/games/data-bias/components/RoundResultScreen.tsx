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
      <h2 className="text-center text-base font-black">
        {game.round}차 {results.title}
      </h2>

      {/* 정확도 */}
      <div className="mt-4 rounded-2xl border bg-card p-5 text-center shadow-sm">
        <div className="text-xs font-medium text-muted-foreground">{results.accuracyLabel}</div>
        <div
          className={cn(
            "mt-1 animate-scale-in text-5xl font-black tabular-nums",
            result.accuracy === 100
              ? "text-success"
              : result.accuracy >= 67
                ? "text-primary"
                : "text-destructive",
          )}
        >
          {result.accuracy}%
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {result.total}문제 중 {result.correctCount}문제 정답
        </div>
        <div className="mx-auto mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              result.accuracy === 100 ? "bg-success" : result.accuracy >= 67 ? "bg-primary" : "bg-destructive",
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
        <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="text-center text-xs font-bold text-primary">{results.compareTitle}</div>
          <div className="mt-2 flex items-center justify-center gap-3 text-2xl font-black tabular-nums">
            <span className="text-muted-foreground">{r1.accuracy}%</span>
            <span className="text-base" aria-hidden>
              →
            </span>
            <span className={result.accuracy >= r1.accuracy ? "text-success" : "text-destructive"}>
              {result.accuracy}%
            </span>
          </div>
          <p className="mt-2 text-center text-xs font-medium leading-relaxed">
            {compareLine(content, r1, result)}
          </p>
        </div>
      )}

      {/* 틀린 문제 목록 */}
      <div className="mt-4">
        <h3 className="text-xs font-bold">📋 {results.wrongListTitle}</h3>
        {wrong.length === 0 ? (
          <p className="mt-2 rounded-xl border border-success/40 bg-success/10 px-3 py-2.5 text-xs font-medium text-success">
            🎉 {results.allCorrectNote}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {wrong.map(({ card, judgement }) => (
              <li key={card.id} className="rounded-xl border bg-card p-3">
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
                      className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive"
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
            className="mt-2 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
          >
            {results.toRound2Button}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={game.goReflection}
          className="mt-5 w-full rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
        >
          {results.toReflectionButton}
        </button>
      )}
    </div>
  );
}
