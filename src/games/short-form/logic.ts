/**
 * 멈출 수 없는 화면 — 순수 계산 로직.
 * 재생 대기열 만들기, 퀴즈 보기 생성, 가상 시간 표기, 등급 판정 등
 * React와 무관한 함수만 둔다.
 */
import type { SfGrade, SfOutcome, SfStats, SfVideo } from "./types";

/** 피셔-예이츠 셔플 (원본 보존) */
export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 영상 풀을 여러 번 섞어 이어 붙인 재생 대기열.
 * 라운드 경계에서 같은 영상이 연달아 나오지 않게 한다(연속 중복 방지).
 * 강제 종료 시점(기본 18개)보다 충분히 길어서 게임 중 바닥나지 않는다.
 */
export function buildQueue(videos: SfVideo[], rounds = 4): SfVideo[] {
  const queue: SfVideo[] = [];
  for (let r = 0; r < rounds; r++) {
    let round = shuffle(videos);
    for (
      let tries = 0;
      tries < 8 && queue.length > 0 && round[0].id === queue[queue.length - 1].id;
      tries++
    ) {
      round = shuffle(videos);
    }
    queue.push(...round);
  }
  return queue;
}

/** 시간 퀴즈 4지선다 보기 — 정답 주변 값으로 만들고 섞는다(전부 정수 분, 1분 이상) */
export function buildQuizChoices(actualMin: number): number[] {
  const set = new Set<number>();
  [actualMin - 2, actualMin - 1, actualMin, actualMin + 2].forEach((n) =>
    set.add(Math.max(1, Math.round(n))),
  );
  let bump = 3;
  while (set.size < 4) {
    set.add(Math.max(1, Math.round(actualMin)) + bump);
    bump += 1;
  }
  return shuffle([...set]);
}

/** 가상 초 → "N분" / "N분 30초" / "30초" 표기 */
export function formatVirtual(totalSec: number): string {
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}초`;
  return sec === 0 ? `${min}분` : `${min}분 ${sec}초`;
}

/** 좋아요·댓글 카운트 표기 — 45200 → "4.5만", 8800 → "8.8천" */
export function formatCount(n: number): string {
  if (n >= 10000) {
    const v = n / 10000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}만`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}천`;
  }
  return String(n);
}

/**
 * 지킴이 점수(0~5): 멈추기(성공 3 / 늦게 1 / 강제 0) + 시간 감각(오차 평균 0.5분 이하 2 / 2분 이하 1).
 */
export function computeScore(outcome: SfOutcome, stats: SfStats): number {
  const stopPts = outcome === "early" ? 3 : outcome === "late" ? 1 : 0;
  const avgError = stats.quizCount > 0 ? stats.totalErrorMin / stats.quizCount : 99;
  const quizPts = avgError <= 0.5 ? 2 : avgError <= 2 ? 1 : 0;
  return stopPts + quizPts;
}

/** 점수에 맞는 등급 — min 내림차순으로 첫 매칭 */
export function pickGrade(grades: SfGrade[], score: number): SfGrade {
  const sorted = [...grades].sort((a, b) => b.min - a.min);
  return sorted.find((g) => score >= g.min) ?? sorted[sorted.length - 1];
}

/** "{키}" 치환 헬퍼 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{([^}]+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
