import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Slider from "./Slider";

type SliderColor = "blue" | "green" | "pink" | "purple";

interface WeightSliderProps {
  icon: LucideIcon;
  label: string;
  value: number;
  min?: number;
  max?: number;
  color: SliderColor;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  hint?: { left: string; right: string };
}

/** 가중치 하나를 조절하는 색깔 카드 슬라이더 */
export default function WeightSlider({
  icon: Icon,
  label,
  value,
  min = 0,
  max = 10,
  color,
  onChange,
  onCommit,
  hint,
}: WeightSliderProps) {
  return (
    <div className={cn("tt-weight-card p-3", `tt-tint-${color}`)}>
      <div className="mb-2 flex justify-between">
        <label className={cn("flex items-center gap-2 text-sm font-extrabold", `tt-text-${color}`)}>
          <Icon size={16} /> {label}
        </label>
        <span className={cn("text-lg font-extrabold tabular-nums", `tt-text-${color}`)}>{value}</span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={1}
        onChange={onChange}
        onCommit={onCommit}
        className={`tt-slider-${color}`}
        ariaLabel={label}
      />
      {hint && (
        <div className="mt-1.5 flex justify-between px-1 text-[10px] text-muted-foreground">
          <span>{hint.left}</span>
          <span>{hint.right}</span>
        </div>
      )}
    </div>
  );
}
