import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { AfImprovement, AfUi, AfUser } from "../types";

interface ImprovementCardProps {
  card: AfImprovement;
  users: AfUser[];
  ui: AfUi;
  selected: boolean;
  /** 이번 스테이지에서 틀렸던 카드 (다시 못 고름) */
  tried?: boolean;
  /** 효과(돕는 사람)가 공개됐는가 — 한 번이라도 시험에 들어간 카드만 */
  revealed: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * 개선 카드 버튼 — 손님 스테이지와 최종 심사가 함께 쓴다.
 * 카드가 누구를 돕는지는 시험해 본 카드만 공개해, 학생이 장벽을 읽고
 * 가설을 세워 시험으로 확인하게 한다(정답 미리 노출 금지).
 */
export default function ImprovementCard({
  card,
  users,
  ui,
  selected,
  tried = false,
  revealed,
  disabled = false,
  onClick,
}: ImprovementCardProps) {
  const helps = users.filter(
    (u) => u.barrierId !== "" && card.helpsBarrierIds.includes(u.barrierId),
  );

  return (
    <button
      type="button"
      disabled={disabled || tried}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "af-cardbtn relative rounded-2xl border-2 bg-card p-3 text-left transition-all",
        selected ? "af-cardbtn-on" : "hover:border-primary/30",
        tried && "opacity-45",
      )}
      style={{ "--tile-hue": 95 } as CSSProperties}
    >
      <div className="flex items-center gap-2">
        <span className="mlq-emoji-tile h-9 w-9 shrink-0 text-lg" aria-hidden>
          {card.emoji}
        </span>
        <span className="text-sm font-extrabold leading-tight">{card.name}</span>
        {selected && (
          <span
            className="af-check ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
            aria-hidden
          >
            ✓
          </span>
        )}
        {tried && (
          <span className="af-tag-off ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold">
            {ui.triedTag} ✕
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{card.desc}</p>
      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-foreground/70">
        {revealed ? (
          <>
            <span>{ui.helpsLabel}:</span>
            {helps.length > 0 ? (
              <span className="text-base leading-none" aria-hidden>
                {helps.map((h) => h.emoji).join(" ")}
              </span>
            ) : (
              <span className="text-muted-foreground/70">{ui.helpsNoneLabel}</span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground/70">{ui.helpsHiddenLabel}</span>
        )}
      </div>
    </button>
  );
}
