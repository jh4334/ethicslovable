import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 시험 연출 지연 훅 — 버튼을 누르면 1.1초 동안 '시험 중' 연출을 보여 준 뒤
 * 판정 콜백을 실행한다. cleanup으로 StrictMode-safe. 스테이지·최종 심사 공용.
 */
export function useJudgeDelay(judge: () => void): [boolean, () => void] {
  const [testing, setTesting] = useState(false);
  useEffect(() => {
    if (!testing) return;
    const timer = setTimeout(() => {
      judge();
      setTesting(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [testing, judge]);
  return [testing, () => setTesting(true)];
}

interface TestButtonProps {
  canTest: boolean;
  testing: boolean;
  idleLabel: string;
  testingLabel: string;
  onTest: () => void;
}

/** 하단 고정(sticky) 시험 버튼 — 카드를 훑는 동안에도 손에 닿는다 */
export default function TestButton({ canTest, testing, idleLabel, testingLabel, onTest }: TestButtonProps) {
  return (
    <div className="sticky bottom-3 z-10 mt-4">
      <button
        type="button"
        disabled={!canTest}
        onClick={() => canTest && onTest()}
        className={cn(
          "w-full px-6 py-3 text-sm font-bold shadow-lg",
          canTest ? "af-btn animate-pop" : "cursor-not-allowed rounded-xl bg-muted text-muted-foreground",
        )}
      >
        {testing ? `⏳ ${testingLabel}` : idleLabel}
      </button>
    </div>
  );
}
