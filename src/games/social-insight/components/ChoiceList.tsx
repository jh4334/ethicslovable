import { BadgeCheck, Check, Heart, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Choice, Feedback } from "../types";
import { fakeLikes, isVerified } from "../sns";

interface ChoiceListProps {
  choices: Choice[];
  feedback: Feedback | null;
  onChoose: (choice: Choice) => void;
}

/**
 * 추천 후보 목록 — 각 보기를 작은 SNS 게시물 미리보기 모양으로 보여 준다.
 * (그라데이션 링 아바타 + 계정명·인증 배지 + 캡션 + 파란 해시태그 + 좋아요 수)
 * 게임 동작(onChoose·피드백 강조)은 이전과 완전히 같다.
 */
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
            "flex w-full items-center gap-2 rounded-2xl border-2 bg-card p-2 text-left shadow-soft transition-all duration-200",
            feedback
              ? choice.isCorrect
                ? "scale-[1.01] border-success bg-success/10"
                : choice.isTrap
                  ? "border-destructive bg-destructive/10"
                  : "border-border opacity-40"
              : "border-border hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/5 hover:shadow-lift active:scale-[0.98]",
          )}
        >
          {/* 미니 게시물: 링 아바타 */}
          <span className="si-story-ring si-ring-sm shrink-0">
            <span className="si-story-avatar h-9 w-9 text-lg">{choice.icon}</span>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[10px] font-bold">
              <span className="truncate">{choice.account}</span>
              {isVerified(choice.account) && (
                <BadgeCheck className="si-verified h-3 w-3 shrink-0" aria-label="인증 계정" />
              )}
              <span className="shrink-0 font-medium text-muted-foreground">
                · {choice.mediaType}
              </span>
            </div>
            <div className="truncate text-xs font-medium">{choice.title}</div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="si-hashtag truncate">{choice.tags}</span>
              <span className="flex shrink-0 items-center gap-0.5 text-muted-foreground">
                <Heart className="si-heart-liked h-2.5 w-2.5" />
                {fakeLikes(`${choice.account}:${choice.title}`).toLocaleString("ko-KR")}
              </span>
            </div>
          </div>

          <div
            className={cn(
              "ml-1 shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-bold transition-colors",
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
