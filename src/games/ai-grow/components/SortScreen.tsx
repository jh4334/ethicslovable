import { ArrowRight, Bot, Hand } from "lucide-react";
import type { AgContent } from "../types";
import type { AiGrowGame } from "../useAiGrowGame";

interface SortScreenProps {
  content: AgContent;
  game: AiGrowGame;
}

/**
 * 2부 · AI가 못하는 것 찾기 — 섞어 낸 카드를 'AI가 잘해요' / '나만 할 수 있어요'로
 * 분류한다. 마지막 카드 뒤에 "AI는 도구, 주인공은 나" 메시지를 보여 준다.
 */
export default function SortScreen({ content, game }: SortScreenProps) {
  const hva = content.humanVsAi;
  const { labels } = content;
  const total = game.sortDeck.length;
  const card = game.sortDeck[game.sortIndex];
  const decided = game.sortLastCorrect !== null;
  const isLast = game.sortIndex >= total - 1;

  return (
    <div className="ag-shell flex min-h-[calc(100vh-3rem)] flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-1 text-center">
          <span className="mlq-chip ag-chip-final">
            🧩 2부 · {hva.activityTitle}
          </span>
        </div>
        <p className="mx-auto mb-5 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
          {hva.activityIntro}
        </p>

        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-extrabold text-muted-foreground">
            {game.sortIndex + 1} / {total} {labels.cardIndex}
          </span>
          <span className="text-xs font-extrabold text-muted-foreground">
            {hva.prompt}
          </span>
        </div>

        {/* 분류할 카드 */}
        <div
          className="ag-sort-card animate-fade-in mb-5 rounded-2xl p-7 text-center"
          key={game.sortIndex}
        >
          <p className="text-lg font-black leading-relaxed sm:text-xl">
            {card.text}
          </p>
        </div>

        {/* 두 개의 통 */}
        <div className="grid grid-cols-2 gap-3">
          {[false, true].map((humanOnly) => {
            const label = humanOnly ? hva.humanBucketLabel : hva.aiBucketLabel;
            const emoji = humanOnly ? hva.humanBucketEmoji : hva.aiBucketEmoji;
            const isAnswer = decided && card.isHumanOnly === humanOnly;
            const Icon = humanOnly ? Hand : Bot;
            return (
              <button
                key={String(humanOnly)}
                onClick={() => game.sortCard(humanOnly)}
                disabled={decided}
                className={[
                  "ag-bucket flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-5 text-center transition",
                  isAnswer
                    ? "ag-bucket-answer"
                    : decided
                      ? "border-border bg-card opacity-45"
                      : "border-border bg-card hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
                ].join(" ")}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-extrabold leading-tight">
                  {emoji} {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 판정 */}
        {decided && (
          <div
            className={[
              "ag-verdict animate-fade-in mt-4 rounded-2xl border p-4 text-center",
              game.sortLastCorrect ? "ag-verdict-growth" : "ag-verdict-nongrowth",
            ].join(" ")}
          >
            <p className="text-sm font-black">
              {game.sortLastCorrect ? `🎉 ${hva.correctFeedback}` : `💭 ${hva.wrongFeedback}`}
              <span className="ml-1.5 font-bold text-muted-foreground">
                — {card.isHumanOnly ? hva.humanBucketLabel : hva.aiBucketLabel}
              </span>
            </p>

            {isLast && (
              <p className="ag-summary mx-auto mt-3 max-w-md rounded-xl p-3.5 text-left text-sm leading-relaxed">
                🌟 {hva.summary}
              </p>
            )}

            <button
              onClick={game.nextCard}
              className="ag-btn-cta mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
            >
              {isLast ? labels.toResult : labels.sortNext}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
