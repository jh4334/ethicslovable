import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface BabyBotProps {
  /** 말풍선 대사 (없으면 말풍선 숨김) */
  line?: string;
  mood?: "normal" | "eating" | "thinking" | "happy" | "confused";
  className?: string;
}

const MOOD_BADGE: Record<NonNullable<BabyBotProps["mood"]>, string> = {
  normal: "",
  eating: "🍚",
  thinking: "💭",
  happy: "✨",
  confused: "❓",
};

/** 새내기 AI 아기봇 — 이모지 캐릭터 + 말풍선 */
export default function BabyBot({ line, mood = "normal", className }: BabyBotProps) {
  const badge = MOOD_BADGE[mood];
  return (
    <div className={cn("flex items-end gap-2", className)}>
      <div className="relative shrink-0">
        <div
          className={cn(
            "db-bot mlq-emoji-tile h-14 w-14 text-3xl",
            mood === "eating" && "db-chew",
            mood === "confused" && "db-wobble",
          )}
          style={{ "--tile-hue": 152 } as CSSProperties}
          aria-hidden
        >
          🤖
        </div>
        {badge && (
          <span className="absolute -right-1 -top-1 text-base" aria-hidden>
            {badge}
          </span>
        )}
      </div>
      {line && (
        <div className="db-bubble relative max-w-[16rem] rounded-2xl border bg-card px-3.5 py-2.5 text-xs font-semibold leading-relaxed shadow-soft">
          {line}
        </div>
      )}
    </div>
  );
}
