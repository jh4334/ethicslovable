import { AlertTriangle, ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApContent } from "../types";
import type { AiPrivacyGame } from "../useAiPrivacyGame";

interface MistakeScreenProps {
  content: ApContent;
  game: AiPrivacyGame;
}

/** 2부 · 실수했어요! — 개인정보를 이미 입력한 상황의 올바른 대응 고르기 */
export default function MistakeScreen({ content, game }: MistakeScreenProps) {
  const { labels, mistakes } = content;
  const mistake = mistakes[game.mIndex];
  const isLast = game.mIndex >= mistakes.length - 1;
  const revealed = game.mStage === "reveal";
  const answer = game.mAnswers[game.mIndex];

  return (
    <div className="ap-shell flex min-h-[calc(100vh-3rem)] flex-col items-center px-4 py-6">
      {/* 진행 스트립 */}
      <div className="mb-4 flex w-full max-w-lg items-center justify-between px-1">
        <span className="text-[11px] font-extrabold text-muted-foreground">
          {labels.part2Label} · {labels.situationLabel} {game.mIndex + 1}/{mistakes.length}
        </span>
        <div className="flex items-center gap-1">
          {mistakes.map((_, i) => {
            const a = game.mAnswers[i];
            const ok = a == null ? null : mistakes[i].choices[a]?.isGood;
            return (
              <span
                key={i}
                className={cn(
                  "ap-dot h-2 w-2 rounded-full",
                  ok === true && "bg-success",
                  ok === false && "bg-destructive",
                  ok == null && i === game.mIndex && "ap-dot-current bg-primary/60",
                  ok == null && i !== game.mIndex && "bg-foreground/15",
                )}
              />
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-lg animate-fade-in">
        {/* 상황 카드 */}
        <div className="ap-situation mb-4 p-5">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-extrabold text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            앗, 실수했어요!
          </p>
          <p className="text-[15px] font-bold leading-relaxed text-foreground">
            {mistake.situation}
          </p>
        </div>

        <p className="mb-2 px-1 text-xs font-bold text-muted-foreground">
          {labels.mistakeChooseHint}
        </p>

        {/* 선택지 */}
        <div className="flex flex-col gap-2">
          {mistake.choices.map((choice, i) => {
            const chosen = answer === i;
            const showGood = revealed && choice.isGood;
            const showBadChosen = revealed && chosen && !choice.isGood;
            return (
              <div key={i}>
                <button
                  onClick={() => game.chooseMistake(i)}
                  disabled={revealed}
                  className={cn(
                    "ap-choice-btn w-full rounded-xl px-4 py-3 text-left text-[13.5px] font-semibold leading-relaxed",
                    showGood && "ap-choice-good",
                    showBadChosen && "ap-choice-bad",
                    revealed && !choice.isGood && !chosen && "ap-choice-dim",
                  )}
                >
                  <span className="flex items-start gap-2">
                    {revealed && (
                      <span className="mt-0.5 shrink-0" aria-hidden>
                        {choice.isGood ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : chosen ? (
                          <X className="h-4 w-4 text-destructive" />
                        ) : (
                          <span className="inline-block h-4 w-4" />
                        )}
                      </span>
                    )}
                    <span>{choice.text}</span>
                  </span>
                </button>
                {/* 선택한 항목 아래에 피드백 */}
                {revealed && (chosen || choice.isGood) && (
                  <p
                    className={cn(
                      "ap-verdict mt-1.5 rounded-xl px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                      choice.isGood ? "ap-verdict-ok" : "ap-verdict-bad",
                    )}
                  >
                    {choice.feedback}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* 다음 버튼 */}
        {revealed && (
          <button
            onClick={game.nextMistake}
            className="ap-btn-cta mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-extrabold"
          >
            {isLast ? labels.toResult : labels.nextMistake}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
