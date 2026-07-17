import { useEffect, useRef } from "react";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { markCompleted } from "@/lib/progress";
import NextQuest from "@/components/NextQuest";
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
      score,
    );
  }, [difficulty.label, score, maxCombo]);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center p-4">
      <div className="mlq-card w-full max-w-sm animate-scale-in p-6 text-center">
        <div className="mb-2 text-5xl">
          {isTop3 ? "🏆" : score >= 100 ? "🌟" : score >= 70 ? "👍" : "🌱"}
        </div>
        {isTop3 && (
          <div className="mlq-chip mb-2 bg-warning/15 text-warning">
            <Trophy className="h-3.5 w-3.5" /> {myRank}위에 올랐어요!
          </div>
        )}
        <h2 className="text-lg font-extrabold">
          {game.playerName.trim() || "익명 요정"}
        </h2>
        <div className="mlq-gradient-text text-5xl font-black tracking-tight">{score}점</div>
        <div className="mb-3 mt-1 text-[11px] font-medium text-muted-foreground">
          {difficulty.label} 난이도 · 최대 {maxCombo}콤보
        </div>

        {/* 배움 정리 */}
        <div className="mb-3 rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-left">
          <p className="text-[11px] leading-relaxed text-foreground">
            💡 {content.meta.resultNote}
          </p>
        </div>

        {/* 학습지 연계 안내 */}
        <p className="mb-3 text-left text-[11px] leading-relaxed text-muted-foreground">
          📄 {content.meta.worksheetNote}
        </p>

        {/* 명예의 전당 Top 5 */}
        <div className="mb-4 rounded-xl bg-secondary/40 p-2.5">
          <div className="mb-1.5 flex items-center justify-center gap-1">
            <Trophy className="h-3 w-3 text-warning" />
            <span className="text-xs font-extrabold">
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
                      "flex items-center justify-between rounded-lg p-1.5 text-xs",
                      isMe
                        ? "border border-primary/30 bg-primary/10 shadow-soft"
                        : "bg-card shadow-soft",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "w-6 shrink-0 font-bold",
                          idx < 3 ? "text-sm leading-none" : "text-muted-foreground",
                        )}
                      >
                        {idx < 3 ? ["🥇", "🥈", "🥉"][idx] : `${idx + 1}위`}
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

        <div className="mb-3">
          <NextQuest gameId="social-insight" />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={game.goToStart}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground transition-all hover:bg-secondary/80 active:scale-95"
          >
            <Home className="h-3.5 w-3.5" />
            처음 화면
          </button>
          <button
            type="button"
            onClick={game.start}
            className="si-btn-cta flex-1 py-2.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            다시 도전!
          </button>
        </div>
      </div>
    </div>
  );
}
