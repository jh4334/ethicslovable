import {
  BookOpen,
  Cat,
  Gamepad2,
  Newspaper,
  Plane,
  ShoppingBag,
  Sparkles,
  Utensils,
  type LucideIcon,
} from "lucide-react";

/**
 * 분야별 아이콘·색상·영상 앱 표시 정보(코드 쪽 표현 정보).
 * 텍스트(이름·수식어·별명)는 src/content/filter-bubble.json 에서 관리한다.
 *
 * 채널명·이모지는 표시 전용 장식 — 누리마을 세계관(가상 IP)에서 파생한
 * 분야별 고정 매핑이라 렌더링마다 바뀌지 않는다.
 */
interface CategoryMeta {
  icon: LucideIcon;
  badgeClass: string;
  bgClass: string;
  textClass: string;
  /** 썸네일 한가운데 놓이는 큰 대표 이모지 */
  emoji: string;
  /** 썸네일 파스텔 그라디언트 배경 클래스 (fb-thumb-*) */
  thumbClass: string;
  /** 가상 채널명 (누리마을 세계관) */
  channelName: string;
  /** 채널 아바타 이모지 */
  channelEmoji: string;
}

const META: Record<string, CategoryMeta> = {
  GAME: {
    icon: Gamepad2,
    badgeClass: "fb-badge-game",
    bgClass: "fb-result-bg-game",
    textClass: "fb-result-text-game",
    emoji: "🎮",
    thumbClass: "fb-thumb-game",
    channelName: "네모게임즈",
    channelEmoji: "🕹️",
  },
  LEARNING: {
    icon: BookOpen,
    badgeClass: "fb-badge-learning",
    bgClass: "fb-result-bg-learning",
    textClass: "fb-result-text-learning",
    emoji: "🔬",
    thumbClass: "fb-thumb-learning",
    channelName: "호기심교실",
    channelEmoji: "🧪",
  },
  NEWS: {
    icon: Newspaper,
    badgeClass: "fb-badge-news",
    bgClass: "fb-result-bg-news",
    textClass: "fb-result-text-news",
    emoji: "📰",
    thumbClass: "fb-thumb-news",
    channelName: "누리마을 뉴스",
    channelEmoji: "🗞️",
  },
  SENSATIONAL: {
    icon: Sparkles,
    badgeClass: "fb-badge-sensational",
    bgClass: "fb-result-bg-sensational",
    textClass: "fb-result-text-sensational",
    emoji: "⚡",
    thumbClass: "fb-thumb-sensational",
    channelName: "소문반장",
    channelEmoji: "📣",
  },
  FOOD: {
    icon: Utensils,
    badgeClass: "fb-badge-food",
    bgClass: "fb-result-bg-food",
    textClass: "fb-result-text-food",
    emoji: "🍕",
    thumbClass: "fb-thumb-food",
    channelName: "요리왕뚝딱",
    channelEmoji: "🍳",
  },
  SHOPPING: {
    icon: ShoppingBag,
    badgeClass: "fb-badge-shopping",
    bgClass: "fb-result-bg-shopping",
    textClass: "fb-result-text-shopping",
    emoji: "🛍️",
    thumbClass: "fb-thumb-shopping",
    channelName: "무지개마켓",
    channelEmoji: "🌈",
  },
  TRAVEL: {
    icon: Plane,
    badgeClass: "fb-badge-travel",
    bgClass: "fb-result-bg-travel",
    textClass: "fb-result-text-travel",
    emoji: "✈️",
    thumbClass: "fb-thumb-travel",
    channelName: "여행조아",
    channelEmoji: "🧳",
  },
  ANIMAL: {
    icon: Cat,
    badgeClass: "fb-badge-animal",
    bgClass: "fb-result-bg-animal",
    textClass: "fb-result-text-animal",
    emoji: "🐶",
    thumbClass: "fb-thumb-animal",
    channelName: "몽실이집사",
    channelEmoji: "🐾",
  },
};

const FALLBACK: CategoryMeta = {
  icon: Sparkles,
  badgeClass: "fb-badge-news",
  bgClass: "fb-result-bg-news",
  textClass: "fb-result-text-news",
  emoji: "📺",
  thumbClass: "fb-thumb-news",
  channelName: "누리 채널",
  channelEmoji: "📺",
};

export function getCategoryMeta(categoryId: string): CategoryMeta {
  return META[categoryId] ?? FALLBACK;
}
