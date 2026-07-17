import { Timer, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiContent } from "../types";
import type { SocialInsightGame } from "../useSocialInsightGame";
import PhoneFrame, { AppTopBar, PhoneStatusBar } from "./PhoneFrame";
import StoriesRow from "./StoriesRow";
import FeedPostCard from "./FeedPostCard";
import ChoiceList from "./ChoiceList";

interface PlayScreenProps {
  content: SiContent;
  game: SocialInsightGame;
}

/**
 * 플레이 화면 — 스마트폰 프레임 속 누리피드 앱.
 * 점수·콤보·타이머 HUD와 미션 안내는 폰 프레임 "밖"에 두어
 * 게임 정보와 SNS 화면이 섞이지 않게 한다.
 */
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
    <div className="relative mx-auto min-h-[calc(100vh-2.75rem)] w-full max-w-md px-2 pb-6 pt-2">
      {/* HUD — 폰 프레임 밖(위)에 고정. 스크롤해도 타이머가 보인다 */}
      <div className="sticky top-1 z-20 mx-auto mb-2 w-full max-w-[420px] rounded-xl border bg-card/90 px-3 py-2 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground">
            {game.round} / {game.totalRounds} 라운드
          </span>
          <div className="flex items-center gap-1.5">
            {game.combo >= 2 && (
              <span className="mlq-chip animate-pop bg-warning/15 text-warning">
                {game.combo}연속!
              </span>
            )}
            <span className="mlq-chip bg-secondary text-secondary-foreground">
              {game.score}점
            </span>
            {game.timed ? (
              <span
                className={cn(
                  "mlq-chip tabular-nums",
                  game.timeLeft <= 3
                    ? "si-timer-danger bg-destructive text-destructive-foreground shadow-soft"
                    : "bg-secondary text-foreground",
                )}
              >
                <Timer className="h-3.5 w-3.5" />
                {game.timeLeft}초
              </span>
            ) : (
              <span className="mlq-chip bg-secondary text-foreground">🐢 천천히</span>
            )}
          </div>
        </div>
        {/* 라운드 진행 표시 */}
        <div className="mt-1.5 flex gap-0.5">
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
        {/* 남은 시간 막대 */}
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "si-time-bar h-full rounded-full",
              game.timeLeft <= 3 ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${Math.max(0, Math.min(1, timeRatio)) * 100}%` }}
          />
        </div>
      </div>

      {/* 미션 안내 — 폰 프레임 위쪽 프레이밍 */}
      <div className="mx-auto mb-2 w-full max-w-[420px] rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-center">
        <p className="text-xs font-bold text-primary">🎯 {content.meta.mission}</p>
      </div>

      {/* 콤보 칭찬 문구 */}
      {game.comboFlash && (
        <div className="si-combo-flash pointer-events-none fixed left-1/2 top-28 z-30 whitespace-nowrap text-xl font-black text-warning drop-shadow-sm">
          {game.comboFlash}
        </div>
      )}

      {/* 스마트폰 속 누리피드 */}
      <PhoneFrame>
        <PhoneStatusBar />
        <AppTopBar snsName={content.meta.snsName} />
        <StoriesRow content={content} />

        {/* 친구가 방금 좋아요 누른 게시물 */}
        <FeedPostCard question={question} />

        <div className="bg-background pb-1">
          {/* 힌트 (함정 라운드에서만) */}
          {game.hasTrap && (
            <div className="px-3 pt-2">
              <button
                type="button"
                onClick={() => game.setShowHint(!game.showHint)}
                className={cn(
                  "flex w-full items-center justify-center gap-1.5 rounded-lg p-1.5 text-xs font-medium transition-colors",
                  game.showHint
                    ? "border border-destructive/30 bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {game.showHint ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {game.showHint ? "힌트 숨기기" : "힌트 보기 (함정 조심!)"}
              </button>
              {game.showHint && question.dislikeLabel && (
                <div className="mt-1.5 animate-fade-in rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-center text-xs text-destructive">
                  ⚠️ 이 친구는 <strong>{question.dislikeLabel}</strong> 게시물을 싫어해서 그냥 넘겨요!
                </div>
              )}
            </div>
          )}

          {/* 추천 후보 목록 */}
          <div className="mt-2 px-3">
            <h3 className="mb-1.5 text-xs font-bold">📌 어떤 게시물을 추천할까요?</h3>
            <ChoiceList choices={game.choices} feedback={game.feedback} onChoose={game.choose} />
          </div>
        </div>
      </PhoneFrame>

      {/* 정답/오답 알림 — 화면 중앙 고정 (스크린리더에도 읽히도록 status) */}
      {game.feedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-1/2 z-30 w-52 -translate-x-1/2 -translate-y-1/2 animate-scale-in"
        >
          <div
            className={cn(
              "flex flex-col items-center rounded-2xl border bg-card/95 p-4 shadow-lift backdrop-blur-md",
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
            <p className="mt-0.5 text-center text-xs text-muted-foreground">
              {game.feedback.message}
            </p>
            {/* 연습(무제한) 모드: 해설을 충분히 읽고 학생이 직접 넘긴다 */}
            {!game.timed && (
              <button
                type="button"
                onClick={game.advance}
                className="mlq-btn-primary mt-3 inline-flex items-center gap-1 px-5 py-2 text-sm font-bold"
              >
                다음 <span aria-hidden>▶</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
