/**
 * 내 데이터의 여행 — 순수 계산 로직.
 * 파트 A에서 남긴 행동 기록(log)만 입력으로 받아
 * 태그 순위 → 프로필 추측 → 맞춤 광고를 계산한다. (저장 없음, 메모리 전용)
 */
import type {
  DtAction,
  DtAnalysis,
  DtContent,
  DtPickedAd,
  DtProfileGuess,
  DtTagCount,
} from "./types";

/** 행동 기록의 태그를 세어 많이 누른 순으로 정렬한다. (동률이면 먼저 나온 태그 우선) */
export function countTags(log: DtAction[]): DtTagCount[] {
  const counts = new Map<string, number>();
  for (const action of log) {
    for (const tag of action.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  // Map은 삽입 순서를 유지하므로, 안정 정렬(sort)만 하면 동률 시 먼저 등장한 태그가 앞선다.
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/** 태그 순위로 "AI가 추측한 나" 카드를 만든다. 태그가 1개뿐이어도 동작(부제 생략). */
export function buildProfile(content: DtContent, ranking: DtTagCount[]): DtProfileGuess {
  const templates = content.profile.templates;
  const top = ranking.slice(0, 2);
  const first = top[0];

  const line = first
    ? (templates[first.tag] ?? templates.default)
    : templates.default;

  const second = top[1];
  const subLine =
    second && second.tag !== first?.tag
      ? content.profile.secondaryLine.replace("{태그}", second.tag)
      : null;

  return { top, line, subLine };
}

/**
 * 광고 3장을 고른다: 관심사 순위와 맞는 광고 2장 + 낚시 광고 1장(가운데 배치).
 * 태그가 단조로워 맞는 광고가 모자라면 남은 풀에서 채우고 일반 이유를 붙인다.
 */
export function pickAds(
  content: DtContent,
  ranking: DtTagCount[],
  matchedTarget = 2,
): DtPickedAd[] {
  const pool = content.adPool;
  const bait = pool.find((ad) => ad.bait);
  const normals = pool.filter((ad) => !ad.bait);
  const used = new Set<string>();
  const picked: DtPickedAd[] = [];

  // 1) 관심사 순위를 따라 태그가 맞는 광고부터 담는다.
  for (const { tag, count } of ranking) {
    if (picked.length >= matchedTarget) break;
    const ad = normals.find((a) => a.tag === tag && !used.has(a.title));
    if (!ad) continue;
    used.add(ad.title);
    picked.push({
      emoji: ad.emoji,
      title: ad.title,
      line: ad.line,
      isBait: false,
      reason: content.adSection.reasonTemplate
        .replace("{태그}", tag)
        .replace("{횟수}", String(count)),
    });
  }

  // 2) 행동이 너무 단조로워 맞는 광고가 모자라면 남은 광고로 채운다.
  for (const ad of normals) {
    if (picked.length >= matchedTarget) break;
    if (used.has(ad.title)) continue;
    used.add(ad.title);
    picked.push({
      emoji: ad.emoji,
      title: ad.title,
      line: ad.line,
      isBait: false,
      reason: content.adSection.genericReason,
    });
  }

  // 3) 낚시 광고는 가운데 끼워 넣는다 — 파트 C(무료 선물 거절)와 연결.
  if (bait) {
    picked.splice(Math.min(1, picked.length), 0, {
      emoji: bait.emoji,
      title: bait.title,
      line: bait.line,
      isBait: true,
      reason: bait.baitReason ?? content.adSection.genericReason,
    });
  }

  return picked.slice(0, 3);
}

/** 행동 기록 전체 분석 — 여행 지도(파트 B)에서 그대로 그린다. */
export function analyzeLog(content: DtContent, log: DtAction[]): DtAnalysis {
  const ranking = countTags(log);
  return {
    ranking,
    profile: buildProfile(content, ranking),
    ads: pickAds(content, ranking),
  };
}

/** 경과 초 → "12초 뒤" / "1분 5초 뒤" */
export function formatElapsed(sec: number): string {
  if (sec < 60) return `${sec}초 뒤`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m}분 뒤` : `${m}분 ${s}초 뒤`;
}

/** 행동 종류 → 화면 표기 (파트 A UI 용어와 통일: 하트=좋아요, 캡션 펼치기=더 보기) */
export const ACTION_LABELS: Record<DtAction["kind"], string> = {
  like: "좋아요",
  open: "더 보기",
  search: "검색",
};

/** 행동 종류 → 아이콘 이모지 (창고 표·수집 목록 공용) — 하트 UI에 맞춰 ❤️ */
export const ACTION_EMOJI: Record<DtAction["kind"], string> = {
  like: "❤️",
  open: "👀",
  search: "🔍",
};
