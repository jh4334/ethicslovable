/**
 * 내 데이터의 여행 — 게임 전체 흐름 훅.
 * intro → feed(파트 A) → journey(파트 B) → protect(파트 C) → result
 *
 * 행동 기록(log)은 React 상태(메모리)에만 있고 어디에도 저장하지 않는다.
 * StrictMode 이중 실행에 안전하도록 상태 갱신은 전부 함수형 setState를 쓴다.
 */
import { useMemo, useRef, useState } from "react";
import { analyzeLog } from "./logic";
import type { DtAction, DtActionKind, DtContent, DtPhase } from "./types";

export function useDataTrailGame(content: DtContent) {
  const [phase, setPhase] = useState<DtPhase>("intro");
  const [log, setLog] = useState<DtAction[]>([]);
  const [shields, setShields] = useState(0);
  const feedStartRef = useRef<number | null>(null);

  const goal = content.feed.actionGoal;
  const goalReached = log.length >= goal;

  const startFeed = () => {
    feedStartRef.current = Date.now();
    setLog([]);
    setShields(0);
    setPhase("feed");
  };

  /** 파트 A 행동 1건 기록 — 목표 개수를 넘으면 무시(버튼도 잠기지만 이중 안전장치) */
  const addAction = (kind: DtActionKind, target: string, tags: string[]) => {
    const startedAt = feedStartRef.current ?? Date.now();
    const atSec = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    setLog((prev) =>
      prev.length >= goal ? prev : [...prev, { kind, target, tags, atSec }],
    );
  };

  const goJourney = () => setPhase("journey");
  const goProtect = () => setPhase("protect");

  const finishProtect = (earnedShields: number) => {
    setShields(earnedShields);
    setPhase("result");
  };

  const restart = () => {
    feedStartRef.current = null;
    setLog([]);
    setShields(0);
    setPhase("intro");
  };

  /** 태그 순위·프로필·광고 — 파트 B/결과 화면에서 사용 */
  const analysis = useMemo(() => analyzeLog(content, log), [content, log]);

  return {
    phase,
    log,
    goal,
    goalReached,
    shields,
    analysis,
    startFeed,
    addAction,
    goJourney,
    goProtect,
    finishProtect,
    restart,
  };
}

export type DataTrailGame = ReturnType<typeof useDataTrailGame>;
