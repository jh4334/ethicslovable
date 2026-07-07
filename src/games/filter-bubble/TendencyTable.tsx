import { BarChart2, CheckCircle, XCircle } from "lucide-react";
import { getCategoryMeta } from "./categoryMeta";
import { countByCategory } from "./logic";
import type { Category, ContentItem } from "./types";

interface TendencyTableProps {
  history: ContentItem[];
  categories: Category[];
}

export function TendencyTable({ history, categories }: TendencyTableProps) {
  const counts = countByCategory(history);

  const sortedCats = [...categories].sort(
    (a, b) => (counts[b.id] || 0) - (counts[a.id] || 0),
  );
  const lovedCats = sortedCats.filter((c) => (counts[c.id] || 0) > 0);
  const ignoredCats = sortedCats.filter((c) => (counts[c.id] || 0) === 0);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-bold text-card-foreground">
        <BarChart2 size={16} className="text-muted-foreground" />
        소비 경향 분석
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* 많이 고른 분야 */}
        <div className="space-y-2">
          <div className="fb-text-safe flex items-center gap-1 text-xs font-bold">
            <CheckCircle size={12} /> 선호 분야
          </div>
          <div className="space-y-1">
            {lovedCats.slice(0, 3).map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between rounded px-2 py-1.5 text-xs ${getCategoryMeta(cat.id).badgeClass}`}
              >
                <span className="font-medium">{cat.label}</span>
                <span className="font-bold">{counts[cat.id]}회</span>
              </div>
            ))}
            {lovedCats.length === 0 && (
              <div className="text-xs text-muted-foreground">아직 기록이 없어요</div>
            )}
          </div>
        </div>

        {/* 한 번도 안 고른 분야 */}
        <div className="space-y-2">
          <div className="fb-text-danger flex items-center gap-1 text-xs font-bold">
            <XCircle size={12} /> 외면한 분야
          </div>
          <div className="flex flex-wrap gap-1">
            {ignoredCats.map((cat) => (
              <span
                key={cat.id}
                className="rounded border border-destructive/20 bg-destructive/10 px-2 py-1 text-[10px] font-medium text-destructive"
              >
                {cat.label}
              </span>
            ))}
            {ignoredCats.length === 0 && (
              <div className="text-xs text-muted-foreground">모든 분야를 골고루 선택했어요</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
