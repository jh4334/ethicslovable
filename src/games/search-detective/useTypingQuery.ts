/**
 * 누리찾기 검색창에 검색어가 한 글자씩 '타이핑되듯' 입력되는 훅.
 * StrictMode에서 effect가 두 번 실행돼도 타이머를 전부 정리(clean up)해
 * 글자가 겹치거나 두 배 속도로 찍히지 않도록 한다.
 * 접근성: 애니메이션 최소화 설정이면 즉시 전체를 표시한다.
 *
 * @param text   타이핑할 검색어
 * @param key    라운드가 바뀔 때마다 달라지는 값 (바뀌면 처음부터 다시)
 * @param charMs 글자 사이 간격(ms)
 */
import { useEffect, useState } from "react";

export function useTypingQuery(
  text: string,
  key: string | number,
  charMs = 90,
): { typed: string; done: boolean } {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setCount(text.length);
      return;
    }

    setCount(0);
    let current = 0;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const tick = () => {
      if (!alive) return;
      current += 1;
      setCount(current);
      if (current < text.length) {
        timers.push(setTimeout(tick, charMs));
      }
    };
    // 검색창이 뜨고 살짝 뒤에 타이핑 시작
    timers.push(setTimeout(tick, 500));

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [text, key, charMs]);

  return { typed: text.slice(0, count), done: count >= text.length };
}
