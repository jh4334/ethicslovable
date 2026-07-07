/**
 * 누리봇 답변을 문장 단위로 하나씩 '타이핑되듯' 순서대로 드러내는 훅.
 * StrictMode에서 effect가 두 번 실행돼도 타이머를 정리(clean up)해
 * 문장이 겹치거나 순서가 꼬이지 않도록 한다.
 *
 * @param count  드러낼 문장 개수
 * @param key    라운드가 바뀔 때마다 달라지는 값 (바뀌면 처음부터 다시 시작)
 * @param stepMs 문장 사이 간격(ms)
 * @returns 지금까지 드러난 문장 수 (0 ~ count)
 */
import { useEffect, useState } from "react";

export function useTypedReveal(count: number, key: string | number, stepMs = 550): number {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // 접근성: 사용자가 애니메이션 최소화를 원하면 즉시 전부 표시
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setShown(count);
      return;
    }

    setShown(0);
    let current = 0;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const tick = () => {
      if (!alive) return;
      current += 1;
      setShown(current);
      if (current < count) {
        timers.push(setTimeout(tick, stepMs));
      }
    };
    // 첫 문장은 살짝 늦게 시작
    timers.push(setTimeout(tick, 250));

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [count, key, stepMs]);

  return shown;
}
