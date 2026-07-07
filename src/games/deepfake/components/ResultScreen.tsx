/**
 * 결과 화면 — 수사 보고서.
 * 점수·탐정 등급·단서 수첩 정리를 보여 주고, 마지막 배움(출처 확인)을 강조한다.
 * 완료 기록은 이 화면에 처음 도착했을 때 한 번만 저장한다 (StrictMode 안전).
 */
import { useEffect, useRef } from "react";
import { RotateCcw, Megaphone, Lock } from "lucide-react";
import { markCompleted } from "@/lib/progress";
import { cn } from "@/lib/utils";
import type { DfContent } from "../types";
import type { DeepfakeGame } from "../useDeepfakeGame";

interface ResultScreenProps {
  content: DfContent;
  game: DeepfakeGame;
}

export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { result } = content;
  const collectedCount = game.collectedClueIds.length;

  // 완료 기록은 한 번만 — StrictMode 의 이펙트 2회 실행에도 안전하게 ref 로 막는다
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    markCompleted("deepfake", `${game.grade.name} 등급 · 단서 ${collectedCount}개 수집`);
  }, [game.grade.name, collectedCount]);

  return (
    <div className="mx-auto w-full max-w-md space-y-3 p-3 pb-8">
      {/* 등급 카드 */}
      <div className="mlq-card animate-scale-in p-5 text-center shadow-lift">
        <p className="df-ink mb-2 text-xs font-bold opacity-80">{result.title}</p>
        <div className="mb-1 text-6xl">{game.grade.emoji}</div>
        <p className="text-[11px] font-semibold text-muted-foreground">{result.gradeLabel}</p>
        <h2 className="df-gradient-text mb-1 text-3xl font-black">{game.grade.name}</h2>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{game.grade.desc}</p>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-accent/25 p-2">
            <p className="text-lg font-black">{game.score}점</p>
            <p className="text-[10px] font-medium text-muted-foreground">
              {content.ui.scoreLabel}
            </p>
          </div>
          <div className="rounded-xl bg-accent/25 p-2">
            <p className="text-lg font-black">
              {game.judgeCorrectCount}/{game.totalRounds}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground">{result.judgeStat}</p>
          </div>
          <div className="rounded-xl bg-accent/25 p-2">
            <p className="text-lg font-black">
              {game.clueFoundCount}/{game.fakeCount}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground">{result.clueStat}</p>
          </div>
        </div>
      </div>

      {/* 단서 수첩 정리 */}
      <div className="mlq-card animate-fade-in p-4">
        <p className="df-ink mb-2.5 text-xs font-extrabold">
          📔 {result.notebookTitle}{" "}
          <span className="font-semibold text-muted-foreground">
            ({collectedCount}/{content.clues.length})
          </span>
        </p>
        <ul className="grid gap-1.5">
          {content.clues.map((clue) => {
            const collected = game.collectedClueIds.includes(clue.id);
            return (
              <li
                key={clue.id}
                className={cn(
                  "rounded-xl px-2.5 py-2",
                  collected
                    ? "df-clue-card"
                    : "border border-dashed border-border bg-muted/60 opacity-80",
                )}
              >
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-bold",
                    !collected && "text-muted-foreground",
                  )}
                >
                  {collected ? "✅" : <Lock className="h-3 w-3" />}
                  {collected ? clue.name : result.lockedName}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {collected ? clue.desc : result.lockedDesc}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 마무리 배움 — 출처 확인 */}
      <div className="df-final-callout animate-fade-in rounded-2xl p-4">
        <p className="df-ink mb-1.5 flex items-center gap-1.5 text-sm font-extrabold">
          <Megaphone className="h-4 w-4 text-warning" />
          {result.finalTitle}
        </p>
        <p className="text-[13px] font-semibold leading-relaxed">{result.finalMessage}</p>
      </div>

      <button
        type="button"
        onClick={game.retry}
        className="df-btn-outline flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold shadow-soft transition-all active:scale-95"
      >
        <RotateCcw className="h-4 w-4" />
        {result.retryButton}
      </button>
    </div>
  );
}
