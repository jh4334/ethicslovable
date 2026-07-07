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
 * 분야별 아이콘·색상(코드 쪽 표현 정보).
 * 텍스트(이름·수식어·별명)는 src/content/filter-bubble.json 에서 관리한다.
 */
interface CategoryMeta {
  icon: LucideIcon;
  badgeClass: string;
  bgClass: string;
  textClass: string;
}

const META: Record<string, CategoryMeta> = {
  GAME: {
    icon: Gamepad2,
    badgeClass: "fb-badge-game",
    bgClass: "fb-result-bg-game",
    textClass: "fb-result-text-game",
  },
  LEARNING: {
    icon: BookOpen,
    badgeClass: "fb-badge-learning",
    bgClass: "fb-result-bg-learning",
    textClass: "fb-result-text-learning",
  },
  NEWS: {
    icon: Newspaper,
    badgeClass: "fb-badge-news",
    bgClass: "fb-result-bg-news",
    textClass: "fb-result-text-news",
  },
  SENSATIONAL: {
    icon: Sparkles,
    badgeClass: "fb-badge-sensational",
    bgClass: "fb-result-bg-sensational",
    textClass: "fb-result-text-sensational",
  },
  FOOD: {
    icon: Utensils,
    badgeClass: "fb-badge-food",
    bgClass: "fb-result-bg-food",
    textClass: "fb-result-text-food",
  },
  SHOPPING: {
    icon: ShoppingBag,
    badgeClass: "fb-badge-shopping",
    bgClass: "fb-result-bg-shopping",
    textClass: "fb-result-text-shopping",
  },
  TRAVEL: {
    icon: Plane,
    badgeClass: "fb-badge-travel",
    bgClass: "fb-result-bg-travel",
    textClass: "fb-result-text-travel",
  },
  ANIMAL: {
    icon: Cat,
    badgeClass: "fb-badge-animal",
    bgClass: "fb-result-bg-animal",
    textClass: "fb-result-text-animal",
  },
};

const FALLBACK: CategoryMeta = {
  icon: Sparkles,
  badgeClass: "fb-badge-news",
  bgClass: "fb-result-bg-news",
  textClass: "fb-result-text-news",
};

export function getCategoryMeta(categoryId: string): CategoryMeta {
  return META[categoryId] ?? FALLBACK;
}
