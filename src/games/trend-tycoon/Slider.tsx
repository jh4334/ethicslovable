import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  /** 드래그 중 실시간으로 호출 */
  onChange: (value: number) => void;
  /** 조작을 끝냈을 때(손을 뗐을 때) 호출 — 조정 횟수 세기에 쓴다 */
  onCommit?: (value: number) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * @radix-ui/react-slider 를 감싼 게임용 슬라이더.
 * 스타일은 styles.css 의 .tt-slider* 클래스로 지정한다.
 */
export default function Slider({
  value,
  min = 0,
  max = 10,
  step = 1,
  onChange,
  onCommit,
  className,
  ariaLabel,
}: SliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn("tt-slider", className)}
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(values) => onChange(values[0])}
      onValueCommit={(values) => onCommit?.(values[0])}
    >
      <SliderPrimitive.Track className="tt-slider-track">
        <SliderPrimitive.Range className="tt-slider-range" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="tt-slider-thumb" aria-label={ariaLabel} />
    </SliderPrimitive.Root>
  );
}
