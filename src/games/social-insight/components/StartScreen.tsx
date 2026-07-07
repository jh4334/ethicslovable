import { useState } from "react";
import { Trophy, User, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiContent } from "../types";
import type { SocialInsightGame } from "../useSocialInsightGame";
import { LEADERBOARD_SHOW } from "../storage";
import BrandLogo from "./BrandLogo";

/** 난이도별 강조색 (콘텐츠 JSON의 id 기준, 모르는 id는 기본색) */
const DIFF_STYLES: Record<string, { active: string; text: string }> = {
  easy: {
    active: "border-success bg-success/10 ring-2 ring-success/25",
    text: "text-success",
  },
  normal: {
    active: "border-primary bg-primary/10 ring-2 ring-primary/25",
    text: "text-primary",
  },
  hard: {
    active: "border-destructive bg-destructive/10 ring-2 ring-destructive/25",
    text: "text-destructive",
  },
};
const diffStyle = (id: string) =>
  DIFF_STYLES[id] ?? {
    active: "border-primary bg-primary/10 ring-2 ring-primary/25",
    text: "text-primary",
  };

interface StartScreenProps {
  content: SiContent;
  game: SocialInsightGame;
}

export default function StartScreen({ content, game }: StartScreenProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState(game.difficultyId);

  const tabEntries = game.leaderboards[leaderboardTab] ?? [];

  return (
    <div className="flex min-h-[calc(100vh-2.75rem)] items-center justify-center p-4">
      <div className="mlq-card w-full max-w-sm animate-scale-in p-6 text-center">
        <div className="si-logo si-logo-glow mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.375rem]">
          <BrandLogo className="h-12 w-12" />
        </div>
        <h1 className="mb-1 text-2xl font-black tracking-tight">{content.meta.gameTitle}</h1>
        <p className="si-brand-text mb-1.5 text-xs font-extrabold">{content.meta.tagline}</p>
        <p className="mb-4 text-xs text-muted-foreground">{content.meta.intro}</p>

        {/* 별명 입력 — 선택 사항, 이 컴퓨터에만 저장 */}
        <div className="mb-4 text-left">
          <label htmlFor="si-nickname" className="mb-1.5 block text-xs font-medium">
            요정 별명 <span className="font-normal text-muted-foreground">(안 써도 돼요)</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="si-nickname"
              type="text"
              value={game.playerName}
              onChange={(e) => game.setPlayerName(e.target.value.slice(0, 10))}
              placeholder="진짜 이름 말고 별명을 지어 주세요!"
              maxLength={10}
              className="w-full rounded-lg border bg-secondary/50 py-2.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {game.playerName.length}/10 · 이 컴퓨터에만 저장돼요
          </p>
        </div>

        {/* 난이도 선택 */}
        <div className="mb-4 text-left">
          <span className="mb-1.5 block text-xs font-medium">난이도</span>
          <div className="grid grid-cols-3 gap-1.5">
            {content.difficulties.map((diff) => {
              const isSelected = game.difficultyId === diff.id;
              const style = diffStyle(diff.id);
              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => {
                    game.setDifficultyId(diff.id);
                    setLeaderboardTab(diff.id);
                  }}
                  className={cn(
                    "rounded-2xl border-2 p-2.5 transition-all duration-200",
                    isSelected
                      ? cn(style.active, style.text, "scale-[1.04] shadow-soft")
                      : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/50",
                  )}
                >
                  <div className="mb-0.5 text-lg leading-none">{diff.emoji}</div>
                  <div className={cn("text-xs font-bold", isSelected ? style.text : "text-foreground")}>
                    {diff.label}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {game.difficulty.description}
          </p>
        </div>

        {/* 명예의 전당 */}
        <button
          type="button"
          onClick={() => setShowLeaderboard((v) => !v)}
          className="mb-3 flex w-full items-center justify-between rounded-xl bg-secondary/50 p-2 transition-colors hover:bg-secondary"
        >
          <span className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs font-medium">명예의 전당</span>
          </span>
          {showLeaderboard ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {showLeaderboard && (
          <div className="mb-3 animate-fade-in rounded-xl bg-secondary/40 p-2">
            <div className="mb-2 flex gap-1">
              {content.difficulties.map((diff) => {
                const isActive = leaderboardTab === diff.id;
                const style = diffStyle(diff.id);
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setLeaderboardTab(diff.id)}
                    className={cn(
                      "flex-1 rounded-lg py-1 text-[10px] font-bold transition-colors",
                      isActive
                        ? cn("border", style.active, style.text)
                        : "bg-card text-muted-foreground hover:bg-card/80",
                    )}
                  >
                    {diff.label}
                  </button>
                );
              })}
            </div>
            <div className="max-h-32 overflow-y-auto">
              {tabEntries.length === 0 ? (
                <p className="py-3 text-center text-xs text-muted-foreground">
                  아직 기록이 없어요
                </p>
              ) : (
                <div className="space-y-1">
                  {tabEntries.slice(0, LEADERBOARD_SHOW).map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg bg-card p-1.5 text-xs shadow-soft"
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
                        <span className="max-w-[80px] truncate font-medium">
                          {entry.playerName}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {entry.maxCombo}콤보
                        </span>
                        <span className="font-bold">{entry.score}점</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={game.start}
          className="si-btn-cta w-full py-3 text-sm"
        >
          훈련 시작!
        </button>
      </div>
    </div>
  );
}
