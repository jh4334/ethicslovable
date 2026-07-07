import type {
  FeedAlgorithmContent,
  GameOverEnding,
  PlayStyleKey,
  StatKey,
  Stats,
} from "./types";

export const STAT_KEYS: StatKey[] = ["eng", "safe", "profit", "trust"];

export function makeInitialStats(startValue: number): Stats {
  return { eng: startValue, safe: startValue, profit: startValue, trust: startValue };
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/** 선택지의 수치 변화를 적용한 새 수치를 계산한다(0~100 고정). */
export function applyEffects(stats: Stats, effects: Stats): Stats {
  return {
    eng: clamp(stats.eng + effects.eng),
    safe: clamp(stats.safe + effects.safe),
    profit: clamp(stats.profit + effects.profit),
    trust: clamp(stats.trust + effects.trust),
  };
}

/**
 * 수치가 한계(0 이하/100 이상)에 닿았는지 검사하고,
 * 닿았다면 콘텐츠 JSON에 정의된 엔딩을 돌려준다.
 */
export function checkGameOver(
  stats: Stats,
  endings: GameOverEnding[],
): GameOverEnding | null {
  for (const key of STAT_KEYS) {
    const value = stats[key];
    if (value <= 0) {
      const ending = endings.find((e) => e.stat === key && e.bound === "low");
      if (ending) return ending;
    }
    if (value >= 100) {
      const ending = endings.find((e) => e.stat === key && e.bound === "high");
      if (ending) return ending;
    }
  }
  return null;
}

/** 최종 수치로 플레이 성향을 분석한다. */
export function analyzePlayStyle(stats: Stats): PlayStyleKey {
  if (stats.profit > 70 || stats.eng > 70) return "profit";
  if (stats.safe > 70) return "safety";
  return "balance";
}

/** 포털 카드에 표시할 한 줄 요약 */
export function buildSummary(
  content: FeedAlgorithmContent,
  survived: boolean,
  day: number,
  stats: Stats,
  endingTitle: string,
): string {
  if (survived) {
    const style = content.playStyles[analyzePlayStyle(stats)];
    return `${content.meta.maxDays}일차까지 운영 · ${style.label}`;
  }
  return `${day}일차 종료 · ${endingTitle}`;
}
