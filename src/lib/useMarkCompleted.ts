import { useEffect, useRef } from "react";
import { markCompleted, type GameId } from "./progress";

/**
 * 게임 결과 화면에서 학습 완료를 딱 한 번만 기록한다.
 * React.StrictMode(개발 모드 이펙트 2회 실행)에서도 ref 가드로 1회만 호출.
 *
 * 16개 게임 결과 화면이 똑같이 쓰던 "ref 가드 + useEffect + markCompleted"
 * 보일러플레이트를 한곳으로 모은 것. 값은 첫 마운트 시점 기준으로 기록된다
 * (가드가 재실행을 막으므로 이후 변화는 반영하지 않음 — 기존 동작과 동일).
 *
 * @param gameId    진행 기록에 저장할 게임 id
 * @param summary   포털 카드에 보일 한 줄 요약
 * @param bestScore 점수형 게임의 이번 점수(최고 점수는 markCompleted가 유지)
 */
export function useMarkCompleted(
  gameId: GameId,
  summary?: string,
  bestScore?: number,
): void {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    markCompleted(gameId, summary, bestScore);
  }, [gameId, summary, bestScore]);
}
