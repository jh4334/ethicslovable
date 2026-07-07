/**
 * 누리피드 SNS "표시용" 파생 데이터 모음.
 * 게임 로직과 무관한 그럴듯한 숫자(좋아요·댓글·시간)와 스토리 목록을
 * 문자열 해시로 만들어 렌더링마다 값이 변하지 않게 한다. (Math.random 금지)
 */
import type { SiContent } from "./types";

/** djb2 변형 — 같은 문자열이면 항상 같은 숫자 */
export function hashString(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** 게시물 좋아요 수 (154 ~ 5,153) — "좋아요 1,234개" 표기용 */
export function fakeLikes(seed: string): number {
  return 154 + (hashString(`like:${seed}`) % 5000);
}

/** 댓글 수 (3 ~ 47) — "댓글 N개 모두 보기" 표기용 */
export function fakeComments(seed: string): number {
  return 3 + (hashString(`comment:${seed}`) % 45);
}

/** 게시 시각 (1 ~ 23) — "N시간 전" 표기용 */
export function fakeHoursAgo(seed: string): number {
  return 1 + (hashString(`time:${seed}`) % 23);
}

/** 인증 배지는 일부 계정에만 — 계정 이름 해시로 결정 */
export function isVerified(account: string): boolean {
  return hashString(`verify:${account}`) % 2 === 0;
}

/** 스토리 줄 항목 — 이름 + 대표 이모지(모두 가상 캐릭터) */
export interface StoryItem {
  name: string;
  emoji: string;
}

/** 콘텐츠 JSON의 계정 외에 스토리 줄을 채우는 누리마을 세계관 캐릭터 */
const EXTRA_STORIES: StoryItem[] = [
  { name: "요리왕뚝딱", emoji: "🍳" },
  { name: "별빛사서", emoji: "📚" },
  { name: "운동왕번개", emoji: "⚽" },
];

/** 스토리 줄: 카테고리 계정(대표 이모지 = 첫 게시물 아이콘) + 세계관 캐릭터, 최대 7명 */
export function buildStories(content: SiContent): StoryItem[] {
  const fromCategories = content.categories.map((c) => ({
    name: c.account,
    emoji: c.posts[0]?.icon ?? "🙂",
  }));
  return [...fromCategories, ...EXTRA_STORIES].slice(0, 7);
}
