import { useEffect, useRef } from "react";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { markCompleted } from "@/lib/progress";
import type { SiContent } from "../types";
import type { SocialInsightGame } from "../useSocialInsightGame";
import { LEADERBOARD_SHOW } from "../storage";

interface ResultScreenProps {
  content: SiContent;
  game: SocialInsightGame;
}

export default function ResultScreen({ content, game }: ResultScreenProps) {
  const { difficulty, score, maxCombo } = game;
  const entries = game.leaderboards[difficulty.id] ?? [];
  // 이름+점수가 아니라 저장 시 부여한 고유 id로 내 기록을 찾는다
  const myRank = game.lastEntryId
    ? entries.findIndex((e) => e.id === game.lastEntryId) + 1
    : 0;
  const isTop3 = myRank > 0 && myRank <= 3;

  // 결과 화면에 도착하면 학습 완료로 기록 (StrictMode에서도 1회만)
  const reportedRef = useRef(false);
  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    markCompleted(
      "social-insight",
      `${difficulty.label} 난이도 ${score}점 · 최대 콤보 ${maxCombo}`,
    );
  }, [difficulty.label, score, maxCombo]);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm animate-scale-in rounded-2xl border bg-card p-5 text-center shadow-lg">
        <div className="mb-2 text-4xl">
          {isTop3 ? "🏆" : score >= 100 ? "🌟" : score >= 70 ? "👍" : "🌱"}
        </div>
        {isTop3 && (
          <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning">
            <Trophy className="h-3 w-3" /> {myRank}위에 올랐어요!
          </div>
        )}
        <h2 className="text-lg font-bold">
          {game.playerName.trim() || "익명 요정"}
        </h2>
        <div className="text-3xl font-black">{score}점</div>
        <div className="mb-3 text-[11px] text-muted-foreground">
          {difficulty.label} 난이도 · 최대 {maxCombo}콤보
        </div>

        {/* 배움 정리 */}
        <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-left">
          <p className="text-[11px] leading-relaxed text-foreground">
            💡 {content.meta.resultNote}
          </p>
        </div>

        {/* 명예의 전당 Top 5 */}
        <div className="mb-4 rounded-lg bg-secondary/30 p-2">
          <div className="mb-1.5 flex items-center justify-center gap-1">
            <Trophy className="h-3 w-3 text-warning" />
            <span className="text-xs font-bold">
              {difficulty.label} 난이도 최고 기록 {LEADERBOARD_SHOW}
            </span>
          </div>
          {entries.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              아직 기록이 없어요
            </p>
          ) : (
            <div className="space-y-1">
              {entries.slice(0, LEADERBOARD_SHOW).map((entry, idx) => {
                const isMe = entry.id === game.lastEntryId;
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center justify-between rounded p-1.5 text-xs",
                      isMe ? "border border-primary/30 bg-primary/10" : "bg-card",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "w-6 font-bold",
                          idx === 0 ? "text-warning" : "text-muted-foreground",
                        )}
                      >
                        {idx + 1}위
                      </span>
                      <span
                        className={cn(
                          "max-w-[80px] truncate font-medium",
                          isMe && "text-primary",
                        )}
                      >
                        {entry.playerName}
                        {isMe && " (나)"}
                      </span>
                    </span>
                    <span className="font-bold">{entry.score}점</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={game.goToStart}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary py-2.5 text-xs font-bold text-secondary-foreground transition-all hover:bg-secondary/80 active:scale-95"
          >
            <Home className="h-3.5 w-3.5" />
            처음 화면
          </button>
          <button
            type="button"
            onClick={game.start}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            다시 도전!
          </button>
        </div>
      </div>
    </div>
  );
}
