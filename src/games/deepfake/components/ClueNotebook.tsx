/**
 * 단서 수첩 — 지금까지 모은 단서 종류를 작은 칩으로 보여 준다.
 * 아직 못 모은 단서는 ??? 로 잠겨 있어 수집 욕구를 자극한다.
 */
import { NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DfClue } from "../types";

interface ClueNotebookProps {
  clues: DfClue[];
  collectedIds: string[];
  /** 방금 새로 기록된 단서 (반짝 강조) */
  newIds?: string[];
  title: string;
  lockedName: string;
}

export default function ClueNotebook({
  clues,
  collectedIds,
  newIds = [],
  title,
  lockedName,
}: ClueNotebookProps) {
  return (
    <div className="rounded-xl border bg-card p-2.5 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] font-bold text-foreground">
          <NotebookPen className="h-3.5 w-3.5 text-warning" />
          {title}
        </span>
        <span className="text-[11px] font-semibold text-muted-foreground">
          {collectedIds.length}/{clues.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {clues.map((clue) => {
          const collected = collectedIds.includes(clue.id);
          const isNew = newIds.includes(clue.id);
          return (
            <span
              key={clue.id}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                collected
                  ? "border-warning/50 bg-accent/40 text-accent-foreground"
                  : "border-dashed border-border bg-muted text-muted-foreground",
                isNew && "df-clue-pop",
              )}
            >
              {collected ? clue.name : lockedName}
            </span>
          );
        })}
      </div>
    </div>
  );
}
