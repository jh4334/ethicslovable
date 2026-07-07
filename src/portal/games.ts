import type { GameId } from "@/lib/progress";

/**
 * 게임 레지스트리 — 학습 순서(차시)대로 정렬.
 * 포털 카드와 라우팅이 이 목록을 사용한다.
 */
export interface GameMeta {
  id: GameId;
  /** 차시 (1~4) */
  lesson: number;
  title: string;
  subtitle: string;
  /** 학습 목표 한 줄 (교사·학생용 안내) */
  goal: string;
  /** 예상 소요 시간 (분) */
  minutes: number;
  emoji: string;
  path: string;
}

export const GAMES: GameMeta[] = [
  {
    id: "feed-algorithm",
    lesson: 1,
    title: "알고리즘 설계자",
    subtitle: "피드 알고리즘 이해",
    goal: "추천 알고리즘이 어떤 기준과 이익으로 움직이는지 알아봐요",
    minutes: 15,
    emoji: "🧙",
    path: "/games/feed-algorithm",
  },
  {
    id: "filter-bubble",
    lesson: 2,
    title: "필터버블 탐지기",
    subtitle: "필터버블 체험",
    goal: "내 선택이 어떻게 정보 편식으로 이어지는지 체험해요",
    minutes: 10,
    emoji: "🫧",
    path: "/games/filter-bubble",
  },
  {
    id: "social-insight",
    lesson: 3,
    title: "추천 요정 훈련소",
    subtitle: "사회적 영향 통찰",
    goal: "알고리즘의 눈으로 추천을 해 보며 그 영향력을 통찰해요",
    minutes: 15,
    emoji: "🔮",
    path: "/games/social-insight",
  },
  {
    id: "trend-tycoon",
    lesson: 4,
    title: "알고리즘 연구소장",
    subtitle: "플랫폼 운영자 관점",
    goal: "플랫폼 운영자가 되어 수익과 책임 사이의 딜레마를 겪어봐요",
    minutes: 15,
    emoji: "🎛️",
    path: "/games/trend-tycoon",
  },
];
