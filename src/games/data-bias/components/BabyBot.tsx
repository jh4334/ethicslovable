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
            "db-bot flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl",
            mood === "eating" && "db-chew",
            mood === "confused" && "db-wobble",
          )}
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
        <div className="db-bubble relative max-w-[16rem] rounded-xl border bg-card px-3 py-2 text-xs font-medium leading-relaxed shadow-sm">
          {line}
        </div>
      )}
    </div>
  );
}
