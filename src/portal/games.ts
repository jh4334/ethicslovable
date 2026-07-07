import type { GameId } from "@/lib/progress";

/**
 * 게임 레지스트리 — 학습 순서(차시)대로 정렬.
 * 포털 카드와 라우팅이 이 목록을 사용한다.
 */
export interface GameMeta {
  id: GameId;
  /** 차시 (1~8) */
  lesson: number;
  /** 챕터: 1부(추천 알고리즘) / 2부(AI 알고리즘) */
  chapter: 1 | 2;
  title: string;
  subtitle: string;
  /** 학습 목표 한 줄 (교사·학생용 안내) */
  goal: string;
  /** 예상 소요 시간 (분) */
  minutes: number;
  emoji: string;
  path: string;
}

export interface ChapterMeta {
  chapter: 1 | 2;
  title: string;
  tagline: string;
}

export const CHAPTERS: ChapterMeta[] = [
  {
    chapter: 1,
    title: "1부 · 알고리즘의 비밀",
    tagline: "누리피드와 누리TV의 추천 알고리즘을 파헤쳐요",
  },
  {
    chapter: 2,
    title: "2부 · 인공지능과 살아가기",
    tagline: "누리소프트 AI 연구소에서 인공지능의 속마음을 알아봐요",
  },
];

export const GAMES: GameMeta[] = [
  {
    id: "feed-algorithm",
    lesson: 1,
    chapter: 1,
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
    chapter: 1,
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
    chapter: 1,
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
    chapter: 1,
    title: "알고리즘 연구소장",
    subtitle: "플랫폼 운영자 관점",
    goal: "플랫폼 운영자가 되어 수익과 책임 사이의 딜레마를 겪어봐요",
    minutes: 15,
    emoji: "🎛️",
    path: "/games/trend-tycoon",
  },
  {
    id: "data-bias",
    lesson: 5,
    chapter: 2,
    title: "데이터 편식쟁이 AI",
    subtitle: "AI 학습과 데이터 편향",
    goal: "AI는 먹은 데이터만큼만 안다는 것을 직접 학습시키며 체험해요",
    minutes: 15,
    emoji: "🍚",
    path: "/games/data-bias",
  },
  {
    id: "deepfake",
    lesson: 6,
    chapter: 2,
    title: "딥페이크 탐정단",
    subtitle: "AI 생성물 판별",
    goal: "AI가 만든 가짜 사진과 글을 단서로 가려내는 눈을 길러요",
    minutes: 15,
    emoji: "🕵️",
    path: "/games/deepfake",
  },
  {
    id: "fact-check",
    lesson: 7,
    chapter: 2,
    title: "누리봇 사실 검증단",
    subtitle: "AI 답변 검증",
    goal: "AI 챗봇의 그럴듯한 거짓말(환각)을 자료와 대조해 찾아내요",
    minutes: 15,
    emoji: "✅",
    path: "/games/fact-check",
  },
  {
    id: "data-trail",
    lesson: 8,
    chapter: 2,
    title: "내 데이터의 여행",
    subtitle: "개인정보와 맞춤 광고",
    goal: "내 클릭이 광고가 되기까지, 데이터의 여행을 따라가요",
    minutes: 15,
    emoji: "🧳",
    path: "/games/data-trail",
  },
];
