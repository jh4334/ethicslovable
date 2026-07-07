import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { fillTemplate } from "../judge";
import type { DbContent, DbTrainingCard } from "../types";
import type { DataBiasGame } from "../useDataBiasGame";
import BabyBot from "./BabyBot";

interface TrainScreenProps {
  content: DbContent;
  game: DataBiasGame;
}

/** 색 특징 태그 → 카드 위 색 점 (라벨을 눈으로 빨리 찾도록 돕는 장식) */
const COLOR_DOT: Record<string, string> = {
  갈색: "#a26a3f",
  검정: "#3f3f46",
  흰색: "#fafaf7",
  노랑: "#f2c744",
};

function colorOf(card: DbTrainingCard): string | null {
  for (const tag of card.variantTags) {
    if (COLOR_DOT[tag]) return COLOR_DOT[tag];
  }
  return null;
}

/** 학습 단계 — 훈련 데이터 16장 중 8장을 골라 아기봇에게 먹인다 */
export default function TrainScreen({ content, game }: TrainScreenProps) {
  const { babyBot, rounds } = content;
  const [feeding, setFeeding] = useState(false);
  const count = game.selected.length;
  const ready = count === game.pickCount;

  // 먹는 연출을 잠깐 보여 준 뒤 시험으로 넘어간다 (cleanup으로 StrictMode-safe)
  const { feed } = game;
  useEffect(() => {
    if (!feeding) return;
    const timer = setTimeout(() => feed(), 1500);
    return () => clearTimeout(timer);
  }, [feeding, feed]);

  // 고른 데이터의 종별 개수 요약 (예: 강아지 3 · 고양이 2 · 새 3)
  const speciesSummary = useMemo(() => {
    const order: string[] = [];
    const counts = new Map<string, number>();
    for (const card of content.trainingCards) {
      if (!counts.has(card.species)) {
        counts.set(card.species, 0);
        order.push(card.species);
      }
    }
    for (const card of game.selectedCards) {
      counts.set(card.species, (counts.get(card.species) ?? 0) + 1);
    }
    return order.map((species) => ({ species, count: counts.get(species) ?? 0 }));
  }, [content.trainingCards, game.selectedCards]);

  const botLine = feeding
    ? babyBot.eatingLine
    : count === 0
      ? babyBot.hungryLine
      : ready
        ? babyBot.readyLine
        : fillTemplate(babyBot.pickingLine, "개수", String(count));

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-in px-4 py-5 pb-28">
      {/* 라운드 배지 + 안내 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="db-pill text-[11px]">{game.round}차 훈련</span>
        <h2 className="text-lg font-black">{rounds.trainTitle}</h2>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rounds.trainGuide}</p>
      <p className="mt-1.5 rounded-lg border border-accent/60 bg-accent/20 px-3 py-2 text-xs font-medium text-accent-foreground">
        💡 {game.round === 1 ? rounds.round1Notice : rounds.round2Notice}
      </p>

      {/* 아기봇 상태 */}
      <div className="mt-4">
        <BabyBot line={botLine} mood={feeding ? "eating" : ready ? "happy" : "normal"} />
      </div>

      {/* 훈련 데이터 그리드 */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {content.trainingCards.map((card) => {
          const isSelected = game.selected.includes(card.id);
          const isFull = ready && !isSelected;
          const dot = colorOf(card);
          const isBig = card.variantTags.includes("큰");
          return (
            <button
              key={card.id}
              type="button"
              disabled={feeding || isFull}
              onClick={() => game.toggleCard(card.id)}
              aria-pressed={isSelected}
              className={cn(
                "db-card relative flex flex-col items-center rounded-2xl border border-transparent bg-card p-2 pt-3 text-center shadow-soft transition-all",
                isSelected ? "db-card-selected" : "hover:border-success/40",
                isFull && "opacity-40",
                feeding && isSelected && "db-card-eaten",
              )}
            >
              {isSelected && (
                <span className="db-check absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white animate-scale-in">
                  ✓
                </span>
              )}
              <span className={cn(isBig ? "text-4xl" : "text-2xl", "leading-none")} aria-hidden>
                {card.emoji}
              </span>
              <span className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold leading-tight">
                {dot && (
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: dot }}
                    aria-hidden
                  />
                )}
                {card.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 하단 고정 바 — 선택 요약 + 먹이기 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="db-pill text-xs tabular-nums">
              🍽️ {count} / {game.pickCount}장
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {speciesSummary.map(({ species, count: n }) => (
                <span
                  key={species}
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    n > 0 ? "bg-success/15 text-success" : "bg-muted text-muted-foreground/60",
                  )}
                >
                  {species} {n}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            disabled={!ready || feeding}
            onClick={() => setFeeding(true)}
            className={cn(
              "shrink-0 px-5 py-2.5 text-sm font-bold",
              ready && !feeding
                ? "db-btn animate-pop"
                : "cursor-not-allowed rounded-xl bg-muted text-muted-foreground transition-all",
            )}
          >
            {feeding ? "냠냠 먹는 중…" : rounds.feedButton}
          </button>
        </div>
      </div>
    </div>
  );
}
