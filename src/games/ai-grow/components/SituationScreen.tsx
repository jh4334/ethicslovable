import { ArrowRight, Check, Sprout } from "lucide-react";
import type { AgContent } from "../types";
import type { AiGrowGame } from "../useAiGrowGame";

interface SituationScreenProps {
  content: AgContent;
  game: AiGrowGame;
}

/**
 * 1부 · 나라면? — 학습 상황 카드에서 'AI에게 베끼기' vs 'AI로 배우기'를 고른다.
 * 선택 후에는 '나를 키우는 선택'인지 판정 태그와 해설을 보여 준다.
 */
export default function SituationScreen({ content, game }: SituationScreenProps) {
  const { situations, labels, seedLabel } = content;
  const sit = situations[game.sitIndex];
  const total = situations.length;
  const chosen = game.sitChoices[game.sitIndex];
  const decided = game.sitStage === "feedback" && chosen != null;
  const chosenChoice = chosen != null ? sit.choices[chosen] : null;
  const isGrowth = chosenChoice?.isGrowth ?? false;

  return (
    <div className="ag-shell flex min-h-[calc(100vh-3rem)] flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* 진행 바 + 씨앗 카운터 */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs font-extrabold text-muted-foreground">
            {labels.situationLabel} {game.sitIndex + 1} / {total}
          </span>
          <span className="ag-seed-count inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black">
            <Sprout className="h-3.5 w-3.5" />
            {seedLabel} {game.seeds}
          </span>
        </div>
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="ag-progress h-full rounded-full transition-all duration-300"
            style={{ width: `${((game.sitIndex + 1) / total) * 100}%` }}
          />
        </div>

        {/* 상황 카드 */}
        <div className="mlq-card animate-fade-in p-5 sm:p-6" key={sit.id}>
          <div className="mb-4 flex items-start gap-3">
            <span
              className="ag-sit-emoji flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
              aria-hidden
            >
              {sit.emoji}
            </span>
            <p className="pt-1 text-sm font-bold leading-relaxed sm:text-base">
              {sit.context}
            </p>
          </div>

          {/* 선택지 */}
          <div className="flex flex-col gap-2.5">
            {sit.choices.map((choice, ci) => {
              const picked = chosen === ci;
              const dim = decided && !picked;
              return (
                <button
                  key={ci}
                  onClick={() => game.choose(ci)}
                  disabled={decided}
                  className={[
                    "ag-choice w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-bold leading-relaxed transition",
                    picked
                      ? choice.isGrowth
                        ? "ag-choice-growth"
                        : "ag-choice-nongrowth"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                    dim ? "opacity-45" : "",
                    decided ? "cursor-default" : "cursor-pointer",
                  ].join(" ")}
                >
                  <span className="flex items-start gap-2">
                    <span className="ag-choice-dot mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black">
                      {picked ? <Check className="h-3.5 w-3.5" /> : ci + 1}
                    </span>
                    {choice.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 판정 + 해설 */}
        {decided && chosenChoice && (
          <div
            className={[
              "ag-verdict animate-fade-in mt-4 rounded-2xl border p-4",
              isGrowth ? "ag-verdict-growth" : "ag-verdict-nongrowth",
            ].join(" ")}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {isGrowth ? "🌱" : "🤔"}
              </span>
              <span className="text-sm font-black">
                {isGrowth ? labels.growthTag : labels.notGrowthTag}
              </span>
              <span className="ml-auto text-xs font-extrabold text-muted-foreground">
                {isGrowth ? `+1 ${seedLabel}` : labels.seedMissed}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              {chosenChoice.feedback}
            </p>
            <button
              onClick={game.nextSituation}
              className="ag-btn-cta mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-extrabold"
            >
              {game.sitIndex >= total - 1 ? labels.toSort : labels.nextSituation}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
