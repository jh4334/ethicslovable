import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface NuriBotProps {
  /** 말풍선 대사 (없으면 말풍선 숨김) */
  line?: string;
  mood?: "normal" | "happy" | "struggle" | "fail";
  className?: string;
}

const MOOD_BADGE: Record<NonNullable<NuriBotProps["mood"]>, string> = {
  normal: "",
  happy: "✨",
  struggle: "❓",
  fail: "⚠️",
};

/** 누리소프트의 AI 비서 누리봇 — 이모지 캐릭터 + 말풍선 */
export default function NuriBot({ line, mood = "normal", className }: NuriBotProps) {
  const badge = MOOD_BADGE[mood];
  return (
    <div className={cn("flex items-end gap-2", className)}>
      <div className="relative shrink-0">
        <div
          className={cn(
            "af-bot mlq-emoji-tile h-14 w-14 text-3xl",
            mood === "struggle" && "af-wobble",
          )}
          style={{ "--tile-hue": 95 } as CSSProperties}
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
        <div className="af-bubble relative max-w-[16rem] rounded-2xl border bg-card px-3.5 py-2.5 text-xs font-semibold leading-relaxed shadow-soft">
          {line}
        </div>
      )}
    </div>
  );
}
