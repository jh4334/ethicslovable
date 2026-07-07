import { Timer, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiContent } from "../types";
import type { SocialInsightGame } from "../useSocialInsightGame";
import BrandLogo from "./BrandLogo";
import FeedPostCard from "./FeedPostCard";
import ChoiceList from "./ChoiceList";

interface PlayScreenProps {
  content: SiContent;
  game: SocialInsightGame;
}

export default function PlayScreen({ content, game }: PlayScreenProps) {
  const { question, difficulty } = game;

  if (!question) {
    return (
      <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center text-sm text-muted-foreground">
        문제를 준비하는 중이에요…
      </div>
    );
  }

  const timeRatio = difficulty.timeLimit > 0 ? game.timeLeft / difficulty.timeLimit : 0;

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-2.75rem)] w-full max-w-sm flex-col overflow-hidden border-x bg-background shadow-xl">
      {/* 상단 바: 누리피드 브랜드 + 점수/콤보/시간 */}
      <header className="sticky top-0 z-10 w-full border-b bg-card px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BrandLogo className="h-5 w-5" />
            <span className="text-sm font-bold">{content.meta.snsName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {game.combo >= 2 && (
              <span className="animate-pop rounded bg-warning/20 px-1.5 py-0.5 text-[10px] font-bold text-warning">
                {game.combo}연속!
              </span>
            )}
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-secondary-foreground">
              {game.score}점
            </span>
            <span
              className={cn(
                "flex items-center rounded px-1.5 py-0.5 text-xs font-bold tabular-nums",
                game.timeLeft <= 3
                  ? "si-timer-danger bg-destructive/15 text-destructive"
                  : "bg-secondary text-foreground",
              )}
            >
              <Timer className="mr-0.5 h-3 w-3" />
              {game.timeLeft}초
            </span>
          </div>
        </div>
        {/* 남은 시간 막대 */}
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "si-time-bar h-full rounded-full",
              game.timeLeft <= 3 ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${Math.max(0, Math.min(1, timeRatio)) * 100}%` }}
          />
        </div>
      </header>

      {/* 콤보 칭찬 문구 */}
      {game.comboFlash && (
        <div className="si-combo-flash pointer-events-none absolute left-1/2 top-16 z-20 whitespace-nowrap text-lg font-black text-warning">
          {game.comboFlash}
        </div>
      )}

      <main className="w-full flex-1 overflow-y-auto pb-4">
        {/* 라운드 진행 표시 */}
        <div className="flex gap-0.5 px-3 pt-2">
          {Array.from({ length: game.totalRounds }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i < game.round - 1
                  ? "bg-primary"
                  : i === game.round - 1
                    ? "bg-primary/40"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
        <div className="px-3 pt-1 text-right text-[10px] font-medium text-muted-foreground">
          {game.round} / {game.totalRounds} 라운드
        </div>

        {/* 미션 안내 */}
        <div className="px-3 py-1.5">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2 text-center">
            <p className="text-[11px] font-medium text-primary">
              🎯 {content.meta.mission}
            </p>
          </div>
        </div>

        {/* 친구가 방금 좋아요 누른 게시물 */}
        <FeedPostCard question={question} />

        {/* 힌트 (함정 라운드에서만) */}
        {game.hasTrap && (
          <div className="mx-3 mt-2">
            <button
              type="button"
              onClick={() => game.setShowHint(!game.showHint)}
              className={cn(
                "flex w-full items-center justify-center gap-1.5 rounded-lg p-1.5 text-[10px] font-medium transition-colors",
                game.showHint
                  ? "border border-destructive/30 bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {game.showHint ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {game.showHint ? "힌트 숨기기" : "힌트 보기 (함정 조심!)"}
            </button>
            {game.showHint && question.dislikeLabel && (
              <div className="mt-1.5 animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-center text-[10px] text-destructive">
                ⚠️ 이 친구는 <strong>{question.dislikeLabel}</strong> 게시물을 싫어해서 그냥 넘겨요!
              </div>
            )}
          </div>
        )}

        {/* 추천 후보 목록 */}
        <div className="mt-3 px-3">
          <h3 className="mb-1.5 text-xs font-bold">📌 어떤 게시물을 추천할까요?</h3>
          <ChoiceList choices={game.choices} feedback={game.feedback} onChoose={game.choose} />
        </div>
      </main>

      {/* 정답/오답 알림 */}
      {game.feedback && (
        <div className="absolute left-1/2 top-1/2 z-30 w-52 -translate-x-1/2 -translate-y-1/2 animate-scale-in">
          <div
            className={cn(
              "flex flex-col items-center rounded-xl border bg-card/95 p-4 shadow-2xl backdrop-blur-md",
              game.feedback.type === "success" ? "border-success/40" : "border-destructive/40",
            )}
          >
            <div
              className={cn(
                "mb-2 flex h-10 w-10 items-center justify-center rounded-full text-xl",
                game.feedback.type === "success" ? "bg-success/20" : "bg-destructive/20",
              )}
            >
              {game.feedback.type === "success" ? "🧚" : "😅"}
            </div>
            <h4
              className={cn(
                "text-sm font-bold",
                game.feedback.type === "success" ? "text-success" : "text-destructive",
              )}
            >
              {game.feedback.title}
            </h4>
            <p className="mt-0.5 text-center text-[10px] text-muted-foreground">
              {game.feedback.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
