import { Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Choice, Feedback } from "../types";

interface ChoiceListProps {
  choices: Choice[];
  feedback: Feedback | null;
  onChoose: (choice: Choice) => void;
}

/** 추천 후보 게시물 목록 */
export default function ChoiceList({ choices, feedback, onChoose }: ChoiceListProps) {
  return (
    <div className="space-y-1.5 pb-4">
      {choices.map((choice, idx) => (
        <button
          key={`${choice.title}-${idx}`}
          type="button"
          onClick={() => onChoose(choice)}
          disabled={feedback !== null}
          className={cn(
            "flex w-full items-center rounded-xl border-2 bg-card p-2.5 text-left transition-all duration-200",
            feedback
              ? choice.isCorrect
                ? "border-success bg-success/10"
                : choice.isTrap
                  ? "border-destructive bg-destructive/10"
                  : "border-border opacity-40"
              : "border-border hover:border-primary hover:bg-primary/5 active:scale-[0.98]",
          )}
        >
          <div className="mr-2.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-xl">
            {choice.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[10px] font-bold text-muted-foreground">
              {choice.account} · {choice.mediaType}
            </div>
            <div className="truncate text-xs font-medium">{choice.title}</div>
            <div className="truncate text-[10px] text-primary">{choice.tags}</div>
          </div>

          <div
            className={cn(
              "ml-2 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors",
              feedback && choice.isCorrect
                ? "bg-success text-success-foreground"
                : feedback && choice.isTrap
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground",
            )}
          >
            {feedback && choice.isCorrect ? (
              <Check className="h-3.5 w-3.5" />
            ) : feedback && choice.isTrap ? (
              <XCircle className="h-3.5 w-3.5" />
            ) : (
              "추천"
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
