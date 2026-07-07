/**
 * 로컬 저장소 도우미 — 브라우저 localStorage에만 저장한다.
 * 시크릿 모드·저장소 차단 환경에서도 절대 게임이 멈추지 않도록
 * 모든 읽기/쓰기를 try/catch로 감싼다(원본 게임은 여기서 크래시했다).
 * 별명은 스스로 정한 게임용 별명만 저장한다(실명·개인정보 없음).
 */
import type { LeaderboardEntry } from "./types";

const LEADERBOARD_KEY = (difficultyId: string) =>
  `mlq-social-insight-leaderboard-${difficultyId}`;
const NAME_KEY = "mlq-social-insight-player-name";

/** 명예의 전당은 난이도별 상위 10명까지 보관, 화면에는 5명까지 보여 준다 */
export const LEADERBOARD_KEEP = 10;
export const LEADERBOARD_SHOW = 5;

export function getLeaderboard(difficultyId: string): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY(difficultyId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LeaderboardEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * 기록을 추가하고 상위 10개를 저장한다.
 * 저장에 실패해도 이번 판의 목록은 돌려줘서 화면은 정상 동작한다.
 */
export function saveToLeaderboard(
  difficultyId: string,
  entry: LeaderboardEntry,
): LeaderboardEntry[] {
  const merged = [...getLeaderboard(difficultyId), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, LEADERBOARD_KEEP);
  try {
    localStorage.setItem(LEADERBOARD_KEY(difficultyId), JSON.stringify(merged));
  } catch {
    /* 저장 실패는 조용히 무시 */
  }
  return merged;
}

export function getSavedPlayerName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function savePlayerName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    /* 저장 실패는 조용히 무시 */
  }
}

/** 리더보드 기록용 고유 id — 이름+점수가 같아도 내 기록을 정확히 찾기 위함 */
export function makeEntryId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
