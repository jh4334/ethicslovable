/**
 * 학습 진행 상황 — 브라우저 localStorage에만 저장한다.
 * 서버 전송·개인정보 수집은 하지 않는다. 저장 실패(시크릿 모드,
 * 저장소 차단)는 조용히 무시하고 게임은 계속 동작해야 한다.
 */

export type GameId =
  | "feed-algorithm"
  | "filter-bubble"
  | "social-insight"
  | "trend-tycoon"
  | "data-bias"
  | "deepfake"
  | "fact-check"
  | "data-trail";

export const GAME_IDS: GameId[] = [
  "feed-algorithm",
  "filter-bubble",
  "social-insight",
  "trend-tycoon",
  "data-bias",
  "deepfake",
  "fact-check",
  "data-trail",
];

export interface GameRecord {
  completedAt: string;
  /** 게임별 요약 한 줄 (예: "필터버블 위험도 72점") — 포털 카드에 표시 */
  summary?: string;
}

export interface Progress {
  games: Partial<Record<GameId, GameRecord>>;
}

const KEY = "mlq-progress-v1";

export function getProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.games) {
        return parsed as Progress;
      }
    }
  } catch {
    /* 저장소를 못 읽어도 게임은 진행한다 */
  }
  return { games: {} };
}

export function markCompleted(gameId: GameId, summary?: string): void {
  try {
    const progress = getProgress();
    progress.games[gameId] = {
      completedAt: new Date().toISOString(),
      summary,
    };
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* 저장 실패는 무시 */
  }
}

export function isCompleted(gameId: GameId): boolean {
  return Boolean(getProgress().games[gameId]);
}

export function completedCount(ids: GameId[] = GAME_IDS): number {
  const progress = getProgress();
  return ids.filter((id) => progress.games[id]).length;
}

export function resetProgress(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 무시 */
  }
}
