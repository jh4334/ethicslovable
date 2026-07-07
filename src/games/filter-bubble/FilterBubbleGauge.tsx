import { AlertTriangle } from "lucide-react";
import { pickGaugeLevel } from "./logic";
import type { GaugeLevel } from "./types";

interface FilterBubbleGaugeProps {
  riskScore: number;
  levels: GaugeLevel[];
}

const LEVEL_TEXT_CLASS: Record<string, string> = {
  safe: "fb-text-safe",
  warning: "fb-text-warning",
  danger: "fb-text-danger",
};

const LEVEL_BAR_CLASS: Record<string, string> = {
  safe: "fb-gauge-safe",
  warning: "fb-gauge-warning",
  danger: "fb-gauge-danger",
};

export function FilterBubbleGauge({ riskScore, levels }: FilterBubbleGaugeProps) {
  const level = pickGaugeLevel(levels, riskScore);
  const textClass = LEVEL_TEXT_CLASS[level.id] ?? "fb-text-safe";
  const barClass = LEVEL_BAR_CLASS[level.id] ?? "fb-gauge-safe";

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-end justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-card-foreground">
          <AlertTriangle size={16} className="text-muted-foreground" />
          필터버블 위험도
        </h3>
        <div className={`text-xl font-black ${textClass}`}>
          {level.label} ({riskScore}점)
        </div>
      </div>

      <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-1000 ease-out ${barClass}`}
          style={{ width: `${riskScore}%` }}
        />
      </div>

      <p className="pt-1 text-xs leading-snug text-muted-foreground">{level.description}</p>
    </div>
  );
}
